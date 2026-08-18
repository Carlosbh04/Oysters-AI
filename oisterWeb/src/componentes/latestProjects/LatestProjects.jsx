import "./LatestProjects.css";
import Rotulo from "../rotulo/Rotulo";
import TextoArena from "../textoArena/TextoArena";
import BucleVideo from "../bucleVideo/BucleVideo";
import { Link, useNavigate } from "react-router-dom";
import LightDust from "../lightDust/LightDust";
import FondoNuevo from "../fondoNuevo/FondoNuevo";
import trabajos from "../../data/trabajos";
import useMediaQuery from "../../hooks/useMediaQuery";
import useEnPantalla from "../../hooks/useEnPantalla";
import { useEffect, useRef, useState } from "react";

/* la sección enseña como MUCHO los 5 últimos: cuando trabajos.js
   crezca, aquí no hay que tocar nada — entran solos.
   NO hay carrusel: los 5 caben en pantalla a la vez y un slider
   solo escondería trabajo detrás de un clic. */
const MAX_PROYECTOS = 5;

/* ============================================================
   MÓVIL: OTRA MAQUETA, NO LA MISMA ENCOGIDA

   Por debajo de 1080 —el mismo corte con el que cambia de
   maquetación el resto de la portada— esta sección deja de ser
   una pila de tarjetas y pasa a ser un DESTACADO grande más un
   ÍNDICE de los demás.

   El motivo es de medida: apiladas, las tarjetas daban 2.791px
   de alto en un móvil de 390. La sección se comía un tercio del
   scroll de la portada para enseñar lo mismo cinco veces, y
   empujaba el contacto —que es el objetivo de la página— fuera
   del alcance de cualquiera con prisa.

   ---- POR QUÉ DOS ÁRBOLES Y NO UN `display:none` ----
   Esto no se puede hacer solo con CSS: el destacado necesita la
   imagen a otro tamaño y una cita que la tarjeta no tiene, y las
   filas del índice no son tarjetas encogidas sino otro elemento.
   Montar los dos árboles y esconder uno dejaría al navegador
   pidiendo imágenes que nadie va a ver.

   Así que se elige el árbol con `useMediaQuery`, que se
   inicializa de forma síncrona (ver el hook): no hay un primer
   render con la maqueta equivocada.

   ⚠️ El árbol de ESCRITORIO no se ha tocado ni una línea. Si
   algo cambia ahí, es un error. */
const CORTE_MANO = "(max-width: 1079px)";

/* ---- EL ESCENARIO ROTA ----
   El destacado no es fijo: los trabajos se van turnando en él.
   Con tres proyectos, dejar uno siempre delante condenaba a los
   otros dos a ser dos renglones de texto para siempre — y en un
   portafolio de tres, dos tercios del trabajo no pueden vivir en
   una nota al pie.

   Al rotar, el hilo de nácar pasa a hacer un trabajo de verdad:
   ya no dice cuánto has bajado —que con dos filas era una
   respuesta pobre— sino CUÁL se está viendo. La cuenta encendida
   y el escenario son la misma información dicha dos veces, que
   es lo que convierte el hilo en navegación.

   5,6s: por debajo de 5 no da tiempo a leer la cita de tres
   líneas, y por encima de 7 el turno se siente parado. */
