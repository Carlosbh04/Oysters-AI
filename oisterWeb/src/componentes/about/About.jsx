import "./About.css";
import { useEffect, useRef, useState } from "react";
import Rotulo from "../rotulo/Rotulo";
import TextoArena from "../textoArena/TextoArena";
import Reveal from "../reveal/Reveal";
import FondoNuevo from "../fondoNuevo/FondoNuevo";
import LightDust from "../lightDust/LightDust";
import useEnPantalla from "../../hooks/useEnPantalla";
import useMediaQuery from "../../hooks/useMediaQuery";
import TeamCard from "./TeamCard";
import ValueCard from "./ValueCard";
import { aboutTeam, aboutValues } from "../../data/about";
import bgGlow from "../../assets/images/about/backgrounds/bg-glow.svg";

/* ============================================================
   MÓVIL: OTRA MAQUETA, NO LA MISMA ENCOGIDA

   Por debajo de 1080 —el mismo corte que el resto de la portada—
   esta sección deja de ser dos tarjetas de equipo más cinco de
   valores.

   El motivo no es la altura, aunque también: 2.414px en un móvil
   de 390 contra 1.049 en escritorio. El motivo es QUÉ ocupa esa
   altura. Los cinco valores eran cinco tarjetas idénticas de
   icono redondo + título + texto, que es el patrón que DESIGN.md
   prohíbe por su nombre —la agencia de plantilla—, y encima es lo
   que menos dice: "creatividad aplicada" e "innovación constante"
   los firma cualquier estudio del mundo.

   Lo que sí es de esta casa son DOS PERSONAS con nombre, cargo y
   cara. Eso no lo puede copiar nadie diciéndolo. Así que en la
   mano mandan ellas: retratos a sangre con el nombre montado al
   pie, igual que la ficha de trabajos. Y los cinco valores bajan
   a una sola pieza, un sello con cinco cláusulas (ver el bloque
   de los valores, más abajo, para por qué NO son un hilo).

   ⚠️ El árbol de ESCRITORIO no se toca. Si algo cambia ahí, es un
   error. */
