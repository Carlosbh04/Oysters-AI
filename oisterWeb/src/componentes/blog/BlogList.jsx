import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import BlogCard from "./BlogCard";
import "./BlogList.css";

function BlogList({ entradas, page = 1, totalPages = 1 }) {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

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
            subtitulo={entrada.entradas?.[0]?.subtitulo}
            foto={entrada.entradas?.[0]?.foto}
            entrada={entrada.entradas?.[0]}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="blog-pagination" aria-label="Paginación del blog">
          {page > 1 && (
            <Link className="blog-pagination__link" to={`/blog/page/${page - 1}`}>
              <span aria-hidden="true">←</span> Anterior
            </Link>
          )}

          <div className="blog-pagination__numbers">
            {Array.from({ length: totalPages }, (_, index) => {
              const numeroPagina = index + 1;
              const active = numeroPagina === page;

              return (
                <Link
                  key={numeroPagina}
                  className={active ? "blog-pagination__number is-active" : "blog-pagination__number"}
                  to={numeroPagina === 1 ? "/blog" : `/blog/page/${numeroPagina}`}
                  aria-current={active ? "page" : undefined}
                >
                  {numeroPagina}
                </Link>
              );
            })}
          </div>

          {page < totalPages && (
            <Link className="blog-pagination__link" to={`/blog/page/${page + 1}`}>
              Siguiente <span aria-hidden="true">→</span>
            </Link>
          )}
        </nav>
      )}

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
