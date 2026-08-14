import { cloneElement, useEffect, useRef } from "react";
import "./TextoArena.css";

/* ============================================================
   TEXTO DE ARENA

   Envuelve CUALQUIER elemento de texto y hace que se deshaga en
   granos al pasarle el cursor por encima, recomponiéndose al
   salir. Nació como banco de pruebas y se extrajo aquí; la
   física es la misma y los diales de abajo son los suyos.

     <TextoArena><h2 className="uc__titulo">…</h2></TextoArena>

   ---- NO AÑADE NINGUNA CAJA ----
   No envuelve en un <div>: le pone una clase y una ref al
   elemento que recibe, y le mete el lienzo DENTRO. `canvas` es
   contenido de frase, así que es válido dentro de un h1-h6, un
   <p> o un <span>, y así no hay ni un nodo nuevo que pueda
   descolocar una rejilla. El elemento sigue siendo el que era.

   ---- EN REPOSO NO EXISTE ----
   Y es la diferencia importante con el banco de pruebas, que
   cruzaba dos lienzos permanentes. Aquí, mientras no haya un
   cursor encima, lo que se ve es el TEXTO DE VERDAD: no hay
   lienzo pintado, ni granos en memoria, ni rAF. Todo eso se
   fabrica en el primer `pointerenter` y se tira al terminar. El
   coste en reposo es cero, que es lo que permite ponerlo en todo
   el texto de la portada y no solo en un titular.

   ---- Y EL TEXTO LO MIDE DEL DOM, NO LO REDIBUJA ----
   El banco pintaba su propia frase con un cuerpo calculado a ojo.
   Eso vale para una línea centrada y se rompe con lo que hay en
   la portada: titulares de dos líneas, alineados a la izquierda,
   con `clamp()`, con acentos en <span> y párrafos que envuelven.

   Aquí se recorre cada carácter con un Range y se pinta EN EL
   SITIO EXACTO donde el navegador ya lo colocó, con la
   tipografía y el color que su propio padre tenga calculados. No
   hay que replicar ninguna regla de maquetación: el ajuste de
   líneas, la alineación y el espaciado ya vienen resueltos.
   ============================================================ */

/* ---- DIALES DE LA SIMULACIÓN (los del banco de pruebas) ---- */

/* Separación entre granos, en píxeles de CSS. Es la resolución de
   la arena: a 2 el texto en reposo es indistinguible. */
const PASO = 2;

/* Techo de granos. No es un límite de memoria sino de fotograma.
   Con texto largo el paso crece solo hasta caber aquí. */
const TOPE_GRANOS = 12000;

const RADIO = 115; /* radio de acción del cursor, en px de CSS */
const EMPUJE = 2.6;

/* ---- ARRASTRE: CUÁNTO SE LLEVA EL CURSOR AL MOVERSE ----
   Va SEPARADO por eje, y esa separación arregla un fallo que se
   veía a diario en el titular del hero: al entrar en él, el texto
   se hundía.

   El motivo: el arrastre suma la velocidad del cursor a la de los
   granos. Al titular se entra casi siempre BAJANDO —el ratón viene
   del header, de arriba—, así que en ese momento todos los granos
   recibían la misma velocidad hacia abajo A LA VEZ. Y eso no se
   lee como arena revuelta sino como el renglón entero cayéndose:
   medido entrando desde arriba, 3834 píxeles de arena por debajo
   del titular contra 9 por encima. Una asimetría de 400 a 1.

   La solución NO es bajar el arrastre a secas: en horizontal es
   justo lo que da la sensación de barrer la arena con la mano, y
   ahí no molesta porque un renglón desplazado de lado se lee como
   dispersión, no como caída.

   Así que el eje Y se queda casi sin arrastre. Lo que mueve los
   granos en vertical sigue siendo el EMPUJE radial, que es
   simétrico por definición —empuja hacia arriba a los de arriba y
   hacia abajo a los de abajo—, y por eso el texto se deshace en su
   sitio en vez de descolgarse. */
const ARRASTRE_X = 0.11;
const ARRASTRE_Y = 0.015;

