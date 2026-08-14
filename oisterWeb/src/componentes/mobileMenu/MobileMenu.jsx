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
    /* al abrir, el nav siempre arranca arriba del todo:
       aunque la sesión anterior quedara scrolleada,
       "Nosotros" está siempre visible al entrar */
    if (isOpen && navRef.current) {
      navRef.current.scrollTop = 0;
    }

    if (!isOpen) return;

    /* se RESTAURA el valor previo en vez de escribir "auto": un
       "auto" a fuego pisaba cualquier overflow que otro hubiera
       puesto (el vídeo en grande también bloquea el body, y los
       dos se pisaban entre sí) — mismo criterio que VideoMarco */
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previo;
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

          {/* ---- "CÓMO LO HACEMOS" ES UNA SECCIÓN, NO UNA PÁGINA ----
              Apuntaba a /services, y esa página resultó ser un
              duplicado: monta el MISMO bloque (InteligenciaIA) que
              ya está en la portada, así que pulsar el menú te
              sacaba de la home para enseñarte un texto que
              acababas de dejar atrás.

              Ahora lleva a la sección de la portada con el mismo
              scroll suave que "Nosotros" y "Casos de uso".

              Aquí estaba también "Qué hacemos", retirado: apuntaba
              a ESTA MISMA sección, así que el menú ofrecía dos
              caminos al mismo sitio con nombres distintos.

              (El id es `que-hacemos` y la entrada se llama "Cómo
              lo hacemos": ver el porqué en DesktopMenu.jsx.) */}
          <NavLink
            className="mobile-menu__link"
            to="/#que-hacemos"
            onClick={closeMenu}
            onClickCapture={irASeccion("que-hacemos")}
          >
            Cómo lo hacemos
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          {/* mismo destino que el menú de escritorio: la sección
              ancla del home, no una página propia (nunca existió
              /use-cases: acababa en "no encontrado") */}
          <NavLink
            className="mobile-menu__link"
            to="/#casos-de-uso"
            onClick={closeMenu}
            onClickCapture={irASeccion("casos-de-uso")}
          >
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