import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./componentes/header/Header";
import IntroAnimation from "./componentes/introAnimation/IntroAnimation";

// Páginas
import HomePage from "./pages/home/Home";
import ContactSection from "./pages/contact/Contact";
import NotFoundPage from "./pages/error/404";

import "./App.css";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="app">
      {/* La app se monta DESDE EL PRINCIPIO: la ostra (GLB),
          el canvas WebGL, fuentes y CSS cargan en paralelo
          mientras el intro anima por encima (fixed + z-index
          99999 la tapa por completo). Al terminar el intro,
          todo ya está listo → transición instantánea. */}
      <Header />

      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage introDone={!showIntro} />} />

          <Route path="/works" element={<div>AÑADIR TRABAJOS</div>} />

          <Route path="/resources" element={<div>AÑADIR RECURSOS</div>} />

          <Route path="/blog" element={<div>AÑADIR ENTRADAS DEL BLOG</div>} />

          <Route
            path="/contact"
            element={<ContactSection introDone={!showIntro} />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* el intro va al final del JSX pero por encima de todo
          gracias a su position: fixed + z-index */}
      {showIntro && <IntroAnimation onFinish={() => setShowIntro(false)} />}
    </div>
  );
}

export default App;
