import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "./BlogCard.css";

function BlogCard({ id, titulo, subtitulo, foto, entrada }) {
  const textoResumen = entrada?.texto || subtitulo || "Lee esta entrada del blog";

  return (
    <Link to={`/blog/${id}`} className="blog-card">
      <div className="blog-card-image">
        <img src={foto} alt={titulo} loading="lazy" />
        <span className="blog-card-badge" aria-hidden="true">
          <Sparkles size={17} strokeWidth={2.2} />
        </span>
        <span className="blog-card-shine" aria-hidden="true"></span>
      </div>

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
