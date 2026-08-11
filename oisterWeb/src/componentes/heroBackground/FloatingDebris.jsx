import { useEffect, useRef } from "react";

/* ============================================================
   ESQUIRLAS FLOTANTES — canvas 2D

   Fragmentos diminutos de cristal suspendidos en el aire. Son
   lo que convierte la niebla en atmósfera: sin nada flotando,
   el humo se lee como un degradado y no como aire.

   ---- POR QUÉ CANVAS Y NO NODOS DEL DOM ----
   Son 40-70 piezas, cada una con posición, giro y opacidad
   propios cambiando en cada fotograma. En el DOM serían 70
   elementos con transform y opacity animados: 70 capas de
   composición y un recálculo de estilo por fotograma. En canvas
   es un solo elemento y un bucle de dibujo.
   ============================================================ */

/* PRNG determinista: el reparto de esquirlas se decide una vez
   y es siempre el mismo. Con Math.random cada recarga movería
   las piezas y no habría forma de ajustar la escena mirándola. */
function aleatorio(semilla) {
  let a = semilla >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IRISADOS = ["#ff6ec7", "#7dd3fc", "#fbbf24", "#a78bfa"];

function FloatingDebris({ cuantas }) {
  const lienzo = useRef(null);

  useEffect(() => {
    const c = lienzo.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

    let w = 0;
    let h = 0;
    let dpr = 1;
    let piezas = [];
    let raf = null;
    let ultimo = 0;
    let tiempo = 0;
    let visible = true;

    const medir = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      if (!w || !h) return;

      /* tope de 2 igual que en el resto del sitio: por encima no
         se aprecia y el relleno se multiplica */
      dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.ceil(w * dpr);
      c.height = Math.ceil(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* en móvil, el 40% de las piezas (lo pide la spec) */
      const total = Math.round((cuantas ?? 58) * (w < 768 ? 0.4 : 1));
      const rnd = aleatorio(70233);

      piezas = Array.from({ length: total }, () => {
        const tam = 2 + rnd() * 4;
        return {
          x: rnd() * w,
          y: rnd() * h,
          tam,
          /* las grandes son las que están CERCA, así que van
             algo desenfocadas: es la única pista de profundidad
             que tiene una partícula suelta */
          cerca: tam > 4.4,
          lados: rnd() < 0.55 ? 3 : 4,
          giro: rnd() * Math.PI * 2,
          giroVel: (rnd() - 0.5) * 0.25,
          sube: 4 + rnd() * 9,
          vaiven: 8 + rnd() * 22,
          periodo: 5 + rnd() * 7,
          fase: rnd() * Math.PI * 2,
          base: 0.2 + rnd() * 0.5,
          color: rnd() < 0.22 ? IRISADOS[Math.floor(rnd() * 4)] : "#e6d7ff",
        };
      });
    };

    const dibujar = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of piezas) {
        /* deriva ascendente con envoltura por abajo */
        const y = ((p.y - tiempo * p.sube) % (h + 60)) + (p.y < 0 ? h + 60 : 0);
        const yy = y < -30 ? y + h + 60 : y;
        const x = p.x + Math.sin(tiempo / p.periodo + p.fase) * p.vaiven;

        const parpadeo = 0.65 + 0.35 * Math.sin(tiempo / 2.4 + p.fase * 2);

        ctx.save();
        ctx.globalAlpha = p.base * parpadeo;
        ctx.translate(x, yy);
        ctx.rotate(p.giro + tiempo * p.giroVel);
        ctx.fillStyle = p.color;

        /* el desenfoque de las cercanas se hace con sombra y no
           con ctx.filter: filter re-rasteriza toda la figura y
           aquí hay decenas por fotograma */
        if (p.cerca) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.globalAlpha *= 0.7;
        }

        ctx.beginPath();
        if (p.lados === 3) {
          ctx.moveTo(0, -p.tam);
          ctx.lineTo(p.tam, p.tam);
          ctx.lineTo(-p.tam, p.tam);
        } else {
          ctx.moveTo(0, -p.tam);
          ctx.lineTo(p.tam * 0.7, 0);
          ctx.lineTo(0, p.tam);
          ctx.lineTo(-p.tam * 0.7, 0);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    };

    const cuadro = (ahora) => {
      raf = requestAnimationFrame(cuadro);
      const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 0;
      ultimo = ahora;
      tiempo += dt;
      dibujar();
    };

    const arrancar = () => {
      if (raf !== null || !visible || menosMovimiento.matches) return;
      ultimo = 0;
      raf = requestAnimationFrame(cuadro);
    };

    const parar = () => {
      if (raf === null) return;
      cancelAnimationFrame(raf);
      raf = null;
    };

    const aplicarPreferencia = () => {
      if (menosMovimiento.matches) {
        parar();
        tiempo = 0;
        dibujar();
      } else {
        arrancar();
      }
    };

    medir();

    const ro = new ResizeObserver(() => {
      medir();
      if (menosMovimiento.matches) dibujar();
    });
    ro.observe(c);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) arrancar();
        else parar();
      },
      { threshold: 0 }
    );
    io.observe(c);

    menosMovimiento.addEventListener("change", aplicarPreferencia);
    aplicarPreferencia();

    return () => {
      parar();
      ro.disconnect();
      io.disconnect();
      menosMovimiento.removeEventListener("change", aplicarPreferencia);
    };
  }, [cuantas]);

  return <canvas className="hb-esquirlas" ref={lienzo} aria-hidden="true" />;
}

export default FloatingDebris;
