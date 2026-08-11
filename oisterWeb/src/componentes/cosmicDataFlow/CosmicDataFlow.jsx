import { useEffect, useRef } from "react";
import { crearEscena } from "./escena.js";
import { crearRejilla, crearGrano, dibujarEscena } from "./dibujo.js";
import "./CosmicDataFlow.css";

/* ============================================================
   COSMIC DATA FLOW — fondo animado autocontenido

   Se monta y ya está: <CosmicDataFlow /> y nada más. No recibe
   props, no expone estado y no toca al resto de la página.

   ---- CÓMO ESTÁ REPARTIDO ----
   · escena.js — dónde está cada cosa (se recalcula al cambiar
     el tamaño de la ventana, o sea casi nunca)
   · dibujo.js — cómo se pinta (60 veces por segundo)
   · este archivo — cuándo se pinta, a qué resolución y cuándo
     hay que parar
   · el CSS — el degradado de fondo y la viñeta, que son
     estáticos y no pintan nada que canvas tenga que redibujar

   ---- POR QUÉ EL FONDO NO ESTÁ EN EL CANVAS ----
   Podría dibujarse ahí, pero pintar cuatro degradados radiales
   a pantalla completa en cada fotograma es de lo más caro que
   se puede hacer en canvas 2D, y no cambian nunca. En CSS los
   compone el navegador una vez y los deja en una capa.

   Y sale un segundo beneficio que no es accesorio: al quedar el
   canvas TRANSPARENTE en las zonas vacías, el bloom no necesita
   descartar los píxeles oscuros, porque lo transparente ya suma
   cero. Ver el comentario de aplicarBloom en dibujo.js.
   ============================================================ */

/* Debajo de este ancho se recorta la densidad: la mitad de
   estrellas y de líneas por cinta. No es solo por potencia —en
   una pantalla estrecha las cintas se solapan y la misma
   densidad se lee como una mancha. */
const ANCHO_MOVIL = 820;

/* Cuánto se desplaza cada capa con el scroll, en píxeles de
   recorrido de puntero equivalente. Los factores por capa
   (0.02 a 0.08) los aplica dibujo.js, así que el icosaedro
   —el más cercano— recorre 700 × 0.08 ≈ 56px de arriba abajo
   de la página. Suficiente para dar profundidad sin que la
   composición se descoloque. */
const RECORRIDO_SCROLL = 700;

/* Suavizado del paralaje. El puntero salta de golpe entre
   fotogramas; sin este filtro el fondo da tirones. 0.06 tarda
   ~40 fotogramas en llegar, que es lo que hace que el fondo
   parezca pesado y lejano en vez de pegado al ratón. */
const SUAVIZADO = 0.06;

