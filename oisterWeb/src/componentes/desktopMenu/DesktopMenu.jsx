import "./DesktopMenu.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronRight, ArrowUpRight } from "lucide-react";
/* Con react-icons: FiChevronRight / FiArrowUpRight de "react-icons/fi" */

const NAV_ITEMS = [
  { label: "Nosotros", to: "/about" },
  { label: "Qué hacemos", to: "/services" },
  {
    label: "Cómo lo hacemos",
    children: [
      { label: "Aprendizaje impulsado por IA", to: "/services#aprendizaje" },
      { label: "Contenido impulsado por IA", to: "/services#contenido" },
      { label: "Personalización impulsada por IA", to: "/services#personalizacion" },
      { label: "Orquestación impulsada por IA", to: "/services#orquestacion" },
    ],
  },
  { label: "Casos de uso", to: "/use-cases" },
  { label: "Trabajos", to: "/works" },
  {
    label: "Recursos",
    children: [
      { label: "Gen AI Training", to: "/resources" },
      { label: "Blog", to: "/blog" },
    ],
  },
];

/* número editorial 01, 02... en mono — conecta con el tagline */
const num = (i) => String(i + 1).padStart(2, "0");

function DesktopMenu({ isOpen, onClose }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    if (!isOpen) setOpenSubmenu(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="desktop-menu__overlay" onClick={onClose} />

      <nav className="desktop-menu" aria-label="Navegación principal">
        <ul className="desktop-menu__list">
          {NAV_ITEMS.map((item, i) =>
            item.children ? (
              /* ===== Item con acordeón ===== */
              <li
                key={item.label}
                className="desktop-menu__item desktop-menu__item--parent"
                style={{ "--i": i }}
              >
                <button
                  type="button"
                  className={`desktop-menu__row ${
                    openSubmenu === item.label ? "desktop-menu__row--open" : ""
                  }`}
                  aria-haspopup="true"
                  aria-expanded={openSubmenu === item.label}
                  onClick={() =>
                    setOpenSubmenu(
                      openSubmenu === item.label ? null : item.label
                    )
                  }
                >
                  <span className="desktop-menu__num" aria-hidden="true">
                    {num(i)}
                  </span>

                  <span className="desktop-menu__label">{item.label}</span>

                  <span className="desktop-menu__chevron" aria-hidden="true">
                    <ChevronRight size={16} strokeWidth={2.4} />
                  </span>
                </button>

                <div
                  className={`desktop-menu__submenu ${
                    openSubmenu === item.label
                      ? "desktop-menu__submenu--open"
                      : ""
                  }`}
                >
                  <ul className="desktop-menu__sublist">
                    {item.children.map((child, j) => (
                      <li key={child.to} style={{ "--j": j }}>
                        <NavLink
                          to={child.to}
                          className="desktop-menu__sublink"
                          onClick={onClose}
                          tabIndex={openSubmenu === item.label ? 0 : -1}
                        >
                          {child.label}
                          <span
                            className="desktop-menu__sublink-arrow"
                            aria-hidden="true"
                          >
                            <ArrowUpRight size={14} strokeWidth={2.4} />
                          </span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              /* ===== Item simple ===== */
              <li
                key={item.to}
                className="desktop-menu__item"
                style={{ "--i": i }}
              >
                <NavLink
                  to={item.to}
                  className="desktop-menu__row"
                  onClick={onClose}
                >
                  <span className="desktop-menu__num" aria-hidden="true">
                    {num(i)}
                  </span>

                  <span className="desktop-menu__label">{item.label}</span>

                  <span className="desktop-menu__go" aria-hidden="true">
                    <ArrowUpRight size={15} strokeWidth={2.4} />
                  </span>
                </NavLink>
              </li>
            )
          )}
        </ul>

        <div className="desktop-menu__footer">
          <button type="button" className="desktop-menu__language">
            ES
          </button>

          <NavLink to="/contact" className="desktop-menu__cta" onClick={onClose}>
            Hablemos
          </NavLink>
        </div>
      </nav>
    </>
  );
}

export default DesktopMenu;