/* ---- LA ARENA SE ABRE A LO LARGO DEL RENGLÓN ----
   El empuje del cursor es RADIAL: reparte por igual en todas las
   direcciones. Sobre una figura redonda eso está bien, pero un
   renglón de texto es una franja ancha y bajita, y ahí el reparto
   radial manda tanta arena hacia abajo como hacia los lados. Como
   por debajo de la línea base no hay más texto, esos granos caen
   sobre el fondo limpio y se ven todos: el titular parece
   descolgarse aunque las letras no se hayan movido de sitio
   —medido: el borde superior de "AI" no cambia ni un píxel—.

   Este factor achata el empuje en vertical. La arena sale
   entonces por donde el renglón es largo, que es como se abre de
   verdad un montón de arena al pasarle la mano, y la línea se
   mantiene recta.

   A 1 vuelve el reparto radial de antes. Por debajo de ~0.3 la
   dispersión se ve plana y artificial. */
const ACHATADO_VERTICAL = 0.42;

const ROCE = 0.9;
const MUELLE = 0.035; /* fuerza de vuelta a casa */

/* Umbrales para dar un grano por dormido: en cuanto está cerca y
   quieto se le CLAVA en su origen. Sin esto el muelle se acerca
   asintóticamente y el bucle no pararía nunca. */
const QUIETO_POS = 0.5;
const QUIETO_VEL = 0.4;

/* el tramo final va por interpolación y no por muelle: converge
   en pocos fotogramas y sin rebote */
const CERCA = 1.6;
const ATERRIZAJE = 0.3;

const TOPE_VELOCIDAD = 26;

/* Margen que se le da al lienzo por fuera del texto, en px de
   CSS. Los granos salen despedidos y sin este colchón se
   recortarían contra el borde del elemento. */
const HOLGURA = 60;

/* ============================================================
   TEXTO PINTADO CON UN DEGRADADO

   Varios titulares del sitio no tienen color: tienen un degradado
   recortado a la forma de las letras (`background-clip: text` con
   el relleno en transparente). Para el navegador su `color`
   calculado ES transparente, así que pintarlos con él no dibuja
   NADA — que es justo lo que pasaba con "Crafting AI" y con el
   "5 proyectos" de Últimos proyectos.

   Aquí se detecta ese caso y se reconstruye el degradado en el
   lienzo. Solo se cubre `linear-gradient`, que es el único que
   usa el sitio; cualquier otra cosa cae al color plano y, si ese
   es transparente, al blanco — antes ilegible que invisible.
   ============================================================ */

const ES_TRANSPARENTE = /^(transparent|rgba?\([^)]*,\s*0\s*\))$/;

/* Separa por comas de PRIMER nivel: no valen las que van dentro
   de un rgb(...) o de otro paréntesis. */
function porComas(s) {
  const partes = [];
  let nivel = 0;
  let actual = "";
  for (const c of s) {
    if (c === "(") nivel++;
    else if (c === ")") nivel--;
    if (c === "," && nivel === 0) {
      partes.push(actual.trim());
      actual = "";
    } else actual += c;
  }
  if (actual.trim()) partes.push(actual.trim());
  return partes;
}

/* Devuelve un CanvasGradient equivalente al linear-gradient del
   elemento, o null si no hay ninguno que se pueda leer. */
