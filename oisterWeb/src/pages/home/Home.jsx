import "./Home.css";
import HeroScene from "./HeroScene";
import useMediaQuery from "../../hooks/useMediaQuery";

function HomePage({ introDone = true }) {
  /* mismo breakpoint que el CSS que oculta .hero__right:
     en móvil/tablet la escena ni se monta (ahorra un canvas
     WebGL entero); en desktop se monta SOLO cuando el intro
     termina — el GLB ya está descargado (preload), así que
     solo queda parsear + compilar shaders, y eso ocurre
     cuando el intro ya no está en pantalla y no puede
     robarle frames. */
  const isDesktop = useMediaQuery("(min-width: 1101px)");

  return (
    <>
      <section className={`hero ${introDone ? "hero--enter" : ""}`}>
        <div className="hero__container">
          {/* LEFT */}
          <div className="hero__left">
            <div className="hero__badge">
              <span>✦</span>
              Agencia IA
            </div>

            <h1 className="hero__title">
              Combinamos <span>inteligencia artificial</span> y creatividad
              humana para resultados extraordinarios.
            </h1>

            <p className="hero__description">
              Analizamos, creamos y optimizamos campañas de marketing con IA
              para conectar marcas con personas de forma más eficiente, precisa
              y escalable.
            </p>

            <div className="hero__buttons">
              <button className="btn btn--primary">Descubre cómo</button>

              <button className="btn btn--secondary">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M4 2.5v9l7-4.5-7-4.5z" fill="currentColor" />
                </svg>
                Ver casos de uso
              </button>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <h3>+120</h3>
                <p>Proyectos exitosos</p>
              </div>

              <div className="hero__stat">
                <h3>35%</h3>
                <p>Promedio de mejora</p>
              </div>

              <div className="hero__stat">
                <h3>+2M</h3>
                <p>Personas alcanzadas</p>
              </div>
            </div>
          </div>

          {/* RIGHT — solo desktop y solo tras el intro */}
          {isDesktop && introDone && (
            <div className="hero__right">
              <HeroScene introDone={introDone} />
              <div className="hero__floor"></div>
              <div className="hero__shadow"></div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default HomePage;