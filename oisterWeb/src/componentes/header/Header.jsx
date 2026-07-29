import "./Header.css";
import { NavLink } from "react-router-dom";
import Dropdown from "../dropdown/Dropdown.jsx";
import { useState } from "react";
import HamburgerButton from "../hamburger/HamburgerButton.jsx";
import MobileMenu from "../mobileMenu/MobileMenu.jsx";

function Header({ introDone = true }) {
  const linkClass = ({ isActive }) =>
    isActive ? "header__link header__link--active" : "header__link";

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        {/* Navegación */}
        <nav className="header__nav">
          <ul className="header__menu">
            {/* Nosotros */}
            <li className="header__item">
              <NavLink to="/about" className={linkClass}>
                Nosotros
                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </NavLink>
            </li>

            {/* Qué hacemos */}
            <li className="header__item">
              <NavLink to="/services" className={linkClass}>
                Qué hacemos
                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </NavLink>
            </li>

            {/* Cómo lo hacemos */}
            <li className="header__item">
              <Dropdown menu="methodology" />
            </li>

            {/* Casos de uso */}
            <li className="header__item">
              <NavLink to="/use-cases" className={linkClass}>
                Casos de uso
                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </NavLink>
            </li>

            {/* Trabajos */}
            <li className="header__item">
              <NavLink to="/works" className={linkClass}>
                Trabajos
                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </NavLink>
            </li>

            {/* Recursos */}
            <li className="header__item">
              <Dropdown menu="resources" />
            </li>
          </ul>
        </nav>

        {/* Acciones */}
        <div className="header__actions">
          <button type="button" className="header__language">
            ES
          </button>

          <NavLink to="/contact" className="header__cta">
            Hablemos
            <span className="header__sparkles">
              <span className="spark sparkle-1"></span>
              <span className="spark sparkle-2"></span>
              <span className="spark sparkle-3"></span>
            </span>
          </NavLink>
        </div>

        <HamburgerButton
          isOpen={isMenuOpen}
          onToggle={() => setIsMenuOpen(!isMenuOpen)}
        />
      </div>

      {/* FUERA de .header__container: la animación de entrada
          deja transform+filter en el container (por el forwards),
          y eso convierte al container en contenedor de referencia
          de cualquier position:fixed descendiente → el drawer se
          descolocaba. Como hermano del container, el fixed vuelve
          a referirse al viewport y el drawer funciona normal. */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  );
}

export default Header;