import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "./WorkCard.css";

/**
 * icono: componente de lucide-react para el badge de la
 * imagen. Por defecto Sparkles. Para personalizarlo por
 * trabajo, pásalo desde WorkList:
 *
 *   import { MessageCircle, FileSearch } from "lucide-react";
 *   <WorkCard ... icono={MessageCircle} />
 */
function WorkCard({
    id,
    titulo,
    subtitulo,
    categoria,
    imagen,
    icono: Icono = Sparkles
}) {
    return (
        <Link
            to={`/works/${id}`}
            className="work-card"
        >
            <div className="work-card-image">

                <img
                    src={imagen}
                    alt={titulo}
                    loading="lazy"
                />

                {/* badge glass en la esquina */}
                <span className="work-card-badge" aria-hidden="true">
                    <Icono size={17} strokeWidth={2.2} />
                </span>

                {/* capa de destello en hover */}
                <span className="work-card-shine" aria-hidden="true"></span>

            </div>

            <div className="work-card-content">

                {
                    categoria &&
                    <span className="work-card-category">
                        {categoria}
                    </span>
                }

                <h2>{titulo}</h2>

                <p>{subtitulo}</p>

                <span className="work-card-button">
                    Ver proyecto <span aria-hidden="true">→</span>
                </span>

            </div>

        </Link>
    );
}

export default WorkCard;