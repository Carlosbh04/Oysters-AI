import "./Header.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import HamburgerButton from "../hamburger/HamburgerButton.jsx";
import MobileMenu from "../mobileMenu/MobileMenu.jsx";
import DesktopMenu from "../desktopMenu/DesktopMenu.jsx";

/* Hook mínimo: ¿estamos en desktop (>1100px)?
   Decide qué menú renderiza la hamburguesa:
   - Desktop → DesktopMenu (panel que cae desde la píldora,
     dropdowns como flyouts laterales)
   - ≤1100px → MobileMenu (el drawer de siempre) */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1101px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1101px)");
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

function Header({ introDone = true, tagline = "LOOKING SHARP TODAY" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDesktop = useIsDesktop();

  /* si cambia el breakpoint con el menú abierto, se cierra:
     evita que el drawer móvil quede abierto al pasar a desktop */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [isDesktop]);

  return (
    <header
      className={`header ${introDone ? "header--enter" : ""} ${
        isMenuOpen ? "is-open" : ""
      }`}
    >
      <div className="header__container">
        {/* Logo */}
        <NavLink to="/" end className="header__logo">
          Logo
        </NavLink>

        {/* Texto central — centrado absoluto respecto a la píldora,
            independiente del ancho del logo y de la hamburguesa */}
        <span className="header__tagline">{tagline}</span>

        {/* Hamburguesa: SIEMPRE visible (también en desktop). */}
        <HamburgerButton
          isOpen={isMenuOpen}
          onToggle={() => setIsMenuOpen(!isMenuOpen)}
        />
      </div>

      {/* DesktopMenu va DESPUÉS de .header__container y en flujo
          normal: así el panel cae de forma natural justo debajo
          de la píldora, pegado a su borde inferior. */}
      {isDesktop && (
        <DesktopMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      {/* FUERA de .header__container: la animación de entrada
          deja transform+filter en el container (por el forwards),
          y eso convierte al container en contenedor de referencia
          de cualquier position:fixed descendiente → el drawer se
          descolocaba. Como hermano del container, el fixed vuelve
          a referirse al viewport y el drawer funciona normal. */}
      {!isDesktop && (
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}

export default Header;