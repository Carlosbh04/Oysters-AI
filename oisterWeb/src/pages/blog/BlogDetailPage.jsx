import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageSection from "../../componentes/layout/PageSection";
import blogEntries from "../../data/blog.json";
import "./BlogDetailPage.css";

const CARGA_MINIMA = 400;

function BlogDetailPage() {
  const { id } = useParams();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);

    const temporizador = setTimeout(() => {
      setCargando(false);
    }, CARGA_MINIMA);

    return () => clearTimeout(temporizador);
  }, [id]);

  const entradaBlog = blogEntries.find((blog) => blog.id === Number(id));

  if (cargando) {
    return (
      <PageSection center={false} className="blog-detail">
        <div className="blog-detail-skeleton" role="status" aria-live="polite">
          <span className="blog-skeleton blog-skeleton-back"></span>
          <span className="blog-skeleton blog-skeleton-title"></span>
          <span className="blog-skeleton blog-skeleton-line"></span>
          <span className="blog-skeleton blog-skeleton-line"></span>
          <span className="blog-skeleton blog-skeleton-image"></span>
        </div>
      </PageSection>
    );
  }

  if (!entradaBlog) {
    return (
      <PageSection className="blog-detail">
        <h1>Entrada de blog no encontrada</h1>
      </PageSection>
    );
  }

  return (
    <PageSection center={false} className="blog-detail">
      <article className="blog-article">
        <Link to="/blog" className="blog-back">
          <span aria-hidden="true">←</span> Todas las entradas
        </Link>

        <header className="blog-article-header">
          <span className="blog-article-category">Blog</span>
          <h1>{entradaBlog.titulo}</h1>
        </header>

        <section className="blog-article-content">
          {entradaBlog.entradas.map((bloque, index) => (
            <section key={`${bloque.subtitulo}-${index}`} className="blog-post-block">
              <h2>{bloque.subtitulo}</h2>
              <p>{bloque.texto}</p>

              {bloque.foto && (
                <figure className="blog-post-image">
                  <img src={bloque.foto} alt={bloque.subtitulo} />
                </figure>
              )}
            </section>
          ))}
        </section>
      </article>
    </PageSection>
  );
}

export default BlogDetailPage;
