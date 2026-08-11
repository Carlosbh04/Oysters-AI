/* ============================================================
   COSMIC DATA FLOW — DIBUJO

   Una función por capa, en orden de profundidad. Todas reciben
   el contexto ya en píxeles CSS (el componente se encarga del
   devicePixelRatio con setTransform), así que aquí no aparece
   el dpr por ningún lado salvo en las capas cacheadas, que sí
   necesitan saber a qué resolución rasterizarse.

   ---- DOS DECISIONES QUE GOBIERNAN TODO EL ARCHIVO ----

   1) NADA DE shadowBlur. Es la forma obvia de hacer un halo en
      canvas 2D y es la más cara con diferencia: obliga a
      rasterizar la figura aparte y desenfocarla en CPU, en cada
      figura y en cada fotograma. Con 400 estrellas es
      inviable. En su lugar se pre-renderizan sprites de brillo
      (un degradado radial en un canvas diminuto) y se estampan
      con drawImage, que va por GPU.

   2) EL BRILLO SE SUMA, NO SE PINTA ENCIMA. Casi todo va con
      globalCompositeOperation = "lighter". Es como se comporta
      la luz de verdad: dos halos que se cruzan dan más luz, no
      el de arriba tapando al de abajo. Con "source-over" los
      cruces de las cintas se ven planos.
   ============================================================ */

import {
  PALETA,
  rgba,
  suave,
  envolventeEn,
  ventanaDeTurno,
  dentroDeVentana,
  BORDE_VENTANA,
  RESOLUCION,
} from "./escena.js";

/* Cuántos puntos de la tabla se meten en el degradado dentro de
   la ventana. Seis bastan: la envolvente es suave, y entre dos
   paradas el degradado ya interpola. Subirlo solo añade llamadas
   a addColorStop —que se multiplican por 88 líneas y por 60
   fotogramas— sin cambiar nada de lo que se ve. */
const MUESTRAS_VENTANA = 6;

const TAU = Math.PI * 2;

/* ============================================================
   SPRITES DE BRILLO

   Un degradado radial dibujado una vez en un canvas pequeño y
   reutilizado miles de veces. La caché va por color+radio: en
   toda la escena hay tres colores y un puñado de radios, así
   que acaban siendo ~10 sprites para decenas de miles de
   estampados.
   ============================================================ */
const cacheSprites = new Map();

function sprite(color, radio, dpr) {
  const clave = `${color}|${radio}|${dpr}`;
  const guardado = cacheSprites.get(clave);
  if (guardado) return guardado;

  const lado = Math.max(4, Math.ceil(radio * 2 * dpr));
  const c = document.createElement("canvas");
  c.width = lado;
  c.height = lado;

  const g = c.getContext("2d");
  const m = lado / 2;
  const grad = g.createRadialGradient(m, m, 0, m, m, m);

  /* Las paradas no son lineales a propósito. Un degradado
     lineal de opaco a transparente se ve como una pelota
     difusa; una luz real cae muy rápido cerca del núcleo y
     luego se arrastra. De ahí el salto brusco al 18% y la cola
     larga hasta el borde. */
  grad.addColorStop(0, rgba(color, 1));
  grad.addColorStop(0.18, rgba(color, 0.55));
  grad.addColorStop(0.45, rgba(color, 0.16));
  grad.addColorStop(1, rgba(color, 0));

  g.fillStyle = grad;
  g.fillRect(0, 0, lado, lado);

  const dato = { lienzo: c, lado: radio * 2 };
  cacheSprites.set(clave, dato);
  return dato;
}

function estampar(ctx, spr, x, y, escala, alfa) {
  const lado = spr.lado * escala;
  ctx.globalAlpha = alfa;
  ctx.drawImage(spr.lienzo, x - lado / 2, y - lado / 2, lado, lado);
}

/* ============================================================
   CAPA 1 — RETÍCULA DE PUNTOS  (cacheada)

   Es completamente estática, así que se rasteriza una vez al
   cambiar el tamaño y luego es un solo drawImage por fotograma.
   Dibujarla punto a punto costaría ~6.000 fillRect por
   fotograma para un resultado idéntico.

   La máscara de opacidad se calcula POR PUNTO en vez de con un
   degradado encima. Un degradado de máscara obligaría a otra
   pasada de composición sobre todo el lienzo; así el coste está
   en la generación, que ocurre una vez.
   ============================================================ */
