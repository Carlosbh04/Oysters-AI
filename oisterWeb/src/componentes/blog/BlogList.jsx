import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import BlogCard from "./BlogCard";
import Paginacion from "../paginacion/Paginacion";
import "./BlogList.css";

function BlogList({ entradas, page = 1, totalPages = 1 }) {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  /* La página del blog vive en la RUTA (/blog/page/2), no en un
     query param como en /works, así que aquí cambiar de página es
     navegar. La 1 va a /blog a secas: es la dirección limpia de
     la sección y /blog/page/1 solo sería ruido duplicado. El
     scroll arriba lo pone ScrollToTop al cambiar de ruta. */
  const irA = (n) => {
    if (n < 1 || n > totalPages || n === page) return;

    navigate(n === 1 ? "/blog" : `/blog/page/${n}`);
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 28;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -24;

    setCursor({ x, y });
  };

  const driftX = Math.round(cursor.x * -0.42);
  const driftY = Math.round(cursor.y * -0.38);

  return (
    <section
      className="blog-list"
      style={{
        "--blog-shift-x": `${cursor.x}px`,
        "--blog-shift-y": `${cursor.y}px`,
        "--blog-drift-x": `${driftX}px`,
        "--blog-drift-y": `${driftY}px`,
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="blog-background-glow" aria-hidden="true" />
      <div className="blog-starfield" aria-hidden="true">
        <span className="blog-star blog-star--one">✦</span>
        <span className="blog-star blog-star--two">✧</span>
        <span className="blog-star blog-star--three">✦</span>
        <span className="blog-star blog-star--four">✹</span>
        <span className="blog-star blog-star--five">✧</span>
        <span className="blog-star blog-star--six">✦</span>
      </div>
      <span className="blog-deco blog-deco-1" aria-hidden="true">✦</span>
      <span className="blog-deco blog-deco-2" aria-hidden="true">✦</span>
      <span className="blog-deco blog-deco-3" aria-hidden="true">✦</span>
      <span className="blog-deco blog-deco-4" aria-hidden="true">✦</span>

      <header className="blog-list-head">
        {/* <p className="blog-list-badge">
          <Sparkles size={13} strokeWidth={2.4} aria-hidden="true" />
          Oister Intelligence
        </p> */}

        <h1 className="blog-list-title">
          Blog
          <span className="blog-list-title-glow" aria-hidden="true"></span>
        </h1>

      </header>

      <div className="blog-list-grid">
        {entradas.map((entrada) => (
          <BlogCard
            key={entrada.id}
            id={entrada.id}
            titulo={entrada.titulo}
            categoria={entrada.categoria}
            fecha={entrada.fecha}
            foto={entrada.entradas?.[0]?.foto}
            entrada={entrada.entradas?.[0]}
          />
        ))}
      </div>

      {/* Paginación compartida con /works (el componente vive en
          paginacion/Paginacion.jsx). Con una sola página se
          oculta sola. */}
      <Paginacion
        actual={page}
        total={totalPages}
        onIrA={irA}
        ariaLabel="Paginación del blog"
      />

      {/* <div className="blog-list-cta">
        <span className="blog-list-cta-icon" aria-hidden="true">
          <Sparkles size={24} strokeWidth={2} />
        </span>

        <div className="blog-list-cta-text">
          <h2>¿Quieres explorar más ideas?</h2>
          <p>
            Conversamos con tu equipo sobre contenidos, campañas y estrategias
            inteligentes.
          </p>
        </div>

        <Link to="/contact" className="blog-list-cta-button">
          Hablemos <span aria-hidden="true">→</span>
        </Link>
      </div> */}
    </section>
  );
}

export default BlogList;
