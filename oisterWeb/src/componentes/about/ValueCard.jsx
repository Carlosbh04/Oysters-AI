import "./ValueCard.css";

/* Tarjeta de valor: icono lucide arriba, título y descripción.
   Mismo patrón que ServiceCard (tarjeta de cristal con barrido),
   pero sin enlace. Los datos vienen de data/about.js.

   El icono es decorativo — el significado lo lleva el título,
   así que se oculta al lector de pantalla en vez de anunciarse
   como una imagen sin nombre. */
function ValueCard({ icon: Icon, title, description }) {
  return (
    <article className="value-card">
      <span className="value-card__icon" aria-hidden="true">
        {Icon && <Icon size={22} strokeWidth={1.8} />}
      </span>

      <h3 className="value-card__title">{title}</h3>

      <p className="value-card__text">{description}</p>
    </article>
  );
}

export default ValueCard;
