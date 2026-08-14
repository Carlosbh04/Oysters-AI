import { useEffect, useRef, useState } from "react";
import "./FondoBlog.css";

/* ============================================================
   FONDO DEL BLOG — el cielo con nieve de estrellas

   Vivía suelto dentro de BlogList: su marcado estaba escrito a
   mano en el JSX del listado y sus capas eran pseudo-elementos
   de `.blog-list`. Se extrajo al necesitarlo TAMBIÉN el detalle
   de entrada, que es la razón de siempre para extraer algo: en
   cuanto un fondo se copia a una segunda página, las dos copias
   empiezan a separarse sin que nadie se dé cuenta.

   Se monta dentro de cualquier contenedor `position: relative`
   —en la práctica, la sección `.blog-page` que ponen las dos
   páginas— y lo llena entero.

   ---- POR QUÉ ESCUCHA EN LA VENTANA ----
   El parallax lo movía un onMouseMove puesto en el contenedor
   del contenido. Aquí no vale: esta capa es `pointer-events:
   none` (tiene que dejar pasar los clics al artículo), así que
   no recibe eventos de ratón. Escuchando en la ventana y
   midiendo contra su propia caja, el efecto es el mismo y el
   componente no le pide nada a quien lo monta.
   ============================================================ */

/* Cuánto se desplazan las capas, en píxeles, de un extremo a
   otro del contenedor. El halo va con el ratón y el polvo en
   contra: ese desacuerdo es lo que da sensación de profundidad
   —si las dos capas fueran en la misma dirección, se leerían
   como una sola pegada al cristal—. */
const RECORRIDO_HALO = { x: 28, y: -24 };
const FACTOR_POLVO = { x: -0.42, y: -0.38 };

function FondoBlog() {
  const cajaRef = useRef(null);
  const [desvio, setDesvio] = useState({ x: 0, y: 0 });

  useEffect(() => {
    /* con movimiento reducido el fondo se queda quieto: la nieve
       ya es animación de sobra, y el parallax es puro adorno */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const alMover = (e) => {
      const caja = cajaRef.current;
      if (!caja) return;

      const r = caja.getBoundingClientRect();
      if (!r.width || !r.height) return;

      setDesvio({
        x: ((e.clientX - r.left) / r.width - 0.5) * RECORRIDO_HALO.x,
        y: ((e.clientY - r.top) / r.height - 0.5) * RECORRIDO_HALO.y,
      });
    };

    window.addEventListener("pointermove", alMover, { passive: true });
    return () => window.removeEventListener("pointermove", alMover);
  }, []);

  return (
    <div
      ref={cajaRef}
      className="fondo-blog"
      aria-hidden="true"
      style={{
        "--fb-halo-x": `${desvio.x}px`,
        "--fb-halo-y": `${desvio.y}px`,
        "--fb-polvo-x": `${Math.round(desvio.x * FACTOR_POLVO.x)}px`,
        "--fb-polvo-y": `${Math.round(desvio.y * FACTOR_POLVO.y)}px`,
      }}
    >
      <span className="fondo-blog__halo" />
      <span className="fondo-blog__polvo" />

      <div className="fondo-blog__campo" />

      {/* los ✦ grandes que cruzan la pantalla. Van sueltos y no
          en un bucle con índice porque cada uno lleva su sitio y
          su retraso escritos en el CSS: es más fácil de retocar
          a ojo que una lista de posiciones en JS. */}
      <span className="fondo-blog__estrella fondo-blog__estrella--1">✦</span>
      <span className="fondo-blog__estrella fondo-blog__estrella--2">✧</span>
      <span className="fondo-blog__estrella fondo-blog__estrella--3">✦</span>
      <span className="fondo-blog__estrella fondo-blog__estrella--4">✹</span>
      <span className="fondo-blog__estrella fondo-blog__estrella--5">✧</span>
      <span className="fondo-blog__estrella fondo-blog__estrella--6">✦</span>

      {/* los ✦ QUIETOS, repartidos por el lienzo. No caen: son
          los que dan textura al fondo cuando la nieve pasa de
          largo, y por eso van a media opacidad. */}
      <span className="fondo-blog__fijo fondo-blog__fijo--1">✦</span>
      <span className="fondo-blog__fijo fondo-blog__fijo--2">✦</span>
      <span className="fondo-blog__fijo fondo-blog__fijo--3">✦</span>
      <span className="fondo-blog__fijo fondo-blog__fijo--4">✦</span>
    </div>
  );
}

export default FondoBlog;
