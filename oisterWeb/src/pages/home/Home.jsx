import "./Home.css";

import { useEffect, useRef, useState } from "react";

import HeroRipples from "./HeroRipples";
import FondoNuevo from "../../componentes/fondoNuevo/FondoNuevo";
import LightDust from "../../componentes/lightDust/LightDust";
import TextoArena from "../../componentes/textoArena/TextoArena";
import HowWeWork from "../../componentes/howWeWork/HowWeWork";
import useMediaQuery from "../../hooks/useMediaQuery";
import useEnPantalla from "../../hooks/useEnPantalla";
import LatestProjects from "../../componentes/latestProjects/LatestProjects";
import About from "../../componentes/about/About";
import UseCases from "../../componentes/useCases/UseCases";

/* HeroVideo: la ostra en vídeo con canal alfa real (ver
   HeroVideo.jsx). No hace falta cargarlo en lazy: el componente
   pesa unos pocos KB — lo que abulta son los vídeos, y esos los
   pide el <video> cuando monta. Las versiones anteriores (ostra
   3D con three.js y luma key en WebGL) se eliminaron del repo:
   están en el historial de git si algún día hacen falta. */
import HeroVideo from "./HeroVideo";

/* Titular del hero. Vive aquí arriba porque se usa DOS veces: una
   como texto completo en el aria-label y otra partido en letras
   para la cascada de entrada. Si se cambia la frase, el acento en
   degradado se recoloca solo — HERO_ACENTO_DESDE lo calcula. */
const HERO_TITULO = "Crafting AI";
/* a partir de qué carácter va el degradado violeta→rosa */
const HERO_ACENTO_DESDE = HERO_TITULO.indexOf("AI");

