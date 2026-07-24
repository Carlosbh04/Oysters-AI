import "./Header.css";
import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="header__container">

        {/* Logo */}
        <NavLink to="/" className="header__logo">
          Logo
        </NavLink>

        {/* Navegación */}
        <nav className="header__nav">
          <ul className="header__menu">

            {/* Dropdown */}
            <li className="header__item">
              <button className="header__link">
                Nosotros

                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </button>
            </li>

            {/* Dropdown */}
            <li className="header__item">
              <button className="header__link">
                Qué hacemos

                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </button>
            </li>

            {/* Dropdown */}
            <li className="header__item">
              <button className="header__link">
                Cómo lo hacemos

                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </button>
            </li>

            {/* Dropdown */}
            <li className="header__item">
              <button className="header__link">
                Casos de uso

                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </button>
            </li>

            {/* Ruta */}
            <li className="header__item">
              <NavLink to="/works" className="header__link">
                Trabajos

                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </NavLink>
            </li>

            {/* Ruta */}
            <li className="header__item">
              <NavLink to="/resources" className="header__link">
                Recursos

                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </NavLink>
            </li>

            {/* Ruta */}
            <li className="header__item">
              <NavLink to="/contact" className="header__link">
                Contacto

                <span className="header__sparkles">
                  <span className="spark sparkle-1"></span>
                  <span className="spark sparkle-2"></span>
                  <span className="spark sparkle-3"></span>
                </span>
              </NavLink>
            </li>

          </ul>
        </nav>

        {/* Acciones */}
        <div className="header__actions">

          <button className="header__language">
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

      </div>
    </header>
  );
}

export default Header;