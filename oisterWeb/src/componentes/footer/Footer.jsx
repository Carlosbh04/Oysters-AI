import { Link, NavLink } from "react-router-dom";
/* solo la flecha del CTA: los iconos de navegación se fueron con
   la fila de enlaces con icono encima. En un sitemap de columnas
   un icono por enlace es ruido — la cabecera de columna ya dice
   de qué va la lista. */
import { ArrowRight } from "lucide-react";
/* fa y no fa6: es el paquete que ya usan TeamCard y Contact, y
   mezclar dos versiones del mismo set trae dos trazos distintos
   para el mismo logotipo */
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

import useEnPantalla from "../../hooks/useEnPantalla";
import FondoNuevo from "../fondoNuevo/FondoNuevo";
/* ---- EL LOGO DEL PIE VA APARTE ----
   Antes salía de assets/hero/oysters-3d.webp, el render maestro
   del logotipo 3D, del que además se deriva la máscara
   oysters-3d-texto.png (ver herramientas/mascara-logo.py).
   Sustituir ese archivo para cambiar el pie habría tocado también
   lo demás, así que el render nuevo entra como asset propio.

   ⚠️ El logotipo es SOLO esta imagen. El lockup ("OYSTERS AI")
   viene dentro del render, así que no se escribe al lado como
   texto: saldría dos veces, y la segunda con otra tipografía. */
import logo from "../../assets/logo/oysters-ai.webp";
import "./Footer.css";

/* ============================================================
   PIE

   Una tarjeta flotando sobre la escena nocturna
   propio, con tres columnas y una barra legal
   debajo.

   ---- POR QUÉ EL FONDO VIVE DENTRO Y NO FUERA ----
   Al revés que "Casos de uso", donde la escena y el contenido
   son dos componentes hermanos que monta la página. Allí tenía
   sentido: son dos piezas grandes con una entrada escalonada que
   había que coordinar desde arriba.

   Aquí no. El pie va a ir en todas las páginas y siempre con su
   escena: obligar a cada sitio a montar dos componentes en el
   orden correcto es repartir una responsabilidad que solo tiene
   una respuesta posible. Se monta <Footer /> y ya está.
   ============================================================ */

/* ---- EL SITEMAP DEL PIE ----
   SOLO rutas que existen de verdad en App.jsx: /, /works,
   /services, /contact, /resources y /blog.

   No hay enlaces a secciones de la portada (#nosotros,
   #que-hacemos, #proyectos) aunque esos anclajes existan en el
   marcado: ScrollToTop hace `scrollTo(0, 0)` en cada cambio de
   ruta y no mira el hash, así que un "/#nosotros" llevaría a la
   portada y se quedaría arriba — un enlace que miente. Para que
   funcionaran hay que enseñarle el hash a ScrollToTop primero.

   Se fueron los iconos por enlace que traía la fila anterior: en
   un sitemap de columnas, la cabecera ya dice de qué va la lista
   y un icono por fila es ruido. */
const SITEMAP = [
  {
    titulo: "Navegación",
    enlaces: [
      { label: "Inicio", to: "/", exacto: true },
      { label: "Trabajos", to: "/works" },
      { label: "Cómo lo hacemos", to: "/services" },
      { label: "Contacto", to: "/contact" },
    ],
  },
  {
    titulo: "Recursos",
    enlaces: [
      { label: "Gen AI Training", to: "/resources" },
      { label: "Blog", to: "/blog" },
    ],
  },
];

/* ⚠️ URLS DE MARCADOR — Instagram y LinkedIn apuntan a los
   perfiles genéricos porque no consta ninguno de la agencia en
   el proyecto. Sustituir antes de publicar; es lo mismo que
   queda pendiente en data/about.js con los del equipo. */
const REDES = [
  {
    icono: FaInstagram,
    label: "Instagram",
    href: "https://www.instagram.com/",
    clase: "pie-red--ig",
  },
  {
    icono: FaLinkedinIn,
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    clase: "pie-red--in",
  },
];

