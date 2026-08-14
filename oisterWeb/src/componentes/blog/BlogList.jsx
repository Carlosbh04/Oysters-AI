import { useNavigate } from "react-router-dom";
import BlogCard from "./BlogCard";
import FondoBlog from "./FondoBlog";
import Paginacion from "../paginacion/Paginacion";
import "./BlogList.css";

function BlogList({ entradas, page = 1, totalPages = 1 }) {
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

  return (
    <section className="blog-list">
      {/* el cielo con la nieve: mismo componente que usa el
          detalle de entrada (ver FondoBlog.jsx) */}
      <FondoBlog />

      <header className="blog-list-head">
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
    </section>
  );
}

export default BlogList;
