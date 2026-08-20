import { useState, useEffect, useRef, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import lazyWithMin from "./utils/Lazywithmin";

import Header from "./componentes/header/Header";
import Footer from "./componentes/footer/Footer";
import IntroAnimation from "./componentes/introAnimation/IntroAnimation";
import PageSection from "./componentes/layout/PageSection";
import ScrollToTop from "./componentes/scrollToTop/ScrollToTop";
import VolverArriba from "./componentes/volverArriba/VolverArriba";
import Persiana from "./componentes/persiana/Persiana";
import { registrarPrecarga } from "./utils/precargaRuta";
import { hayViaje } from "./componentes/persiana/persianaEstado";
import useMediaQuery from "./hooks/useMediaQuery";
import useApartarDelPie from "./hooks/useApartarDelPie";
import DefaultSkeleton from "./componentes/skeleton/DefaultSkeleton";
import WorkDetailSkeleton from "./componentes/skeleton/work-detail/WorkDetailSkeleton";
import WorksSkeleton from "./componentes/skeleton/work-list/WorksSkeleton";
import ContactSkeleton from "./componentes/skeleton/contact/ContactSkeleton";

import HomePage from "./pages/home/Home";

/* ============================================================
   SOLO HOME VIAJA EN EL BUNDLE INICIAL

   Todo lo demás —works, detalle, contacto, blog y el 404— se
   parte en su propio chunk con lazyWithMin. Antes iban estáticos
   y el visitante de la portada pagaba el JavaScript de las cinco
   páginas que no estaba viendo; medido en el build, sacarlos
   adelgaza el chunk inicial ~un tercio.

   La infraestructura para que el corte no se NOTE ya existía:
   cada ruta tiene su skeleton (getSkeletonFor) y getRouteChunk precarga el
   chunk mientras el skeleton está en pantalla, así que el
   fallback de Suspense no llega a verse en la navegación normal.

   Home se queda estático a propósito: ES la ruta inicial. En
   lazy, el primer pintado esperaría un viaje de red extra para
   descargar su chunk — lo contrario de lo que se busca.
   ============================================================ */
const ContactSection = lazyWithMin(() => import("./pages/contact/Contact"));
const NotFoundPage = lazyWithMin(() => import("./pages/error/404"));
const WorksPage = lazyWithMin(() => import("./pages/work/WorkPage"));
const WorkDetailPage = lazyWithMin(() => import("./pages/work/WorkDetailPage"));
const BlogPage = lazyWithMin(() => import("./pages/blog/BlogPage"));
const BlogDetailPage = lazyWithMin(() => import("./pages/blog/BlogDetailPage"));

/* ---- LAS QUE SÍ VAN EN LAZY ----
   Bancos de pruebas y apartados secundarios: no se visitan en la
   primera carga, así que su código no tiene por qué viajar en el
   bundle inicial.

   Contact, 404, WorkPage, WorkDetail y el blog están declarados
   ARRIBA con lazyWithMin, junto a Home: no volver a declararlos
   aquí — sería una redeclaración del mismo nombre y el módulo ni
   compila. */

/* ---- CÓMO LO HACEMOS ----
   Los cuatro apartados sueltos (/services/aprendizaje-ia y sus
   tres hermanos) se retiran: los cuatro están AHORA dentro de esta
   página, como el mapa alrededor del anillo. Ver el comentario de
   ComoLoHacemosPage.jsx. */
const ComoLoHacemosPage = lazyWithMin(() =>
  import("./pages/servicios/ComoLoHacemosPage")
);

/* fondo de tira tecnológica, en rediseño */
const FondoTramaPage = lazyWithMin(() =>
  import("./pages/fondoTrama/FondoTramaPage")
);

/* escena del corredor de datos con la figura de mármol */
const EscenaOraculoPage = lazyWithMin(() =>
  import("./pages/escenaOraculo/EscenaOraculoPage")
);

/* Gen AI Training: la página del curso, a la que apunta
   "Recursos → Gen AI Training" en los dos menús. */
const GenAiTrainingPage = lazyWithMin(() =>
  import("./pages/recursos/GenAiTrainingPage")
);

import "./App.css";

/* Los skeletons de /works, /works/:id y /contact se envuelven en
   el MISMO PageSection (center={false} para works, className
   "contact-page" para contacto) que sus páginas reales (mismo
   padding del header, ancho y min-height): así el reveal solo
   cambia shimmer → contenido en su sitio, sin salto de layout.
   DefaultSkeleton no: su layout ya replica un hero genérico y
   sus páginas reales son placeholders. */
function getSkeletonFor(pathname) {
  if (/^\/works\/[^/]+$/.test(pathname)) {
    return (
      /* la clase pinta el color de base del fondo que la página
         real dibuja detrás del contenido (una nube en shader).
         Montarla aquí la metería en el bundle principal, y para un
         hueco de carga basta con el color. */
      <PageSection center={false} className="work-detail-hueco">
        <WorkDetailSkeleton />
      </PageSection>
    );
  }
  if (pathname === "/works") {
    return (
      <PageSection center={false}>
        <WorksSkeleton />
      </PageSection>
    );
  }
  if (pathname === "/contact") {
    return (
      <PageSection className="contact-page">
        <ContactSkeleton />
      </PageSection>
    );
  }
  return <DefaultSkeleton />;
}

/* chunk que renderiza cada ruta: se precarga mientras el
   skeleton está activo para que el reveal no tropiece con el
   fallback de Suspense (el header + la página deben entrar
   juntos, sin skeleton residual). */
/* ---- QUÉ CHUNK HAY QUE PRECARGAR PARA ESTA RUTA ----
   Devuelve SIEMPRE una función que promete, y ahí está el detalle
   que rompía el detalle del blog.

   Las páginas cargadas con lazyWithMin traen `.preload`. Las
   ESTÁTICAS no —hoy solo queda Home, pero la regla vale para
   cualquiera que vuelva a serlo—: su código ya viaja en el
   bundle inicial, no hay nada que precargar. Pedirles `.preload`
   da `undefined`, y quien llama a esto lo invoca como función:

     getRouteChunk(location.pathname)()   ->  undefined()

   Eso es lo que petaba en /blog/1: no entra en ninguna rama con
   nombre, cae al final —que devolvía `NotFoundPage.preload`— y
   revienta antes de pintar nada. La lista /blog se salvaba solo
   porque tiene rama propia.

   `precargaDe` cierra el agujero de raíz: si no hay chunk,
   responde con una promesa ya resuelta. */
const precargaDe = (pagina) => pagina?.preload ?? (() => Promise.resolve());

/* ============================================================
   EL ESQUELETO TAMBIÉN ESPERA A LAS IMÁGENES

   Hasta aquí, el esqueleto solo esperaba al CHUNK de JavaScript.
   Con eso basta en una página de texto, pero no en una que entra
   con una foto grande: el chunk llega, el esqueleto se retira, la
   página se monta... y ENTONCES el navegador empieza a descargar
   la imagen. Resultado: la maqueta aparece con los huecos vacíos
   y la foto entra de golpe unos segundos después, que es
   exactamente lo que el esqueleto existía para evitar.

   La solución no necesita máquina nueva: el reveal ya espera a la
   promesa que devuelve getRouteChunk, así que basta con que esa
   promesa incluya las imágenes.

   ---- POR QUÉ NUNCA SE QUEDA COLGADO ----
   Dos seguros, porque un esqueleto que no se va es peor que una
   imagen que entra tarde:
     · cada imagen resuelve TAMBIÉN en `onerror` — un 404 o un
       archivo corrupto no bloquean;
     · y hay un tope de tiempo: pasado TOPE_IMAGENES se sigue
       adelante aunque la descarga no haya terminado. Con una red
       mala, la página entra con el hueco —el comportamiento de
       antes— en vez de dejar al visitante mirando el shimmer.
   ============================================================ */

/* Las imágenes que deben estar DESCARGADAS antes de retirar el
   esqueleto de cada ruta. Solo las de la primera pantalla: hacer
   esperar por una foto que está a tres scrolls de distancia sería
   retrasar la entrada a cambio de nada. */
const IMAGENES_DE_ENTRADA = {
  "/resources": [
    "/img/formacion/cabecera.jpg",
    "/img/formacion/presentacion.jpg",
  ],
};

const TOPE_IMAGENES = 4000;

const precargaImagenes = (rutas) =>
  Promise.all(
    rutas.map(
      (src) =>
        new Promise((resolver) => {
          const img = new Image();
          img.onload = resolver;
          img.onerror = resolver;
          img.src = src;
        })
    )
  );

/* corre la promesa contra un reloj: lo que gane, gana */
const conTope = (promesa, ms) =>
  Promise.race([promesa, new Promise((r) => setTimeout(r, ms))]);

function getRouteChunk(pathname) {
  if (pathname === "/works") return precargaDe(WorksPage);
  if (/^\/works\/[^/]+$/.test(pathname)) return precargaDe(WorkDetailPage);
  if (pathname === "/contact") return precargaDe(ContactSection);
  if (pathname === "/services") return precargaDe(ComoLoHacemosPage);
  if (pathname === "/fondo-trama") return precargaDe(FondoTramaPage);
  if (pathname === "/escena-oraculo") return precargaDe(EscenaOraculoPage);

  /* El blog, en lazy como el resto: detalle y listado (suelto o
     paginado) tienen cada uno su chunk que precargar. */
  if (/^\/blog\/[^/]+$/.test(pathname) && !pathname.startsWith("/blog/page/"))
    return precargaDe(BlogDetailPage);
  if (pathname.startsWith("/blog")) return precargaDe(BlogPage);

  /* la única ruta que además espera a sus imágenes (ver
     IMAGENES_DE_ENTRADA, arriba) */
  if (pathname === "/resources") {
    return () =>
      Promise.all([
        precargaDe(GenAiTrainingPage)(),
        conTope(
          precargaImagenes(IMAGENES_DE_ENTRADA["/resources"]),
          TOPE_IMAGENES
        ),
      ]);
  }

  if (pathname === "/") {
    return () => Promise.resolve();
  }

  /* cualquier otra cosa cae en la página de "no encontrado", que
     también es estática */
  return precargaDe(NotFoundPage);
}


/* Cuánto se queda el skeleton visible DESPUÉS de que el intro
   termine (~5,1s desde el montaje: 2,6s de partículas + 1,1s de
   tipeo + pausa y fundido), antes de revelar la página real por
   primera vez.

   ---- POR QUÉ BAJA DE 1700 A 300 ----
   Estaba en 1700ms y era tiempo muerto entero. Medida la primera
   carga de /works:
     · 5.113ms  el intro desaparece
     · 7.136ms  aparece por fin la página
   Dos segundos mirando un skeleton, con el contenido ya listo
   desde hacía rato: el chunk de la ruta termina de cargar a los
   408ms. Y el perfil de CPU de esa ventana da 3,2s de 3,5
   INACTIVOS — no se estaba calculando nada, solo esperando a
   este temporizador.

   La espera tampoco hace falta para que llegue el código: de eso
   ya se encarga `routeReady`, que es una condición aparte unas
   líneas más abajo y que este temporizador ni siquiera arranca
   hasta cumplirse.

   Lo único que aporta un respiro aquí es no encadenar dos
   transiciones seguidas —el intro yéndose y el contenido
   entrando— en el mismo instante. 300ms bastan para eso. */
const INITIAL_REVEAL_HOLD = 300;
/* pulso normal al navegar entre rutas ya montadas */
const NAV_PULSE = 1100;

/* El mismo corte que usan About, VolverArriba y LatestProjects
   para decidir "esto es una mano". Se repite escrito, como en
   ellos, en vez de sacarlo a un módulo: el proyecto lo declara así
   en cada consumidor. */
const CORTE_MANO = "(max-width: 1079px)";

/* ---- LA INTRO SE REPRODUCE SIEMPRE, Y ES A PROPÓSITO ----
   En cada carga y en cada recarga. Medido contra el build de
   producción, eso son 5.314ms en la portada, 5.847 en /works y
   5.553 en /blog antes de que se pueda leer nada.

   Se probó saltarla a partir de la primera vez guardando una
   marca en sessionStorage, y se deshizo: la intro es la carta de
   presentación del estudio y tiene que salir cuando toca, no
   cuando el almacenamiento del navegador diga. El precio lo paga
   sobre todo quien desarrolla, recargando; el visitante que entra
   una vez la ve una vez.

   Si algún día vuelve a molestar, el sitio donde se decide es el
   inicializador de `showIntro`, unas líneas más abajo. */

/* ---- CON QUÉ COLOR ARRANCA EL PIE ----
   El pie tiene que empezar en el tono con el que TERMINA la
   página que lleva encima, o en el borde aparece una banda. Medido
   justo por encima de la costura:

     portada     31% de luz     trabajos    29%
     servicios   14%            contacto    11%

   O sea, dos familias. Un solo color tapaba bien una y plantaba
   una banda clara bajo la otra.

   La clasificación vive aquí porque este es el único sitio que
   conoce la ruta ANTES de pintar. El pie es hermano de <main>, no
   hijo, así que una página no puede pasárselo por herencia de
   variables: tendría que hacerlo por JS y sería peor.

   Al añadir una ruta oscura, se añade aquí. Si se olvida, cae en
   "clara", que es el caso común y el que menos chirría. */
/* "/services" sin barra final: la ruta es exactamente eso. Con
   "/services/" —como estaba, cuando existían los cuatro apartados—
   `startsWith` no la reconocería y el pie arrancaría en claro
   contra un fondo oscuro, dejando una banda en la costura. */
const FONDOS_OSCUROS = ["/services", "/contact", "/escena-oraculo"];

/* Qué fondo le toca al pie. El pie ya NO trae escena propia: se
   pinta con el fondo de la página para que este se extienda más
   allá del contenido (ver Footer.css, --pie-fondo).

   · "home"   → la única página con una cadena de secciones OPACA
                y un color de cierre concreto; el pie lo continúa.
   · "oscuro" / "claro" → el resto. No pintan fondo propio (o lo
                pintan `fixed`, como el detalle de proyecto), así
                que el pie va transparente y deja pasar lo que ya
                hubiera detrás. La distinción se mantiene porque
                el fondo antiguo, archivado, todavía la consume.

   Si una página nueva pinta un fondo opaco propio, dale aquí su
   clave y define su --pie-fondo en Footer.css. */
const tonoDelPie = (pathname) => {
  if (pathname === "/") return "home";

  /* Gen AI Training es la única página CLARA del sitio y pinta su
     propio fondo opaco, así que entra en el caso que describe el
     comentario de arriba: clave propia y --pie-fondo definido en
     Footer.css. Sin ella caía en "claro" —o sea, pie transparente
     sobre el degradado oscuro del body— y aparecía una línea dura
     justo donde acababa el papel. */
  if (pathname === "/resources") return "formacion";

  return FONDOS_OSCUROS.some((p) => pathname.startsWith(p))
    ? "oscuro"
    : "claro";
};

/* ---- ¿EL PIE LLEVA LA ESCENA DE LA PÁGINA? ----
   El pie ya no tiene fondo PROPIO: se pinta con el de la página
   para que este se extienda más allá del contenido.

   Estas rutas montan <FondoNuevo> en TODAS sus secciones, así que
   el pie monta la misma escena y se une a la última con la misma
   onda que junta unas secciones con otras (fn--onda-arriba). Un
   color plano aquí no vale: la escena está ANIMADA —su degradado
   gira—, y cualquier color fijo acaba enseñando una banda dura en
   la junta en algún momento del giro.

   El resto de rutas no pintan fondo propio: el pie va
   transparente y deja pasar el degradado del body. */
const RUTAS_CON_ESCENA = ["/services"];
const pieConEscena = (pathname) =>
  pathname === "/" || RUTAS_CON_ESCENA.some((p) => pathname.startsWith(p));

function App() {
  const location = useLocation();
  /* Se decide en el inicializador, no en un efecto: tiene que
     estar resuelto ANTES del primer render. Con un efecto, la
     intro alcanzaría a montarse y se vería un fogonazo de telón
     negro antes de retirarse. */
  /* la intro ha empezado su fundido de salida (ver el comentario
     del onLeaving, abajo del todo) */
  const [introSaliendo, setIntroSaliendo] = useState(false);

  const [showIntro, setShowIntro] = useState(true);

  /* nace en true si la ruta actual no es Home: el skeleton
     queda montado (shimmer corriendo) DETRÁS de la intro
     desde el primer render — la intro es fixed + z-index
     alto, así que esto es invisible hasta que ella se levanta.
     Home nunca usa skeleton (lo cubre su propio intro). */
  /* ============================================================
     EN MÓVIL NO HAY ESQUELETO

     El esqueleto se pensó para que la espera de un chunk no fuera
     una pantalla en blanco. En una mano ya no hace falta y estorba
     por dos motivos:

       · Las navegaciones del menú van tapadas por la persiana, que
         hace de cargador. El esqueleto quedaba DETRÁS de la
         cortina: nadie lo veía y encima alargaba el viaje.
       · Fuera del menú aparecía y desaparecía en un parpadeo, que
         se lee como que la página falla, no como que carga.

     Se apaga en los tres sitios donde asomaba: el estado inicial
     (aquí), el encendido de cada navegación (más abajo) y el
     fallback de Suspense.

     ⚠️ El precio: si alguien abre una ruta que no es la portada
     DIRECTAMENTE desde el navegador en el móvil, y su chunk aún no
     está en caché, ve la cabecera y el hueco vacío mientras baja.
     Antes veía el esqueleto. Es el único caso en que quitarlo
     resta, y es también el más raro.
     ============================================================ */
  const esMano = useMediaQuery(CORTE_MANO);
  
  /* los botones flotantes se apartan de la fila legal del pie
     (ver useApartarDelPie.js) */
  useApartarDelPie();

  const [skeletonVisible, setSkeletonVisible] = useState(
    () =>
      !window.matchMedia(CORTE_MANO).matches &&
      window.location.pathname !== "/"
  );

  /* ruta en la que cargó la app: distingue el reveal inicial
     (tras el intro) del pulso de navegación interna. Al
     completar el reveal inicial se limpia (a null). */
  const initialPathname = useRef(window.location.pathname);

  /* patrón oficial "adjust state when a prop changes": al
     cambiar la ruta, el skeleton se ajusta DURANTE el render
     (inmediato, sin efecto). Un guard de primer render con
     useRef NO sirve aquí: el doble-invoke de StrictMode en dev
     lo consume en el mount y el pulso de navegación se
     dispararía en la carga inicial, apagando el skeleton antes
     de que termine el intro. */
  const [prevPathname, setPrevPathname] = useState(window.location.pathname);

  /* el chunk de la ruta actual está listo (se precarga con
     getRouteChunk mientras el skeleton está activo) */
  const [routeReady, setRouteReady] = useState(false);

  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setSkeletonVisible(!esMano && location.pathname !== "/");
    setRouteReady(false);
  }

  /* ---- EL MISMO PRECARGADOR, PRESTADO A LA PERSIANA ----
     Mientras las columnas suben la pantalla ya no se ve, y son
     seiscientos y pico milisegundos que valen para ir trayendo la
     página de destino. Se deja aquí en vez de importarse desde el
     hook porque ese import cerraría un círculo; ver
     utils/precargaRuta.js. */
  useEffect(() => {
    registrarPrecarga(getRouteChunk);
  }, []);

  /* precarga el chunk de la ruta actual mientras el skeleton
     está activo; el reveal espera a routeReady para que nunca
     queden header + skeleton a la vez. */
  useEffect(() => {
    if (!skeletonVisible) return;
    let alive = true;
    getRouteChunk(location.pathname)()
      .then(() => {
        if (alive) setRouteReady(true);
      })
      .catch(() => {
        if (alive) setRouteReady(true);
      });
    return () => {
      alive = false;
    };
  }, [skeletonVisible, location.pathname]);

  /* programa el APAGADO del skeleton: si la app cargó en esta
     ruta se espera al reveal inicial (INITIAL_REVEAL_HOLD);
     en cualquier navegación interna hace el pulso NAV_PULSE.
     No revela hasta que el chunk de la ruta esté listo
     (routeReady). Home se revela al instante (su propia
     entrada hace de loader). Los setState van dentro de
     setTimeout para no llamarlos sincrónicamente en el efecto. */
  useEffect(() => {
    if (showIntro) return;
    if (location.pathname === "/") return;
    if (!routeReady) return;

    const isInitialReveal = location.pathname === initialPathname.current;

    /* Con la persiana tapando no hay pulso que valga: se apaga el
       esqueleto en cuanto la ruta está lista, porque la cortina ya
       está haciendo de cargador y esperar aquí solo alarga la
       transición con la pantalla quieta. */
    const espera = esMano || hayViaje()
      ? 0
      : isInitialReveal
        ? INITIAL_REVEAL_HOLD
        : NAV_PULSE;

    const t = setTimeout(() => {
      setSkeletonVisible(false);
      initialPathname.current = null;
    }, espera);

    return () => clearTimeout(t);
  }, [showIntro, location.pathname, routeReady, esMano]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app" data-pie={tonoDelPie(location.pathname)}>
      <ScrollToTop />

      <Header
        introDone={!showIntro && !skeletonVisible}
        hideNav={skeletonVisible && !showIntro}
      />

      <main className="app__main">
        {skeletonVisible ? (
          getSkeletonFor(location.pathname)
        ) : (
          <Suspense
            key={location.pathname}
            /* en la mano, ni aquí: ver el bloque de esMano arriba */
            fallback={esMano ? null : getSkeletonFor(location.pathname)}
          >
            <div className="page-anim">
              <Routes>
                <Route path="/" element={<HomePage introDone={!showIntro} introSaliendo={introSaliendo} />} />

                {/* El blog llega de esta rama. Las tres rutas van
                    juntas: listado, listado paginado y detalle. */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/page/:page" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogDetailPage />} />

                <Route path="/works" element={<WorksPage />} />
                <Route path="/works/:id" element={<WorkDetailPage />} />
                <Route path="/resources" element={<GenAiTrainingPage />} />
                <Route path="/contact" element={<ContactSection introDone={!showIntro} />} />
                <Route path="/services" element={<ComoLoHacemosPage />} />
                <Route path="/fondo-trama" element={<FondoTramaPage />} />
                <Route path="/escena-oraculo" element={<EscenaOraculoPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Suspense>
        )}
      </main>

      {/* ---- EL PIE, EN TODAS LAS RUTAS ----
          Vivía dentro de HomePage y solo salía en la portada.
          Aquí sale en todas, con una sola excepción: mientras
          está el skeleton no hay contenido todavía, y un pie
          colgando de un esqueleto se lee como que la página ya
          cargó y está vacía.

          Al salir de HomePage se lleva consigo su animación de
          entrada, que va por IntersectionObserver dentro del
          propio componente: no hay nada que reconectar por
          ruta. */}
      {!skeletonVisible && (
        <Footer conEscena={pieConEscena(location.pathname)} />
      )}

      {/* ---- EL CONTROL DE VUELTA ----
          Va aquí y no dentro de una página porque sirve en todas.
          Después del pie a propósito: es lo último del árbol, así
          que en el orden de tabulación queda al final, detrás del
          contenido — como corresponde a un atajo, no a un enlace
          de navegación.

          No confundir con <ScrollToTop /> de arriba: aquel
          reposiciona el scroll al cambiar de ruta y no pinta nada.
          Este es el botón que se ve. */}
      <VolverArriba />

      {/* ---- LA TRANSICIÓN ENTRE PÁGINAS ----
          Va en la raíz porque tiene que TAPAR todo lo demás,
          incluido el menú del que se acaba de salir, y porque el
          viaje continúa después de que el menú se desmonte.

          No pinta nada mientras no hay navegación en curso: las
          cinco columnas están a scaleY(0). Ver Persiana.jsx. */}
      <Persiana />

      {showIntro && (
        <IntroAnimation
          onFinish={() => setShowIntro(false)}
          /* ---- POR QUÉ EL HERO NECESITA ESTE SEGUNDO AVISO ----
             Mientras el telón es OPACO, el hero de la portada se
             pinta entero debajo (visible para el navegador,
             invisible para la persona): así el LCP se registra en
             el segundo ~2 y no en el ~9, sin que cambie un solo
             fotograma de lo que se ve. Pero el telón termina con
             un fundido de 0,8s, y durante ese fundido el hero
             tiene que estar YA velado o se le vería formado antes
             de su coreografía. Este aviso llega justo cuando el
             fundido arranca — con el telón aún opaco. */
          onLeaving={() => setIntroSaliendo(true)}
        />
      )}
    </div>
  );
}

export default App;