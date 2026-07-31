import "./ServiceCard.css";
import { NavLink } from "react-router-dom";

function ServiceCard({ icon: Icon, title, description, link }) {
  return (
    <article className="service-card">
      <header className="service-card__header">
        <span className="service-card__icon">
          {Icon && <Icon size={20} strokeWidth={1.8} />}
        </span>

        <h3 className="service-card__title">{title}</h3>
      </header>

      <p className="service-card__text">{description}</p>

      <NavLink to={link} className="service-card__link">
        Ver más
        <svg
          width="13"
          height="13"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 7h9M7.5 3.5 11 7l-3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </NavLink>
    </article>
  );
}

export default ServiceCard;