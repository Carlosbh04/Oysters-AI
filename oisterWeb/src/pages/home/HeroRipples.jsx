import "./HeroRipples.css";
import { useEffect, useRef } from "react";

/* Ondas de agua concéntricas bajo la ostra (solo desktop).
   Cinco anillos elípticos que nacen en el centro, se expanden
   y se desvanecen, con delays escalonados NEGATIVOS: el ciclo
   ya está en marcha al llegar — nunca se ve "arrancar".
   Escenario del HERO: no viaja con la ostra al hacer scroll. */
function HeroRipples() {
  const raizRef = useRef(null);

  /* seis animaciones infinitas que seguían corriendo con el hero
     ya scrolleado. Observador simétrico → clase → play-state
     paused (patrón de la casa): la pausa conserva la fase Y los
     desfases negativos entre anillos — al volver, la emisión
     continúa donde estaba, sin arranque visible. classList y no
     estado: no hay nada que re-renderizar. */
  useEffect(() => {
    const el = raizRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("hero-ripples--fuera", !e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="hero-ripples" aria-hidden="true" ref={raizRef}>
      <span className="hero-ripples__core" />

      <span className="hero-ripples__ring" style={{ "--i": 0 }} />
      <span className="hero-ripples__ring" style={{ "--i": 1 }} />
      <span className="hero-ripples__ring" style={{ "--i": 2 }} />
      <span className="hero-ripples__ring" style={{ "--i": 3 }} />
      <span className="hero-ripples__ring" style={{ "--i": 4 }} />
    </div>
  );
}

export default HeroRipples;