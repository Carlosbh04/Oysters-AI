import {
  User,
  Brain,
  SlidersHorizontal,
  Zap,
  BarChart3,
  Database,
  Users,
  Target,
  Send,
  Star,
  TrendingUp,
  Heart,
  Timer,
  ArrowRight,
} from "lucide-react";

import holograma from "../../assets/servicios/personalizacion-holograma.webp";
import "./PersonalizacionIA.css";

/* ============================================================
   PERSONALIZACIÓN IMPULSADA POR IA

   El tercero de los cuatro apartados de "Cómo lo hacemos".
   Mismo reparto que Aprendizaje y Contenido —el argumento
   arriba, el procedimiento debajo— y un tercer bloque que estos
   no tienen: la fila de beneficios con la que cierra la maqueta.

   El fondo lo pone EscenaServicio; aquí no se toca nada de él.
   Este archivo no pinta NINGÚN fondo de página: lo único opaco
   son las fichas, porque llevan texto sobre una escena con
   corredor de luz y ahí una superficie translúcida no se lee.
   ============================================================ */

/* Las CAPACIDADES rodean el holograma. Cada una trae SU SITIO en
   el escenario —x/y son su esquina superior izquierda y w su
   ancho, en % del cuadro—, porque en la maqueta no forman
   columnas simétricas: las dos de la izquierda se alinean, las
   dos de la derecha bajan a su lado y "Resultados reales" se
   descuelga sola al fondo. Esa asimetría es lo que hace que
   parezcan flotando alrededor de la pieza y no tabuladas.

   Es el mismo mecanismo que en Contenido, y por el mismo motivo:
   una rejilla no reproduce esto sin celdas vacías por todas
   partes, y posiciones en % sobre una caja de proporción fija
   escalan enteras sin que dos fichas lleguen a pisarse. Por
   debajo del breakpoint la caja se deshace y caen en columna. */
const CAPACIDADES = [
  {
    icono: User,
    titulo: "Conoce",
    texto:
      "La IA recopila y unifica datos de comportamiento, intereses e interacciones en todos los puntos de contacto.",
    x: 0,
    y: 5,
    w: 22,
  },
  {
    icono: Brain,
    titulo: "Entiende",
    texto:
      "Analizamos patrones para identificar preferencias, necesidades y oportunidades únicas de cada usuario.",
    x: 0,
    y: 42,
    w: 22,
  },
  {
    icono: SlidersHorizontal,
    titulo: "Personaliza",
    texto:
      "Creamos experiencias, mensajes y recomendaciones hechos a la medida para cada segmento o individuo.",
    x: 74,
    y: 5,
    w: 26,
  },
  {
    icono: Zap,
    titulo: "Actúa",
    texto:
      "Automatizamos la entrega del contenido personalizado en el momento y canal más efectivo.",
    x: 74,
    y: 42,
    w: 26,
  },
  {
    icono: BarChart3,
    titulo: "Resultados reales",
    texto:
      "Más relevancia. Más engagement. Más conversiones. Clientes que vuelven y recomiendan tu marca.",
    /* la única que no se alinea con ninguna otra: en la maqueta
       cae por debajo de "Actúa" y algo más a la izquierda, ya
       fuera de la columna derecha. Es el remate de la escena, no
       un cuarto par. */
    x: 69,
    y: 76,
    w: 31,
  },
];

/* Los PASOS son la misma cadena contada como compromiso: arriba
   se explica qué hace la IA, aquí qué hacemos nosotros. Se
   mantienen aparte de CAPACIDADES a propósito —el texto cambia de
   voz— igual que en Contenido. */
const PASOS = [
  {
    icono: Database,
    titulo: "Recopilamos",
    texto: "Obtenemos datos de todas las interacciones y puntos de contacto.",
  },
  {
    icono: Brain,
    titulo: "Analizamos",
    texto: "La IA identifica patrones, preferencias e intenciones de cada usuario.",
  },
  {
    icono: Users,
    titulo: "Segmentamos",
    texto: "Creamos segmentos dinámicos y perfiles predictivos.",
  },
  {
    icono: Target,
    titulo: "Personalizamos",
    texto: "Adaptamos contenido, ofertas y experiencias en tiempo real.",
  },
  {
    icono: Send,
    titulo: "Optimizamos",
    texto: "Aprendemos y ajustamos continuamente para mejorar resultados.",
  },
];

/* La fila de cierre. No repite lo de arriba: las capacidades
   dicen QUÉ hace el sistema y los pasos CÓMO se trabaja; esto es
   qué se lleva el cliente. */
