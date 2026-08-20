import { Link } from "react-router-dom";
import useViajeConPersiana from "../../hooks/useViajeConPersiana";
import "./BlogCard.css";

function BlogCard({ id, titulo, categoria, fecha, foto, entrada }) {
  /* la misma cortina que el resto del sitio */
  const { aRuta } = useViajeConPersiana();

  const textoCompleto =
    entrada?.texto || entrada?.subtitulo || "Lee esta entrada del blog";
  const textoResumen = textoCompleto.length > 160
    ? `${textoCompleto.slice(0, 160).trim()}...`
    : textoCompleto;

  return (
    <Link
            to={`/blog/${id}`}
            className="blog-card"
            onClick={aRuta(`/blog/${id}`)}
        >
      {/* alt vacío: la imagen es ambiental y el titular ya nombra
          la entrada — un lector de pantalla no necesita oírla.
          onError: si el archivo falta (public/img/blog aún no
          existe), se oculta el img y queda el degradado de respaldo
          del contenedor — mismo criterio que el cristal de
          LatestProjects. */}
      {foto && (
        <div className="blog-card-media">
          <img
            src={foto}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <div className="blog-card-content">
        {/* badge de categoría + fecha en la misma fila, como en
            el diseño de referencia. La fecha sale de blog.json
            ya formateada: aquí solo se pinta. */}
        <div className="blog-card-meta">
          <span className="blog-card-category">{categoria || "Blog"}</span>
          {fecha && <span className="blog-card-date">{fecha}</span>}
        </div>

        <h2>{titulo}</h2>

        <span className="blog-card-divider" aria-hidden="true"></span>

        <p>{textoResumen}</p>

        <span className="blog-card-button">
          Leer entrada <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default BlogCard;
