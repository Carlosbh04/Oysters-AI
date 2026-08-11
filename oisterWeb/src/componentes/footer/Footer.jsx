import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  FileText,
  Home,
  Mail,
  Send,
  Users,
} from "lucide-react";
/* fa y no fa6: es el paquete que ya usan TeamCard y Contact, y
   mezclar dos versiones del mismo set trae dos trazos distintos
   para el mismo logotipo */
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

import useEnPantalla from "../../hooks/useEnPantalla";
import Rotulo from "../rotulo/Rotulo";
import Crystal from "../heroBackground/Crystal";
import FooterBackground from "./FooterBackground";
import logo from "../../assets/hero/oysters-3d.webp";
/* cristal-1 y no otro: los cuatro renders son el mismo octaedro
   en ángulos distintos, y este es el único con el eje VERTICAL.
   Los demás vienen volcados, y una piedra inclinada no se lee
   posada sobre su huella, se lee cayéndose. */
import cristal from "../../assets/hero/cristal-1.webp";
import "./Footer.css";

/* ============================================================
   PIE

   Una tarjeta flotando sobre la escena nocturna
   (FooterBackground), con tres columnas y una barra legal
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

const NAVEGACION = [
  { icono: Home, label: "Inicio", to: "/" },
  { icono: Briefcase, label: "Trabajos", to: "/works" },
  { icono: FileText, label: "Recursos", to: "/resources" },
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

/* Las barritas de al lado del cristal. Van en un array y no
   escritas a mano porque lo único que las distingue es la altura
   y el lado; con doce <span> en el JSX, cambiar el ritmo obliga a
   editar doce líneas. */
const BARRAS_IZQ = [22, 46, 30, 62, 38];
const BARRAS_DER = [34, 58, 26, 70, 44, 30];

function Footer() {
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
      <FooterBackground />

      <div className="pie__tarjeta">
        {/* El filo de luz de arriba. Es el gesto que hace que la
            tarjeta parezca posada sobre la escena y no recortada
            contra ella: un borde uniforme la deja plana, y un
            filo que se enciende solo en el centro sugiere que hay
            una fuente por encima. */}
        <span className="pie__filo" aria-hidden="true" />

        <div className="pie__cuerpo">
          {/* ---- COLUMNA 1 · MARCA ---- */}
          <div className="pie__marca">
            <img
              className="pie__logo"
              src={logo}
              alt="Oysters"
              width={900}
              height={756}
              loading="lazy"
              decoding="async"
            />

            <p className="pie__reclamo">
              Inteligencia artificial que transforma{" "}
              <span>ideas</span> en <span>resultados</span>.
            </p>

            <Link to="/contact" className="pie__cta">
              <Send strokeWidth={1.8} aria-hidden="true" />
              <span>Contactar</span>
              <ArrowRight
                className="pie__cta-flecha"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* ---- COLUMNA 2 · NAVEGACIÓN ---- */}
          <nav className="pie__col" aria-labelledby="pie-nav">
            <Rotulo className="pie__titulo" icono={BarChart3}>
              <span id="pie-nav">Navegación</span>
            </Rotulo>

            <ul className="pie__enlaces">
              {NAVEGACION.map(({ icono: Icono, label, to }, i) => (
                <li key={to} style={{ "--i": i }}>
                  <Link to={to} className="pie-enlace">
                    <Icono
                      className="pie-enlace__icono"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    <span className="pie-enlace__texto">{label}</span>
                    <ArrowRight
                      className="pie-enlace__flecha"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---- COLUMNA 3 · REDES ---- */}
          <div className="pie__col" aria-labelledby="pie-redes">
            <Rotulo className="pie__titulo" icono={Users}>
              <span id="pie-redes">Síguenos</span>
            </Rotulo>

            <ul className="pie__redes">
              {REDES.map(({ icono: Icono, label, href, clase }, i) => (
                <li key={label} style={{ "--i": i }}>
                  <a
                    className={`pie-red ${clase}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span className="pie-red__marca" aria-hidden="true">
                      <Icono />
                    </span>
                    <span className="pie-red__texto">{label}</span>
                    <ArrowRight
                      className="pie-red__flecha"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>

            {/* ---- LA PIEZA ----
                El mismo octaedro de las otras secciones, posado
                sobre su huella de luz. Es lo que impide que esta
                columna se quede corta: las otras dos llenan su
                alto con contenido y esta solo tiene dos botones.

                Decorativa del todo, así que aria-hidden y sin
                texto: no aporta nada que leer. */}
            <div className="pie__pieza" aria-hidden="true">
              <span className="pie__barras pie__barras--izq">
                {BARRAS_IZQ.map((h, i) => (
                  <i key={i} style={{ "--h": `${h}%` }} />
                ))}
              </span>

              {/* los anillos van ANTES en el marcado, no detrás
                  con z-index negativo: un z-index negativo dentro
                  de una caja que no crea contexto de apilamiento
                  se escapa hacia atrás y puede acabar por debajo
                  de la propia tarjeta. Con el orden del DOM basta
                  y no hay nada que se pueda escapar. */}
              <span className="pie__gema">
                <span className="pie__anillos">
                  <i style={{ "--r": 0 }} />
                  <i style={{ "--r": 1 }} />
                  <i style={{ "--r": 2 }} />
                </span>
                <Crystal src={cristal} niebla={0.18} />
              </span>

              <span className="pie__barras pie__barras--der">
                {BARRAS_DER.map((h, i) => (
                  <i key={i} style={{ "--h": `${h}%` }} />
                ))}
              </span>
            </div>
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