function Footer({ conEscena = false }) {
  /* ---- EL DISPARO VIVE AQUÍ, NO EN LA PÁGINA ----
     Al revés que en "Casos de uso", donde la escena y el
     contenido son componentes hermanos y hacía falta que alguien
     de arriba los sincronizara. Aquí el pie ya contiene su propia
     escena, así que no hay nada que coordinar con nadie: se monta
     <Footer /> y trae su entrada puesta.

     El margen negativo lo retrasa hasta que el pie está de
     verdad asomando. Sin él dispararía al entrar el primer píxel
     y la cascada acabaría antes de que nadie la mire — es lo que
     pasó con casos de uso y costó dos correcciones. */
  const [pieRef, dentro] = useEnPantalla({ margen: "0px 0px -14% 0px" });

  return (
    <footer className={`pie ${dentro ? "pie--dentro" : ""}`} ref={pieRef}>
      {/* ---- EL FONDO ES EL DE LA PÁGINA, NO UNO PROPIO ----
          El pie ya no monta su escena nocturna (la sala con la
          rejilla en perspectiva). Se leía como un escenario
          APARTE pegado al final, de otro mundo visual que el
          resto de la página.

          Ahora sigue a la página, y son dos casos:

          · Páginas CON escena (Home, /services): montan
            <FondoNuevo> en todas sus secciones, así que el pie
            monta LA MISMA y se une a la última con la misma onda
            que junta unas secciones con otras. No vale un color
            plano: la escena está animada —su degradado gira— y
            cualquier color fijo enseña una banda dura en la junta
            en algún punto del giro.

          · El resto: el pie va transparente (--pie-fondo, en
            Footer.css) y deja pasar lo que ya hubiera detrás — el
            degradado del body, o una escena `fixed` como la del
            detalle de proyecto.

          `enPausa` colgado de `dentro`: la llegada de la escena
          se dispara al alcanzar el pie scrolleando, no al cargar
          la página con el pie a varias pantallas de distancia. */}
      {conEscena && (
        <FondoNuevo className="pie__fondo fn--onda-arriba" enPausa={!dentro} />
      )}

      <div className="pie__tarjeta">
        {/* El filo de luz de arriba. Es el gesto que hace que la
            tarjeta parezca posada sobre la escena y no recortada
            contra ella: un borde uniforme la deja plana, y un
            filo que se enciende solo en el centro sugiere que hay
            una fuente por encima. */}
        <span className="pie__filo" aria-hidden="true" />

        {/* ============================================================
            DOS PANELES A SANGRE

            El pie se parte en dos mitades que llegan hasta el borde
            de la tarjeta: a la izquierda la MARCA sobre un
            degradado de acento, a la derecha los ENLACES sobre el
            oscuro de siempre.

            El motivo no es decorativo. El logotipo es un render 3D
            con alfa y luz propia, y hasta ahora flotaba sobre el
            mismo cristal que el texto: sin fondo pensado para él,
            su volumen no se leía. Aquí tiene el suyo.

            Y de paso resuelve lo que estaba medido: la banda de
            tres columnas dejaba 670px para cuatro enlaces que
            ocupaban 400. El contraste entre paneles hace ahora el
            trabajo que hacían los filetes, y el ancho se llena con
            navegación en vez de con aire.
            ============================================================ */}
        <div className="pie__split">
          {/* ---- PANEL DE ACENTO: LA MARCA ---- */}
          <div className="pie__panel">
            <img
              className="pie__logo"
              src={logo}
              alt="Oysters AI"
              width={300}
              height={284}
              loading="lazy"
              decoding="async"
            />

            <div className="pie__panel-pie">
              <p className="pie__llamada">
                ¿Ponemos la IA a trabajar en <span>tu marca</span>?
              </p>

              <Link to="/contact" className="pie__cta">
                <span>Contactar</span>
                <ArrowRight
                  className="pie__cta-flecha"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* ---- PANEL OSCURO: LOS ENLACES ---- */}
          <div className="pie__lado">
            <nav className="pie__cols" aria-label="Enlaces del pie">
              {SITEMAP.map(({ titulo, enlaces }) => (
                <div className="pie__col" key={titulo}>
                  <h3 className="pie__col-titulo">{titulo}</h3>
                  <ul>
                    {enlaces.map(({ label, to, exacto }) => (
                      <li key={to}>
                        {/* NavLink y no Link: trae puesta la clase de
                            activo, que es lo que marca en qué apartado
                            estás. `end` en Inicio porque si no, "/"
                            coincide con cualquier ruta. */}
                        <NavLink to={to} end={exacto} className="pie-enlace">
                          {label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* las redes, como una columna más: en una rejilla de
                  sitemap dos círculos sueltos piden cabecera igual
                  que las otras listas */}
              <div className="pie__col">
                <h3 className="pie__col-titulo">Síguenos</h3>
                <ul>
                  {/* sin la clase de marca (pie-red--ig / --in): esa
                      pintaba el disco de Instagram o LinkedIn a todo
                      color, y aquí no hay disco — es una fila de
                      lista como las de al lado. Con ella puesta, el
                      enlace entero salía con el degradado de fondo. */}
                  {REDES.map(({ icono: Icono, label, href }) => (
                    <li key={label}>
                      <a
                        className="pie-enlace pie-enlace--red"
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <Icono aria-hidden="true" />
                        <span>{label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>

        {/* ---- BARRA LEGAL ---- */}
        <div className="pie__legal">
          <span className="pie__filo pie__filo--legal" aria-hidden="true" />

          <p className="pie__copy">© 2026 Oysters AI</p>

          {/* el destello del centro: el mismo gesto que el filo de
              arriba, reducido a un punto. Marca el eje de la barra
              y evita que los dos extremos se lean como dos cosas
              sueltas */}
          <svg className="pie__estrella" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z"
              fill="currentColor"
            />
          </svg>

          {/* ⚠️ /privacidad y /aviso-legal todavía no existen como
              rutas: hoy caen en la página de "no encontrado". */}
          <nav className="pie__legales">
            <Link to="/privacidad">Privacidad</Link>
            <span aria-hidden="true">|</span>
            <Link to="/aviso-legal">Aviso legal</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
