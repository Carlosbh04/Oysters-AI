import { Brain, FileText, UserRound, TrendingUp, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import aiFirst from "../../assets/useCases/ai-first.webp";
import Rotulo from "../rotulo/Rotulo";
import "./UseCases.css";

/* ============================================================
   CASOS DE USO

   Dos mitades: a la izquierda el enunciado —rótulo, titular,
   entradilla, la pieza de AI FIRST y la salida a contacto—, y a
   la derecha las cuatro capacidades en rejilla de dos por dos.

   ---- EL CONTENIDO VIVE AQUÍ Y NO EN data/ ----
   Los cuatro bloques son el discurso de la agencia, no datos de
   catálogo: no crecen, no se filtran y no vienen de ningún sitio.
   Sacarlos a un archivo de datos añadiría un salto de lectura sin
   ganar nada; el día que haya que editarlos, se editan donde se
   ven.
   ============================================================ */

const CAPACIDADES = [
  {
    icono: Brain,
    titulo: "Inteligencia",
    puntos: [
      "Escucha Digital",
      "Insights de Consumidor",
      "Buyer Personas",
      "Brand Bulls Eye",
      "Customer Journeys",
      "Storytelling",
    ],
  },
  {
    icono: FileText,
    titulo: "Contenido",
    puntos: [
      "Desarrollo de Campañas Creatividad",
      "Diseño Packaging, Señalética, OOH",
      "Banco de Imagen",
      "Avatares Virtuales",
      "Branding / Alineamiento de Marca",
      "Brand Book",
    ],
  },
  {
    icono: UserRound,
    titulo: "Personalización",
    puntos: [
      "Estrategia Social",
      "Community Management",
      "Fidelización",
      "Test Creativo",
      "Automatización",
    ],
  },
  {
    icono: TrendingUp,
    titulo: "Orquestación",
    puntos: [
      "Optimización Media",
      "Optimización Visual SEO",
      "Social Shopping",
      "Eventos",
    ],
  },
];

/* `dentro` viene del contenedor de la sección: es el mismo
   disparo que enciende el fondo, para que las tres fases de la
   entrada cuenten desde el mismo instante. Ver Home.jsx. */
function UseCases({ dentro = false }) {
  return (
    <section
      className={`uc ${dentro ? "uc--dentro" : ""}`}
      aria-labelledby="uc-titulo"
    >
      <div className="uc__rejilla">
        <div className="uc__enunciado">
          {/* El filete va DELANTE del texto y es la misma figura
              que abre cada tarjeta —el número con su raya—. Repetir
              ese gesto aquí ata las dos mitades de la sección: se
              lee como un sistema y no como dos bloques juntos. */}
          <Rotulo className="uc__rotulo">Casos de uso</Rotulo>

          <h2 id="uc-titulo" className="uc__titulo">
            AI-Human en acción:
            <span> casos de uso</span>
          </h2>

          <p className="uc__entradilla">
            Descubre cómo aplicamos Inteligencia Artificial para generar
            impacto real en negocios de diferentes industrias.
          </p>

          {/* ---- LA PIEZA DE AI FIRST ----
              Decorativa: el mensaje que lleva escrito ya está en el
              titular de al lado, así que repetirlo al lector de
              pantalla sería ruido. De ahí el alt vacío y el
              aria-hidden.

              `width`/`height` van declarados aunque el CSS los
              recalcule: reservan el hueco antes de que la imagen
              llegue y evitan que el botón de contacto salte al
              cargar. */}
          <img
            className="uc__pieza"
            src={aiFirst}
            alt=""
            aria-hidden="true"
            width={900}
            height={675}
            loading="lazy"
            decoding="async"
          />

          <Link to="/contact" className="uc__cta">
            Contactar
            <ArrowRight strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>

        <ul className="uc__tarjetas">
          {CAPACIDADES.map(({ icono: Icono, titulo, puntos }, i) => (
            /* --i alimenta el escalonado de la entrada: cada
               tarjeta entra un paso después que la anterior */
            <li key={titulo} className="uc__tarjeta" style={{ "--i": i }}>
              {/* El número y su filete: el filete se estira con
                  `flex` para llegar siempre al borde de la tarjeta,
                  midan lo que midan los dos dígitos. */}
              <div className="uc__numero">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <i aria-hidden="true" />
              </div>

              <div className="uc__cabeza">
                <span className="uc__icono" aria-hidden="true">
                  <Icono strokeWidth={1.6} />
                </span>
                <h3>{titulo}</h3>
              </div>

              <ul className="uc__puntos">
                {puntos.map((p) => (
                  <li key={p}>
                    <ChevronRight strokeWidth={2.4} aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default UseCases;
