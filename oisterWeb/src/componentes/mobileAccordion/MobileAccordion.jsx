import "./MobileAccordion.css";
import { NavLink } from "react-router-dom";
import ChevronDown from "../../assets/icons/chevron-down.svg";
import useViajeConPersiana from "../../hooks/useViajeConPersiana";

/* `style` se reenvía a la raíz a propósito: el menú móvil le pasa
   su `--i` para el escalonado de la entrada (ver MobileMenu.css).
   Sin este paso el acordeón sería el único hijo del nav sin
   índice, y entraría a destiempo con el resto. */
function MobileAccordion({
  id,
  title,
  items = [],
  onClose,
  isOpen,
  setOpenAccordion,
  style,
}) {
  /* los de dentro también cambian de página: misma persiana que
     "Trabajos" o "Hablemos" (ver useViajeConPersiana.js) */
  const { aRuta } = useViajeConPersiana();

  const handleToggle = () => {
    setOpenAccordion((current) => (current === id ? null : id));
  };

  return (
    <div className={`mobile-accordion ${isOpen ? "active" : ""}`} style={style}>
      <button
        type="button"
        onClick={handleToggle}
        className="mobile-accordion__header"
      >
        <span>{title}</span>
        <span className="mobile-accordion__icon">
          <img src={ChevronDown} alt="" className={isOpen ? "active" : ""} />
        </span>
      </button>
      <div className={`mobile-accordion__content ${isOpen ? "active" : ""}`}>
        <div className="mobile-accordion__body">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={aRuta(item.path, onClose)}
              className="mobile-accordion__link"
            >
              <span>{item.title}</span>
              <span className="mobile-menu__arrow">→</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MobileAccordion;