const BENEFICIOS = [
  {
    icono: Star,
    titulo: "Experiencias únicas",
    texto: "Cada persona recibe lo que le interesa, cuando le interesa.",
  },
  {
    icono: TrendingUp,
    titulo: "Mayor conversión",
    texto: "Mensajes relevantes que impulsan acciones y ventas.",
  },
  {
    icono: Heart,
    titulo: "Lealtad y retención",
    texto: "Clientes más satisfechos que vuelven y recomiendan.",
  },
  {
    icono: Timer,
    titulo: "Eficiencia inteligente",
    texto: "Automatizamos y optimizamos para mejores resultados con menos esfuerzo.",
  },
];

function PersonalizacionIA() {
  return (
    <div className="pe">
      {/* ============ BLOQUE 1 · EL ARGUMENTO ============ */}
      <section className="pe__cabecera" aria-labelledby="pe-titulo">
        <div className="pe__intro">
          <div className="pe__discurso">
            <h1 id="pe-titulo" className="pe__titulo" data-entrada="titulo">
              Personalización
              <span>impulsada por IA</span>
            </h1>

            <p className="pe__entradilla" data-entrada="texto">
              La IA analiza datos en <strong>tiempo real</strong> para entender a
              cada persona y ofrecer experiencias, mensajes y recomendaciones
              únicas que aumentan la conexión, la conversión y la{" "}
              <strong>lealtad a tu marca</strong>.
            </p>
          </div>

          {/* ---- LA PIEZA Y SUS CAPACIDADES ----
              `alt=""`: el holograma es decorativo. Todo lo que
              cuenta —las cinco capacidades— está en HTML de
              verdad, en las fichas de alrededor, así que
              describir la imagen haría que un lector de pantalla
              leyese lo mismo dos veces. */}
          <figure className="pe__escena">
            <img
              className="pe__holograma"
              data-entrada="pieza"
              src={holograma}
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              alt=""
            />

            {CAPACIDADES.map(({ icono: Icono, titulo, texto, x, y, w }, i) => (
              <article
                key={titulo}
                className="pe-ficha"
                data-entrada="ficha"
                style={{ "--x": `${x}%`, "--y": `${y}%`, "--w": `${w}%`, "--i": i }}
              >
                <h2 className="pe-ficha__titulo">
                  <span className="pe-ficha__icono" aria-hidden="true">
                    <Icono strokeWidth={1.6} />
                  </span>
                  {titulo}
                </h2>
                <p className="pe-ficha__texto">{texto}</p>
              </article>
            ))}
          </figure>
        </div>
      </section>

      {/* ============ BLOQUE 2 · EL PROCEDIMIENTO ============ */}
      <section
        className="pe__proceso"
        id="pe-proceso"
        aria-labelledby="pe-como"
      >
        <div className="pe__proceso-rejilla">
          <div className="pe__proceso-texto" data-entrada="apartado">
            <h2 id="pe-como" className="pe__subtitulo">
              ¿Cómo lo hacemos?
            </h2>

            <p className="pe__proceso-entradilla">
              Un proceso inteligente y continuo que se adapta a tu audiencia
              para ofrecer experiencias cada vez más relevantes.
            </p>
          </div>

          {/* <ol> y no <ul>: el orden ES la información. Con una
              lista sin orden, un lector de pantalla no anuncia que
              hay una secuencia y las flechas —decorativas— no lo
              suplen. */}
          <ol className="pe__pasos">
            {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
              <li key={titulo} className="pe-paso" data-entrada="paso" style={{ "--i": i }}>
                <span className="pe-paso__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="pe-paso__icono" aria-hidden="true">
                  <Icono size={34} strokeWidth={1.4} />
                </span>

                <h3 className="pe-paso__titulo">{titulo}</h3>
                <p className="pe-paso__texto">{texto}</p>

                {/* la unión vive DENTRO del paso, no entre ellos:
                    así el último no la lleva sin condicionales y la
                    rejilla no gana celdas impares */}
                {i < PASOS.length - 1 && (
                  <i className="pe-paso__union" aria-hidden="true">
                    <ArrowRight size={18} strokeWidth={1.7} />
                  </i>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ BLOQUE 3 · LOS BENEFICIOS ============ */}
      <section className="pe__beneficios" aria-label="Beneficios">
        <ul className="pe__beneficios-rejilla">
          {BENEFICIOS.map(({ icono: Icono, titulo, texto }, i) => (
            <li
              key={titulo}
              className="pe-beneficio"
              data-entrada="cierre"
              style={{ "--i": i }}
            >
              <span className="pe-beneficio__icono" aria-hidden="true">
                <Icono size={30} strokeWidth={1.4} />
              </span>

              <div>
                <h3 className="pe-beneficio__titulo">{titulo}</h3>
                <p className="pe-beneficio__texto">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default PersonalizacionIA;
