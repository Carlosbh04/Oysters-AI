import { useState, useEffect, useRef, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import lazyWithMin from "./utils/Lazywithmin";

import Header from "./componentes/header/Header";
import Footer from "./componentes/footer/Footer";
import IntroAnimation from "./componentes/introAnimation/IntroAnimation";
import PageSection from "./componentes/layout/PageSection";
import ScrollToTop from "./componentes/scrollToTop/ScrollToTop";
import DefaultSkeleton from "./componentes/skeleton/DefaultSkeleton";
import WorkDetailSkeleton from "./componentes/skeleton/work-detail/WorkDetailSkeleton";
import WorksSkeleton from "./componentes/skeleton/work-list/WorksSkeleton";
import ContactSkeleton from "./componentes/skeleton/contact/ContactSkeleton";

import HomePage from "./pages/home/Home";
import ContactSection from "./pages/contact/Contact";
import NotFoundPage from "./pages/error/404";
import WorksPage from "./pages/work/WorkPage";
import WorkDetailPage from "./pages/work/WorkDetailPage";

/* Del blog: van estáticos como el resto de páginas principales
   de esta rama. */
import BlogPage from "./pages/blog/BlogPage";
import BlogDetailPage from "./pages/blog/BlogDetailPage";

/* ---- LAS QUE SÍ VAN EN LAZY ----
   Bancos de pruebas y apartados secundarios: no se visitan en la
   primera carga, así que su código no tiene por qué viajar en el
   bundle inicial.

   OJO con lo que NO está aquí: Contact, 404, WorkPage y
   WorkDetail se importan ARRIBA de forma estática. La versión
   guardada en el stash los declaraba además con lazyWithMin, y
   dejar las dos cosas es una redeclaración del mismo nombre —
   el módulo ni compila. Se quedan los estáticos, que es lo que
   trae la rama. */

/* banco de pruebas del fondo Cosmic Data Flow */
const CosmicPage = lazyWithMin(() => import("./pages/laboratorio/CosmicPage"));

const UseCasesPage = lazyWithMin(() =>
  import("./pages/laboratorio/UseCasesPage")
);

const FooterPage = lazyWithMin(() => import("./pages/laboratorio/FooterPage"));

/* Los cuatro apartados de "Cómo lo hacemos". Comparten el fondo
   (EscenaServicio); de momento solo el primero trae contenido. */
const AprendizajeIAPage = lazyWithMin(() =>
  import("./pages/servicios/AprendizajeIAPage")
);

const ContenidoIAPage = lazyWithMin(() =>
  import("./pages/servicios/ContenidoIAPage")
);

const PersonalizacionIAPage = lazyWithMin(() =>
  import("./pages/servicios/PersonalizacionIAPage")
);

const OrquestacionIAPage = lazyWithMin(() =>
  import("./pages/servicios/OrquestacionIAPage")
);

/* banco de pruebas del fondo del hero */
const HeroBackgroundPage = lazyWithMin(() =>
  import("./pages/laboratorio/HeroBackgroundPage")
);

/* fondo de tira tecnológica, en rediseño */
const FondoTramaPage = lazyWithMin(() =>
  import("./pages/fondoTrama/FondoTramaPage")
);

/* escena del corredor de datos con la figura de mármol */
const EscenaOraculoPage = lazyWithMin(() =>
  import("./pages/escenaOraculo/EscenaOraculoPage")
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
      /* la clase pinta el fondo oscuro de la escena Cosmic Data
         Flow, que en la página real dibuja un canvas. Montar el
         canvas aquí lo metería en el bundle principal —14 kB que
         solo hacen falta en esta ruta—, y para un hueco de carga
         basta con el color de base. */
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

   Las páginas cargadas con lazyWithMin traen `.preload`. Las que
   se importan de forma ESTÁTICA arriba —Home, Contact, 404,
   WorkPage, WorkDetail— no: su código ya viaja en el bundle
   inicial, no hay nada que precargar. Pedirles `.preload` da
   `undefined`, y quien llama a esto lo invoca como función:

     getRouteChunk(location.pathname)()   ->  undefined()

   Eso es lo que petaba en /blog/1: no entra en ninguna rama con
   nombre, cae al final —que devolvía `NotFoundPage.preload`— y
   revienta antes de pintar nada. La lista /blog se salvaba solo
   porque tiene rama propia.

   `precargaDe` cierra el agujero de raíz: si no hay chunk,
   responde con una promesa ya resuelta. */
const precargaDe = (pagina) => pagina?.preload ?? (() => Promise.resolve());

function getRouteChunk(pathname) {
  if (pathname === "/works") return precargaDe(WorksPage);
  if (/^\/works\/[^/]+$/.test(pathname)) return precargaDe(WorkDetailPage);
  if (pathname === "/contact") return precargaDe(ContactSection);
  if (pathname === "/cosmic") return precargaDe(CosmicPage);
  if (pathname === "/lab/hero-background") return precargaDe(HeroBackgroundPage);
  if (pathname === "/lab/casos-de-uso") return precargaDe(UseCasesPage);
  if (pathname === "/lab/footer") return precargaDe(FooterPage);
  if (pathname === "/services/aprendizaje-ia") return precargaDe(AprendizajeIAPage);
  if (pathname === "/services/contenido-ia") return precargaDe(ContenidoIAPage);
  if (pathname === "/services/personalizacion-ia") return precargaDe(PersonalizacionIAPage);
  if (pathname === "/services/orquestacion-ia") return precargaDe(OrquestacionIAPage);
  if (pathname === "/fondo-trama") return precargaDe(FondoTramaPage);
  if (pathname === "/escena-oraculo") return precargaDe(EscenaOraculoPage);

  /* El blog va estático en esta rama: nada que precargar, ni en
     el listado, ni paginado, ni en el detalle. */
  if (pathname.startsWith("/blog")) return () => Promise.resolve();

  if (pathname === "/" || pathname === "/resources") {
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

/* Las rutas de laboratorio son bancos de pruebas: van a
   pantalla completa, sin cabecera y sin la intro. La intro dura
   ~5s y en una página que se recarga cada dos por tres para ver
   un cambio es puro peaje. */
const esLaboratorio = (pathname) => pathname.startsWith("/lab/");

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
const FONDOS_OSCUROS = ["/services/", "/contact", "/cosmic", "/escena-oraculo"];
const tonoDelPie = (pathname) =>
  FONDOS_OSCUROS.some((p) => pathname.startsWith(p)) ? "oscuro" : "claro";

function App() {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(
    () => !esLaboratorio(window.location.pathname)
  );

  /* nace en true si la ruta actual no es Home: el skeleton
     queda montado (shimmer corriendo) DETRÁS de la intro
     desde el primer render — la intro es fixed + z-index
     alto, así que esto es invisible hasta que ella se levanta.
     Home nunca usa skeleton (lo cubre su propio intro). */
  const [skeletonVisible, setSkeletonVisible] = useState(
    () => window.location.pathname !== "/"
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
    setSkeletonVisible(location.pathname !== "/");
    setRouteReady(false);
  }

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
    const t = setTimeout(() => {
      setSkeletonVisible(false);
      initialPathname.current = null;
    }, isInitialReveal ? INITIAL_REVEAL_HOLD : NAV_PULSE);

    return () => clearTimeout(t);
  }, [showIntro, location.pathname, routeReady]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app" data-pie={tonoDelPie(location.pathname)}>
      <ScrollToTop />

      {!esLaboratorio(location.pathname) && (
        <Header
          introDone={!showIntro && !skeletonVisible}
          hideNav={skeletonVisible && !showIntro}
        />
      )}

      <main className="app__main">
        {skeletonVisible ? (
          getSkeletonFor(location.pathname)
        ) : (
          <Suspense key={location.pathname} fallback={getSkeletonFor(location.pathname)}>
            <div className="page-anim">
              <Routes>
                <Route path="/" element={<HomePage introDone={!showIntro} />} />

                {/* El blog llega de esta rama. Las tres rutas van
                    juntas: listado, listado paginado y detalle. */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/page/:page" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogDetailPage />} />

                <Route path="/works" element={<WorksPage />} />
                <Route path="/works/:id" element={<WorkDetailPage />} />
                <Route path="/resources" element={<div>AÑADIR RECURSOS</div>} />
                <Route path="/contact" element={<ContactSection introDone={!showIntro} />} />
                <Route path="/cosmic" element={<CosmicPage />} />
                <Route path="/lab/hero-background" element={<HeroBackgroundPage />} />
                <Route path="/lab/casos-de-uso" element={<UseCasesPage />} />
                <Route path="/lab/footer" element={<FooterPage />} />
                <Route path="/services/aprendizaje-ia" element={<AprendizajeIAPage />} />
                <Route path="/services/contenido-ia" element={<ContenidoIAPage />} />
                <Route path="/services/personalizacion-ia" element={<PersonalizacionIAPage />} />
                <Route path="/services/orquestacion-ia" element={<OrquestacionIAPage />} />
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
          Aquí sale en todas, con las dos mismas excepciones que
          la cabecera y por los mismos motivos:

            · las rutas de laboratorio van a pantalla completa,
              y además /lab/footer monta su propio <Footer /> —
              con el global saldrían dos;
            · mientras está el skeleton no hay contenido todavía,
              y un pie colgando de un esqueleto se lee como que
              la página ya cargó y está vacía.

          Al salir de HomePage se lleva consigo su animación de
          entrada, que va por IntersectionObserver dentro del
          propio componente: no hay nada que reconectar por
          ruta. */}
      {!esLaboratorio(location.pathname) && !skeletonVisible && <Footer />}

      {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
    </div>
  );
}

export default App;