function degradadoDe(cs, caja, destino, dx, dy) {
  const fondo = cs.backgroundImage;
  if (!fondo || fondo === "none") return null;

  /* Puede haber VARIAS capas. La primera es la de arriba —en el
     hero es un brillo que barre y va casi todo en transparente—,
     así que el color de base es la ÚLTIMA. */
  const capas = porComas(fondo).filter((c) => c.includes("linear-gradient"));
  if (!capas.length) return null;

  const capa = capas[capas.length - 1];
  const dentro = capa.slice(capa.indexOf("(") + 1, capa.lastIndexOf(")"));
  const trozos = porComas(dentro);
  if (!trozos.length) return null;

  /* el primer trozo es el ángulo si lo lleva; si no, CSS asume
     "to bottom", que son 180deg */
  let angulo = 180;
  let primero = 0;
  const gr = /^(-?[\d.]+)deg$/.exec(trozos[0]);
  if (gr) {
    angulo = parseFloat(gr[1]);
    primero = 1;
  } else if (/^to\s/.test(trozos[0])) {
    const hacia = trozos[0];
    angulo = hacia.includes("right") ? 90 : hacia.includes("left") ? 270 : hacia.includes("top") ? 0 : 180;
    primero = 1;
  }

  const paradas = [];
  for (let i = primero; i < trozos.length; i++) {
    const m = /^(.*?)(?:\s+([\d.]+)%)?$/.exec(trozos[i].trim());
    if (!m) continue;
    paradas.push({ color: m[1].trim(), pos: m[2] !== undefined ? parseFloat(m[2]) / 100 : null });
  }
  if (paradas.length < 2) return null;

  /* las paradas sin porcentaje se reparten a partes iguales */
  paradas.forEach((p, i) => {
    if (p.pos === null) p.pos = i / (paradas.length - 1);
  });

  /* ---- DEL ÁNGULO DE CSS A DOS PUNTOS ----
     En CSS 0deg apunta ARRIBA y crece en el sentido del reloj; el
     lienzo quiere el punto de inicio y el de fin. La longitud de
     la línea del degradado es la proyección de la caja sobre esa
     dirección, que es lo que hace que la última parada caiga
     justo en la esquina y no antes. */
  const rad = (angulo * Math.PI) / 180;
  const sx = Math.sin(rad);
  const cy = -Math.cos(rad);
  const largo = Math.abs(caja.width * sx) + Math.abs(caja.height * cy);
  const cx = dx + caja.width / 2;
  const cyc = dy + caja.height / 2;

  const g = destino.createLinearGradient(
    cx - (sx * largo) / 2,
    cyc - (cy * largo) / 2,
    cx + (sx * largo) / 2,
    cyc + (cy * largo) / 2
  );
  for (const p of paradas) {
    try {
      g.addColorStop(Math.min(1, Math.max(0, p.pos)), p.color);
    } catch {
      /* una parada ilegible no puede tirar el titular entero */
    }
  }
  return g;
}

