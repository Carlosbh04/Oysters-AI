import { useEffect, useId, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import "./PieDesplegable.css";

/* ============================================================
   ENTRADA DESPLEGABLE DEL PIE

   Una entrada de la navegación del pie que, en vez de llevar a
   una página, abre un panel con sus enlaces. La usa "Recursos",
   que agrupa dos destinos.

   ---- POR QUÉ NO SE REUTILIZA MobileAccordion ----
   Existe y hace casi esto, pero es un ACORDEÓN: al abrirse crece
   y empuja hacia abajo lo que tiene debajo. Eso funciona en el
   menú móvil, que es una columna, y aquí no: la navegación del
   pie es una FILA horizontal de cinco entradas dentro de una
   tarjeta de una sola línea de alto. Un acordeón ahí estiraría la
   tarjeta y descolocaría las columnas de al lado cada vez que
   alguien pulsa.

   Este panel va en `absolute`, así que se despliega POR ENCIMA
   sin ocupar sitio en el flujo y sin mover nada.

   ---- Y ABRE HACIA ARRIBA ----
   Es lo último de la página: hacia abajo no hay sitio y el panel
   se saldría por el borde de la ventana.
   ============================================================ */
function PieDesplegable({ icono: Icono, label, items = [] }) {
  const [abierto, setAbierto] = useState(false);
  const cajaRef = useRef(null);
  const panelId = `pie-desplegable-${useId().replace(/:/g, "")}`;

  /* Cerrar al pulsar fuera y con Escape. Los dos listeners solo
     existen mientras está abierto: registrarlos siempre haría que
     cada clic de la página pasara por aquí para nada.

     `pointerdown` y no `click`: con click, el evento que abre el
     panel llega a document DESPUÉS de que el estado ya sea
     "abierto", y se cerraría solo en el mismo gesto. */
  useEffect(() => {
    if (!abierto) return;

    const fuera = (e) => {
      if (!cajaRef.current?.contains(e.target)) setAbierto(false);
    };
    const tecla = (e) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div
      className={`pie-desplegable ${abierto ? "pie-desplegable--abierto" : ""}`}
      ref={cajaRef}
    >
      {/* <button> y no <a>: no lleva a ninguna parte, abre algo.
          Un enlace aquí obligaría a cancelar su navegación con
          preventDefault y dejaría una URL falsa en la barra de
          estado del navegador. */}
      <button
        type="button"
        className="pie-enlace pie-desplegable__boton"
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto((v) => !v)}
      >
        {/* La flecha acompaña al ICONO, no al rótulo. Va dentro de
            esta caja para poder colgarse a su derecha en absolute:
            así el icono sigue centrado en la columna como el de
            las demás entradas —si la flecha ocupara sitio en el
            flujo, empujaría el icono a la izquierda y "Recursos"
            dejaría de alinear con sus vecinas. */}
        <span className="pie-desplegable__marca">
          <Icono
            className="pie-enlace__icono"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          <ChevronDown
            className="pie-desplegable__flecha"
            size={14}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        </span>

        <span className="pie-enlace__texto">{label}</span>
      </button>

      {/* Se queda SIEMPRE en el marcado y se oculta con CSS, en vez
          de montarse y desmontarse: así la apertura y el cierre
          pueden transicionar. Montándolo al abrir no habría estado
          de partida desde el que animar.

          `inert` mientras está cerrado — no basta con la opacidad:
          sin él, sus enlaces siguen siendo alcanzables con el
          tabulador y el foco se iría a un panel invisible. */}
      <ul className="pie-desplegable__panel" id={panelId} inert={!abierto}>
        {items.map(({ label: texto, to }) => (
          <li key={to}>
            <NavLink
              to={to}
              className="pie-desplegable__enlace"
              onClick={() => setAbierto(false)}
            >
              {texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PieDesplegable;
