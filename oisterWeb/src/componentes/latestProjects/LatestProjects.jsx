import "./LatestProjects.css";
import Rotulo from "../rotulo/Rotulo";
import TextoArena from "../textoArena/TextoArena";
import BucleVideo from "../bucleVideo/BucleVideo";
import { Link, useNavigate } from "react-router-dom";
import LightDust from "../lightDust/LightDust";
import FondoNuevo from "../fondoNuevo/FondoNuevo";
import trabajos from "../../data/trabajos";
import useMediaQuery from "../../hooks/useMediaQuery";
import { useEffect, useRef, useState } from "react";

/* la sección enseña como MUCHO los 5 últimos: cuando trabajos.js
   crezca, aquí no hay que tocar nada — entran solos.
   NO hay carrusel: los 5 caben en pantalla a la vez y un slider
   solo escondería trabajo detrás de un clic. */
const MAX_PROYECTOS = 5;

/* ---- EL CRISTAL ----
   Vive en public/ y NO se importa: así, si el archivo todavía no
   está, el build no falla — solo da 404 y se cae al plan B.
   Mismo criterio que el vídeo del hero.

   La imagen es a la vez `poster` del vídeo y respaldo: se ve
   mientras el vídeo carga, si no hay ningún vídeo, y con
   movimiento reducido.

   ⚠️ AQUÍ SOLO VAN ARCHIVOS QUE EXISTEN DE VERDAD.
   Es tentador listar los tres formatos "por si acaso", pero un
   archivo que falta NO da 404: el dev server de Vite responde a
   cualquier ruta desconocida con el index.html y un HTTP 200.
   El navegador pide el .webm, recibe HTML con un 200, intenta
   decodificarlo como vídeo, falla — y da por muerto el elemento
   entero SIN llegar nunca al .mp4 que sí está. Resultado: el
   cristal se queda congelado en el poster.

   Si algún día se pasa a vídeo con alfa (ver el LEEME), se
   añaden AL PONER los archivos, y en este orden — el navegador
   se queda con la primera fuente que sepa reproducir:
     { src: ".../cristal.mov",  type: "video/quicktime" }, // Safari
     { src: ".../cristal.webm", type: "video/webm" },      // Chrome
   y el mp4 se queda el último como plan universal. */
/* .webp: el mismo póster a un octavo del peso (324K → 40K). Es
   la primera imagen que pide la portada después del hero, así que
   su tamaño sí se nota en el LCP. El .png original sigue al lado. */
const CRISTAL_IMG = "/img/work/cristal.webp";

/* ---- LOS DOS FORMATOS, Y POR QUÉ EN ESTE ORDEN ----
   Faltaba el .mov y por eso el cristal no giraba en Safari. Los
   dos archivos estaban puestos en public/videos/work/ desde el
   principio; lo que faltaba era declarar el primero.

   No hay un formato que sirva para todos, y no es un capricho de
   compresión sino de canal alfa:

     cristal.mov    HEVC con alfa  → Safari e iOS
     cristal.webm   VP9 con alfa   → Chrome, Firefox, Edge

   Safari no lee alfa en webm: recibía el único formato que había,
   no sabía qué hacer con él y se quedaba en el póster — un cristal
   congelado, que es exactamente el síntoma.

   El .mov va PRIMERO porque el navegador se queda con la primera
   fuente que dice saber reproducir. Chrome responde "" a
   `video/quicktime` y salta limpiamente a la siguiente; Safari lo
   coge y ya no mira el webm. Mismo orden y mismo motivo que la
   ostra del hero (ver HeroVideo.jsx), que es la referencia que ya
   funcionaba en los dos.

   ⚠️ El .mov tiene que salir TAL CUAL del codificador de Apple: si
   se remultiplexa a .mp4, Safari lo acepta pero pierde el alfa.
   Está explicado en public/videos/work/LEEME.md. */
const CRISTAL_SOURCES = [
  { src: "/videos/work/cristal.mov", type: "video/quicktime" },
  { src: "/videos/work/cristal.webm", type: "video/webm" },
];

/* parte un texto en spans-letra para el efecto de tipeo */
const typeChars = (text) =>
  text.split("").map((ch, i) => (
    <span
      key={i}
      className="latest-projects__all-char"
      style={{ "--ch": i }}
    >
      {ch === " " ? "\u00A0" : ch}
    </span>
  ));

