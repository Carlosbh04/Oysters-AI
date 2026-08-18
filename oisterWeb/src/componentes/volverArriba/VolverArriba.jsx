import { useEffect, useRef, useState } from "react";
import useMediaQuery from "../../hooks/useMediaQuery";
import "./VolverArriba.css";

/* ============================================================
   VOLVER ARRIBA — LA PERLA

   No confundir con ScrollToTop.jsx, que sigue existiendo y hace
   otra cosa: aquel reposiciona el scroll al cambiar de ruta
   —React Router no recarga la página— y no pinta nada. Este es el
   control visible.

   Hacía falta porque la portada mide más de 11.000px en un móvil:
   volver al menú eran varios segundos de deslizar, y el menú es
   donde está el contacto.

   ---- POR QUÉ UNA PERLA ----
   Es la MISMA pieza que marca las paradas de la cadena en "Cómo
   lo hacemos": mismo degradado radial, mismo brillo descentrado,
   misma tinta oscura dentro. No es un botón que se parezca a la
   marca — es un trozo de la marca suelto.

   Y hay una razón práctica además de la de estilo: el nácar es
   MACIZO. Un disco de cristal esmerilado hereda lo que tenga
   debajo, así que se apaga sobre las secciones claras del sitio;
   la perla da 4,1:1 sobre el peor fondo del recorrido.
   ============================================================ */

/* Por debajo de 1080. En escritorio no se monta: allí están Inicio
   y Cmd+↑, el scroll es de rueda y la portada se recorre en mucho
   menos gesto. Si algún día se quiere en escritorio, se cambia
   esta consulta y ya — el resto del componente no distingue. */
const CORTE_MANO = "(max-width: 1079px)";

function VolverArriba() {
  const esMano = useMediaQuery(CORTE_MANO);
  const [visible, setVisible] = useState(false);

  /* El estado se guarda TAMBIÉN en una ref para poder comparar sin
     re-suscribir el listener. Con solo el estado, el efecto
     dependería de `visible` y habría que quitar y volver a poner
     el listener de scroll en cada aparición. */
  const visibleRef = useRef(false);

  useEffect(() => {
    if (!esMano) return undefined;

    let pedido = false;

    const mirar = () => {
      pedido = false;

      /* ---- EL UMBRAL ES UNA PANTALLA, NO UN NÚMERO REDONDO ----
         Con un valor fijo tipo 400px, en un móvil pequeño eso ya
         es media página y en uno grande no llega a un tercio: el
         botón aparecería en momentos distintos de la lectura según
         el aparato. Atado al alto real de la ventana, aparece
         siempre en el mismo punto — cuando la primera pantalla ha
         quedado atrás. */
      const debe = window.scrollY > window.innerHeight;

      if (debe !== visibleRef.current) {
        visibleRef.current = debe;
        setVisible(debe);
      }
    };

    const alMover = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(mirar);
    };

    mirar();
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);

    return () => {
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
    };
  }, [esMano]);

  if (!esMano) return null;

  const subir = () => {
    /* `smooth` salvo que el visitante haya pedido menos
       movimiento; entonces el salto es seco, que es lo correcto.
       Se lee en el momento del clic y no al montar: la
       preferencia del sistema puede cambiar con la página
       abierta. */
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      className="perla-arriba"
      /* el atributo gobierna la entrada; el botón NO se desmonta,
         porque desmontándolo no habría animación de salida — se
         evaporaría de golpe */
      data-ver={visible || undefined}
      /* y fuera de vista deja de ser alcanzable con el tabulador:
         `pointer-events: none` no basta, el teclado lo ignora */
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : "true"}
      onClick={subir}
      aria-label="Volver arriba"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

export default VolverArriba;
