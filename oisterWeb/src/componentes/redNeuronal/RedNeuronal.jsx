import "./RedNeuronal.css";
import { useEffect, useRef } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";

/* ============================================================
   RED NEURONAL DE FONDO

   Canvas 2D, sin dependencias. Va en `fixed` cubriendo el
   viewport y por detrás de todo: así el lienzo mide siempre lo
   mismo (no crece con la página) y el coste no depende de lo
   larga que sea la sección.

   Qué hay:
   · NODOS a la deriva, con rebote elástico en los bordes
   · SINAPSIS entre los que están cerca, con opacidad por
     distancia — es lo que dibuja la "red"
   · IMPULSOS que recorren las sinapsis: el detalle que la hace
     parecer viva y no un grafo estático
   · RATÓN: atrae a los nodos cercanos, los ilumina y tiende sus
     propias conexiones al cursor

   Coste: ver los comentarios de RENDIMIENTO más abajo. Lo
   importante es que nada de esto se ejecuta si el usuario no lo
   está viendo, ni si ha pedido no ver movimiento.
   ============================================================ */

/* ---- DIALES ----
   DENSIDAD es nodos por millón de píxeles de viewport, no un
   número absoluto: así una pantalla grande no se queda vacía ni
   una pequeña se satura. */
const DENSIDAD = 62;
const NODOS_MAX = 130; /* techo duro: ver RENDIMIENTO */
const RADIO_SINAPSIS = 168; /* a qué distancia se conectan dos nodos */
const RADIO_RATON = 230; /* alcance del campo del cursor */
const FUERZA_RATON = 0.55; /* cuánto los atrae */
const VELOCIDAD = 0.16; /* deriva base, px por frame */

/* impulsos viajando por la red */
const IMPULSOS_MAX = 14;
const PROB_IMPULSO = 0.02; /* por frame */
const VEL_IMPULSO = 0.016; /* fracción de la sinapsis por frame */

/* ---- OLEADAS DE LUZ ----
   La luz no se pinta encima: se PROPAGA. Nace en un nodo al azar
   y en cada frame contagia a sus vecinos por las sinapsis, que es
   como viaja una señal en una red de verdad. Por eso se ve
   avanzar en abanico y no como un barrido plano.

   · PROB_SEMILLA   con qué frecuencia nace una oleada nueva
   · TRANSMISION    cuánto conserva el vecino al recibirla. Por
                    debajo de 1 la oleada se apaga sola con la
                    distancia — es lo que le da el alcance.
   · DECAIMIENTO    cuánto se apaga cada nodo por frame. Marca
                    el LARGO de la estela.
   · UMBRAL         por debajo se considera apagado; evita
                    arrastrar cálculos de valores invisibles. */
const PROB_SEMILLA = 0.02;
const TRANSMISION = 0.9;
const DECAIMIENTO = 0.965;
const UMBRAL = 0.02;

/* ---- COLORES ----
   Empezaron en lila de marca (#b794ff) y no se veían. Medido el
   contraste contra el rango REAL del fondo de esta página, que va
   de #533881 en las zonas hondas a #a383aa donde pegan los orbes:

     lila #b794ff      peor caso 1,36x  ← invisible
     rosa #f090d4      peor caso 1,51x
     violeta #3a1d63   peor caso 1,47x
     casi blanco       peor caso 2,95x  ← el único que aguanta

   El fondo es morado de luminosidad MEDIA, así que cualquier tono
   de esa misma familia se le funde por arriba o por abajo. Lo
   único que separa en todo el rango es irse al extremo claro.
   Además le va al asunto: una red neuronal se lee como luz.

   El color del ratón se queda rosa a propósito: ahí no compite
   con el fondo sino con los nodos blancos de al lado, y contra
   blanco el rosa canta. */
const COLOR_NODO = "246, 240, 255"; /* casi blanco: --color-text */
const COLOR_SINAPSIS = "228, 216, 255";
const COLOR_ACTIVO = "255, 168, 228"; /* rosa claro: lo que toca el ratón */
const COLOR_IMPULSO = "255, 255, 255";