export function crearRejilla(w, h, dpr) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);

  const g = c.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = rgba(PALETA.puntoRejilla, 1);

  const paso = 16;

  for (let y = paso / 2; y < h; y += paso) {
    for (let x = paso / 2; x < w; x += paso) {
      const nx = x / w;
      const ny = y / h;

      /* dónde vive la retícula: tercio superior y mitad derecha */
      const arriba = 1 - suave(0.06, 0.44, ny);
      const derecha = suave(0.44, 0.96, nx);
      let m = Math.max(arriba, derecha);

      if (m <= 0.01) continue;

      /* se desvanece contra los cuatro bordes: si llega al filo
         se ve el corte del lienzo y deja de parecer un plano
         técnico para parecer una textura pegada */
      m *= suave(0, 0.07, nx) * (1 - suave(0.93, 1, nx));
      m *= suave(0, 0.05, ny) * (1 - suave(0.94, 1, ny));

      /* y respeta el hueco oscuro del centro-izquierda, que es
         donde se apoya el contenido de la página */
      const d = Math.hypot((nx - 0.3) / 0.36, (ny - 0.56) / 0.34);
      m *= suave(0.7, 1.3, d);

      if (m <= 0.01) continue;

      /* 0.28 y no el 0.18 del encargo: ese valor da por hecho
         puntos de más de un píxel. A 1px exacto y sobre fondo
         casi negro, 0.18 no se distingue de no dibujar nada. */
      g.globalAlpha = 0.28 * m;
      g.fillRect(x, y, 1, 1);
    }
  }

  return c;
}

/* ============================================================
   CAPA 2 — CAMPO DE ESTRELLAS
   ============================================================ */