const ROTACION_MS = 5600;

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
  /* la sección detecta por sí misma cuándo está en pantalla y
     dispara la cascada de aparición. Ratio bajo (0.2) porque la
     sección es alta: con 0.45 en portátiles cortos no llegaría a
     revelarse nunca. Apagado asimétrico (lo pone el hook): solo
     al salir por abajo, para rehacer la entrada al volver. */
  const [sectionRef, landed] = useEnPantalla({ ratio: 0.2 });

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

  /* ---- EL AGUA Y EL ARO SE PARAN FUERA DE PANTALLA ----
     Las tres animaciones infinitas del botón (aro lpRingSpin +
     dos capas de agua lpSlosh) van sobre custom properties:
     main thread, un tick de estilo por frame aunque el botón
     quede a dos pantallas — parte del UpdateLayoutTree continuo
     medido en la traza de producción. Observador SIMÉTRICO
     local (useEnPantalla no encaja: su reset asimétrico las
     dejaría corriendo tras pasar de largo la sección), y
     classList en vez de estado a propósito: este botón ya lleva
     clases imperativas (--bye/--go) que un className re-escrito
     por un re-render pisaría. play-state conserva la fase. */
  useEffect(() => {
    const el = allRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([e]) =>
        el.classList.toggle("latest-projects__all--fuera", !e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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

  /* ---- segundo observador: SOLO para las cards ----
     La cabecera se revela cuando la sección asoma (--landed);
     las cards esperan a que SU bloque entre al viewport y
     entonces lanzan su propia cascada (--in en el grid). Si se
     apagaran al dejarlas atrás, la cabecera quedaría visible y
     las cards desaparecerían por debajo. */
  const [gridRef, cardsIn] = useEnPantalla({ ratio: 0.25 });

  /* ---- entrada del cristal ----
     Observador propio y no el del grid: el cristal vive en la
     cabecera, muy por encima de las cards, y con el umbral del
     grid entraría cuando ya llevaba media pantalla visible. */
  const [cristalRef, cristalIn] = useEnPantalla({ ratio: 0.3 });

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

  /* la maqueta de la mano (ver CORTE_MANO arriba) */
  const esMano = useMediaQuery(CORTE_MANO);

  /* cuál está en el escenario ahora mismo */
  const [actual, setActual] = useState(0);
  const destacado = proyectos[actual] ?? proyectos[0];

  /* ---- QUIEN ELIGE, MANDA ----
     Al tocar una miniatura el turno automático NO se reinicia: se
     acaba. El visitante ha dicho cuál quiere ver, y devolverle el
     control a un reloj que se lo va a cambiar en cinco segundos es
     quitárselo otra vez.

     Vale también para tocar la que ya está puesta: el gesto
     significa "quieto aquí", no "otra vuelta". */
  const [autoRota, setAutoRota] = useState(true);

  const elegirTrabajo = (i) => {
    setActual(i);
    setAutoRota(false);
  };

  /* ---- CON CINCO, LA TIRA SE SALE ----
     Tres miniaturas caben de sobra y van centradas. Cinco no:
     5×74 + 4 huecos son 432px contra los 342 útiles de un móvil
     de 390. En vez de encogerlas hasta que las caras no se
     distingan, la tira se desliza.

     Y si se desliza, el turno automático tiene que ARRASTRARLA:
     de nada sirve que el escenario cambie a un trabajo cuya
     miniatura está fuera de pantalla. Esto lo hace el navegador
     con scrollIntoView, que respeta el ajuste de movimiento
     reducido del sistema por sí solo cuando se le pide `smooth`.

     Con tres no hace nada —no hay a dónde deslizar— así que la
     misma línea sirve para los dos casos. */
  const tiraRef = useRef(null);

  useEffect(() => {
    if (!esMano) return;
    const tira = tiraRef.current;
    if (!tira || tira.scrollWidth <= tira.clientWidth) return;

    const cara = tira.children[actual];
    cara?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [esMano, actual]);

  /* ---- CUÁNDO SE TURNAN ----
     Solo mientras el escenario está a la vista. Hace falta un
     observador propio y no vale `cardsIn`: aquel se apaga SOLO al
     volver hacia arriba (ver el comentario del hook), así que si
     sigues bajando se queda encendido y el turno correría a
     espaldas de nadie, gastando batería y adelantando proyectos
     que el visitante no llegará a ver. */
  const escenaRef = useRef(null);
  const [escenaALaVista, setEscenaALaVista] = useState(false);

  useEffect(() => {
    if (!esMano) return;
    const el = escenaRef.current;
    if (!el) return;

    const observador = new IntersectionObserver(
      ([entrada]) => setEscenaALaVista(entrada.isIntersecting),
      { threshold: 0.35 }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [esMano]);

  useEffect(() => {
    if (!esMano || !escenaALaVista || !autoRota || proyectos.length < 2) return;

    /* ---- QUIEN PIDE MENOS MOVIMIENTO NO PIDE MENOS CONTENIDO ----
       Con motion reducido el escenario NO rota. Y no se pierde
       nada: los tres trabajos siguen listados enteros en el
       índice de abajo, cada uno con su enlace. Esa es también la
       razón por la que este turno automático no deja a nadie
       fuera — la información que rota está además quieta y
       completa unos centímetros más abajo. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reloj = setInterval(
      () => setActual((i) => (i + 1) % proyectos.length),
      ROTACION_MS
    );

    /* en una pestaña de fondo el intervalo se estrangula pero
       sigue disparando: al volver te encontrabas el turno
       adelantado varios proyectos de golpe */
    const alCambiarPestana = () => {
      if (document.hidden) clearInterval(reloj);
    };
    document.addEventListener("visibilitychange", alCambiarPestana);

    return () => {
      clearInterval(reloj);
      document.removeEventListener("visibilitychange", alCambiarPestana);
    };
  }, [esMano, escenaALaVista, autoRota, proyectos.length]);

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
          <div
            className={`latest-projects__intro-text ${
              esMano ? "lp-cabeza" : ""
            }`}
          >
            {/* ---- EL BROCHE DE LA SARTA ----
                El mismo hilo de nácar que enhebra el índice, pero
                empezando aquí arriba. No es una repetición del
                motivo: es LITERALMENTE la misma línea, puesta a la
                misma x de pantalla (ver el cálculo en el CSS), de
                modo que cabecera, trabajo destacado y sumario se
                leen como un solo objeto en vez de tres bloques
                apilados.

                La perla grande lo interrumpe a media altura, que
                es lo que hace una perla en un collar. */}
            {esMano && (
              <span className="lp-cabeza__hilo" aria-hidden="true">
                <span className="lp-cabeza__broche" />
              </span>
            )}

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
              /* ---- EL TECLEO ES DE RATÓN, Y HAY QUE DESENCHUFARLO ----
                 No basta con esconder por CSS el texto del hover,
                 que fue el primer intento: en táctil el navegador
                 dispara igualmente los eventos de ratón al tocar,
                 así que el tecleo seguía corriendo, BORRABA letra
                 a letra el texto de reposo y el de relevo estaba
                 oculto. Resultado: una píldora vacía justo en el
                 momento de pulsarla.

                 En la mano el enlace no lleva manejadores: es un
                 enlace y ya está. */
              onMouseEnter={esMano ? undefined : handleAllEnter}
              onMouseLeave={esMano ? undefined : handleAllLeave}
              onClick={esMano ? undefined : handleAllClick}
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
              una columna. Ver public/videos/work/LEEME.md.

              ---- Y EN MÓVIL NO SE MONTA ----
              En escritorio va al LADO del texto y llena una columna
              que si no quedaría vacía. Apilado en la mano ocupaba
              ~430px por encima del titular, y desde que el trabajo
              destacado entra a sangre justo debajo, la sección
              tenía dos protagonistas grandes seguidos: primero una
              gema que no es de nadie y luego la campaña del
              cliente. Gana la del cliente.

              No se esconde con CSS, no se monta: así el móvil
              tampoco descarga el vídeo ni su póster. */}
          {!esMano && (
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
          )}
        </div>

        {/* ===== LA MANO: destacado + índice enhebrado =====
             Solo por debajo de 1080. Ver CORTE_MANO arriba: es
             OTRA maqueta, no la de escritorio encogida. */}
        {esMano ? (
          <div
            ref={gridRef}
            className={`lp-mano ${cardsIn ? "lp-mano--in" : ""}`}
          >
            {/* ---- LA PERLA MAYOR ----
                El enlace envuelve imagen y texto: la diana es la
                pieza entera, no un "Ver proyecto" de 90px al pie.
                En la mano, el pulgar acierta la foto mucho antes
                que un enlace de texto. */}
            {destacado && (
              <Link
                ref={escenaRef}
                className="lp-mano__perla"
                to={`/works/${destacado.id}`}
                aria-label={`${destacado.titulo} — ${destacado.categoria}`}
              >
                {/* ---- LAS FOTOS VAN TODAS PUESTAS, SUPERPUESTAS ----
                    Y solo una opaca. Es lo que permite fundir un
                    trabajo con el siguiente en vez de cortar.

                    La alternativa —cambiar el `src` de una sola
                    imagen— deja un hueco: el navegador tira la
                    anterior y no tiene la nueva hasta que llega,
                    así que en cada turno parpadeaba el fondo. Son
                    tres imágenes en una sección que ya las pedía
                    todas para las tarjetas de escritorio. */}
                <span className="lp-mano__perla-media">
                  {proyectos.map((p, i) => (
                    <span
                      key={p.id}
                      className="lp-mano__perla-capa"
                      data-actual={i === actual || undefined}
                      aria-hidden="true"
                    >
                      {p.imagenes?.[0] ? (
                        <img
                          src={p.imagenes[0]}
                          alt=""
                          /* la primera se carga ya; las que esperan
                             turno, cuando el navegador tenga hueco */
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      ) : p.videos?.[0] || p.video ? (
                        <BucleVideo src={p.videos?.[0] || p.video} />
                      ) : (
                        <span className="lp-mano__perla-relleno" />
                      )}
                    </span>
                  ))}

                  {/* el velo que hace legible el nombre montado
                      sobre la foto. Va aquí y no en la imagen
                      porque tiene que cubrir también al vídeo y
                      al relleno. */}
                  <span className="lp-mano__perla-velo" aria-hidden="true" />

                  {/* ---- EL NOMBRE VA DENTRO DE LA FOTO ----
                      Y no como hermano suyo, que fue el primer
                      intento: siendo hermano, su `bottom: 0` se
                      medía contra el ENLACE entero —foto más
                      cita— y el nombre aterrizaba encima del
                      texto de abajo. Dentro, `bottom: 0` es el
                      pie de la imagen, que es donde tiene que
                      estar.

                      `key` con el id: al cambiar de turno React
                      rehace el bloque y su animación de entrada
                      vuelve a correr. Sin él, el texto cambiaría
                      de golpe bajo una foto que se está fundiendo. */}
                  <span className="lp-mano__perla-texto" key={destacado.id}>
                    <span className="lp-mano__perla-nombre">
                      {destacado.titulo}
                    </span>

                    {/* ---- LA LÍNEA DE DATOS, CON SU CONTADOR ----
                        El contador estuvo arriba, en la cabecera,
                        y ahí decía la verdad en el sitio
                        equivocado: hablaba de algo que ocurría
                        200px más abajo. Aquí va pegado a lo que
                        cuenta —esta ficha es la número tal de
                        tantas— y de paso la línea gana sintaxis:
                        el dato del trabajo a la izquierda, su
                        posición en la serie a la derecha. */}
                    <span className="lp-mano__perla-linea">
                      <span className="lp-mano__perla-dato">
                        {destacado.anio}
                        <i aria-hidden="true">·</i>
                        {destacado.categoria}
                      </span>

                      {/* aria-hidden: no es información nueva —el
                          índice ya la da con `aria-current`— y un
                          número que cambia solo cada cinco
                          segundos es ruido para un lector. */}
                      {proyectos.length > 1 && (
                        <span className="lp-mano__contador" aria-hidden="true">
                          <b>{String(actual + 1).padStart(2, "0")}</b>
                          <i>/</i>
                          {String(proyectos.length).padStart(2, "0")}
                        </span>
                      )}
                    </span>
                  </span>
                </span>

                {/* El RESULTADO, no el subtítulo: quien está
                    evaluando no necesita otra descripción de lo
                    que se hizo, necesita en qué acabó. */}
                <span className="lp-mano__perla-cita" key={`c${destacado.id}`}>
                  {destacado.resultado || destacado.subtitulo}
                </span>
              </Link>
            )}

            {/* ---- EL ANILLO DE TURNO ----
                El índice deja de ser una lista de filas y pasa a
                ser el MANDO del escenario. La diferencia no es de
                forma: es que antes duplicaba lo de arriba —el
                escenario ya enseña un trabajo cada 5,6 s— y ahora
                lo gobierna.

                Cada miniatura lleva un aro que dibuja cuánto
                queda para el relevo. Deja de ser un adorno: es el
                reloj de algo que ya está ocurriendo, y por eso el
                aro es información y no decoración. La que está en
                turno va a color; las demás, desaturadas — así la
                cara en color siempre es la que ves arriba.

                ---- POR QUÉ SON BOTONES Y NO ENLACES ----
                Antes cada fila llevaba a /works/:id. Ahora un
                toque PONE ese trabajo en el escenario, y el
                escenario es el que lleva a su ficha. Son dos
                toques en lugar de uno, y a cambio el visitante
                puede ver los tres sin salir de la portada, que es
                lo que hace un índice.

                La tira se desliza si no caben: con tres sobran, con
                seis hará falta. */}
            {proyectos.length > 1 && (
              <div
                ref={tiraRef}
                className="lp-mano__turnos"
                role="group"
                aria-label="Elegir el trabajo que se muestra"
                /* el aro solo cuenta cuando hay algo que contar:
                   con el reloj parado —fuera de pantalla o porque
                   el visitante eligió— no se dibuja ningún
                   recorrido. Ver el bug del aro en el CSS. */
                data-contando={
                  autoRota && escenaALaVista && proyectos.length > 1
                    ? "true"
                    : undefined
                }
              >
                {proyectos.map((proyecto, i) => (
                  <button
                    key={proyecto.id}
                    type="button"
                    className="lp-mano__turno"
                    aria-current={i === actual ? "true" : undefined}
                    aria-label={`${proyecto.titulo} — ${proyecto.categoria}`}
                    onClick={() => elegirTrabajo(i)}
                  >
                    <span className="lp-mano__aro">
                      <svg viewBox="0 0 74 74" aria-hidden="true">
                        <circle
                          className="lp-mano__aro-pista"
                          cx="37"
                          cy="37"
                          r="35"
                        />
                        {/* la `key` fuerza a rehacer el trazo en
                            cada relevo, que es lo que hace que la
                            vuelta empiece de cero con el turno */}
                        <circle
                          key={`aro-${actual}`}
                          className="lp-mano__aro-avance"
                          cx="37"
                          cy="37"
                          r="35"
                        />
                      </svg>

                      <span className="lp-mano__cara">
                        {proyecto.imagenes?.[0] ? (
                          <img
                            src={proyecto.imagenes[0]}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span
                            className="lp-mano__cara-relleno"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </span>

                    <span className="lp-mano__turno-nombre">
                      {proyecto.titulo}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
        /* ===== grid de cards: va pegado al bloque de arriba,
             sin rótulo intermedio — el titular ya dice qué son ===== */
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
        )}
      </div>
    </section>
  );
}

export default LatestProjects;