function RedNeuronal() {
  const canvasRef = useRef(null);
  const sinMovimiento = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sinMovimiento) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let ancho = 0;
    let alto = 0;
    let nodos = [];
    let impulsos = [];
    /* buffer del contagio, reutilizado entre frames: crear un
       array nuevo cada frame daría trabajo al recolector de
       basura 60 veces por segundo */
    let contagio = new Float32Array(0);
    let raf = null;
    let visible = true;

    /* el ratón vive en coordenadas de viewport porque el lienzo
       es fixed: no hace falta convertir nada ni leer scroll */
    const raton = { x: -9999, y: -9999, activo: false };

    /* ---- MEDIDA Y SEMBRADO ----
       dpr acotado a 2: en pantallas 3x el lienzo tendría 9 veces
       más píxeles que pintar sin diferencia visible en un fondo
       difuso como este. */
    const medir = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ancho = window.innerWidth;
      alto = window.innerHeight;

      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      canvas.style.width = `${ancho}px`;
      canvas.style.height = `${alto}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const objetivo = Math.min(
        NODOS_MAX,
        Math.round((ancho * alto * DENSIDAD) / 1_000_000)
      );

      /* al redimensionar se conservan los nodos que había y solo
         se ajusta la cantidad: así la red no "salta" de golpe */
      while (nodos.length > objetivo) nodos.pop();
      while (nodos.length < objetivo) {
        nodos.push({
          x: Math.random() * ancho,
          y: Math.random() * alto,
          vx: (Math.random() - 0.5) * VELOCIDAD * 2,
          vy: (Math.random() - 0.5) * VELOCIDAD * 2,
          r: 1 + Math.random() * 1.6,
          /* fase propia para que el latido no vaya sincronizado */
          fase: Math.random() * Math.PI * 2,
          act: 0, /* activación de la oleada, 0→1 */
        });
      }

      if (contagio.length !== nodos.length) {
        contagio = new Float32Array(nodos.length);
      }
    };

    const dibujar = (t) => {
      ctx.clearRect(0, 0, ancho, alto);

      /* ---- 0 · sembrar una oleada ----
         Se enciende un nodo al azar; el contagio hace el resto. */
      if (nodos.length && Math.random() < PROB_SEMILLA) {
        nodos[(Math.random() * nodos.length) | 0].act = 1;
      }
      contagio.fill(0);

      /* ---- 1 · mover ---- */
      for (const n of nodos) {
        n.x += n.vx;
        n.y += n.vy;

        /* rebote en los bordes, no teletransporte: envolver de un
           lado a otro corta las sinapsis a media pantalla */
        if (n.x < 0 || n.x > ancho) {
          n.vx *= -1;
          n.x = Math.max(0, Math.min(ancho, n.x));
        }
        if (n.y < 0 || n.y > alto) {
          n.vy *= -1;
          n.y = Math.max(0, Math.min(alto, n.y));
        }

        /* campo del ratón: atrae y devuelve el nodo a su deriva
           poco a poco (el 0.94 es el rozamiento) */
        if (raton.activo) {
          const dx = raton.x - n.x;
          const dy = raton.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < RADIO_RATON * RADIO_RATON && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = (1 - d / RADIO_RATON) * FUERZA_RATON;
            n.vx += (dx / d) * f * 0.05;
            n.vy += (dy / d) * f * 0.05;
          }
        }
        n.vx *= 0.994;
        n.vy *= 0.994;

        /* si el rozamiento las deja paradas, se reanima la deriva */
        const v = Math.hypot(n.vx, n.vy);
        if (v < VELOCIDAD * 0.35) {
          n.vx += (Math.random() - 0.5) * 0.02;
          n.vy += (Math.random() - 0.5) * 0.02;
        }
      }

      /* ---- 2 · sinapsis ----
         RENDIMIENTO: el bucle es O(n²/2). Con el techo de 130
         nodos son 8.385 comparaciones por frame, que a 60fps es
         medio millón por segundo — trivial para JS moderno. Si
         algún día se sube NODOS_MAX por encima de ~250 habría que
         meter una rejilla espacial; por debajo, no compensa la
         complejidad. */
      ctx.lineWidth = 1;
      for (let i = 0; i < nodos.length; i++) {
        const a = nodos[i];
        for (let j = i + 1; j < nodos.length; j++) {
          const b = nodos[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > RADIO_SINAPSIS * RADIO_SINAPSIS) continue;

          const d = Math.sqrt(d2);
          const cerca = 1 - d / RADIO_SINAPSIS;

          /* PROPAGACIÓN. Va aquí porque este bucle ya recorre
             todos los pares conectados: saber quién es vecino de
             quién sale gratis.
             Se acumula en un buffer aparte y se aplica DESPUÉS,
             para que el resultado no dependa del orden en que se
             visiten los pares — si se escribiera directamente
             sobre n.act, una oleada avanzaría varios saltos en un
             solo frame por los nodos de índice alto. */
          if (a.act > UMBRAL || b.act > UMBRAL) {
            const paso = TRANSMISION * cerca;
            if (a.act * paso > contagio[j]) contagio[j] = a.act * paso;
            if (b.act * paso > contagio[i]) contagio[i] = b.act * paso;
          }

          /* la sinapsis se enciende con el nodo más activo de sus
             dos extremos: así la luz se ve RECORRER la red */
          const encendido = a.act > b.act ? a.act : b.act;

          /* las sinapsis próximas al cursor se tiñen de rosa */
          let color = COLOR_SINAPSIS;
          let alfa = cerca * (0.34 + encendido * 1.5);
          if (raton.activo) {
            const mx = (a.x + b.x) / 2 - raton.x;
            const my = (a.y + b.y) / 2 - raton.y;
            const dm = Math.hypot(mx, my);
            if (dm < RADIO_RATON) {
              const k = 1 - dm / RADIO_RATON;
              color = COLOR_ACTIVO;
              alfa = cerca * (0.34 + k * 0.55);
            }
          }

          ctx.strokeStyle = `rgba(${color}, ${alfa})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      /* ---- 2b · aplicar el contagio y apagar ----
         El decaimiento es lo que deja la ESTELA: sin él la
         oleada sería un parpadeo instantáneo en vez de una luz
         que recorre la red y se apaga por detrás. */
      for (let i = 0; i < nodos.length; i++) {
        const n = nodos[i];
        n.act = n.act * DECAIMIENTO;
        if (contagio[i] > n.act) n.act = contagio[i];
        if (n.act < UMBRAL) n.act = 0;
      }

      /* ---- 3 · conexiones al cursor ---- */
      if (raton.activo) {
        for (const n of nodos) {
          const d = Math.hypot(n.x - raton.x, n.y - raton.y);
          if (d > RADIO_RATON) continue;
          const k = 1 - d / RADIO_RATON;
          ctx.strokeStyle = `rgba(${COLOR_ACTIVO}, ${k * 0.5})`;
          ctx.lineWidth = k * 1.3;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(raton.x, raton.y);
          ctx.stroke();
        }
        ctx.lineWidth = 1;
      }

      /* ---- 4 · impulsos ----
         Nacen en una sinapsis existente y la recorren. Se
         re-comprueba la distancia en cada frame porque los nodos
         se mueven: si la sinapsis se rompe, el impulso muere. */
      if (impulsos.length < IMPULSOS_MAX && Math.random() < PROB_IMPULSO) {
        const a = Math.floor(Math.random() * nodos.length);
        const b = Math.floor(Math.random() * nodos.length);
        if (a !== b && nodos[a] && nodos[b]) {
          const d = Math.hypot(nodos[a].x - nodos[b].x, nodos[a].y - nodos[b].y);
          if (d < RADIO_SINAPSIS) impulsos.push({ a, b, t: 0 });
        }
      }

      impulsos = impulsos.filter((p) => {
        const a = nodos[p.a];
        const b = nodos[p.b];
        if (!a || !b) return false;

        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > RADIO_SINAPSIS) return false;

        p.t += VEL_IMPULSO;
        if (p.t >= 1) return false;

        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        /* se desvanece en los extremos para que no aparezca ni
           desaparezca de golpe */
        const alfa = Math.sin(p.t * Math.PI) * 0.9;

        const halo = ctx.createRadialGradient(x, y, 0, x, y, 7);
        halo.addColorStop(0, `rgba(${COLOR_IMPULSO}, ${alfa})`);
        halo.addColorStop(1, `rgba(${COLOR_IMPULSO}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      /* ---- 5 · nodos ----
         Se pintan los últimos para que queden por encima de sus
         propias sinapsis. */
      for (const n of nodos) {
        const late = 0.72 + Math.sin(t * 0.0013 + n.fase) * 0.28;

        let color = COLOR_NODO;
        let radio = n.r * (1 + n.act * 1.6);
        let alfa = Math.min(1, (0.72 + n.act * 0.9) * late);

        if (raton.activo) {
          const d = Math.hypot(n.x - raton.x, n.y - raton.y);
          if (d < RADIO_RATON) {
            const k = 1 - d / RADIO_RATON;
            color = COLOR_ACTIVO;
            radio = n.r * (1 + k * 0.9);
            alfa = Math.min(1, (0.55 + k * 0.65) * late);
          }
        }

        /* HALO + NÚCLEO: dos arcos por nodo en vez de uno. Es lo
           que hace que se lean como puntos de LUZ y no como
           topos planos, y sobre un fondo de luminosidad media es
           justo lo que les da presencia.
           Dos arcos y no `shadowBlur`: el desenfoque de canvas es
           notoriamente caro y aquí serían 130 por frame. */
        ctx.fillStyle = `rgba(${color}, ${alfa * 0.16})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radio * 3.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${color}, ${alfa})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radio, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(dibujar);
    };

    /* ---- ARRANQUE Y PARADA ----
       RENDIMIENTO: el bucle NO corre porque sí. Se para si la
       pestaña pasa a segundo plano (visibilitychange) — si no,
       seguiría gastando batería con la página oculta. */
    const arrancar = () => {
      if (raf === null && visible) raf = requestAnimationFrame(dibujar);
    };
    const parar = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
    };

    const onVisibilidad = () => {
      visible = document.visibilityState === "visible";
      visible ? arrancar() : parar();
    };

    const onRaton = (e) => {
      raton.x = e.clientX;
      raton.y = e.clientY;
      raton.activo = true;
    };
    const onSalir = () => {
      raton.activo = false;
      raton.x = -9999;
      raton.y = -9999;
    };

    /* en táctil no hay cursor: el campo se activa al arrastrar */
    const onTocar = (e) => {
      const t0 = e.touches?.[0];
      if (!t0) return;
      raton.x = t0.clientX;
      raton.y = t0.clientY;
      raton.activo = true;
    };

    medir();
    arrancar();

    window.addEventListener("resize", medir);
    window.addEventListener("pointermove", onRaton, { passive: true });
    window.addEventListener("pointerleave", onSalir);
    window.addEventListener("touchmove", onTocar, { passive: true });
    window.addEventListener("touchend", onSalir);
    document.addEventListener("visibilitychange", onVisibilidad);

    return () => {
      parar();
      window.removeEventListener("resize", medir);
      window.removeEventListener("pointermove", onRaton);
      window.removeEventListener("pointerleave", onSalir);
      window.removeEventListener("touchmove", onTocar);
      window.removeEventListener("touchend", onSalir);
      document.removeEventListener("visibilitychange", onVisibilidad);
    };
  }, [sinMovimiento]);

  /* con movimiento reducido no se monta el lienzo siquiera */
  if (sinMovimiento) return null;

  return <canvas ref={canvasRef} className="red-neuronal" aria-hidden="true" />;
}

export default RedNeuronal;
