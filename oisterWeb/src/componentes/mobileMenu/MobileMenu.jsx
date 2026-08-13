import "./MobileMenu.css";
import useIrASeccion from "../../hooks/useIrASeccion";
import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MobileAccordion from "../mobileAccordion/MobileAccordion.jsx";
import { dropdowns } from "../../data/dropdown.js";

function MobileMenu({ isOpen, onClose }) {
  const irASeccion = useIrASeccion();

  const [openAccordion, setOpenAccordion] = useState(null);
  const navRef = useRef(null);

  const closeMenu = () => {
    setOpenAccordion(null);
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

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
        setOpenAccordion(null);
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
        onClick={closeMenu}
      />

      <aside className={`mobile-menu ${isOpen ? "active" : ""}`}>
        <div className="mobile-menu__header">
          <NavLink to="/" className="mobile-menu__logo" onClick={closeMenu}>
            Oysters AI
          </NavLink>
        </div>

        <nav className="mobile-menu__nav" ref={navRef}>
          <NavLink
            className="mobile-menu__link"
            to="/#nosotros"
            onClick={closeMenu}
            onClickCapture={irASeccion("nosotros")}
          >
            Nosotros
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <NavLink
            className="mobile-menu__link"
            to="/#que-hacemos"
            onClick={closeMenu}
            onClickCapture={irASeccion("que-hacemos")}
          >
            Qué hacemos
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          {/* ---- DE ACORDEÓN A ENLACE ----
              "Cómo lo hacemos" era un desplegable con cuatro
              apartados dentro, y sus cuatro enlaces apuntaban a
              /methodology/* — rutas que nunca han existido: los
              cuatro acababan en "no encontrado".

              Ahora es un enlace normal a la página que los contiene
              a los cuatro, igual que en el menú de escritorio. */}
          <NavLink className="mobile-menu__link" to="/services" onClick={closeMenu}>
            Cómo lo hacemos
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <NavLink className="mobile-menu__link" to="/use-cases" onClick={closeMenu}>
            Casos de uso
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <NavLink className="mobile-menu__link" to="/works" onClick={closeMenu}>
            Trabajos
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <MobileAccordion
            id="resources"
            title={dropdowns.resources.title}
            items={dropdowns.resources.items}
            onClose={closeMenu}
            isOpen={openAccordion === "resources"}
            setOpenAccordion={setOpenAccordion}
          />

        </nav>

        <div className="mobile-menu__footer">
          <button type="button" className="mobile-menu__language">
            ES
          </button>

          <NavLink to="/contact" className="mobile-menu__cta" onClick={closeMenu}>
            Hablemos
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default MobileMenu;