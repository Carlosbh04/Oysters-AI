import "./TeamCard.css";
import { FaLinkedin } from "react-icons/fa";

/* Tarjeta de miembro del equipo: retrato a sangre en la columna
   izquierda y, a la derecha, nombre, cargo, biografía y enlace
   a LinkedIn.

   El botón de LinkedIn va DENTRO del cuerpo, al final. Estaba
   flotando sobre la foto en absoluto: sobre el hueco vacío del
   placeholder parecía un elemento suelto, y en el cuerpo cumple
   además la función de cerrar la columna de texto — con
   margin-top:auto se pega abajo y se come el hueco muerto que
   quedaba bajo la biografía.

   El contenido real vive en data/about.js; la foto queda en
   null hasta que estén los retratos definitivos. */
function TeamCard({ name, role, photo, bio, linkedin }) {
  return (
    <article className="team-card">
      <div className="team-card__media">
        {photo ? (
          <img src={photo} alt={name} loading="lazy" decoding="async" />
        ) : (
          <span className="team-card__placeholder" aria-hidden="true">
            Foto del equipo
          </span>
        )}
      </div>

      <div className="team-card__body">
        <h3 className="team-card__name">{name}</h3>
        <p className="team-card__role">{role}</p>
        <p className="team-card__bio">{bio}</p>

        <a
          className="team-card__linkedin"
          href={linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label={`LinkedIn de ${name}`}
        >
          <FaLinkedin aria-hidden="true" />
          <span>LinkedIn</span>
        </a>
      </div>
    </article>
  );
}

export default TeamCard;
