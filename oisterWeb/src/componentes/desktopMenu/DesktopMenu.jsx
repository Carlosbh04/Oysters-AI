import "./DesktopMenu.css";
import { NavLink } from "react-router-dom";
import useIrASeccion from "../../hooks/useIrASeccion";
import { useEffect, useState } from "react";
import { ChevronRight, ArrowUpRight } from "lucide-react";
/* Con react-icons: FiChevronRight / FiArrowUpRight de "react-icons/fi" */

/* `seccion` marca las entradas que no son páginas sino anclas de
   la portada. Iban a /about y /services, que no existen como
   rutas: las dos acababan en la página de "no encontrado". */
const NAV_ITEMS = [
  { label: "Nosotros", to: "/#nosotros", seccion: "nosotros" },
  { label: "Qué hacemos", to: "/#que-hacemos", seccion: "que-hacemos" },
  {
    label: "Cómo lo hacemos",
    children: [
      { label: "Aprendizaje impulsado por IA", to: "/services/aprendizaje-ia" },
      /* Los cuatro tienen ya su página. Los tres de abajo montan
         de momento solo el fondo compartido y un marcador: el
         contenido llega después. */
      { label: "Contenido impulsado por IA", to: "/services/contenido-ia" },
      { label: "Personalización impulsada por IA", to: "/services/personalizacion-ia" },
      { label: "Orquestación impulsada por IA", to: "/services/orquestacion-ia" },
    ],
  },
  /* Ancla de la portada, no página propia: iba a /use-cases, que
     no existe como ruta y caía en "no encontrado". `seccion`
     activa el scroll suave, igual que "Nosotros" y "Qué
     hacemos" — ver useIrASeccion. */
  { label: "Casos de uso", to: "/#casos-de-uso", seccion: "casos-de-uso" },

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
  const irASeccion = useIrASeccion();

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const closeMenu = () => {
    setOpenSubmenu(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenSubmenu(null);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* ---- CERRADO NO PUEDE HABER SUBMENÚ ABIERTO ----
     `closeMenu` reinicia openSubmenu, pero solo lo llaman el
     overlay, Escape y los propios enlaces. La HAMBURGUESA no:
     el Header cambia isMenuOpen por su cuenta. Resultado
     reproducible: despliegas "Cómo lo hacemos", cierras con la
     hamburguesa, vuelves a abrir y el acordeón sigue abierto.

     Se ajusta aquí, en el render, y no en un efecto: es el caso
     que React documenta para corregir estado cuando cambia una
     prop, y evita el re-render en cascada que provoca un
     setState dentro de useEffect. La guarda impide el bucle.

     Y se pone en el propio componente y no en el Header porque
     openSubmenu es suyo: cualquier otra forma de cerrar que se
     añada mañana queda cubierta sin acordarse de nada. */
  if (!isOpen) {
    if (openSubmenu !== null) setOpenSubmenu(null);
    return null;
  }

  return (
    <>
      <div className="desktop-menu__overlay" onClick={closeMenu} />

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
                          onClick={closeMenu}
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
                  onClickCapture={item.seccion ? irASeccion(item.seccion) : undefined}
                  className="desktop-menu__row"
                  onClick={closeMenu}
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

          <NavLink to="/contact" className="desktop-menu__cta" onClick={closeMenu}>
            Hablemos
          </NavLink>
        </div>
      </nav>
    </>
  );
}

export default DesktopMenu;