import "./HowWeWork.css";
import ServiceCard from "./ServiceCard";
import LightDust from "../lightDust/LightDust";
import howWeWork from "../../data/howWeWork";
import { useEffect, useRef, useState } from "react";

function HowWeWork() {
  const sectionRef = useRef(null);
  const [landed, setLanded] = useState(false);

  /* La sección detecta por sí misma cuándo está en pantalla
     (≈ cuando la ostra completa su viaje y se acopla) y
     enciende halo + sombra. Autosuficiente: no depende de
     variables publicadas por la escena 3D. Reversible: al
     scrollear de vuelta arriba, las luces se apagan. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setLanded(entry.intersectionRatio >= 0.45),
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
      {/* polvo de luz cayendo: llena el aire de la sección */}
      <LightDust />

      <div className="how-we-work__container">
        {/* ===== Columna izquierda: PISTA DE ATERRIZAJE =====
            Aquí NO se renderiza nada 3D: es el hueco reservado
            donde la ostra del hero (position:fixed en desktop)
            aterriza al completar el scroll. Solo lleva el halo
            de suelo que la recibe. */}
        <div className="how-we-work__scene" aria-hidden="true">
          {/* halo de luz + sombra de agua: invisibles hasta que
              la ostra completa el viaje (se revelan con
              --h-scroll-p, que Oyster.jsx publica en :root) */}
          <div className="how-we-work__halo" />
          <div className="how-we-work__glow" />
          <div className="how-we-work__shadow" />
        </div>

        {/* ===== Columna derecha: contenido ===== */}
        <div className="how-we-work__content">
          <p className="how-we-work__eyebrow">Qué hacemos</p>

          <h2 className="how-we-work__title">
            Soluciones de IA y marketing
            <br />
            que generan <span>resultados reales.</span>
          </h2>

          <p className="how-we-work__description">
            Combinamos estrategia, creatividad y tecnología para ayudar a
            marcas a crecer, automatizar procesos y conectar con las personas
            correctas. Desde la inteligencia artificial hasta el análisis de
            datos, creamos soluciones personalizadas y medibles que impulsan
            resultados reales y sostenibles en el tiempo.
          </p>

          <div className="how-we-work__cards">
            {howWeWork.map((service) => (
              /* el wrapper lleva la animación de aparición:
                 así no pisa el transform del hover de la card */
              <div className="how-we-work__reveal" key={service.id}>
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowWeWork;