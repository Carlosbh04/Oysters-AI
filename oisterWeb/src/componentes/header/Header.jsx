import "./Header.css";
import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import HamburgerButton from "../hamburger/HamburgerButton.jsx";
import MobileMenu from "../mobileMenu/MobileMenu.jsx";
import DesktopMenu from "../desktopMenu/DesktopMenu.jsx";
import HeaderTagline from "./HeaderTagline.jsx";

/* Hook mínimo: ¿estamos en desktop (>1100px)?
   Decide qué menú renderiza la hamburguesa:
   - Desktop → DesktopMenu (panel que cae desde la píldora,
     dropdowns como flyouts laterales)
   - ≤1100px → MobileMenu (el drawer de siempre) */
function useIsDesktop(onBreakpointChange) {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia("(min-width: 1101px)").matches
  );

  const onChangeRef = useRef(onBreakpointChange);
  useEffect(() => {
    onChangeRef.current = onBreakpointChange;
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1101px)");
    const handleChange = (e) => {
      setIsDesktop(e.matches);
      onChangeRef.current?.(e.matches);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}

/* hideNav: oculta la píldora mientras se muestra un skeleton
   de página (App.jsx la controla vía la fase "transitioning").
   Default false: si nadie la pasa, el header se comporta
   exactamente igual que antes. */
/* Ya no hay prop `tagline`: el rótulo lo decide la ruta, no
   quien monta el header (ver rutasNombres.js). Nadie se lo
   pasaba, así que quitarla no rompe ninguna llamada. */
function Header({ introDone = true, hideNav = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDesktop = useIsDesktop(() => setIsMenuOpen(false));

  return (
    <header
      className={`header ${introDone ? "header--enter" : ""} ${
        isMenuOpen ? "is-open" : ""
      } ${hideNav ? "header--hidden" : ""}`}
    >
      <div className="header__container">
        {/* el resplandor de debajo: un halo difuso, no una línea
            (ver Header.css) */}
        <span className="header__resplandor" aria-hidden="true" />

        {/* Logo */}
        <NavLink to="/" end className="header__logo">
          Logo
        </NavLink>

        {/* Texto central — centrado absoluto respecto a la píldora,
            independiente del ancho del logo y de la hamburguesa */}
        {/* el rótulo se teclea al cambiar de ruta; el diseño
            del span es el mismo, solo cambia quién lo pinta */}
        <HeaderTagline introDone={introDone} />

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
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
}

export default Header;