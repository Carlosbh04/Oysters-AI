import { Link } from "react-router-dom";
import "./WorkCard.css";

function WorkCard({
    id,
    titulo,
    subtitulo,
    imagen
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
                />

            </div>

            <div className="work-card-content">

                <h2>{titulo}</h2>

                <p>{subtitulo}</p>

                <span className="work-card-button">
                    Ver proyecto →
                </span>

            </div>

        </Link>
    );
}

export default WorkCard;