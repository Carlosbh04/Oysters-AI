import { useState, useEffect, useRef, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import lazyWithMin from "./utils/Lazywithmin";

import Header from "./componentes/header/Header";
import IntroAnimation from "./componentes/introAnimation/IntroAnimation";
import ScrollToTop from "./componentes/scrollToTop/ScrollToTop";
import PageSkeleton from "./componentes/skeleton/PageSkeleton";

/* HOME en EAGER: es la landing (siempre es la primera visita),
   tiene el canvas WebGL de la ostra y su GLB con preload — el
   lazy le rompía la carga de la escena y no le aportaba nada.
   El resto de páginas sí van en LAZY: se descargan solo al
   navegar a ellas (code-splitting) y mientras cargan, Suspense
   muestra EL esqueleto genérico — uno para todas las rutas. */
import HomePage from "./pages/home/Home";

/* lazyWithMin = lazy + skeleton visible un mínimo de 600ms:
   sin él, en conexiones rápidas el esqueleto parpadearía
   30ms y se sentiría glitch en vez de carga */
const ContactSection = lazyWithMin(() => import("./pages/contact/Contact"));
const NotFoundPage = lazyWithMin(() => import("./pages/error/404"));
const WorksPage = lazyWithMin(() => import("./pages/work/WorkPage"));
const WorkDetailPage = lazyWithMin(() => import("./pages/work/WorkDetailPage"));

import "./App.css";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();

  /* ---- skeleton en CADA navegación ----
     Los chunks ya cargados no vuelven a suspender nunca, así
     que Suspense solo cubre las primeras visitas. Para que el
     skeleton aparezca SIEMPRE al cambiar de página, lo
     orquestamos desde el cambio de ruta: al navegar, 1.1s de
     skeleton y luego la página entra con su animación. La
     primera carga de la app se salta esto (el intro es el
     loader de la home). */
  const [transitioning, setTransitioning] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), 1100);
    return () => clearTimeout(t);
  }, [location.pathname]);

  /* Recargar SIEMPRE arranca arriba: el intro se reproduce en
     cada carga, así que restaurar el scroll a mitad de página
     no tiene sentido — y de paso elimina los bugs de posición
     de la ostra causados por la restauración impredecible del
     scroll del navegador tras recargar. */
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app">
      {/* Resetea el scroll arriba en cada cambio de ruta */}
      <ScrollToTop />

      {/* La app se monta DESDE EL PRINCIPIO: la ostra (GLB),
          el canvas WebGL, fuentes y CSS cargan en paralelo
          mientras el intro anima por encima (fixed + z-index
          99999 la tapa por completo). Al terminar el intro,
          todo ya está listo → transición instantánea. */}
      <Header introDone={!showIntro} />

      <main className="app__main">
        {/* Durante la transición de ruta: SOLO el skeleton.
            Después, la página monta (con Suspense por si el
            chunk aún descarga — su fallback es el mismo
            skeleton, continuidad perfecta) y entra animada.
            El key en el Suspense sigue siendo necesario:
            React Router retiene la página vieja durante
            suspensiones si el boundary no se recrea. */}
        {transitioning ? (
          <PageSkeleton />
        ) : (
          <Suspense key={location.pathname} fallback={<PageSkeleton />}>
            <div className="page-anim">
              <Routes>
          <Route path="/" element={<HomePage introDone={!showIntro} />} />

          <Route path="/works" element={<WorksPage />} />

          <Route path="/works/:id" element={<WorkDetailPage />} />

          <Route path="/resources" element={<div>AÑADIR RECURSOS</div>} />

          <Route path="/blog" element={<div>AÑADIR ENTRADAS DEL BLOG</div>} />

          <Route
            path="/contact"
            element={<ContactSection introDone={!showIntro} />}
          />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </Suspense>
        )}
      </main>

      {/* el intro va al final del JSX pero por encima de todo
          gracias a su position: fixed + z-index */}
      {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
    </div>
  );
}

export default App;