function TextoArena({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* La simulación solo se monta donde hay un cursor de verdad.
       En táctil no existe "pasar por encima" y con motion
       reducido se está pidiendo justo lo contrario de esto. En
       ambos casos queda el texto normal, que es el reposo. */
    const conCursor = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!conCursor.matches || sinMovimiento.matches) return;

    let lienzo = null;
    let ctx = null;
    let granos = [];
    let buffer = null;
    let buffer32 = null;
    let dpr = 1;
    let ancho = 0;
    let alto = 0;
    let lado = 2;
    let listo = false; /* ¿están sembrados los granos? */

    const raton = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0, dentro: false };
    let raf = null;

    /* ---- ORIGEN DEL BLOQUE, EN COORDENADAS DE PÁGINA ----
       El puntero se convierte a coordenadas locales comparando
       pageX/pageY contra este origen. En espacio de PÁGINA (no de
       viewport) porque así el scroll no lo mueve: medirlo por
       pointermove —como se hacía— era un forced layout por evento
       para leer un valor que solo cambia cuando cambia la
       maquetación. Lo sella `preparar` con la medición que ya
       hace, y cada pointerenter lo re-sella con UNA lectura: eso
       cubre los desplazamientos sin cambio de tamaño que el
       ResizeObserver de abajo no ve. */
    let origenX = 0;
    let origenY = 0;

    const sellarOrigen = (caja) => {
      origenX = caja.left + window.scrollX;
      origenY = caja.top + window.scrollY;
    };

    /* ---- EL TEXTO, MEDIDO DEL DOM ----
       Se recorre carácter a carácter con un Range y se pinta cada
       uno donde el navegador ya lo puso. Es O(n) llamadas de
       medición, pero ocurre UNA vez, al primer hover, y sobre un
       bloque de texto son unos pocos milisegundos. */
    function pintarTexto(destino) {
      const caja = el.getBoundingClientRect();
      const rango = document.createRange();
      const paseante = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);

      let nodo;
      while ((nodo = paseante.nextNode())) {
        const padre = nodo.parentElement;
        if (!padre || padre.tagName === "CANVAS") continue;

        const cs = getComputedStyle(padre);
        destino.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`;
        /* el espaciado entre letras lo aplica el navegador al
           maquetar, pero aquí se pinta letra a letra en su sitio
           ya medido: ponerlo otra vez lo sumaría dos veces */
        if ("letterSpacing" in destino) destino.letterSpacing = "0px";
        /* ---- DE QUÉ COLOR SE PINTA ----
           `-webkit-text-fill-color` manda sobre `color` y es lo
           que estos titulares ponen en transparente para dejar ver
           su degradado. Si el relleno es transparente hay que ir a
           buscar ese degradado; si tampoco lo hay, blanco — un
           titular en un tono que no es el suyo se nota, pero uno
           invisible es un fallo. */
        const relleno = cs.webkitTextFillColor || cs.color;
        if (ES_TRANSPARENTE.test(relleno.replace(/\s/g, ""))) {
          const r = padre.getBoundingClientRect();
          destino.fillStyle =
            degradadoDe(
              cs,
              r,
              destino,
              r.left - caja.left + HOLGURA,
              r.top - caja.top + HOLGURA
            ) || "#ffffff";
        } else {
          destino.fillStyle = relleno;
        }
        destino.textBaseline = "alphabetic";

        const texto = nodo.textContent;
        /* métricas de la fuente para colocar la línea base: el
           rectángulo que devuelve el Range es la CAJA DE LÍNEA, que
           incluye el interlineado repartido arriba y abajo */
        const m = destino.measureText("H");
        const subida = m.fontBoundingBoxAscent || parseFloat(cs.fontSize) * 0.8;
        const bajada = m.fontBoundingBoxDescent || parseFloat(cs.fontSize) * 0.2;

        /* ---- text-transform NO VIENE EN textContent ----
           `textContent` devuelve el texto FUENTE. La mayusculación
           la aplica el navegador al pintar, así que un titular
           escrito "Crafting AI" con `text-transform: uppercase` se
           lee aquí en minúsculas.

           Pintarlo tal cual era el fallo del hero: los glifos
           salían en minúscula —más bajos y con otra forma— pero
           COLOCADOS en las posiciones que el navegador había
           calculado para las mayúsculas. El resultado se leía como
           un cambio de tipografía, con letras sueltas y huecos. */
        const caja2 = cs.textTransform;
        const transformar = (c) =>
          caja2 === "uppercase" ? c.toUpperCase()
          : caja2 === "lowercase" ? c.toLowerCase()
          : c;

        for (let i = 0; i < texto.length; i++) {
          const bruto = texto[i];
          if (bruto === " " || bruto === "\n" || bruto === "\t") continue;
          /* `capitalize` solo afecta a la primera letra de cada
             palabra: se resuelve mirando qué hay detrás. */
          const ch =
            caja2 === "capitalize"
              ? (i === 0 || /\s/.test(texto[i - 1])
                  ? bruto.toUpperCase()
                  : bruto)
              : transformar(bruto);

          rango.setStart(nodo, i);
          rango.setEnd(nodo, i + 1);
          const r = rango.getBoundingClientRect();
          if (!r.width && !r.height) continue;

          const medio = (r.height - (subida + bajada)) / 2;
          destino.fillText(
            ch,
            r.left - caja.left + HOLGURA,
            r.top - caja.top + HOLGURA + medio + subida
          );
        }
      }
    }

    /* ---- DE PÍXELES A GRANOS ----
       Cada píxel con tinta se convierte en un grano que recuerda de
       dónde salió y con qué color, así la arena hereda la forma Y
       el color del texto sin describirlos dos veces. */
    function sembrar() {
      const auxiliar = document.createElement("canvas");
      auxiliar.width = lienzo.width;
      auxiliar.height = lienzo.height;
      const ctxAux = auxiliar.getContext("2d", { willReadFrequently: true });
      ctxAux.setTransform(dpr, 0, 0, dpr, 0, 0);
      pintarTexto(ctxAux);

      const datos = ctxAux.getImageData(0, 0, auxiliar.width, auxiliar.height).data;
      const anchoPx = auxiliar.width;
      const altoPx = auxiliar.height;

      /* dos pasadas: primero se cuenta y, si no cabe, se engorda el
         paso. Contar es barato comparado con crear objetos que
         luego habría que tirar. */
      let paso = Math.max(1, Math.round(PASO * dpr));
      for (;;) {
        let cuenta = 0;
        for (let y = 0; y < altoPx; y += paso)
          for (let x = 0; x < anchoPx; x += paso)
            if (datos[(y * anchoPx + x) * 4 + 3] > 24) cuenta++;
        if (cuenta <= TOPE_GRANOS || paso > 12) break;
        paso++;
      }

      lado = paso;
      granos = [];

      for (let y = 0; y < altoPx; y += paso) {
        for (let x = 0; x < anchoPx; x += paso) {
          const i = (y * anchoPx + x) * 4;
          const a = datos[i + 3];
          if (a <= 24) continue;

          /* color empaquetado en un entero (AABBGGRR en
             little-endian), que es como lo espera el búfer de
             píxeles: guardarlo ya hecho ahorra montarlo en cada
             fotograma */
          const color =
            ((a << 24) | (datos[i + 2] << 16) | (datos[i + 1] << 8) | datos[i]) >>> 0;

          granos.push({
            ox: x / dpr,
            oy: y / dpr,
            x: x / dpr,
            y: y / dpr,
            vx: 0,
            vy: 0,
            color,
            /* su propio caos: sin esto, los granos a la misma
               distancia reciben la misma fuerza y salen en
               formación, como una sábana en vez de como arena */
            caos: 0.65 + Math.random() * 0.7,
            /* y cada uno vuelve a su ritmo, para que el texto se
               recomponga por partes y no de golpe */
            regreso: MUELLE * (0.7 + Math.random() * 0.6),
            dormido: true,
          });
        }
      }

      buffer = ctx.createImageData(anchoPx, altoPx);
      buffer32 = new Uint32Array(buffer.data.buffer);
      listo = true;
    }

    function preparar() {
      if (listo) return;

      const caja = el.getBoundingClientRect();
      sellarOrigen(caja);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = Math.max(1, Math.round(caja.width)) + HOLGURA * 2;
      alto = Math.max(1, Math.round(caja.height)) + HOLGURA * 2;

      lienzo = document.createElement("canvas");
      lienzo.className = "arena__lienzo";
      lienzo.setAttribute("aria-hidden", "true");
      lienzo.width = Math.round(ancho * dpr);
      lienzo.height = Math.round(alto * dpr);
      lienzo.style.width = `${ancho}px`;
      lienzo.style.height = `${alto}px`;
      lienzo.style.left = `${-HOLGURA}px`;
      lienzo.style.top = `${-HOLGURA}px`;
      el.appendChild(lienzo);

      ctx = lienzo.getContext("2d", { alpha: true });
      sembrar();
    }

    function dibujar() {
      if (!buffer32) return;
      buffer32.fill(0);

      const anchoPx = lienzo.width;
      const altoPx = lienzo.height;

      for (let k = 0; k < granos.length; k++) {
        const g = granos[k];
        const px = (g.x * dpr) | 0;
        const py = (g.y * dpr) | 0;

        for (let j = 0; j < lado; j++) {
          const fy = py + j;
          if (fy < 0 || fy >= altoPx) continue;
          const fila = fy * anchoPx;
          for (let i = 0; i < lado; i++) {
            const fx = px + i;
            if (fx < 0 || fx >= anchoPx) continue;
            buffer32[fila + fx] = g.color;
          }
        }
      }

      ctx.putImageData(buffer, 0, 0);
    }

    const RADIO2 = RADIO * RADIO;

    function fotograma() {
      /* la velocidad del cursor se calcula aquí y no en el evento:
         un pointermove puede llegar varias veces entre fotogramas
         y el último ganaría, dando tirones */
      raton.vx = raton.x - raton.px;
      raton.vy = raton.y - raton.py;
      raton.px = raton.x;
      raton.py = raton.y;

      let despiertos = 0;

      for (let k = 0; k < granos.length; k++) {
        const g = granos[k];

        if (raton.dentro) {
          const dx = g.x - raton.x;
          const dy = g.y - raton.y;
          const d2 = dx * dx + dy * dy;

          if (d2 < RADIO2) {
            const d = Math.sqrt(d2) || 0.001;
            /* caída al cuadrado: llega a cero SUAVE en el borde, y
               por eso no se distingue el círculo del radio */
            const caida = 1 - d / RADIO;
            const fuerza = caida * caida * EMPUJE * g.caos;
            g.vx += (dx / d) * fuerza + raton.vx * ARRASTRE_X * caida;
            g.vy +=
              (dy / d) * fuerza * ACHATADO_VERTICAL +
              raton.vy * ARRASTRE_Y * caida;
            g.dormido = false;
          }
        }

        if (g.dormido) continue;

        g.vx += (g.ox - g.x) * g.regreso;
        g.vy += (g.oy - g.y) * g.regreso;
        g.vx *= ROCE;
        g.vy *= ROCE;

        if (g.vx > TOPE_VELOCIDAD) g.vx = TOPE_VELOCIDAD;
        else if (g.vx < -TOPE_VELOCIDAD) g.vx = -TOPE_VELOCIDAD;
        if (g.vy > TOPE_VELOCIDAD) g.vy = TOPE_VELOCIDAD;
        else if (g.vy < -TOPE_VELOCIDAD) g.vy = -TOPE_VELOCIDAD;

        g.x += g.vx;
        g.y += g.vy;

        if (
          Math.abs(g.x - g.ox) < CERCA &&
          Math.abs(g.y - g.oy) < CERCA &&
          Math.abs(g.vx) < 1 &&
          Math.abs(g.vy) < 1
        ) {
          g.x += (g.ox - g.x) * ATERRIZAJE;
          g.y += (g.oy - g.y) * ATERRIZAJE;
          g.vx *= 0.5;
          g.vy *= 0.5;
        }

        if (
          Math.abs(g.x - g.ox) < QUIETO_POS &&
          Math.abs(g.y - g.oy) < QUIETO_POS &&
          Math.abs(g.vx) < QUIETO_VEL &&
          Math.abs(g.vy) < QUIETO_VEL
        ) {
          g.x = g.ox;
          g.y = g.oy;
          g.vx = 0;
          g.vy = 0;
          g.dormido = true;
        } else {
          despiertos++;
        }
      }

      dibujar();

      /* ---- Y AQUÍ SE APAGA DEL TODO ----
         Sin granos despiertos y sin cursor encima no hay nada que
         calcular: se suelta el bucle, se devuelve el texto real y
         la pestaña baja a cero. */
      if (despiertos === 0 && !raton.dentro) {
        el.classList.remove("arena--activa");
        raf = null;
        return;
      }

      raf = requestAnimationFrame(fotograma);
    }

    const alEntrar = () => {
      if (!listo) preparar(); /* preparar ya sella el origen */
      else sellarOrigen(el.getBoundingClientRect());
    };

    const alMover = (e) => {
      if (!listo) preparar();
      raton.x = e.pageX - origenX + HOLGURA;
      raton.y = e.pageY - origenY + HOLGURA;
      if (!raton.dentro) {
        /* al entrar, la posición anterior es la de ahora: si no, el
           primer fotograma calcularía una velocidad enorme desde
           donde estuviera el cursor la última vez y el texto
           saltaría de golpe */
        raton.px = raton.x;
        raton.py = raton.y;
        raton.dentro = true;
      }
      el.classList.add("arena--activa");
      if (raf === null) raf = requestAnimationFrame(fotograma);
    };

    const alSalir = () => {
      raton.dentro = false;
      raton.vx = 0;
      raton.vy = 0;
      /* no se apaga aquí: quedan granos fuera de sitio y el bucle
         tiene que seguir hasta devolverlos a casa */
      if (raf === null && listo) raf = requestAnimationFrame(fotograma);
    };

    el.addEventListener("pointerenter", alEntrar);
    el.addEventListener("pointermove", alMover);
    el.addEventListener("pointerleave", alSalir);

    /* al cambiar de tamaño, lo sembrado deja de valer: las
       posiciones se midieron contra la maquetación anterior. Se
       tira todo y se volverá a preparar en el siguiente hover. */
    let temporizador = null;
    const observador = new ResizeObserver(() => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        if (raf !== null) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        raton.dentro = false;
        el.classList.remove("arena--activa");
        lienzo?.remove();
        lienzo = null;
        ctx = null;
        granos = [];
        buffer = null;
        buffer32 = null;
        listo = false;
      }, 150);
    });
    observador.observe(el);

    return () => {
      observador.disconnect();
      clearTimeout(temporizador);
      if (raf !== null) cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", alEntrar);
      el.removeEventListener("pointermove", alMover);
      el.removeEventListener("pointerleave", alSalir);
      lienzo?.remove();
    };
  }, []);

  return cloneElement(children, {
    ref,
    className: `${children.props.className ?? ""} arena`.trim(),
  });
}

export default TextoArena;
