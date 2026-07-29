import "./MobileMenu.css";
import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MobileAccordion from "../mobileAccordion/MobileAccordion.jsx";
import { dropdowns } from "../../data/dropdown.js";

function MobileMenu({ isOpen, onClose }) {
  const [openAccordion, setOpenAccordion] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    if (!isOpen) {
      setOpenAccordion(null);
    }

    /* al abrir, el nav siempre arranca arriba del todo:
       aunque la sesión anterior quedara scrolleada,
       "Nosotros" está siempre visible al entrar */
    if (isOpen && navRef.current) {
      navRef.current.scrollTop = 0;
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`mobile-menu__overlay ${isOpen ? "active" : ""}`}
        onClick={onClose}
      />

      <aside className={`mobile-menu ${isOpen ? "active" : ""}`}>
        <div className="mobile-menu__header">
          <NavLink to="/" className="mobile-menu__logo" onClick={onClose}>
            Oysters AI
          </NavLink>
        </div>

        <nav className="mobile-menu__nav" ref={navRef}>
          <NavLink className="mobile-menu__link" to="/about" onClick={onClose}>
            Nosotros
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <NavLink className="mobile-menu__link" to="/services" onClick={onClose}>
            Qué hacemos
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <MobileAccordion
            id="methodology"
            title={dropdowns.methodology.title}
            items={dropdowns.methodology.items}
            onClose={onClose}
            isOpen={openAccordion === "methodology"}
            setOpenAccordion={setOpenAccordion}
          />

          <NavLink className="mobile-menu__link" to="/use-cases" onClick={onClose}>
            Casos de uso
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <NavLink className="mobile-menu__link" to="/works" onClick={onClose}>
            Trabajos
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <MobileAccordion
            id="resources"
            title={dropdowns.resources.title}
            items={dropdowns.resources.items}
            onClose={onClose}
            isOpen={openAccordion === "resources"}
            setOpenAccordion={setOpenAccordion}
          />
        </nav>

        <div className="mobile-menu__footer">
          <button type="button" className="mobile-menu__language">
            ES
          </button>

          <NavLink to="/contact" className="mobile-menu__cta" onClick={onClose}>
            Hablemos
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default MobileMenu;