const CORTE_MANO = "(max-width: 1079px)";

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

  const esMano = useMediaQuery(CORTE_MANO);

  /* ---- LA MARQUESINA SE PARA EN EL CENTRO ----
     El desfile corre y, EN EL INSTANTE en que un título cruza el
     centro del marco, se congela ahí. Lo lee unos segundos y
     sigue. La parada no corrige nada: cuando ocurre, el título ya
     está donde tiene que estar.

     ---- POR QUÉ NO ERA ASÍ ANTES, Y POR QUÉ SE VEÍA MAL ----
     La primera versión paraba por reloj —cada 3,8 s, cayera donde
     cayera— y DESPUÉS deslizaba el título más cercano hasta el
     centro. Dos movimientos seguidos: un frenazo y una
     corrección. Ese segundo tirón es lo que se leía como un
     fallo, porque lo es: la pieza se estaba enmendando a sí misma
     delante del visitante.

     Ahora hay un solo movimiento. El precio es tener que VIGILAR
     dónde está la cinta, y eso se hace midiendo por fotograma —
     pero con dos lecturas de caja, no diez: los centros de los
     títulos dentro de la pista se miden UNA vez y se guardan; por
     fotograma solo se lee dónde está la pista y dónde el marco.

     `MARGEN` es la tolerancia en píxeles. A la velocidad del
     desfile la cinta avanza medio píxel por fotograma, así que 4
     se acierta siempre sin quedarse corto en pantallas lentas. */
  const [valorActivo, setValorActivo] = useState(0);
  const [cintaQuieta, setCintaQuieta] = useState(false);
  /* solo lo usa el TOQUE: al elegir a mano, el título tocado
     puede estar en cualquier sitio y hay que traerlo al centro.
     En las paradas automáticas vale 0 — ya está centrado. */
  const [ajuste, setAjuste] = useState(0);
  const marcoRef = useRef(null);
  const maquina = useRef({});

  useEffect(() => {
    if (!esMano) return;

    const marco = marcoRef.current;
    if (!marco) return;

    let vivo = true;
    const R = {};
    const mando = maquina.current;
    const MARGEN = 4;
    /* tiempo mínimo de desfile entre dos paradas: sin él, al
       reanudar el título sigue centrado un par de fotogramas y
       volvería a pararse en el sitio */
    const RODAJE = 2200;
    const LECTURA = 3600;
    const LECTURA_TOQUE = 5000;

    const sinMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (sinMovimiento) return;

    /* los centros de cada título DENTRO de la pista, medidos una
       sola vez: no cambian mientras no cambie la tipografía */
    let centros = [];
    const medirCentros = () => {
      const pista = marco.querySelector(".ab-valores__pista");
      if (!pista) return;
      centros = [...pista.querySelectorAll(".ab-valores__titular")].map(
        (el) => el.offsetLeft + el.offsetWidth / 2
      );
    };
    medirCentros();

    const observaTam = new ResizeObserver(medirCentros);
    observaTam.observe(marco);

    let rodando = false;
    let desde = 0;
    let rafId = null;

    const vigilar = (ahora) => {
      if (!vivo || !rodando) return;

      if (ahora - desde >= RODAJE) {
        const pista = marco.querySelector(".ab-valores__pista");
        const cajaMarco = marco.getBoundingClientRect();
        const cajaPista = pista.getBoundingClientRect();
        const centro = cajaMarco.left + cajaMarco.width / 2;

        for (let i = 0; i < centros.length; i++) {
          const enPantalla = cajaPista.left + centros[i];
          if (Math.abs(enPantalla - centro) <= MARGEN) {
            parar(i % aboutValues.length);
            return;
          }
        }
      }
      rafId = requestAnimationFrame(vigilar);
    };

    const arrancar = () => {
      if (!vivo) return;
      setAjuste(0);
      setCintaQuieta(false);
      rodando = true;
      desde = performance.now();
      rafId = requestAnimationFrame(vigilar);
    };

    const parar = (i, ms = LECTURA) => {
      rodando = false;
      if (rafId) cancelAnimationFrame(rafId);
      setCintaQuieta(true);
      setValorActivo(i);
      R.lectura = setTimeout(arrancar, ms);
    };

    /* el toque: para donde esté, trae el título tocado al centro
       —aquí sí hace falta la pista— y da más tiempo de lectura */
    mando.parar = (i, el) => {
      if (!vivo) return;
      clearTimeout(R.lectura);
      rodando = false;
      if (rafId) cancelAnimationFrame(rafId);
      setCintaQuieta(true);
      if (i != null) setValorActivo(i);
      if (el) {
        const cajaMarco = marco.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        const delta =
          cajaMarco.left + cajaMarco.width / 2 - (b.left + b.width / 2);
        setAjuste((previo) => Math.max(-140, Math.min(140, previo + delta)));
      }
      R.lectura = setTimeout(arrancar, LECTURA_TOQUE);
    };

    arrancar();

    return () => {
      vivo = false;
      rodando = false;
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(R.lectura);
      observaTam.disconnect();
      mando.parar = undefined;
    };
  }, [esMano]);

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

            {esMano ? (
              /* ---- DOS NOMBRES ----
                 Los retratos salen a sangre por los dos lados y el
                 nombre va montado sobre el pie de la foto: el mismo
                 gesto que la ficha de "Nuestros trabajos", para que
                 las dos secciones se reconozcan como parientes.

                 No es un enlace entero a LinkedIn, y eso es a
                 propósito: esas URL apuntan hoy a la portada de
                 LinkedIn, no a los perfiles (está anotado en
                 data/about.js). Una foto a pantalla completa que
                 lleva a una página genérica es peor que un enlace
                 pequeño y explícito, así que el enlace se queda
                 pequeño y explícito hasta que las URL sean reales. */
              <div className="ab-gente">
                {aboutTeam.map((persona, i) => (
                  <article
                    className="ab-gente__persona"
                    key={persona.id}
                    style={{ "--ab-i": i }}
                  >
                    <span className="ab-gente__media">
                      {persona.photo ? (
                        <img
                          src={persona.photo}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="ab-gente__relleno" aria-hidden="true" />
                      )}
                      <span className="ab-gente__velo" aria-hidden="true" />

                      <span className="ab-gente__texto">
                        <h3 className="ab-gente__nombre">{persona.name}</h3>
                        <p className="ab-gente__cargo">{persona.role}</p>
                      </span>
                    </span>

                    <p className="ab-gente__bio">{persona.bio}</p>

                    <a
                      className="ab-gente__linkedin"
                      href={persona.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`LinkedIn de ${persona.name}`}
                    >
                      LinkedIn
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M4 10 10 4M5 4h5v5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="about-team">
                {aboutTeam.map((member, i) => (
                  <Reveal key={member.id} delay={i * 0.12}>
                    <TeamCard {...member} />
                  </Reveal>
                ))}
              </div>
            )}
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

        {esMano ? (
          /* ---- LA MARQUESINA CON FOCO ----
             Dos velocidades sobre el mismo material. Arriba, los
             cinco títulos desfilan en cinta continua — el "vivo
             siempre" de la casa sin pedirle nada al visitante.
             Abajo, el LECTOR: una banda de nácar con el valor
             elegido completo.

             La cinta lleva el lote duplicado para que el bucle no
             tenga costura; el segundo va con aria-hidden porque
             para un lector de pantalla son los mismos cinco
             botones otra vez.

             El lector es aria-live: quien no ve la cinta se
             entera igual de qué valor acaba de bajar. */
          <div className="ab-valores">
            <p className="ab-valores__rotulo">Cómo trabajamos</p>

            {/* ---- UNA SOLA PIEZA ----
                La cinta y el lector estaban sueltos: la cinta era
                texto sobre el fondo de la sección y el lector una
                banda con superficie propia. Se leían como dos
                tiras despegadas después de un retrato a sangre.

                Ahora comparten UNA superficie —la atmósfera de
                nácar y su velo— con la cinta arriba y el texto
                debajo, separados por un filete. Un objeto, dos
                zonas: el desfile y lo que dice el elegido. */}
            <div
              className="ab-valores__pieza"
              style={{ "--ab-i": valorActivo }}
            >
              <span className="ab-valores__atmosfera" aria-hidden="true" />
              <span className="ab-valores__velo" aria-hidden="true" />

              <div
                ref={marcoRef}
                className={`ab-valores__marco ${
                  cintaQuieta ? "ab-valores__marco--quieta" : ""
                }`}
                onPointerDown={() => maquina.current.parar?.()}
              >
                {/* ⚠️ SON TRES CAPAS Y LAS TRES HACEN FALTA:
                      marco  — recorta y enmascara los bordes
                      cinta  — DESFILA (animación de la casa)
                      pista  — se desliza para centrar el elegido

                    Al fundir la cinta y el lector en una sola
                    pieza me dejé fuera esta capa intermedia, y con
                    ella el desfile: quedó una fila de títulos
                    quieta. Dos transforms en dos elementos se
                    suman sin pelearse; el mismo transform en uno
                    solo no puede hacer las dos cosas. */}
                <div className="ab-valores__cinta">
                  <div
                    className="ab-valores__pista"
                    style={{ "--ab-ajuste": `${ajuste}px` }}
                  >
                    {[false, true].map((duplicado) => (
                      <div
                        className="ab-valores__lote"
                        key={duplicado ? "b" : "a"}
                        aria-hidden={duplicado || undefined}
                      >
                        {aboutValues.map((valor, i) => (
                          <button
                            key={valor.id}
                            type="button"
                            className="ab-valores__titular"
                            aria-current={
                              i === valorActivo ? "true" : undefined
                            }
                            tabIndex={duplicado ? -1 : undefined}
                            onClick={(e) =>
                              maquina.current.parar?.(i, e.currentTarget)
                            }
                          >
                            {valor.title}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ---- Y EL TÍTULO, UNA SOLA VEZ ----
                  Aquí se repetía: la cinta ya lleva el nombre del
                  valor en grande y centrado, y debajo volvía a
                  salir como titular del lector. Dos veces las
                  mismas palabras, una encima de otra — parecía un
                  fallo, y en el fondo lo era.

                  El lector se queda solo con la frase, que es lo
                  único que la cinta no puede dar. Sube de cuerpo
                  porque ya no compite con un titular encima.

                  La `key` rehace el bloque en cada elección: su
                  animación corre justo cuando cambia el contenido. */}
              <div
                className="ab-valores__lector"
                aria-live="polite"
                key={valorActivo}
              >
                <span className="ab-valores__destello" aria-hidden="true" />
                <p className="ab-valores__texto">
                  {aboutValues[valorActivo].description}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="about-values">
            {aboutValues.map((value, i) => (
              <Reveal key={value.id} delay={i * 0.08}>
                <ValueCard {...value} />
              </Reveal>
            ))}
          </div>
        )}
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