function HomePage({ introDone = true, introSaliendo = false }) {
  /* mismo breakpoint que el CSS que oculta .hero__right: en
     móvil/tablet la escena ni se monta, así que el mp4 ni se
     descarga (son varios MB que en móvil se pagan caros y no
     se llegarían a ver). */
  const isDesktop = useMediaQuery("(min-width: 1101px)");

  /* La escena ya NO se monta durante la intro (antes lo hacía a
     los ~2.6s con useDeferredMount, para precargar el vídeo en la
     ventana de calma). El motivo del cambio es SAFARI: mientras
     corre la intro, .hero__right está a opacity 0 (Home.css,
     .hero:not(.hero--enter)), y Safari evalúa la política de
     autoplay cuando el vídeo tiene datos — si en ese momento el
     elemento es invisible, decide "no", planta su botón de play
     con la sombra encima, y no siempre re-evalúa al aparecer.
     Montando al terminar la intro, el vídeo nace visible y el
     autoplay nativo pasa la política. El precio es descargar el
     vídeo un par de segundos más tarde; con el alfa real un
     <video> sin datos no pinta nada (no hay rectángulo), así que
     no hace falta esconderlo mientras carga. En revisitas a Home
     (introDone true) monta al instante con el vídeo cacheado. */
  const sceneReady = introDone;

  /* El CTA y el scroll-cue bajan a la sección siguiente SIN tocar
     HowWeWork: el hero conoce a su hermano por nextElementSibling
     (HowWeWork renderiza una <section> como raíz). Con motion
     reducido el viaje es un salto seco, no un paseo. */
  const heroRef = useRef(null);

  /* Disparo único de la entrada de "Casos de uso" (ver el
     comentario junto a la sección, más abajo).

     ---- POR QUÉ ARRANCA JUSTO BAJO EL PLIEGUE ----
     El margen POSITIVO dispara un poco antes de que la sección
     asome, al revés que el resto. La razón es que esta es la
     ÚLTIMA sección de la página: con el scroll al fondo su borde
     superior se queda en 73px y nunca llega a lo alto de la
     ventana, así que hay MUY POCO recorrido después de entrar
     para que la escena se monte.

     El número salió de dos correcciones seguidas, una en cada
     sentido, y por eso conviene dejarlas escritas:

       · con el margen por defecto (-35%) el decorado empezaba
         con la sección ya medio dentro: se llegaba a una sala
         vacía y el fondo se montaba delante;
       · corregido a +30% se fue al otro extremo — medido, a
         600px/s la escena estaba al 97% cuando la sección
         apenas asomaba, o sea que la entrada ocurría entera
         fuera de pantalla y no se veía nada animarse.

     +8% es el punto medio: el fondo se está montando cuando
     llegas, y el texto y las tarjetas entran contigo mirando. */
  const [casosRef, casosDentro] = useEnPantalla({ margen: "0px 0px 8% 0px" });

  /* sin useCallback: va a dos <button> nativos, que no se
     benefician de identidad estable — envolverlo solo sugería
     una optimización que no existía */
  const scrollToNext = () => {
    const next = heroRef.current?.nextElementSibling;
    if (!next) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    next.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  /* el scroll-cue solo tiene sentido con la página virgen: al
     primer scroll se retira (y no vuelve — ya cumplió) */
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---- EL AGUA DEL BOTÓN SE PARA FUERA DE PANTALLA ----
     Sus dos capas animan una custom property (--btn-tilt), y una
     custom property no es compositable: tickea recálculo de
     estilo en main thread cada frame, esté el botón donde esté —
     parte del UpdateLayoutTree continuo medido en la traza de
     producción. Observador SIMÉTRICO local (useEnPantalla no
     encaja: su reset asimétrico dejaría el agua corriendo justo
     tras pasar de largo el hero) que pone la clase directamente
     con classList — sin estado: no hay nada que re-renderizar.
     play-state congela conservando la fase. */
  const gotaRef = useRef(null);

  useEffect(() => {
    const el = gotaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("btn--fuera", !e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* ---- LOS TRES ESTADOS DEL HERO ----
          1 · intro con el telón OPACO → sin clase: el hero se
              pinta entero debajo. Nadie lo ve, pero el navegador
              sí — el LCP y el FCP se registran aquí, y además la
              maquetación, la fuente y las capas llegan resueltas
              al momento del descubrimiento.
          2 · el telón arranca su fundido → hero--velado: todo a
              opacity 0 debajo del telón todavía opaco, para que
              el fundido descubra el fondo solo, como siempre.
          3 · la intro termina → hero--enter: la coreografía de
              entrada corre EXACTAMENTE igual que antes (sus
              keyframes ya arrancan de opacity 0 con fill
              backwards, no dependen del estado previo). */}
      <section
        ref={heroRef}
        className={`hero ${
          introDone ? "hero--enter" : introSaliendo ? "hero--velado" : ""
        }`}
      >
        {/* ---- EL FONDO ----
            Va PRIMERO en el marcado porque es el suelo de la
            sección: todo lo demás se apila encima (ver la escala
            de z-index en Home.css). Hasta ahora el hero no tenía
            fondo propio y se veía el degradado del <body>.

            SUSTITUYE a la trama suelta que había aquí: FondoNuevo
            ya monta esa misma trama por dentro, sobre su degradado
            que gira. Dejar las dos pondría el circuito dos veces,
            una encima de otra.

            `enPausa` mientras corre la intro: si no, su llegada
            —el color entrando, el barrido y el circuito
            revelándose— pasaría entera detrás del telón. Se suelta
            en el mismo instante en que el hero recibe su clase de
            entrada, así que las dos cosas entran juntas. */}
        <FondoNuevo className="hero__fondo" enPausa={!introDone} />

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
            {/* El titular es ahora una DECLARACIÓN de dos palabras,
                no una frase. Por eso desaparece el eyebrow que
                había encima ("Estudio creativo · Marketing con IA"):
                un kicker existe para dar contexto a un titular
                largo, y sobre dos palabras solo competiría con
                ellas. El contexto lo da ya el párrafo de debajo. */}
            {/* El titular se compone LETRA A LETRA (ver la cascada
                en Home.css). Se parte aquí y no con JS de runtime
                porque son once caracteres fijos: no hay nada que
                calcular.

                aria-label + aria-hidden NO son opcionales: sin
                ellos un lector de pantalla encuentra once
                elementos sueltos y deletrea "C, R, A, F...". El
                atributo del h1 le da el texto de una pieza. Mismo
                patrón que el CTA de "Ver todos los proyectos".

                --i alimenta el retardo de cada letra en CSS, así
                que el escalonado no depende de nth-child y da
                igual cuántas letras tenga el titular. */}
            <TextoArena>
              <h1
                className="hero__title hero__title--declaracion"
                aria-label={HERO_TITULO}
              >
                {[...HERO_TITULO].map((caracter, i) =>
                  caracter === " " ? (
                    <span key={i} className="hero__title-espacio" aria-hidden="true">
                      {" "}
                    </span>
                  ) : (
                    <span
                      key={i}
                      className={`hero__title-letra${
                        i >= HERO_ACENTO_DESDE ? " hero__title-letra--acento" : ""
                      }`}
                      style={{ "--i": i }}
                      aria-hidden="true"
                    >
                      {caracter}
                    </span>
                  )
                )}
              </h1>
            </TextoArena>

            <TextoArena>
              <p className="hero__description">
                La creatividad evoluciona, y en OYSTERS estamos en el centro de
                esa transformación. Combinamos la intuición humana con la
                precisión de la IA para idear, planificar y ejecutar estrategias
                publicitarias de marca de principio a fin.
              </p>
            </TextoArena>

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

                <button
                  type="button"
                  ref={gotaRef}
                  className="btn btn--primary btn--drop"
                  onClick={scrollToNext}
                >
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
        </div>

        {/* Cuelga de .hero y no de .hero__container: es
            position:fixed, o sea que su sitio en pantalla no
            depende del padre, y el acople se recalcula solo contra
            quien sea (useHeroScrollDock usa parentElement). */}
        {isDesktop && sceneReady && <HeroVideo />}

        {/* scroll-cue: la señal de que hay página debajo. Es un
            botón de verdad (baja a la sección siguiente); al
            primer scroll se desvanece y suelta los pointer-events */}
        <button
          type="button"
          className={`hero__scroll-cue ${hasScrolled ? "is-hidden" : ""}`}
          onClick={scrollToNext}
          aria-label="Bajar a la siguiente sección"
        >
          <span className="hero__scroll-line" aria-hidden="true" />
        </button>

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

      <LatestProjects />

      <About />

      {/* ---- CASOS DE USO ----
          Va después de "Nosotros": primero quiénes somos y luego
          en qué se traduce eso.

          Trae su propio fondo y por eso va envuelta: la escena es
          una capa a pantalla completa colocada en absoluto, así que
          necesita un contenedor que la contenga. Sin él se saldría
          de la sección y taparía lo que tiene encima y debajo.

          ---- UN SOLO DISPARO PARA LAS DOS PIEZAS ----
          La entrada va escalonada —primero se coloca el fondo,
          luego el texto y al final las tarjetas—, y eso solo se
          sostiene si las dos mitades arrancan del MISMO instante.
          Con un observador en cada componente, cada uno dispararía
          en su propio píxel de scroll (sus cajas no son idénticas)
          y el orden dejaría de estar garantizado.

          Así que el disparo vive aquí, en el contenedor, y baja
          como prop. Ninguna de las dos necesita saber de la otra
          ni alcanzar sus clases desde su hoja de estilos. */}
      <section id="casos-de-uso" className="home-casos" ref={casosRef}>
        {/* ---- EL MISMO FONDO QUE LAS OTRAS TRES ----
            Sustituye a UseCasesBackground, la escena propia que
            tenía esta sección —paneles en perspectiva, retícula
            de puntos, marcas y halo—. Era la última del home con
            fondo distinto: las cuatro comparten ahora el mismo
            degradado que gira con el circuito revelándose encima.

            Se va también el FondoTrama suelto que había aquí
            debajo: FondoNuevo lo monta por dentro, con el mismo
            `ft--sin-base` que estaba puesto, así que montar los
            dos sería dibujar el circuito dos veces.

            `enPausa` cuelga del mismo observador que ya usaba la
            sección para escalonar su entrada, así que la llegada
            del fondo ocurre al alcanzarla scrolleando y no a
            espaldas del visitante. */}
        <FondoNuevo
          className="home-casos__fondo fn--onda-arriba"
          enPausa={!casosDentro}
        />

        <UseCases dentro={casosDentro} />
      </section>
    </>
  );
}

export default HomePage;
