import "./Home.css";
import HeroScene from "./HeroScene";
import HeroRipples from "./HeroRipples";
import LightDust from "../../componentes/lightDust/LightDust";
import HowWeWork from "../../componentes/howWeWork/HowWeWork";
import useMediaQuery from "../../hooks/useMediaQuery";
import useDeferredMount from "../../hooks/useDeferredMount";

function HomePage({ introDone = true }) {
  /* mismo breakpoint que el CSS que oculta .hero__right:
     en móvil/tablet la escena ni se monta (ahorra un canvas
     WebGL entero); en desktop se monta SOLO cuando el intro
     termina — el GLB ya está descargado (preload), así que
     solo queda parsear + compilar shaders, y eso ocurre
     cuando el intro ya no está en pantalla y no puede
     robarle frames. */
  const isDesktop = useMediaQuery("(min-width: 1101px)");

  /* la escena 3D monta DIFERIDA solo en la PRIMERA carga
     (debajo del intro): el trabajo pesado cae en la ventana
     de calma. En cualquier revisita a Home (introDone ya es
     true porque App conserva el estado entre rutas) monta AL
     INSTANTE — el GLB ya está cacheado por useGLTF y no hay
     intro al que proteger. */
 const deferred = useDeferredMount(999999);
  const sceneReady = introDone || deferred;

  return (
    <>
      <section className={`hero ${introDone ? "hero--enter" : ""}`}>
        {/* ondas de agua bajo la ostra: escenario del hero,
            NO viajan con ella al hacer scroll */}
        <HeroRipples />

        {/* polvo de luz cayendo, como en HowWeWork */}
        <LightDust />

        <div className="hero__container">
          {/* LEFT — composición limpia: título, descripción, CTA.
              (badge, botón secundario y stats fuera: el hero
              respira como en el mockup) */}
          <div className="hero__left">
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
              {/* CTA gota de agua: .btn-droplet es una GOTA de
                  verdad (forma de lágrima con la punta arriba,
                  mismo gradiente del botón) que cae, hace boom
                  contra el suelo deshaciéndose en charquito, y
                  de ahí brota el botón agrandándose (boom) con
                  todo su contenido. El stage centra la gota
                  sobre el botón sin importar su ancho. */}
              <span className="btn-drop-stage">
                <span className="btn-droplet" aria-hidden="true" />

                <button className="btn btn--primary btn--drop">
                  {/* capa de agua del hover: nivel + oleaje
                      (estilos en Home.css, .btn__water) */}
                  <span className="btn__water" aria-hidden="true" />
                  <span className="btn__label">Descubre cómo</span>
                  <span className="btn__arrow" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 7h9M7.5 3.5 11 7l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </span>
            </div>
          </div>

          {/* RIGHT — solo desktop. Se monta DESDE EL ARRANQUE,
              debajo del intro: el GLB se parsea y los shaders
              compilan mientras el intro tapa la pantalla. Al
              caer el telón, la ostra ya está lista y pequeñita
              (el spring de nacimiento espera a introDone) y
              hace su pop justo en el reveal — no llega tarde.
              El Suspense local de HeroScene atrapa la carga. */}
          {isDesktop && sceneReady && (
            <div className="hero__right">
              <HeroScene introDone={introDone} />
              <div className="hero__floor"></div>
            </div>
          )}
        </div>

        {/* ---- onda de cierre del hero ----
            La curva orgánica que separa el hero de la sección
            siguiente (como en el mockup). Su color vive en
            --hero-wave-color (Home.css): ponle EXACTAMENTE el
            background de la sección "Qué hacemos" para que se
            fundan sin costura. preserveAspectRatio="none" →
            la curva estira a cualquier ancho sin deformar
            el layout. */}
        <div className="hero__wave" aria-hidden="true">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,72 C220,118 470,26 740,48 C1010,70 1230,112 1440,56 L1440,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* la sección que recibe a la ostra al hacer scroll */}
      <HowWeWork />
    </>
  );
}

export default HomePage;