export function pintarEstrellas(ctx, escena, tiempo, dx, dy, dpr) {
  const { estrellas, h } = escena;

  ctx.save();
  ctx.translate(dx, dy);
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < estrellas.length; i++) {
    const e = estrellas[i];

    /* deriva vertical con envoltura: al salir por abajo vuelve
       a entrar por arriba. El módulo se hace sobre h + margen
       para que no aparezca de golpe justo en el borde. */
    const y = ((e.y + tiempo * e.deriva) % (h + 40)) - 20;

    /* parpadeo: seno propio de cada estrella. El 0.55 + 0.45 lo
       mantiene siempre visible (nunca llega a apagarse del
       todo), que es como se comporta una estrella real vista a
       través de atmósfera. */
    const pulso = 0.55 + 0.45 * Math.sin((tiempo / e.periodo) * TAU + e.fase);
    const alfa = e.base * pulso;

    if (e.tipo === 2) {
      /* solo las grandes llevan halo: son ~4% del total, así que
         el coste de los sprites se queda en unas pocas decenas */
      estampar(ctx, sprite(e.color, 9, dpr), e.x, y, 1, alfa * 0.85);
      ctx.globalAlpha = alfa;
      ctx.fillStyle = rgba(e.color, 1);
      ctx.beginPath();
      ctx.arc(e.x, y, e.radio, 0, TAU);
      ctx.fill();
    } else if (e.tipo === 1) {
      ctx.globalAlpha = alfa;
      ctx.fillStyle = rgba(e.color, 1);
      ctx.beginPath();
      ctx.arc(e.x, y, e.radio, 0, TAU);
      ctx.fill();
    } else {
      /* las diminutas van con fillRect y no con arc: a medio
         píxel de radio el círculo no se distingue del cuadrado
         y fillRect no necesita construir un trazado */
      ctx.globalAlpha = alfa;
      ctx.fillStyle = rgba(e.color, 1);
      ctx.fillRect(e.x, y, 1, 1);
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ============================================================
   CAPA 3 — LAS CINTAS

   El bucle caliente de todo el componente. Dos cosas lo
   mantienen barato:

   · La curva se MUESTREA UNA VEZ por fotograma (unos 55 puntos
     con su normal) y las ~110 líneas reutilizan ese muestreo
     desplazándose sobre la normal. Evaluar la Bézier por línea
     serían 6.000 evaluaciones en lugar de 55.

   · Los colores vienen precalculados desde escena.js.
   ============================================================ */
function bezier(p, t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
    y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
  };
}

function derivada(p, t) {
  const u = 1 - t;
  return {
    x:
      3 * u * u * (p[1].x - p[0].x) +
      6 * u * t * (p[2].x - p[1].x) +
      3 * t * t * (p[3].x - p[2].x),
    y:
      3 * u * u * (p[1].y - p[0].y) +
      6 * u * t * (p[2].y - p[1].y) +
      3 * t * t * (p[3].y - p[2].y),
  };
}

/* los puntos de control orbitan despacio: es lo que mueve la
   cinta entera. Cada uno con su periodo y en elipse (el eje Y
   va a 0.7) para que no se lea como un giro circular. */
function controlesAnimados(cinta, tiempo, w, h) {
  return cinta.control.map((p, i) => {
    const o = cinta.orbita[i];
    const f = (tiempo / o.p) * TAU;
    return {
      x: (p.x + Math.cos(f + i) * o.a) * w,
      y: (p.y + Math.sin(f * 1.3 + i * 2) * o.a * 0.7) * h,
    };
  });
}

export function pintarCintas(ctx, escena, tiempo, dx, dy, dpr) {
  const { w, h, cintas, movil } = escena;
  const M = movil ? 34 : 54;

  ctx.save();
  ctx.translate(dx, dy);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  for (const cinta of cintas) {
    /* ---- ¿LE TOCA ESTAR? ----
       Las cintas con `turno` se relevan y solo una está a la vez;
       la que no tiene turno (el arco azul) se pinta siempre.

       El descarte temprano no es solo corrección: mientras una
       de las magentas está oculta nos ahorramos sus ~80 trazos
       por fotograma, así que el coste medio BAJA respecto a
       tenerlas las dos puestas. */
    const ventana =
      cinta.turno === undefined
        ? { cola: 0, frente: 1 }
        : ventanaDeTurno(tiempo, cinta.turno);

    if (!ventana) continue;
    if (ventana.frente - ventana.cola < 0.02) continue;

    /* el grosor es de cada cinta, no del contexto: la A va a 1px
       y las magentas por debajo del píxel (ver escena.js) */
    ctx.lineWidth = cinta.trazo;

    const p = controlesAnimados(cinta, tiempo, w, h);

    /* muestreo compartido: punto base + normal unitaria */
    const bx = new Float32Array(M + 1);
    const by = new Float32Array(M + 1);
    const nx = new Float32Array(M + 1);
    const ny = new Float32Array(M + 1);
    const ts = new Float32Array(M + 1);
    /* la cinta se estrecha a lo largo del recorrido: aquí se
       guarda cuánto mide en cada muestra */
    const anchoEn = new Float32Array(M + 1);

    for (let i = 0; i <= M; i++) {
      const t = i / M;
      ts[i] = t;
      anchoEn[i] = cinta.anchoPx * (cinta.anchoIni + (cinta.anchoFin - cinta.anchoIni) * t);
      const b = bezier(p, t);
      const d = derivada(p, t);
      const len = Math.hypot(d.x, d.y) || 1;
      bx[i] = b.x;
      by[i] = b.y;
      /* normal = tangente girada 90°: es la dirección en la que
         se abre la pila de líneas */
      nx[i] = -d.y / len;
      ny[i] = d.x / len;
    }

    /* ---- DE t A POSICIÓN DEL DEGRADADO ----
       La envolvente está escrita en t (parámetro de la curva),
       pero un degradado lineal se mide por la PROYECCIÓN sobre
       la recta que une sus dos extremos. Las dos cosas no
       coinciden: una Bézier no recorre su cuerda a velocidad
       constante. Medido en esta curva, t=0.72 caía en la
       posición 0.60 del degradado, así que el hueco salía 12
       puntos más ancho y más tarde de lo escrito.

       Se arregla proyectando de verdad cada t de la envolvente.
       Son 8 evaluaciones por cinta y fotograma —no por línea—,
       así que no cuesta nada, y a cambio los números de la
       envolvente significan exactamente lo que dicen. */
    let posiciones = null;
    let indices = null;

    if (cinta.tabla) {
      /* ---- LAS PARADAS DE LA VENTANA ----
         Transparente en los dos bordes y unas cuantas muestras
         de la tabla por dentro. Lo que hace que el frente no sea
         un corte es que la primera muestra no está pegada al
         borde sino a BORDE_VENTANA de él: entre las dos el
         degradado interpola, y eso es la transición.

         Si la ventana es más estrecha que dos cantos —al
         arrancar y al terminar— el canto se encoge para que
         siempre quepan los dos. Sin ese ajuste las paradas
         saldrían desordenadas y addColorStop lanzaría. */
      const { cola, frente } = ventana;
      const canto = Math.min(BORDE_VENTANA, (frente - cola) / 2.2);
      const desde = cola + canto;
      const hasta = frente - canto;

      const tes = [cola];
      for (let j = 0; j <= MUESTRAS_VENTANA; j++) {
        tes.push(desde + ((hasta - desde) * j) / MUESTRAS_VENTANA);
      }
      tes.push(frente);

      /* ---- DE t A POSICIÓN DEL DEGRADADO ----
         La ventana está en t (parámetro de la curva), pero un
         degradado lineal se mide por la PROYECCIÓN sobre la
         recta que une sus extremos. Las dos cosas no coinciden:
         una Bézier no recorre su cuerda a velocidad constante.
         Medido en esta curva, t=0.72 caía en la posición 0.60
         del degradado.

         Se proyecta de verdad cada t. Son 9 evaluaciones por
         cinta y fotograma —no por línea—, así que no cuesta
         nada, y a cambio la ventana está donde dice estar. */
      const ex = bx[M] - bx[0];
      const ey = by[M] - by[0];
      const largo2 = ex * ex + ey * ey || 1;
      let previa = 0;

      posiciones = tes.map((tt) => {
        const q = bezier(p, tt);
        const u = ((q.x - bx[0]) * ex + (q.y - by[0]) * ey) / largo2;
        /* addColorStop exige posiciones no decrecientes */
        previa = Math.min(1, Math.max(previa, u));
        return previa;
      });

      /* −1 marca las dos paradas transparentes de los extremos */
      indices = tes.map((tt, j) =>
        j === 0 || j === tes.length - 1
          ? -1
          : Math.max(0, Math.min(RESOLUCION, Math.round(tt * RESOLUCION)))
      );
    }

    for (let k = 0; k < cinta.lineas; k++) {
      /* el carril NO es k/n − 0.5: viene del reparto en seno que
         calcula escena.js, y es lo que hace que la pila se lea
         como superficie curva en vez de como persiana */
      const s = cinta.carriles[k];

      if (cinta.tabla) {
        /* El degradado se orienta con los EXTREMOS de la curva.
           Requiere que la proyección sea monótona, que en estas
           curvas lo es porque x e y avanzan siempre en el mismo
           sentido. Una que se doblara sobre sí misma habría que
           trocearla. */
        const g = ctx.createLinearGradient(bx[0], by[0], bx[M], by[M]);
        for (let j = 0; j < posiciones.length; j++) {
          const idx = indices[j];
          g.addColorStop(
            posiciones[j],
            idx < 0 ? cinta.transparente[k] : cinta.tabla[k][idx]
          );
        }
        ctx.strokeStyle = g;
      } else {
        ctx.strokeStyle = cinta.colores[k];
      }

      ctx.globalAlpha = 1;
      ctx.beginPath();

      for (let i = 0; i <= M; i++) {
        /* LA ONDULACIÓN: el desfase depende de s, o sea del
           carril. Por eso cada línea de la pila va un poco
           retrasada respecto a su vecina y el conjunto se
           retuerce como tela en lugar de desplazarse rígido. */
        const onda =
          1 +
          cinta.rizo *
            Math.sin(
              cinta.frecuencia * ts[i] * TAU +
                tiempo * cinta.velOnda +
                s * cinta.desfase
            );

        const off = s * anchoEn[i] * onda;
        const x = bx[i] + nx[i] * off;
        const y = by[i] + ny[i] * off;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
    }

    /* ---- NÚCLEOS DE LUZ ----
       En los puntos de máxima curvatura, donde la pila de líneas
       se comprime y de forma natural hay más densidad. Se marca
       ahí porque es donde el ojo ya está mirando. */
    for (const n of cinta.nucleos) {
      const c = bezier(p, n.t);
      const radio = n.radio * Math.min(w, h);
      const late = 0.85 + 0.15 * Math.sin((tiempo / 5) * TAU + n.t * 9);

      /* el foco no se enciende hasta que el frente pasa por
         encima, y se apaga cuando la cola lo alcanza */
      const paso = dentroDeVentana(n.t, ventana);
      if (paso <= 0.002) continue;

      estampar(ctx, sprite(cinta.desde, radio, dpr), c.x, c.y, late, n.fuerza * 0.5 * paso);
      estampar(ctx, sprite(PALETA.blanco, radio * 0.3, dpr), c.x, c.y, late, n.fuerza * 0.6 * paso);
    }

    /* ---- MICRO-PUNTOS DE DATOS ----
       Recorren la cinta a distinta velocidad y en distinto
       carril. Son los que dan la lectura de "flujo": las líneas
       ondulan pero no avanzan, y sin esto la cinta se lee como
       una tela agitada y no como algo que transporta. */
    for (const d of cinta.puntosDato) {
      let t = (d.t0 + tiempo * d.velocidad) % 1;
      if (t < 0) t += 1;

      const b = bezier(p, t);
      const der = derivada(p, t);
      const len = Math.hypot(der.x, der.y) || 1;
      const onda =
        1 +
        cinta.rizo *
          Math.sin(
            cinta.frecuencia * t * TAU + tiempo * cinta.velOnda + d.s * cinta.desfase
          );
      const off =
        d.s *
        cinta.anchoPx *
        (cinta.anchoIni + (cinta.anchoFin - cinta.anchoIni) * t) *
        onda;

      const x = b.x + (-der.y / len) * off;
      const y = b.y + (der.x / len) * off;

      /* se apagan en los extremos del recorrido para que no
         aparezcan y desaparezcan de golpe al dar la vuelta */
      /* se apagan en los extremos del recorrido y TAMBIÉN en el
         tramo donde la cinta se desvanece: si no, quedarían
         puntos brillando en mitad del hueco */
      const vida =
        suave(0, 0.08, t) *
        (1 - suave(0.92, 1, t)) *
        envolventeEn(cinta.envolvente, t) *
        dentroDeVentana(t, ventana);

      if (vida <= 0.002) continue;

      estampar(ctx, sprite(PALETA.blanco, d.radio * 5, dpr), x, y, 1, d.brillo * vida * 0.5);
      ctx.globalAlpha = d.brillo * vida;
      ctx.fillStyle = rgba(PALETA.blanco, 1);
      ctx.beginPath();
      ctx.arc(x, y, d.radio, 0, TAU);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ============================================================
   CAPA 4 — CONSTELACIONES
   ============================================================ */
export function pintarConstelaciones(ctx, escena, tiempo, dx, dy, dpr) {
  ctx.save();
  ctx.translate(dx, dy);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 0.5;

  for (const grupo of escena.constelaciones) {
    /* Las aristas llevan la opacidad ligada a la CERCANÍA (el
       tercer valor que guarda la escena). Con opacidad plana
       todas pesan igual y el grupo se lee como un polígono; con
       este degradado se lee como una red. */
    for (const [i, j, cerca] of grupo.aristas) {
      ctx.strokeStyle = rgba(PALETA.violeta, 0.35 * cerca);
      ctx.beginPath();
      ctx.moveTo(grupo.nodos[i].x, grupo.nodos[i].y);
      ctx.lineTo(grupo.nodos[j].x, grupo.nodos[j].y);
      ctx.stroke();
    }

    for (const n of grupo.nodos) {
      const pulso = 0.6 + 0.4 * Math.sin((tiempo / n.periodo) * TAU + n.fase);

      estampar(ctx, sprite(PALETA.rosa, 10, dpr), n.x, n.y, 1, 0.4 * pulso);
      ctx.globalAlpha = 0.9 * pulso;
      ctx.fillStyle = rgba(PALETA.rosa, 1);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radio, 0, TAU);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ============================================================
   CAPA 5 — ICOSAEDRO WIREFRAME

   Proyección hecha a mano en vez de tirar de Three.js: son 12
   vértices y 30 aristas. Traer un motor 3D entero (y su
   contexto WebGL, y ~150KB) para esto sería desproporcionado, y
   además obligaría a mantener dos sistemas de render en el
   mismo componente.
   ============================================================ */
export function pintarIcosaedro(ctx, escena, tiempo, dx, dy, dpr) {
  const ico = escena.icosaedro;

  /* una vuelta cada 40s */
  const ang = (tiempo / 40) * TAU;
  const cos = Math.cos(ang);
  const sen = Math.sin(ang);

  /* el eje de giro va inclinado: con un eje Y limpio la figura
     gira sobre sí misma sin enseñar nunca la cara de arriba y
     se lee como plana */
  const inc = 0.38;
  const cosI = Math.cos(inc);
  const senI = Math.sin(inc);

  const proyectados = ico.vertices.map((v) => {
    /* giro sobre Y */
    const x1 = v.x * cos - v.z * sen;
    const z1 = v.x * sen + v.z * cos;
    /* inclinación sobre X */
    const y2 = v.y * cosI - z1 * senI;
    const z2 = v.y * senI + z1 * cosI;

    /* perspectiva débil: lo justo para que se note qué cara
       está delante. Con proyección ortográfica pura el sólido
       parece un dibujo plano de aristas cruzadas. */
    const k = 1 / (1 - z2 * 0.3);

    return {
      x: ico.cx + x1 * ico.radio * k,
      y: ico.cy + y2 * ico.radio * k,
      z: z2,
    };
  });

  ctx.save();
  ctx.translate(dx, dy);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 1;

  for (const [i, j] of ico.aristas) {
    const a = proyectados[i];
    const b = proyectados[j];

    /* profundidad → opacidad: es lo único que distingue las
       aristas de delante de las de detrás sin pintar caras */
    const z = (a.z + b.z) / 2;
    const alfa = 0.18 + 0.55 * suave(-1, 1, z);

    ctx.strokeStyle = rgba(PALETA.rosa, alfa);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  for (let i = 0; i < proyectados.length; i++) {
    const v = proyectados[i];
    const alfa = 0.3 + 0.7 * suave(-1, 1, v.z);

    estampar(ctx, sprite(PALETA.rosa, 8, dpr), v.x, v.y, 1, alfa * 0.5);
    ctx.globalAlpha = alfa;
    ctx.fillStyle = rgba(PALETA.blanco, 1);
    ctx.beginPath();
    ctx.arc(v.x, v.y, 1.4, 0, TAU);
    ctx.fill();
  }

  /* ---- DESTELLO EN CRUZ ----
     Cualquiera de los doce vértices puede soltar rayos cruzados,
     cada uno a su ritmo (ver `chispas` en escena.js).

     Dos condiciones para encenderse, y las dos importan:

     · que le toque por su reloj. El destello es un PICO breve
       —1.4s de un ciclo de 5 a 13— y no una oscilación suave: un
       seno haría que todos estuviesen medio encendidos siempre y
       se perdería la sensación de chispazo.

     · que el vértice esté DE CARA. Un destello saliendo de la
       parte de atrás del sólido delata al instante que no hay
       volumen real, solo aristas cruzadas. */
  for (let i = 0; i < proyectados.length; i++) {
    const v = proyectados[i];
    const chispa = ico.chispas[i];

    const frente = suave(-0.2, 0.9, v.z);
    if (frente <= 0.02) continue;

    /* distancia al pico del ciclo, medida por el camino corto
       (por eso el +0.5 y el módulo): así el destello es continuo
       al dar la vuelta el reloj y no se corta en seco */
    const ciclo = (tiempo / chispa.periodo + chispa.fase) % 1;
    const dist = Math.abs(((ciclo + 0.5) % 1) - 0.5);
    const pico = 1 - suave(0, 1.4 / chispa.periodo / 2, dist);
    if (pico <= 0.02) continue;

    const fuerza = pico * frente * chispa.fuerza;
    const largo = ico.radio * 1.5 * (0.7 + 0.3 * pico);

    ctx.globalAlpha = fuerza * 0.6;

    for (const [ex, ey, l] of [
      [1, 0, largo],
      [0, 1, largo * 0.7],
    ]) {
      const g = ctx.createLinearGradient(
        v.x - ex * l, v.y - ey * l,
        v.x + ex * l, v.y + ey * l
      );
      g.addColorStop(0, rgba(PALETA.rosa, 0));
      g.addColorStop(0.5, rgba(PALETA.blanco, 0.9));
      g.addColorStop(1, rgba(PALETA.rosa, 0));

      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(v.x - ex * l, v.y - ey * l);
      ctx.lineTo(v.x + ex * l, v.y + ey * l);
      ctx.stroke();
    }

    estampar(ctx, sprite(PALETA.rosa, ico.radio * 0.6, dpr), v.x, v.y, 1, fuerza * 0.5);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ============================================================
   CAPA 6 — ARCO DE PLANETA
   ============================================================ */
export function pintarPlaneta(ctx, escena, tiempo, dx, dy) {
  const p = escena.planeta;

  ctx.save();
  ctx.translate(dx, dy);

  /* ---- EL CUERPO ----
     Va en "source-over" y no en "lighter", al revés que el
     resto: es el único elemento OPACO de la escena. Tiene que
     TAPAR las estrellas que quedan detrás; si se suma, se ven
     a través y deja de ser un cuerpo sólido. */
  const luz = ctx.createRadialGradient(
    p.cx + p.radio * 0.55, p.cy - p.radio * 0.62, p.radio * 0.05,
    p.cx, p.cy, p.radio
  );
  luz.addColorStop(0, "rgba(124,58,237,0.85)");
  luz.addColorStop(0.35, "rgba(58,26,120,0.75)");
  luz.addColorStop(1, "rgba(4,2,16,0.96)");

  ctx.fillStyle = luz;
  ctx.beginPath();
  ctx.arc(p.cx, p.cy, p.radio, 0, TAU);
  ctx.fill();

  /* ---- EL LIMBO ----
     El filo iluminado. Un stroke no admite degradado cónico, y
     el brillo tiene que morir en el lado en sombra: se resuelve
     con un degradado LINEAL orientado en la diagonal de la luz,
     que para un arco de este tamaño es indistinguible. */
  ctx.globalCompositeOperation = "lighter";
  const filo = ctx.createLinearGradient(
    p.cx + p.radio * 0.7, p.cy - p.radio * 0.7,
    p.cx - p.radio * 0.5, p.cy + p.radio * 0.5
  );
  filo.addColorStop(0, rgba(PALETA.violeta, 0.75));
  filo.addColorStop(0.45, rgba(PALETA.azul, 0.2));
  filo.addColorStop(1, rgba(PALETA.azul, 0));

  ctx.strokeStyle = filo;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(p.cx, p.cy, p.radio, 0, TAU);
  ctx.stroke();

  /* ---- ANILLOS ORBITALES ----
     Elipses muy achatadas que se salen del cuerpo. La rotación
     lentísima (240s y 300s) no es para que se vea moverse, es
     para que nunca queden en la misma posición dos visitas
     seguidas. */
  ctx.lineWidth = 0.5;

  for (const [escalaR, achata, giro, periodo, alfa] of [
    [1.45, 0.3, -0.35, 240, 0.25],
    [1.85, 0.24, -0.5, 300, 0.16],
  ]) {
    ctx.strokeStyle = rgba(PALETA.puntoRejilla, alfa);
    ctx.beginPath();
    ctx.ellipse(
      p.cx, p.cy,
      p.radio * escalaR,
      p.radio * escalaR * achata,
      giro + (tiempo / periodo) * TAU,
      0, TAU
    );
    ctx.stroke();
  }

  ctx.restore();
}

/* ============================================================
   CAPA 7 — GRANO  (cacheado)

   No es un efecto: es el arreglo del banding. Los degradados
   muy suaves sobre fondos casi negros se ven a bandas en
   pantallas de 8 bits porque no hay valores intermedios
   disponibles. Un ruido de baja amplitud rompe el patrón y el
   ojo reconstruye el degradado continuo — el mismo motivo por
   el que el cine añade grano.

   Se genera un mosaico de 128px y se repite con createPattern.
   Un ruido a pantalla completa serían millones de valores
   aleatorios por resize.
   ============================================================ */
export function crearGrano(dpr) {
  const lado = 128;
  const c = document.createElement("canvas");
  c.width = c.height = lado;

  const g = c.getContext("2d");
  const img = g.createImageData(lado, lado);

  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }

  g.putImageData(img, 0, 0);
  return { lienzo: c, lado, dpr };
}

export function pintarGrano(ctx, grano, w, h, tiempo) {
  const patron = ctx.createPattern(grano.lienzo, "repeat");
  if (!patron) return;

  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.035;

  /* se desplaza a saltos de píxel entero cada fotograma: quieto
     se lee como suciedad en la pantalla, y a saltos enteros no
     hay interpolación que lo emborrone */
  const off = Math.floor(tiempo * 24) % grano.lado;
  ctx.translate(-off, -((off * 7) % grano.lado));

  ctx.fillStyle = patron;
  ctx.fillRect(0, 0, w + grano.lado, h + grano.lado);
  ctx.restore();
}

/* ============================================================
   BLOOM

   Se reduce el lienzo entero a 1/4, se desenfoca y se vuelve a
   sumar encima.

   ---- POR QUÉ NO HACE FALTA UMBRAL ----
   Un bloom de verdad primero descarta los píxeles oscuros, y
   eso normalmente exige leer los píxeles uno a uno (carísimo).
   Aquí sale gratis: el lienzo es TRANSPARENTE donde no se ha
   dibujado nada —el fondo lo pone una capa CSS por debajo—, y
   con "lighter" lo transparente suma cero. Las zonas oscuras se
   descartan solas.

   El desenfoque se aplica en el lienzo pequeño, así que un
   blur(6px) ahí equivale a 24px en pantalla por cuatro veces
   menos trabajo.
   ============================================================ */
export function aplicarBloom(ctx, fuente, destino, w, h) {
  const g = destino.getContext("2d");

  g.clearRect(0, 0, destino.width, destino.height);
  g.filter = "blur(6px)";
  g.drawImage(fuente, 0, 0, destino.width, destino.height);
  g.filter = "none";

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.38;
  ctx.drawImage(destino, 0, 0, w, h);
  ctx.restore();
}

/* ============================================================
   EL FOTOGRAMA COMPLETO

   Los factores de paralaje (0.02 estrellas, 0.05 cintas, 0.08
   icosaedro) son la profundidad: lo lejano se mueve poco y lo
   cercano mucho. Es la única pista de profundidad que hay en
   una escena sin sombras ni oclusión.
   ============================================================ */
export function dibujarEscena(ctx, escena, estado) {
  const { w, h } = escena;
  const { tiempo, px, py, rejilla, grano, bloom, dpr } = estado;

  ctx.clearRect(0, 0, w, h);

  if (rejilla) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.translate(px * 0.012, py * 0.012);
    ctx.drawImage(rejilla, 0, 0, w, h);
    ctx.restore();
  }

  pintarEstrellas(ctx, escena, tiempo, px * 0.02, py * 0.02, dpr);
  pintarPlaneta(ctx, escena, tiempo, px * 0.03, py * 0.03);
  pintarCintas(ctx, escena, tiempo, px * 0.05, py * 0.05, dpr);
  pintarConstelaciones(ctx, escena, tiempo, px * 0.06, py * 0.06, dpr);
  pintarIcosaedro(ctx, escena, tiempo, px * 0.08, py * 0.08, dpr);

  /* El bloom va DESPUÉS de las capas y ANTES del grano. Si se
     invierte, el grano entra en el desenfoque y en vez de un
     ruido fino de un píxel sale una mancha sucia — y además el
     grano dejaría de cumplir su función, que es precisamente
     ser la última capa, la que rompe el banding de todo lo que
     hay debajo. */
  if (bloom) aplicarBloom(ctx, ctx.canvas, bloom, w, h);
  if (grano) pintarGrano(ctx, grano, w, h, tiempo);
}
