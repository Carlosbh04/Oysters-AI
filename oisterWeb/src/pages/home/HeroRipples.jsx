import "./HeroRipples.css";

/* Ondas de agua concéntricas bajo la ostra (solo desktop).
   Cinco anillos elípticos que nacen en el centro, se expanden
   y se desvanecen, con delays escalonados NEGATIVOS: el ciclo
   ya está en marcha al llegar — nunca se ve "arrancar".
   Escenario del HERO: no viaja con la ostra al hacer scroll. */
function HeroRipples() {
  return (
    <div className="hero-ripples" aria-hidden="true">
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