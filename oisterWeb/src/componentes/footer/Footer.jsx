import { Link, NavLink } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  FileText,
  Home,
  Mail,
} from "lucide-react";
/* fa y no fa6: es el paquete que ya usan TeamCard y Contact, y
   mezclar dos versiones del mismo set trae dos trazos distintos
   para el mismo logotipo */
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

import useEnPantalla from "../../hooks/useEnPantalla";
import FondoNuevo from "../fondoNuevo/FondoNuevo";
import PieDesplegable from "./PieDesplegable";
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

/* Una entrada con `hijos` no lleva a ninguna parte: abre un
   panel con ellos (ver PieDesplegable). El resto son enlaces
   normales.

   ---- LOS DESTINOS SALEN DEL MENÚ DE ESCRITORIO, NO DE
   data/dropdown.js ----
   Ese archivo tiene el mismo apartado "Recursos" y sería lo
   inmediato para no repetir la lista, pero manda a "Entrenamiento
   IA Generativa" a /training, que NO existe como ruta en
   App.jsx: el enlace acabaría en la página de "no encontrado".
   DesktopMenu resuelve lo mismo apuntando a /resources, que sí
   existe, y es lo que se copia aquí para que el pie y el menú
   digan lo mismo. Si algún día se crea /training, los tres sitios
   se unifican. */
const NAVEGACION = [
  { icono: Home, label: "Inicio", to: "/" },
  { icono: Briefcase, label: "Trabajos", to: "/works" },
  {
    icono: FileText,
    label: "Recursos",
    hijos: [
      { label: "Gen AI Training", to: "/resources" },
      { label: "Blog", to: "/blog" },
    ],
  },
  { icono: BookOpen, label: "Blog", to: "/blog" },
  { icono: Mail, label: "Contacto", to: "/contact" },
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

        <div className="pie__cuerpo">
          {/* ---- MARCA ---- */}
          <div className="pie__marca">
            <img
              className="pie__logo"
              src={logo}
              alt="Oysters AI"
              width={300}
              height={284}
              loading="lazy"
              decoding="async"
            />

            <p className="pie__reclamo">
              Inteligencia artificial que transforma{" "}
              <span>ideas</span> en <span>resultados</span>.
            </p>
          </div>

          {/* ---- NAVEGACIÓN ----
              En fila y con el icono ENCIMA del rótulo, no en lista
              vertical. Sin cabecera de columna: en horizontal, un
              "Navegación" encima no encabeza nada, solo añade una
              línea de texto a una banda que se quiere baja.

              NavLink y no Link: trae la clase de activo puesta, que
              es lo que enciende el subrayado del apartado en el que
              estás. `end` en Inicio para que "/" no salga activo en
              todas las rutas — sin él, cualquier ruta empieza por
              "/" y coincidiría siempre. */}
          <nav className="pie__nav" aria-label="Enlaces del pie">
            <ul className="pie__enlaces">
              {NAVEGACION.map(({ icono: Icono, label, to, hijos }, i) => (
                /* la clave es `to` cuando lo hay y el rótulo cuando
                   no: las entradas desplegables no tienen destino */
                <li key={to ?? label} style={{ "--i": i }}>
                  {hijos ? (
                    <PieDesplegable icono={Icono} label={label} items={hijos} />
                  ) : (
                    <NavLink to={to} end={to === "/"} className="pie-enlace">
                      <Icono
                        className="pie-enlace__icono"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                      <span className="pie-enlace__texto">{label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* ---- REDES + CONTACTO ---- */}
          <div className="pie__social">
            <div className="pie__redes-bloque">
              {/* rótulo en texto plano y no con <Rotulo>: aquel
                  trae versalitas anchas, filete y halo, calibrado
                  para encabezar una sección entera. Aquí es una
                  etiqueta de dos palabras sobre dos botones. */}
              <p className="pie__social-titulo" id="pie-redes">
                Síguenos
              </p>

              <ul className="pie__redes" aria-labelledby="pie-redes">
                {REDES.map(({ icono: Icono, label, href, clase }, i) => (
                  <li key={label} style={{ "--i": i }}>
                    <a
                      className={`pie-red ${clase}`}
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      /* el nombre de la red se va del marcado
                         visible —ahora es solo el círculo— pero
                         tiene que seguir estando para quien navega
                         a oído */
                      aria-label={label}
                    >
                      <Icono aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

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