function CosmicDataFlow() {
  const hostRef = useRef(null);
  const lienzoRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    const lienzo = lienzoRef.current;
    if (!host || !lienzo) return;

    const ctx = lienzo.getContext("2d");
    if (!ctx) return;

    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

    let escena = null;
    let rejilla = null;
    let grano = null;
    let bloom = null;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let altoDocumento = 1;

    let raf = null;
    let ultimo = 0;
    let tiempo = 0;

    /* dos condiciones independientes: la pestaña puede estar
       oculta Y el fondo fuera de pantalla, y hace falta que las
       dos den permiso para que el bucle corra */
    let enPantalla = true;
    let pestanaVisible = !document.hidden;

    /* paralaje: destino (dónde debería estar) y actual (dónde
       está), que persigue al destino con SUAVIZADO */
    let destinoX = 0;
    let destinoY = 0;
    let actualX = 0;
    let actualY = 0;
    let punteroX = 0;
    let punteroY = 0;

    /* ---- MEDIR Y RECONSTRUIR ----
       Todo lo que depende del tamaño se rehace aquí: el tamaño
       real del lienzo, la escena y las dos capas cacheadas. */
    const medir = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      if (w === 0 || h === 0) return;

      /* El dpr se limita a 2. En un móvil con dpr 3 el lienzo
         tendría 9 veces más píxeles que en dpr 1, y por encima
         de 2 la diferencia ya no se aprecia a simple vista: es
         pagar el triple de relleno por nada. */
      dpr = Math.min(2, window.devicePixelRatio || 1);

      lienzo.width = Math.ceil(w * dpr);
      lienzo.height = Math.ceil(h * dpr);

      /* a partir de aquí se dibuja en píxeles CSS y el dpr deja
         de aparecer: lo absorbe esta transformación */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      escena = crearEscena(w, h, w < ANCHO_MOVIL);
      rejilla = crearRejilla(w, h, dpr);
      grano = grano || crearGrano(dpr);

      /* el lienzo del bloom va a un cuarto de lado (un dieciseisavo
         de píxeles). El desenfoque cuesta por píxel, así que aquí
         está el grueso del ahorro. */
      bloom = document.createElement("canvas");
      bloom.width = Math.max(1, Math.round(lienzo.width / 4));
      bloom.height = Math.max(1, Math.round(lienzo.height / 4));

      /* se cachea porque leer scrollHeight fuerza al navegador a
         recalcular el layout, y en el bucle de dibujo eso sería
         un reflow por fotograma */
      altoDocumento = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    const pintar = () => {
      if (!escena) return;
      dibujarEscena(ctx, escena, {
        tiempo,
        px: actualX,
        py: actualY,
        rejilla,
        grano,
        bloom,
        dpr,
      });
    };

    const cuadro = (ahora) => {
      raf = requestAnimationFrame(cuadro);

      /* dt real y no un incremento fijo: si el navegador se
         salta fotogramas, la animación sigue yendo al mismo
         ritmo en lugar de ralentizarse. El tope de 50ms evita
         que al volver de una pestaña en segundo plano la escena
         dé un salto de varios segundos. */
      const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 0;
      ultimo = ahora;
      tiempo += dt;

      const progreso = Math.min(1, Math.max(0, window.scrollY / altoDocumento));
      destinoX = punteroX;
      destinoY = punteroY - progreso * RECORRIDO_SCROLL;

      actualX += (destinoX - actualX) * SUAVIZADO;
      actualY += (destinoY - actualY) * SUAVIZADO;

      pintar();
    };

    const arrancar = () => {
      if (raf !== null) return;
      if (!enPantalla || !pestanaVisible) return;
      if (menosMovimiento.matches) return;
      ultimo = 0;
      raf = requestAnimationFrame(cuadro);
    };

    const parar = () => {
      if (raf === null) return;
      cancelAnimationFrame(raf);
      raf = null;
    };

    /* ---- MOVIMIENTO REDUCIDO ----
       No es "menos animación": es ninguna. Se pinta UN fotograma
       y se abandona el bucle. La escena se sigue viendo entera
       —composición, colores, brillos— simplemente congelada. */
    const aplicarPreferencia = () => {
      if (menosMovimiento.matches) {
        parar();
        actualX = 0;
        actualY = 0;
        tiempo = 0;
        pintar();
      } else {
        arrancar();
      }
    };

    const alRedimensionar = () => {
      medir();
      if (menosMovimiento.matches) pintar();
    };

    const alMoverPuntero = (e) => {
      /* offset respecto al centro: en los bordes vale ±mitad del
         ancho, y dibujo.js lo escala por capa */
      punteroX = e.clientX - w / 2;
      punteroY = e.clientY - h / 2;
    };

    const alCambiarVisibilidad = () => {
      pestanaVisible = !document.hidden;
      if (pestanaVisible) arrancar();
      else parar();
    };

    medir();

    /* ResizeObserver y no el evento resize de window: así también
       reacciona si el contenedor cambia de tamaño por otra causa
       (por ejemplo si mañana se usa dentro de una sección y no a
       pantalla completa) */
    const ro = new ResizeObserver(alRedimensionar);
    ro.observe(host);

    /* Ahora mismo el host es fixed y ocupa la ventana, así que
       esto no dispara nunca. Está por lo mismo que el
       ResizeObserver: el día que se monte dentro de una sección
       concreta, deja de pintar en cuanto se sale de pantalla sin
       tener que tocar nada. */
    const io = new IntersectionObserver(
      ([entrada]) => {
        enPantalla = entrada.isIntersecting;
        if (enPantalla) arrancar();
        else parar();
      },
      { threshold: 0 }
    );
    io.observe(host);

    window.addEventListener("pointermove", alMoverPuntero, { passive: true });
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    menosMovimiento.addEventListener("change", aplicarPreferencia);

    aplicarPreferencia();

    return () => {
      parar();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", alMoverPuntero);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      menosMovimiento.removeEventListener("change", aplicarPreferencia);
    };
  }, []);

  return (
    <div className="cosmic" ref={hostRef} aria-hidden="true">
      {/* nebulosa: cuatro degradados radiales compuestos por el
          navegador una sola vez */}
      <div className="cosmic__nebulosa" />

      <canvas className="cosmic__lienzo" ref={lienzoRef} />

      {/* viñeta por encima de todo: cierra la composición y baja
          la luminancia de los bordes, que es donde suele caer el
          contenido de la página */}
      <div className="cosmic__vineta" />
    </div>
  );
}

export default CosmicDataFlow;
