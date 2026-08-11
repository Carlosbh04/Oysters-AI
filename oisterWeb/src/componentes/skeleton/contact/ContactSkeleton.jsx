import SkeletonPiece from "../SkeletonPiece";
import "./ContactSkeleton.css";

/* Eco de Contact.jsx con la misma estructura y dimensiones:
   grid (cabecera e info a la izquierda, formulario a la
   derecha) + tarjeta del formulario con los 5 campos y el
   botón, para que el reveal no descoloque. Va envuelto en el
   MISMO PageSection className="contact-page" que ContactSection
   (App.jsx). */
function ContactSkeleton() {
  return (
    <div className="contact-skeleton">
      {/* CABECERA: titular + barra + dos párrafos */}
      <div className="contact-skeleton__header">
        <SkeletonPiece
          variant="title"
          width="240px"
          height="52px"
          className="contact-skeleton__title"
        />
        <SkeletonPiece
          variant="block"
          width="84px"
          height="6px"
          className="contact-skeleton__bar"
        />
        <div className="contact-skeleton__text">
          <SkeletonPiece variant="line" width="100%" height="32px" />
          <SkeletonPiece variant="line" width="92%" height="32px" />
          <SkeletonPiece variant="line" width="100%" height="32px" />
          <SkeletonPiece variant="line" width="90%" height="32px" />
          <SkeletonPiece variant="line" width="84%" height="32px" />
        </div>
      </div>

      {/* FORMULARIO: 4 campos + textarea + botón */}
      <div className="contact-skeleton__form">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonPiece
            key={i}
            variant="line"
            height="50px"
            className="contact-skeleton__input"
          />
        ))}
        <SkeletonPiece
          variant="line"
          height="137px"
          className="contact-skeleton__input contact-skeleton__textarea"
        />
        <SkeletonPiece
          variant="line"
          height="56px"
          className="contact-skeleton__btn"
        />
      </div>

      {/* INFO: 2 items (icono + texto) + síguenos */}
      <div className="contact-skeleton__info">
        {[0, 1].map((i) => (
          <div className="contact-skeleton__item" key={i}>
            <SkeletonPiece variant="circle" size={46} />
            <SkeletonPiece variant="line" width="54%" height="18px" />
          </div>
        ))}
        <SkeletonPiece
          variant="line"
          width="110px"
          height="13px"
          className="contact-skeleton__social-title"
        />
        <div className="contact-skeleton__social">
          {[0, 1, 2].map((i) => (
            <SkeletonPiece key={i} variant="circle" size={52} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContactSkeleton;