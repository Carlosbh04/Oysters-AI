import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import BlogCard from "./BlogCard";
import "./BlogList.css";

function BlogList({ entradas }) {
  return (
    <section className="blog-list">
      <span className="blog-deco blog-deco-1" aria-hidden="true">✦</span>
      <span className="blog-deco blog-deco-2" aria-hidden="true">✦</span>
      <span className="blog-deco blog-deco-3" aria-hidden="true">✦</span>
      <span className="blog-deco blog-deco-4" aria-hidden="true">✦</span>

      <header className="blog-list-head">
        <p className="blog-list-badge">
          <Sparkles size={13} strokeWidth={2.4} aria-hidden="true" />
          Oister Intelligence
        </p>

        <h1 className="blog-list-title">
          Blog
          <span className="blog-list-title-glow" aria-hidden="true"></span>
        </h1>

        <p className="blog-list-subtitle">
          Ideas, procesos y casos de uso para construir marcas con IA.
        </p>
      </header>

      <div className="blog-list-grid">
        {entradas.map((entrada) => (
          <BlogCard
            key={entrada.id}
            id={entrada.id}
            titulo={entrada.titulo}
            subtitulo={entrada.entradas?.[0]?.subtitulo}
            foto={entrada.entradas?.[0]?.foto}
            entrada={entrada.entradas?.[0]}
          />
        ))}
      </div>

      <div className="blog-list-cta">
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
      </div>
    </section>
  );
}

export default BlogList;
