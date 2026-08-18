import { useRef, useState } from "react";
import { Brain, FileText, UserRound, TrendingUp, ChevronRight } from "lucide-react";
import aiFirst from "../../assets/useCases/ai-first.webp";
import Rotulo from "../rotulo/Rotulo";
import TextoArena from "../textoArena/TextoArena";
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

/* `corto` es el rótulo del conmutador de móvil: cuatro segmentos
   en ~360px dan ~82px por cabeza, y "Personalización" no cabe ni
   en versalitas de 9px. El nombre completo viaja en aria-label y
   en la cabecera del panel, así que la abreviatura nunca es la
   única forma de leer la capacidad. */
const CAPACIDADES = [
  {
    icono: Brain,
    titulo: "Inteligencia",
    corto: "Intel.",
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
    corto: "Cont.",
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
    corto: "Pers.",
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
    corto: "Orq.",
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
  /* ---- EL CONMUTADOR DE MÓVIL (≤640px) ----
     Cuál de las cuatro capacidades está en el panel. Vive aquí y
     no en radios + :checked (que era como lo probaba la maqueta)
     porque en React el estado da gratis lo que a los radios hay
     que arrancarles: los atributos de tabs de verdad
     (aria-selected, tabindex rotatorio) y las flechas del teclado. */
  const [activa, setActiva] = useState(0);
  const refsTab = useRef([]);

  /* el patrón de tabs completo: flechas para moverse, Home/End
     a los extremos. El foco viaja con la selección. */
  const alTeclearTab = (e) => {
    const n = CAPACIDADES.length;
    let sig = null;
    if (e.key === "ArrowRight") sig = (activa + 1) % n;
    else if (e.key === "ArrowLeft") sig = (activa - 1 + n) % n;
    else if (e.key === "Home") sig = 0;
    else if (e.key === "End") sig = n - 1;
    if (sig === null) return;
    e.preventDefault();
    setActiva(sig);
    refsTab.current[sig]?.focus();
  };

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
          {/* ---- LA PORTADA (solo cuenta en móvil) ----
              Envuelve rótulo y titular para que en ≤640px los dos
              puedan colocarse SOBRE la pieza de AI FIRST, que pasa
              a ser la portada de la sección.

              En escritorio este div es `display: contents`: no
              genera caja, así que sus hijos siguen siendo hijos
              directos de la columna flex y el orden y la
              maquetación quedan EXACTAMENTE como estaban. Es la
              única forma de agrupar para móvil sin tocar el otro
              ancho — y por eso la pieza se queda fuera del
              envoltorio: en escritorio va después de la entradilla
              y meterla aquí la habría adelantado. En móvil las
              reúne la rejilla, que no depende del orden del DOM. */}
          <div className="uc__portada">
            <Rotulo className="uc__rotulo">Casos de uso</Rotulo>

            <TextoArena>
              <h2 id="uc-titulo" className="uc__titulo">
                AI-Human en acción:
                <span> casos de uso</span>
              </h2>
            </TextoArena>
          </div>

          <TextoArena>
            <p className="uc__entradilla">
              Descubre cómo aplicamos Inteligencia Artificial para generar
              impacto real en negocios de diferentes industrias.
            </p>
          </TextoArena>

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
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
          />

          {/* Aquí iba el botón "Contactar", debajo de la pieza de
              AI FIRST. Fuera por encargo.

              Con él se van los dos únicos imports que lo servían
              —Link de react-router y el icono ArrowRight— y, con
              ellos, el último enlace de esta sección: lo que queda
              es un bloque que solo se lee. Tenerlo en cuenta si
              algún día se busca por dónde sale el visitante desde
              casos de uso. */}
        </div>

        {/* ---- MÓVIL: EL CONMUTADOR (≤640px) ----
            La dirección 03 de la galería de propuestas: cuatro
            segmentos de icono y UN panel que cambia con fundido,
            en vez de cuatro tarjetas apiladas con 21 viñetas
            (~1.400px de lista).

            Los dos árboles —tarjetas y conmutador— van SIEMPRE en
            el DOM y el CSS enseña el que toca, igual que hace
            InteligenciaIA con sus dos versiones: el punto de corte
            vive en un solo sitio (la hoja) y cambiar el ancho de
            la ventana no re-renderiza nada. El precio son unos
            nodos de texto de más; aquí no hay imágenes que el
            navegador pudiera descargar en balde.

            Los paneles se apilan en la misma celda de grid, así
            que el marco mide SIEMPRE lo que el más alto
            (Contenido): cambiar de pestaña no hace saltar el
            layout. `inert` en los dormidos: fuera del tab-order y
            del lector de pantalla, misma receta que el desplegable
            del pie. */}
        <div className="uc__mano">
          <div
            className="uc__seg"
            role="tablist"
            aria-label="Capacidades de IA"
          >
            {CAPACIDADES.map(({ icono: Icono, titulo, corto }, i) => (
              <button
                key={titulo}
                ref={(el) => (refsTab.current[i] = el)}
                type="button"
                role="tab"
                id={`uc-tab-${i}`}
                aria-controls={`uc-panel-${i}`}
                aria-selected={i === activa}
                aria-label={titulo}
                tabIndex={i === activa ? 0 : -1}
                onClick={() => setActiva(i)}
                onKeyDown={alTeclearTab}
              >
                <Icono strokeWidth={1.6} aria-hidden="true" />
                <small aria-hidden="true">{corto}</small>
              </button>
            ))}
          </div>

          <div className="uc__panes">
            {CAPACIDADES.map(({ titulo, puntos }, i) => (
              <div
                key={titulo}
                role="tabpanel"
                id={`uc-panel-${i}`}
                aria-labelledby={`uc-tab-${i}`}
                inert={i !== activa}
                className={`uc__pane ${i === activa ? "uc__pane--activa" : ""}`}
                /* la cifra fantasma del fondo la pinta el ::after */
                data-cifra={String(i + 1).padStart(2, "0")}
              >
                <div className="uc__pane-cab">
                  <h3>{titulo}</h3>
                  <span className="uc__pane-cnt">
                    {puntos.length} capacidades
                  </span>
                </div>

                <ul className="uc__chips">
                  {puntos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
