import "./About.css";
import Rotulo from "../rotulo/Rotulo";
import Reveal from "../reveal/Reveal";
import LightDust from "../lightDust/LightDust";
import TeamCard from "./TeamCard";
import ValueCard from "./ValueCard";
import { aboutTeam, aboutValues } from "../../data/about";
import heroImg from "../../assets/images/about/hero/about-hero-dark.png";
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
  return (
    <section id="nosotros" className="about" aria-labelledby="about-titulo">
      <div className="about__wave about__wave--top" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 L1440,0 L1440,56 C1230,112 1010,70 740,48 C470,26 220,118 0,72 Z" />
        </svg>
      </div>
      <img className="about__bg" src={bgGlow} alt="" aria-hidden="true" loading="lazy" decoding="async" />

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

            <h2 id="about-titulo" className="about-hero__title">
              Somos más que una agencia, somos tu <span>socio estratégico en IA.</span>
            </h2>

            <p className="about-hero__desc">
              Combinamos inteligencia artificial, creatividad y datos para
              transformar ideas en soluciones reales que impulsan el
              crecimiento de marcas y empresas.
            </p>

            <div className="about-team">
              {aboutTeam.map((member, i) => (
                <Reveal key={member.id} delay={i * 0.12}>
                  <TeamCard {...member} />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="about-hero__media">
            <span className="about-hero__halo" aria-hidden="true" />
            <img src={heroImg} alt="Estudio Oyster" loading="lazy" decoding="async" />
            <span className="about-hero__spark" aria-hidden="true" />
          </div>
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
