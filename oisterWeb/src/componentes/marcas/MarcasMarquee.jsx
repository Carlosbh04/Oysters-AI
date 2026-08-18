import { useEffect, useRef } from "react";
import "./MarcasMarquee.css";
import { getMarcas } from "../../data/marcas";

/* ============================================================
   CINTA DE MARCAS

   Desplazamiento infinito, CSS puro: cero JS de animación y cero
   listeners de scroll.

   CÓMO SE CIERRA EL BUCLE
   La pista lleva el listado DOS VECES y se anima de 0 a -50% de
   su propio ancho. Al llegar a -50% ha recorrido exactamente una
   copia, así que el fotograma final es idéntico al inicial y el
   salto del reinicio no se ve. Es lo que hace que parezca
   infinito sin medir nada.

   Por eso la copia tiene que ser EXACTA: si las dos mitades no
   miden lo mismo, el empalme se nota en cada vuelta.
   ============================================================ */

/* Con pocas marcas, una sola pasada puede no llenar la pantalla
   y dejaría un hueco antes de empezar a repetirse. Se repite el
   listado hasta llegar a este mínimo. */
const MINIMO_POR_VUELTA = 8;

function MarcasMarquee() {
  const marcas = getMarcas();
  const cintaRef = useRef(null);

  /* ---- LA CINTA SE PARA CUANDO NADIE LA VE ----
     Iba a 38s en bucle infinito desde que carga la página, la
     mires o no: una animación de transform corriendo a 60fps en
     el fondo del documento durante toda la visita. En un móvil
     eso es batería a cambio de nada, y es exactamente por lo que
     se retiró el efecto de arena.

     El observador la enciende al asomar y la apaga al salir. No
     desmonta nada ni reinicia el bucle —`animation-play-state`
     congela y reanuda donde iba—, así que al volver a entrar la
     cinta sigue por donde estaba y no da un salto.

     El efecto va SIEMPRE, antes del `return null` de más abajo,
     porque un hook no puede quedar detrás de una salida
     anticipada: React exige el mismo número de hooks en cada
     render. Por eso el guard vive dentro. */
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
  }, []);

  if (marcas.length === 0) return null;

  /* una vuelta completa, ya rellenada */
  const vuelta = [];
  while (vuelta.length < MINIMO_POR_VUELTA) {
    vuelta.push(...marcas);
  }

  const pintar = (m, i, copia) => (
    <li className="marcas__item" key={`${copia}-${i}`}>
      {m.Icono && (
        <m.Icono
          size={16}
          strokeWidth={2.2}
          aria-hidden="true"
          style={{ color: m.color }}
        />
      )}
      <span>{m.nombre}</span>
    </li>
  );

  return (
    <section className="marcas" ref={cintaRef} aria-labelledby="marcas-titulo">
      <h2 id="marcas-titulo" className="marcas__titulo">
        Marcas para las que hemos desarrollado proyectos de IA
      </h2>

      <div className="marcas__ventana">
        {/* La PISTA es la que se mueve, y envuelve a las dos
            copias: si se animara cada lista por separado, cada
            una viajaría por su cuenta y el bucle no cerraría. */}
        <div className="marcas__pista">
          <ul className="marcas__vuelta">
            {/* la primera copia es la que leen los lectores de
                pantalla */}
            {vuelta.map((m, i) => pintar(m, i, "a"))}
          </ul>

          {/* la segunda va aria-hidden: visualmente cierra el
              bucle, pero repetirla en voz alta sería ruido */}
          <ul className="marcas__vuelta" aria-hidden="true">
            {vuelta.map((m, i) => pintar(m, i, "b"))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default MarcasMarquee;
