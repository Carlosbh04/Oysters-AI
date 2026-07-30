import { Routes, Route } from "react-router-dom";

import Header from "./header/Header.jsx";
// import Footer from "./footer/Footer.jsx";

import HomePage from "./pages/home/Home.jsx";
import ContactSection from "./pages/contact/Contact.jsx";
import NotFoundPage from "./pages/404.jsx";
import WorksPage from "./pages/work/WorkPage.jsx";
import WorkDetailPage from "./pages/work/WorkDetailPage.jsx";

import "./App.css";


function App() {
  return (
    <div className="app">

      <Header />

      <main className="app__main">
        <Routes>

          <Route path="/" element={<HomePage />} />

          <Route path="/works" element={<WorksPage />} />

          <Route path="/works/:id" element={<WorkDetailPage />} />

          <Route path="/resources" element={<div>AÑADIR RECURSOS</div>} />

          <Route path="/blog" element={<div>AÑADIR ENTRADAS DEL BLOG</div>} />

          <Route path="/contact" element={<ContactSection />} />

          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </main>

      {/* <Footer /> */}

    </div>
  );
}

export default App;