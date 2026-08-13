import "./HowWeWork.css";
import LightDust from "../lightDust/LightDust";
import FondoNuevo from "../fondoNuevo/FondoNuevo";
import InteligenciaIA from "../inteligenciaIA/InteligenciaIA";
import { useEffect, useRef, useState } from "react";

function HowWeWork() {
  const sectionRef = useRef(null);
  const [landed, setLanded] = useState(false);

  const pistaRef = useRef(null);

  /* Enciende el halo y la sombra cuando la ostra está llegando.
     Reset ASIMÉTRICO: solo se apaga si sale del viewport por
     ABAJO (top > 0 = has vuelto arriba) → al volver a bajar
     rehace su entrada. Si sale por ARRIBA (top < 0 = sigues
     bajando), se queda encendida.

     ---- SE OBSERVA LA PISTA, NO LA SECCIÓN ----
     Antes vigilaba la sección entera con un umbral del 45% de su
     superficie. Eso valía cuando medía ~600px; con el contenido
     nuevo pasa de 2000px, y el 45% de 2000 son 900px de sección
     visible a la vez — o sea que en una pantalla de portátil el
     umbral no se alcanza NUNCA. Consecuencias: el halo no se
     encendía y, como el fondo tiene su llegada atada a este mismo
     estado, tampoco arrancaba.

     La pista mide unos 420px y es lo que de verdad interesa: se
     enciende cuando ella está a la vista. */
  useEffect(() => {
    const el = pistaRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.45) {
          setLanded(true);
        } else if (entry.boundingClientRect.top > 0) {
          setLanded(false); // salió por abajo: subiste
        }
      },
      { threshold: [0, 0.45, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`how-we-work ${landed ? "how-we-work--landed" : ""}`}
      id="que-hacemos"
    >
      {/* ---- EL FONDO ----
          El mismo que el hero: degradado que gira e invierte sus
          colores, con el circuito revelándose encima. Sustituye a
          la trama suelta que había aquí —FondoNuevo ya la monta
          por dentro—, y tapa el degradado plano de la sección, que
          se queda como color de respaldo.

          `enPausa` atado a `landed`, que es el observador que esta
          sección ya tenía para encender su halo: así la llegada
          del fondo no se gasta a espaldas del visitante mientras
          la sección está fuera de pantalla, sino que ocurre justo
          cuando se llega scrolleando. */}
      <FondoNuevo
        className="how-we-work__fondo fn--onda-arriba"
        enPausa={!landed}
      />

      {/* polvo de luz cayendo: llena el aire de la sección */}
      <LightDust />

      {/* ---- EL CONTENIDO ES AHORA EL BLOQUE DE "CÓMO LO HACEMOS" ----
          Aquí vivía el contenido propio de la sección: rótulo,
          titular, párrafo y las cuatro tarjetas (Automatización
          Inteligente, Marketing con IA, Desarrollo de Soluciones y
          Consultoría Tecnológica). Se ha sustituido por el bloque
          de InteligenciaIA — titular con vídeo,
          misión y visión, y el mapa de los cuatro apartados
          alrededor del anillo con su luz recorriéndolo.

          ---- POR QUÉ LA SECCIÓN SE QUEDA Y SOLO CAMBIA LO DE
               DENTRO ----
          Porque esta sección hace tres cosas que no se ven y que se
          habrían perdido al borrarla:

            · lleva el `id="que-hacemos"`, al que apunta el menú y
              que además MIDE useHeroScrollDock para saber dónde
              termina el viaje de la ostra;
            · contiene la PISTA DE ATERRIZAJE — el halo que la
              recibe. El hook busca `.how-we-work__halo` por
              selector: sin ese elemento, la ostra viaja y no se
              acopla a nada;
            · monta el fondo con su onda de entrada y el polvo de
              luz, que cosen esta sección con el hero de arriba.

          La pista va en la COLUMNA IZQUIERDA que el bloque ya
          reservaba para la esfera. O sea que la ostra del hero
          aterriza justo en el sitio que estaba guardado para ella. */}
      <InteligenciaIA
        sobreFondo
        pista={
          <div className="how-we-work__scene" ref={pistaRef} aria-hidden="true">
            <div className="how-we-work__halo" />
            <div className="how-we-work__glow" />
            <div className="how-we-work__shadow" />
          </div>
        }
      />

    </section>
  );
}

export default HowWeWork;