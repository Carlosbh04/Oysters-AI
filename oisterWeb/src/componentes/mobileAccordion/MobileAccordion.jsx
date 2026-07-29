import "./MobileAccordion.css";
import { NavLink } from "react-router-dom";
import ChevronDown from "../../assets/icons/chevron-down.svg";

function MobileAccordion({
  id,
  title,
  items = [],
  onClose,
  isOpen,
  setOpenAccordion,
}) {
  const handleToggle = () => {
    setOpenAccordion((current) => (current === id ? null : id));
  };

  return (
    <div className={`mobile-accordion ${isOpen ? "active" : ""}`}>
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
              onClick={onClose}
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