/* flechita compartida (botón "ver todos" y links de las cards) */
function Arrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 7h9M7.5 3.5 11 7l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LatestProjects() {
  const sectionRef = useRef(null);
  const [landed, setLanded] = useState(false);

  /* botón "Ver todos": al SALIR el ratón se marca --bye un
     instante → el CSS dispara la reaparición de las letras.
     Así el efecto ocurre SOLO al soltar el hover (nunca en la
     entrada de la sección ni en reposo). */
  const allRef = useRef(null);

  /* ---- clic → splash de despedida → navegar ----
     El clic responde AL INSTANTE (nunca se bloquea): dispara
     la clase --go (el splash de salida en CSS) y navega a
     /works ~450ms después, al terminar el efecto. La llegada
     la remata el skeleton de transición de App.jsx. Con
     motion reducido, navega directo sin teatro. */
  const navigate = useNavigate();
  const goingRef = useRef(false);
  const navTimer = useRef(null);
  const vivoRef = useRef(true);

  useEffect(
    () => () => {
      vivoRef.current = false;
      clearTimeout(navTimer.current);
    },
    []
  );

  const handleAllClick = (e) => {
    e.preventDefault();
    if (goingRef.current) return; /* anti doble clic */
    goingRef.current = true;

    const el = allRef.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!el || reduce) {
      navigate("/works");
      return;
    }

    const salir = () => {
      if (!vivoRef.current) return;
      el.classList.remove("latest-projects__all--bye");
      el.classList.add("latest-projects__all--go");
      navTimer.current = setTimeout(() => navigate("/works"), 400);
    };

    /* ---- SE LE PREGUNTA A LA ANIMACIÓN, NO A UN CRONÓMETRO ----
       Antes esto se calculaba a mano: `mouseenter` guardaba un
       performance.now() y el clic esperaba lo que faltase hasta
       una constante SEQ_MS = 1600. Eran DOS relojes midiendo lo
       mismo por separado —el del JS y el de la animación CSS— y
       daban por hecho que arrancaban a la vez y duraban igual.

       En cuanto se desincronizaban, el cronómetro mentía y el
       clic salía con "Descúbrelos" a medio escribir. Y hay
       varias formas de desincronizarlos: encadenar hover →
       salir → hover (la animación se reinicia, pero si por lo
       que sea no llega el mouseenter el cronómetro se queda con
       la marca vieja y cree que ya han pasado los 1600ms), la
       pestaña en segundo plano, o cualquier cambio en los
       delays del CSS que nadie se acuerde de copiar aquí.

       Ahora no hay segundo reloj: se leen las animaciones lpType
       que están corriendo de verdad sobre las letras y se espera
       su promesa `finished`. Se sincroniza solo, y si mañana
       cambian los tiempos en el CSS esto sigue funcionando sin
       tocar nada.

       Si la promesa se RECHAZA es porque la animación se canceló
       —el ratón se fue del botón y el :hover desapareció—. En
       ese caso no hay nada que esperar: se sale ya. Por eso el
       mismo `salir` va en los dos brazos. */
    const letras = el.querySelectorAll(
      ".latest-projects__all-label--hover .latest-projects__all-char"
    );

    const tecleo = [...letras]
      .flatMap((n) => n.getAnimations())
      .filter((a) => a.animationName === "lpType");

    if (!tecleo.length) {
      salir();
      return;
    }

    Promise.allSettled(tecleo.map((a) => a.finished)).then(salir);
  };

  const handleAllEnter = () => {
    allRef.current?.classList.remove("latest-projects__all--bye");
  };

  const handleAllLeave = () => {
    const el = allRef.current;
    if (!el) return;
    el.classList.remove("latest-projects__all--bye");
    void el.offsetWidth; /* reinicia la animación si encadenas hovers */
    el.classList.add("latest-projects__all--bye");
  };

  /* mismo patrón que HowWeWork: la sección detecta por sí misma
     cuándo está en pantalla y dispara la cascada de aparición.
     Umbral más bajo (0.2) porque la sección es alta: con 0.45
     en portátiles cortos no llegaría a revelarse nunca. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    /* Misma regla que HowWeWork: al salir NO basta con que baje
       el ratio, hay que mirar POR DÓNDE salió.
       · top < 0  → la sección quedó por encima: sigues bajando,
                    se queda encendida.
       · top > 0  → la sección volvió a caer por debajo del
                    borde superior: subiste del todo, se apaga y
                    así rehace su entrada cuando vuelvas a bajar. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.2) {
          setLanded(true);
        } else if (entry.boundingClientRect.top > 0) {
          setLanded(false); // salió por abajo: subiste
        }
      },
      { threshold: [0, 0.2, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ---- segundo observador: SOLO para las cards ----
     La cabecera se revela cuando la sección asoma (--landed);
     las cards esperan a que SU bloque entre al viewport y
     entonces lanzan su propia cascada (--in en el grid). */
  const gridRef = useRef(null);
  const [cardsIn, setCardsIn] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    /* el grid sigue la misma regla que la sección: si se apagara
       al dejarlo atrás, la cabecera quedaría visible y las cards
       desaparecerían por debajo — justo el salto que queremos
       evitar */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.25) {
          setCardsIn(true);
        } else if (entry.boundingClientRect.top > 0) {
          setCardsIn(false); // salió por abajo: subiste
        }
      },
      { threshold: [0, 0.25, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ---- entrada del cristal ----
     Observador propio y no el del grid: el cristal vive en la
     cabecera, muy por encima de las cards, y con el umbral del
     grid entraría cuando ya llevaba media pantalla visible.

     Misma regla asimétrica que el resto de la sección: se apaga
     solo si sale por abajo (has subido), para que al volver a
     bajar rehaga su entrada. Si sale por arriba se queda puesto. */
  const cristalRef = useRef(null);
  const [cristalIn, setCristalIn] = useState(false);

  useEffect(() => {
    const el = cristalRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.3) {
          setCristalIn(true);
        } else if (entry.boundingClientRect.top > 0) {
          setCristalIn(false);
        }
      },
      { threshold: [0, 0.3, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ---- el cristal ----
     A quien pide no ver movimiento se le sirve la imagen fija.
     `sinVideo` se enciende si NINGUNA de las fuentes se pudo
     reproducir (típicamente porque aún no hay archivo). */
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [sinVideo, setSinVideo] = useState(false);
  const mostrarVideo = !reduceMotion && !sinVideo;

  /* La pausa fuera de pantalla la llevaba un observador propio
     aquí; ahora la lleva BucleVideo, que lo necesita de todos
     modos para saber cuándo relevar sus dos pistas. Tenerlo en
     los dos sitios significaba dos observadores peleándose por el
     mismo elemento. */


  const proyectos = trabajos.slice(0, MAX_PROYECTOS);

  return (
    <section
      ref={sectionRef}
      className={`latest-projects ${landed ? "latest-projects--landed" : ""}`}
      id="proyectos"
      /* --lp-count: el nº REAL de proyectos manda el ancho de la
         sección (ver LatestProjects.css). Con el ancho fijo de
         1440px pensado para 5, tres cards de 280px dejaban ~280px
         de vacío a cada lado: la sección se leía medio desierta.
         Ahora el contenedor se ciñe a lo que hay y las cards
         crecen a ocuparlo. */
      style={{ "--lp-count": proyectos.length }}
    >
      {/* ---- onda de entrada de la sección ----
          la curva orgánica que la separa de "Qué hacemos",
          como la onda del hero: pintada con el color FINAL de
          HowWeWork (--lp-wave-color en el CSS) para fundirse
          con esa sección sin costura */}
      <div className="latest-projects__wave" aria-hidden="true">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 L1440,0 L1440,56 C1230,112 1010,70 740,48 C470,26 220,118 0,72 Z" />
        </svg>
      </div>

      {/* ---- EL FONDO ----
          El mismo que el hero y "Qué hacemos". Sustituye a la
          trama suelta que había aquí: FondoNuevo la monta por
          dentro, sobre su degradado que gira.

          `enPausa` colgado de `landed`, el observador que la
          sección ya usaba para su propia entrada: la llegada del
          fondo se dispara al alcanzarla scrolleando, no al cargar
          la página con la sección aún fuera de pantalla. */}
      <FondoNuevo
        className="latest-projects__fondo fn--onda-arriba"
        enPausa={!landed}
      />

      {/* polvo de luz: el mismo aire que hero y HowWeWork */}
      <LightDust />

      <div className="latest-projects__container">
        {/* ===== cabecera: texto a la izquierda, cristal a la derecha ===== */}
        <div className="latest-projects__intro">
          <div className="latest-projects__intro-text">
            <Rotulo className="latest-projects__eyebrow">Nuestros trabajos</Rotulo>

            <TextoArena>
              <h2 className="latest-projects__title">
                Nuestros últimos{" "}
                <span>{proyectos.length} proyectos</span>
              </h2>
            </TextoArena>

            <TextoArena>
              <p className="latest-projects__description">
                Transformamos ideas en soluciones reales. Así ayudamos a marcas
                y empresas a crecer con IA, automatización y creatividad.
              </p>
            </TextoArena>

            {/* la ruta real de App.jsx: /works → WorksPage */}
            <Link
              ref={allRef}
              className="latest-projects__all"
              to="/works"
              aria-label="Ver todos los proyectos"
              onMouseEnter={handleAllEnter}
              onMouseLeave={handleAllLeave}
              onClick={handleAllClick}
            >
              {/* capa de agua del hover: nivel + oleaje, la misma
                  receta del CTA del hero (estilos __all-water) */}
              <span className="latest-projects__all-water" aria-hidden="true" />

              {/* DOS textos, letra a letra (aria-hidden + aria-label
                  en el Link: los lectores leen el texto completo):
                  · --rest  → el de reposo, define el ancho del botón
                  · --hover → el que se teclea tras el llenado
                    (CAMBIA AQUÍ la frase del hover si quieres otra) */}
              <span
                className="latest-projects__all-label latest-projects__all-label--rest"
                aria-hidden="true"
              >
                {typeChars("Ver todos los proyectos")}
              </span>
              <span
                className="latest-projects__all-label latest-projects__all-label--hover"
                aria-hidden="true"
              >
                {typeChars("Descúbrelos")}
              </span>
              <Arrow />
            </Link>
          </div>

          {/* El cristal. aria-hidden: es atmósfera, no información.
              Si tampoco está la imagen (404), en vez de dejar media
              rejilla vacía se marca el bloque y el CSS lo colapsa a
              una columna. Ver public/videos/work/LEEME.md. */}
          <div
            ref={cristalRef}
            className={`latest-projects__crystal ${
              cristalIn ? "latest-projects__crystal--in" : ""
            }`}
            aria-hidden="true"
          >
            {/* El vídeo del cristal trae CANAL ALFA de verdad
                (`alpha_mode=1`), así que el navegador compone la
                transparencia solo.

                Aquí había un luma key en SVG —un filtro que
                fabricaba el alfa a partir del brillo de cada
                píxel— porque el render anterior llegaba opaco
                sobre negro. Con el vídeo nuevo no solo sobraba:
                lo estropeaba, volviendo transparentes las caras
                oscuras del cristal por el hecho de ser oscuras.

                Si algún día vuelve un vídeo sin alfa, el filtro
                está en el historial de git: busca
                "lp-cristal-luma". */}

            {mostrarVideo ? (
              <BucleVideo
                sources={CRISTAL_SOURCES}
                poster={CRISTAL_IMG}
                /* ---- SOLO SE RINDE SI FALLA EL <video>, NO UN <source> ----
                   Esta comprobación no es una precaución teórica: sin
                   ella, añadir el .mov para Safari APAGABA el cristal en
                   Chrome, que es justo lo contrario de lo que se venía a
                   arreglar.

                   El motivo es que hay dos errores distintos con el
                   mismo nombre. Cuando el navegador descarta UNA fuente
                   que no sabe leer —Chrome con el .mov— dispara `error`
                   en ese <source>, y es un trámite normal: sigue
                   probando la siguiente. Solo cuando se le acaban las
                   fuentes dispara `error` en el <video>, y ese sí
                   significa "no hay vídeo".

                   React los mezcla: como `error` no burbujea, escucha en
                   la raíz y luego simula el burbujeo, así que el fallo
                   de un <source> acaba llamando al onError del <video>.
                   Mirando el elemento que falló se distinguen. */
                onError={(e) => {
                  if (e.target.tagName === "VIDEO") setSinVideo(true);
                }}
              />
            ) : (
              <img
                src={CRISTAL_IMG}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(e) =>
                  e.currentTarget
                    .closest(".latest-projects__intro")
                    ?.classList.add("latest-projects__intro--sin-cristal")
                }
              />
            )}
          </div>
        </div>

        {/* ===== grid de cards: va pegado al bloque de arriba,
             sin rótulo intermedio — el titular ya dice qué son ===== */}
        <div
          ref={gridRef}
          className={`latest-projects__grid ${
            cardsIn ? "latest-projects__grid--in" : ""
          }`}
        >
          {proyectos.map((proyecto, i) => (
            /* el wrapper lleva la animación de aparición (y el
               apartarse de las vecinas): así no pisa el transform
               del hover de la card — mismo truco que HowWeWork.
               --lp-i alimenta el stagger de la cascada en CSS. */
            <div
              className="latest-projects__reveal"
              key={proyecto.id}
              style={{ "--lp-i": i }}
            >
              <article className="project-card">
                <div className="project-card__media">
                  {proyecto.imagenes?.[0] ? (
                    <img
                      src={proyecto.imagenes[0]}
                      alt={proyecto.titulo}
                      loading="lazy"
                    />
                  ) : proyecto.videos?.[0] || proyecto.video ? (
                    /* sin imagen de portada, la card usa el primer
                       vídeo en loop mudo — portada viva, muy OYSTERS */
                    <BucleVideo src={proyecto.videos?.[0] || proyecto.video} />
                  ) : (
                    <div
                      className="project-card__placeholder"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="project-card__body">
                  {proyecto.categoria && (
                    <p className="project-card__category">
                      {proyecto.categoria}
                    </p>
                  )}

                  <h3 className="project-card__title">{proyecto.titulo}</h3>

                  {/* sin `subtitulo`: a 231px de ancho salía a 27
                      caracteres por línea y se partía en tres.
                      El porqué completo, en el CSS. */}

                  {/* la ruta real de App.jsx: /works/:id → WorkDetailPage */}
                  <Link
                    className="project-card__link"
                    to={`/works/${proyecto.id}`}
                  >
                    <span>Ver proyecto</span>
                    <Arrow />
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestProjects;