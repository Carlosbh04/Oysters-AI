import { Link } from "react-router-dom";
import "./BlogCard.css";

function BlogCard({ id, titulo, subtitulo, entrada }) {
  const textoCompleto = entrada?.texto || subtitulo || "Lee esta entrada del blog";
  const textoResumen = textoCompleto.length > 160
    ? `${textoCompleto.slice(0, 160).trim()}...`
    : textoCompleto;

  return (
    <Link to={`/blog/${id}`} className="blog-card">
      <div className="blog-card-content">
        <span className="blog-card-category">Blog</span>
        <h2>{titulo}</h2>
        <p>{textoResumen}</p>
        <span className="blog-card-button">
          Leer entrada <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default BlogCard;
