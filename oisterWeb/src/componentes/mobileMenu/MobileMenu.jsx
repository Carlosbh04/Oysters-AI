import "./MobileMenu.css";
import useViajeConPersiana from "../../hooks/useViajeConPersiana";
import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import MobileAccordion from "../mobileAccordion/MobileAccordion.jsx";
import { dropdowns } from "../../data/dropdown.js";

function MobileMenu({ isOpen, onClose }) {
  /* ---- TODO EL MENÚ SALE CON LA PERSIANA DELANTE ----
     Los dos tipos de destino usan la misma transición y se
     diferencian solo en lo que hacen con la pantalla tapada:
     `aRuta` cambia de página, `aSeccion` se coloca en un bloque de
     la portada. Ver useViajeConPersiana.js.

     (El menú de ESCRITORIO sigue con el scroll animado de
     useIrASeccion: allí el recorrido se ve y merece la pena.) */
  const { aRuta, aSeccion } = useViajeConPersiana();

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
          <NavLink
            to="/"
            className="mobile-menu__logo"
            onClick={aRuta("/", closeMenu)}
          >
            Oysters AI
          </NavLink>
        </div>

        <nav className="mobile-menu__nav" ref={navRef}>
          <NavLink
            className="mobile-menu__link"
            style={{ "--i": 0 }}
            to="/#nosotros"
            onClick={aSeccion("nosotros", closeMenu)}
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
            style={{ "--i": 1 }}
            to="/#que-hacemos"
            onClick={aSeccion("que-hacemos", closeMenu)}
          >
            Cómo lo hacemos
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          {/* mismo destino que el menú de escritorio: la sección
              ancla del home, no una página propia (nunca existió
              /use-cases: acababa en "no encontrado") */}
          <NavLink
            className="mobile-menu__link"
            style={{ "--i": 2 }}
            to="/#casos-de-uso"
            onClick={aSeccion("casos-de-uso", closeMenu)}
          >
            Casos de uso
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          <NavLink
            className="mobile-menu__link"
            style={{ "--i": 3 }}
            to="/works"
            onClick={aRuta("/works", closeMenu)}
          >
            Trabajos
            <span className="mobile-menu__arrow">→</span>
          </NavLink>

          {/* --i alimenta el escalonado del enfoque (ver
              MobileMenu.css): un número por hijo del nav, en el
              orden en que se leen. */}
          <MobileAccordion
            style={{ "--i": 4 }}
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

          <NavLink
            to="/contact"
            className="mobile-menu__cta"
            onClick={aRuta("/contact", closeMenu)}
          >
            Hablemos
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default MobileMenu;