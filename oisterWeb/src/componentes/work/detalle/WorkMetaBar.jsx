import { useEffect, useRef } from "react";
import { User, Building2, Calendar, Globe } from "lucide-react";
import useMediaQuery from "../../../hooks/useMediaQuery";

/* ============================================================
   BARRA DE FICHA

   Una sola tarjeta partida en celdas iguales con separadores
   finos. Se pintan solo las celdas que tienen dato: un proyecto
   sin industria no deja un hueco vacío, deja tres celdas en vez
   de cuatro, y la rejilla se reparte sola porque va con
   `grid-auto-flow: column` y `1fr`.

   La spec pide tres celdas (cliente, industria, año). La cuarta
   —web— existe en los datos y aparece cuando la hay: tirarla
   sería perder contenido para cuadrar con un dibujo.

   ---- Y EN LA MANO ES UNA CINTA QUE NO PARA ----
   Ahí las celdas no caben en una línea, y la tira era un scroll
   horizontal: había que arrastrarla para ver el año o la web, y
   nada avisaba de que hubiera más a la derecha. En cinta se leen
   solas, pasando.

   La mecánica es la misma que la de MarcasMarquee, y a propósito:
   el listado va DOS VECES y la pista se anima de 0 a -50% de su
   ancho. Al llegar a -50% ha recorrido exactamente una copia, así
   que el fotograma final es idéntico al inicial y el reinicio no
   se ve. Por eso las dos mitades tienen que ser iguales.
   ============================================================ */

const CORTE_MANO = "(max-width: 1079px)";

/* Con tres o cuatro datos, una vuelta no llena la pantalla y se
   vería el hueco antes de que empiece a repetirse. Se repite el
   listado hasta llegar a este mínimo. */
const MINIMO_POR_VUELTA = 8;

function WorkMetaBar({ cliente, industria, anio, url }) {
  const cintaRef = useRef(null);
  const esMano = useMediaQuery(CORTE_MANO);

  /* ---- LA CINTA SE PARA CUANDO NADIE LA VE ----
     Un transform en bucle infinito a 60fps durante toda la visita
     es batería a cambio de nada en cuanto la ficha sale de
     pantalla. `animation-play-state` congela y reanuda donde iba,
     así que al volver no da un salto.

     El efecto va SIEMPRE, antes de cualquier salida anticipada:
     React exige el mismo número de hooks en cada render. */
  useEffect(() => {
    const cinta = cintaRef.current;
    if (!cinta) return undefined;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        cinta.toggleAttribute("data-quieta", !entrada.isIntersecting);
      },
      { threshold: 0 }
    );

    observador.observe(cinta);
    return () => observador.disconnect();
  }, [esMano]);

  const celdas = [
    cliente && { icono: User, rotulo: "Cliente", valor: cliente },
    industria && { icono: Building2, rotulo: "Industria", valor: industria },
    anio && { icono: Calendar, rotulo: "Año", valor: anio },
    url && {
      icono: Globe,
      rotulo: "Web",
      valor: (
        <a href={url} target="_blank" rel="noreferrer">
          {url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>
      ),
    },
  ].filter(Boolean);

  if (!celdas.length) return null;

  const pintar = ({ icono: Icono, rotulo, valor }, clave) => (
    <div className="wd-meta__celda" key={clave}>
      <span className="wd-meta__icono" aria-hidden="true">
        <Icono strokeWidth={1.6} />
      </span>

      <span className="wd-meta__texto">
        <span className="wd-meta__rotulo">{rotulo}</span>
        <span className="wd-meta__valor">{valor}</span>
      </span>
    </div>
  );

  /* ---- EN ESCRITORIO NO SE TOCA NADA ----
     Mismo marcado que antes: las celdas sueltas dentro de la
     tarjeta. Ni pista, ni copia, ni animación. */
  if (!esMano) {
    return (
      <div className="wd-tarjeta wd-meta">
        {celdas.map((c) => pintar(c, c.rotulo))}
      </div>
    );
  }

  /* una vuelta completa, ya rellenada hasta llenar la pantalla */
  const vuelta = [];
  while (vuelta.length < MINIMO_POR_VUELTA) {
    vuelta.push(...celdas);
  }

  return (
    <div className="wd-tarjeta wd-meta" ref={cintaRef}>
      {/* La PISTA es la que se mueve, y envuelve a las dos copias:
          animando cada vuelta por separado, cada una viajaría por
          su cuenta y el bucle no cerraría. */}
      <div className="wd-meta__pista">
        {/* la primera copia es la que leen los lectores de pantalla */}
        <div className="wd-meta__vuelta">
          {vuelta.map((c, i) => pintar(c, `a-${i}`))}
        </div>

        {/* la segunda solo cierra el bucle: repetir los mismos
            cuatro datos en voz alta sería ruido */}
        <div className="wd-meta__vuelta" aria-hidden="true">
          {vuelta.map((c, i) => pintar(c, `b-${i}`))}
        </div>
      </div>
    </div>
  );
}

export default WorkMetaBar;
