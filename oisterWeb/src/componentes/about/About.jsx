import "./About.css";
import Rotulo from "../rotulo/Rotulo";
import TextoArena from "../textoArena/TextoArena";
import Reveal from "../reveal/Reveal";
import FondoNuevo from "../fondoNuevo/FondoNuevo";
import LightDust from "../lightDust/LightDust";
import useEnPantalla from "../../hooks/useEnPantalla";
import TeamCard from "./TeamCard";
import ValueCard from "./ValueCard";
import { aboutTeam, aboutValues } from "../../data/about";
import bgGlow from "../../assets/images/about/backgrounds/bg-glow.svg";

/* Sección "Sobre nosotros": hero (texto + imagen a la derecha),
   dos tarjetas de equipo y una fila de cinco tarjetas de valores.
   Los textos son placeholders: los datos viven en data/about.js.
   Se monta como un <section> standalone (igual que HowWeWork)
   para integrarse en cualquier página.

   El título es <h2> y no <h1>: la sección vive dentro de Home,
   que ya tiene su <h1> en el hero. Dos <h1> en la misma página
   rompen la navegación por encabezados. */
function About() {
  /* ---- SOLO PARA EL FONDO ----
     Marca cuándo la sección está a la vista, y con eso se suelta
     la llegada de FondoNuevo (`enPausa`). Es el mismo criterio que
     usan "Qué hacemos" y "Últimos proyectos" con su `landed`: sin
     esto, la entrada del fondo se gastaría nada más cargar la
     página, con la sección todavía a dos pantallas de distancia, y
     al llegar scrolleando estaría ya puesta.

     El reset de este hook es asimétrico —solo se apaga si vuelves
     ARRIBA—, que es justo lo que hace `landed` en las otras dos:
     bajando, el fondo no se reinicia a tu espalda. */
  const [seccionRef, aLaVista] = useEnPantalla();

  return (
    <section
      id="nosotros"
      className="about"
      aria-labelledby="about-titulo"
      ref={seccionRef}
    >
      <div className="about__wave about__wave--top" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 L1440,0 L1440,56 C1230,112 1010,70 740,48 C470,26 220,118 0,72 Z" />
        </svg>
      </div>
      <img className="about__bg" src={bgGlow} alt="" aria-hidden="true" loading="lazy" decoding="async" />

      {/* ---- EL FONDO ----
          El mismo que el hero, "Qué hacemos" y "Últimos
          proyectos": el degradado que gira e invierte sus colores,
          con el circuito revelándose encima.

          Antes aquí iba un <FondoTrama> suelto, o sea SOLO el
          circuito sobre el degradado plano de la sección. Esa era
          la diferencia que se notaba al llegar scrolleando: las
          tres secciones de arriba tenían el color moviéndose
          debajo del dibujo y esta lo tenía quieto. No hace falta
          montar los dos — FondoNuevo ya lleva FondoTrama dentro,
          con el mismo `ft--sin-base` que estaba puesto aquí.

          `enPausa` colgado del observador de la sección, igual que
          en sus dos hermanas. */}
      <FondoNuevo
        className="about__fondo fn--onda-arriba"
        enPausa={!aLaVista}
      />

      {/* Polvo de luz cayendo, igual que en el hero, HowWeWork y
          los últimos proyectos: sin él la sección era la única
          del home con el aire quieto, y el corte se notaba al
          llegar scrolleando.

          Va DESPUÉS del fondo y ANTES del contenedor: las motas
          quedan sobre el halo y por debajo del texto. */}
      <LightDust />

      <div className="about__container">
        {/* Manifiesto y equipo se perciben como una única composición. */}
        {/* threshold 0 + margen inferior: el disparo deja de
            depender de lo alto que sea el bloque y pasa a ser
            "su borde superior ha subido por encima del 60% de
            la ventana". Ver el porqué en Reveal.jsx. */}
        <Reveal
          variant="up"
          className="about-hero"
          threshold={0}
          rootMargin="0px 0px -40% 0px"
        >
          <div className="about-hero__text">
            <Rotulo className="about-hero__eyebrow">Sobre nosotros</Rotulo>

            {/* El titular es una DECLARACIÓN de dos frases, la
                segunda en rosa; el párrafo de debajo es el que
                explica el qué. */}
            <TextoArena>
              <h2 id="about-titulo" className="about-hero__title">
                No somos una agencia más.{" "}
                <span>Somos tu socio estratégico.</span>
              </h2>
            </TextoArena>

            <TextoArena>
              <p className="about-hero__desc">
                Unimos estrategia, creatividad y datos con el potencial de la
                inteligencia artificial para crear marketing más inteligente,
                personalizado y efectivo, desde la idea hasta los resultados.
              </p>
            </TextoArena>

            <div className="about-team">
              {aboutTeam.map((member, i) => (
                <Reveal key={member.id} delay={i * 0.12}>
                  <TeamCard {...member} />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Aquí iba el retrato de la derecha. Se quitó a
              petición, y con él su halo y el destello que tenía
              posado encima: los dos existían para meterla en la
              atmósfera de la sección, y sin ella se leen como dos
              luces sueltas en una esquina vacía.

              Lo que SÍ se queda es el aura de .about-hero::before:
              esa no era suya, es el color de fondo de ese lado. Sin
              ella la mitad derecha se queda en morado plano. Misma
              razón por la que .ucb__halo sobrevivió a la figura en
              Casos de uso. */}
        </Reveal>

        <div className="about-values">
          {aboutValues.map((value, i) => (
            <Reveal key={value.id} delay={i * 0.08}>
              <ValueCard {...value} />
            </Reveal>
          ))}
        </div>
      </div>

      <div className="about__wave about__wave--bottom" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 L1440,0 L1440,56 C1230,112 1010,70 740,48 C470,26 220,118 0,72 Z" />
        </svg>
      </div>
    </section>
  );
}

export default About;
