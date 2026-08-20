import "./Header.css";
import { NavLink, useLocation} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import HamburgerButton from "../hamburger/HamburgerButton.jsx";
import MobileMenu from "../mobileMenu/MobileMenu.jsx";
import DesktopMenu from "../desktopMenu/DesktopMenu.jsx";
import HeaderTagline from "./HeaderTagline.jsx";
/* el mismo archivo que usa el pie: un solo logotipo para todo el
   sitio (ver el comentario del <img> más abajo) */
import logo from "../../assets/logo/oysters-ai.webp";
import SeccionEnCurso from "./SeccionEnCurso";

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

  /* ============================================================
     EN UN ARTÍCULO, LA CABECERA SE METE DENTRO

     Leyendo una entrada del blog, al bajar la píldora deja de
     flotar: pierde márgenes, esquinas y sombra, cambia su rosa por
     el morado de la página y se pega al borde. Se retiran el logo
     y la hamburguesa, y en su sitio queda «Blog │ el titular» —
     eso lo pinta SeccionEnCurso. Al subir se vuelve a montar.

     Deja de leerse como algo ENCIMA de la página y pasa a ser
     parte de ella, que es lo que le da sitio al titular.

     ---- LOS DOS UMBRALES NO SON EL MISMO ----
     Se mete a los 96px y se deshace a los 56. Con un único número,
     un scroll parado justo encima haría PARPADEAR la cabecera
     entre sus dos formas a cada temblor del dedo. Separándolos hay
     que volver un trecho para deshacer el cambio.

     ---- Y SOLO AQUÍ ----
     Solo en la mano y solo en la ficha de un artículo: es el único
     sitio donde hay un titular que merezca la barra, y el único
     donde se lee de corrido lo bastante como para que estorbe una
     cabecera flotando. */
  const { pathname } = useLocation();

  const enArticulo = /^\/blog\/[^/]+$/.test(pathname) &&
    !pathname.startsWith("/blog/page/");

  const [leyendo, setLeyendo] = useState(false);

  useEffect(() => {
    /* no se apaga el estado aquí con un setState: el efecto se
       limita a escuchar, y de que la clase NO salga fuera de un
       artículo se encarga el propio render (ver la clase abajo).
       Tocar el estado en el cuerpo del efecto encadena renders. */
    if (isDesktop || !enArticulo) return undefined;

    const ENTRA = 96;
    const SALE = 56;

    let pedido = null;

    const mirar = () => {
      pedido = null;
      const y = window.scrollY;
      setLeyendo((previo) => (y > ENTRA ? true : y < SALE ? false : previo));
    };

    const alMover = () => {
      if (pedido === null) pedido = requestAnimationFrame(mirar);
    };

    /* la primera medida también va en un fotograma: llamarla aquí
       sería un setState síncrono dentro del efecto */
    pedido = requestAnimationFrame(mirar);
    window.addEventListener("scroll", alMover, { passive: true });

    return () => {
      window.removeEventListener("scroll", alMover);
      if (pedido !== null) cancelAnimationFrame(pedido);
    };
  }, [isDesktop, enArticulo]);

  return (
    <header
      className={`header ${introDone ? "header--enter" : ""} ${
        isMenuOpen ? "is-open" : ""
      } ${hideNav ? "header--hidden" : ""} ${
        leyendo && enArticulo && !isDesktop && !isMenuOpen
          ? "header--lectura"
          : ""
      }`}
    >
      <div className="header__container">
        {/* el resplandor de debajo: un halo difuso, no una línea
            (ver Header.css) */}
        <span className="header__resplandor" aria-hidden="true" />

        {/* ---- EL LOGO ----
            Es el MISMO render que el pie (assets/logo/oysters-ai.webp),
            no una versión aparte: si algún día se cambia el logotipo,
            se cambia en un sitio y aparece en los dos.

            Va como <img> con su alt y no como texto: el lettering
            "OYSTERS" viene DENTRO del render, así que escribirlo al
            lado lo diría dos veces y con otra tipografía. El alt es
            lo que lo deja legible para un lector de pantalla.

            width/height explícitos —los del archivo— para que el
            navegador reserve el hueco antes de descargarlo y la
            píldora no dé un salto al llegar la imagen. */}
        <NavLink to="/" end className="header__logo" aria-label="Oysters AI, ir al inicio">
          <img
            className="header__logo-img"
            src={logo}
            alt="Oysters AI"
            width={300}
            height={284}
            /* el logo entra en el primer pintado de CUALQUIER ruta:
               nada de lazy, que solo retrasaría lo que se ve antes */
            decoding="async"
          />
        </NavLink>

        {/* Texto central — centrado absoluto respecto a la píldora,
            independiente del ancho del logo y de la hamburguesa */}
        {/* ---- QUIÉN OCUPA EL CENTRO, SEGÚN EL ANCHO ----
            En escritorio, el rótulo tecleado de siempre. En la
            mano, la sección en curso: ahí el tecleado estaba
            OCULTO por debajo de 420px, así que el centro de la
            píldora —273px en un móvil de 390— no llevaba nada.

            Son excluyentes a propósito. Los dos van centrados en
            absoluto sobre la misma píldora: pintados a la vez se
            solaparían letra sobre letra. */}
        {isDesktop ? (
          <HeaderTagline introDone={introDone} />
        ) : (
          <SeccionEnCurso />
        )}

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