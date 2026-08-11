import {
  Share2,
  Zap,
  SlidersHorizontal,
  TrendingUp,
  Search,
  Settings,
  Play,
  BarChart3,
  Puzzle,
  Clock,
  Target,
  ArrowRight,
} from "lucide-react";

import diagrama from "../../assets/servicios/orquestacion-holograma.webp";
import "./OrquestacionIA.css";

/* ============================================================
   ORQUESTACIÓN IMPULSADA POR IA

   El cuarto y último de los apartados de "Cómo lo hacemos".
   Mismo reparto que sus tres hermanas —el argumento arriba, el
   procedimiento debajo— y la fila de beneficios de cierre que
   estrenó Personalización.

   El fondo lo pone EscenaServicio; aquí no se toca nada de él, y
   este archivo no pinta NINGÚN fondo de página.

   ---- EN QUÉ SE DIFERENCIA DE PERSONALIZACIÓN ----
   Allí las fichas van SUELTAS sobre el escenario, en posiciones
   absolutas, porque rodean al holograma. Aquí no: el diagrama de
   la maqueta —el cerebro y sus seis nodos— viene ENTERO dentro
   de la imagen, texto incluido, así que no hay nada que colocar
   encima. Las cuatro fichas forman una columna de verdad a la
   derecha y el bloque es una rejilla de tres columnas normal y
   corriente. Es más simple, y conviene que se quede así.
   ============================================================ */

/* ---- LA IMAGEN LLEVA TEXTO DENTRO ----
   "Estrategia", "Datos", "Audiencias", "Contenido",
   "Automatización" y "Resultados" están pintados en el webp y no
   existen en ninguna otra parte de la página. Por eso el alt NO
   va vacío, al revés que en Personalización y Contenido: allí las
   fichas de al lado repetían en HTML lo que decía la imagen y
   describirla habría hecho que un lector de pantalla leyera lo
   mismo dos veces. Aquí, sin este texto, esos seis conceptos no
   llegan.

   Si algún día el diagrama se rehace con los rótulos fuera de la
   imagen, esto vuelve a alt="". */
const ALT_DIAGRAMA =
  "Diagrama de orquestación: una IA central conectada a estrategia, datos, " +
  "audiencias, contenido y automatización, con los resultados —medimos, " +
  "aprendemos y optimizamos— alimentándose del conjunto.";

/* Las CAPACIDADES: la columna de la derecha. Sin coordenadas,
   al contrario que en Personalización — aquí son una lista y la
   rejilla las coloca. */
const CAPACIDADES = [
  {
    icono: Share2,
    titulo: "Sincronizamos",
    texto:
      "Conectamos herramientas, canales y equipos para trabajar en perfecta alineación.",
  },
  {
    icono: Zap,
    titulo: "Automatizamos",
    texto:
      "Creamos flujos inteligentes que ejecutan tareas repetitivas y optimizan tiempos.",
  },
  {
    icono: SlidersHorizontal,
    titulo: "Adaptamos",
    texto:
      "La IA ajusta cada acción en tiempo real según el comportamiento y los objetivos.",
  },
  {
    icono: TrendingUp,
    titulo: "Escalamos",
    texto:
      "Optimizamos continuamente para multiplicar el impacto y escalar resultados.",
  },
];

/* Los PASOS son la misma cadena contada como compromiso: arriba
   se explica qué hace el sistema, aquí qué hacemos nosotros. Se
   mantienen aparte de CAPACIDADES a propósito —el texto cambia de
   voz— igual que en las otras tres. */
const PASOS = [
  {
    icono: Search,
    titulo: "Analizamos",
    texto: "Estudiamos tu negocio, audiencia y datos para entender el escenario.",
  },
  {
    icono: Share2,
    titulo: "Diseñamos",
    texto: "Creamos la estrategia, flujos y arquitectura de automatización con IA.",
  },
  {
    icono: Settings,
    titulo: "Orquestamos",
    texto: "Conectamos herramientas, canales y equipos en un sistema sincronizado.",
  },
  {
    icono: Play,
    titulo: "Ejecutamos",
    texto: "La IA y la automatización ponen en marcha cada acción de forma precisa.",
  },
  {
    icono: BarChart3,
    titulo: "Optimizamos",
    texto: "Medimos, aprendemos y ajustamos para mejorar continuamente.",
  },
];

/* La fila de cierre. No repite lo de arriba: las capacidades
   dicen QUÉ hace el sistema y los pasos CÓMO se trabaja; esto es
   qué se lleva el cliente. */
const BENEFICIOS = [
  {
    icono: Puzzle,
    titulo: "Integración total",
    texto: "Todas las piezas conectadas en un solo sistema.",
  },
  {
    icono: Clock,
    titulo: "Eficiencia operativa",
    texto: "Menos tareas manuales, más resultados.",
  },
  {
    icono: Target,
    titulo: "Precisión inteligente",
    texto: "Decisiones basadas en datos y aprendizaje automático.",
  },
  {
    icono: TrendingUp,
    titulo: "Resultados escalables",
    texto: "Estrategias diseñadas para crecer contigo.",
  },
];

function OrquestacionIA() {
  return (
    <div className="or">
      {/* ============ BLOQUE 1 · EL ARGUMENTO ============ */}
      <section className="or__cabecera" aria-labelledby="or-titulo">
        {/* tres columnas: discurso · diagrama · capacidades */}
        <div className="or__intro">
          <div className="or__discurso">
            <h1 id="or-titulo" className="or__titulo" data-entrada="titulo">
              Orquestación
              <span>impulsada por IA</span>
            </h1>

            <p className="or__entradilla" data-entrada="texto">
              Coordinamos inteligencias, procesos y herramientas para ejecutar
              estrategias de <strong>marketing digital</strong> con precisión,
              agilidad y <strong>resultados escalables</strong>.
            </p>
          </div>

          <figure className="or__escena">
            <img
              className="or__diagrama"
              data-entrada="pieza"
              src={diagrama}
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              alt={ALT_DIAGRAMA}
            />
          </figure>

          <ul className="or__capacidades">
            {CAPACIDADES.map(({ icono: Icono, titulo, texto }, i) => (
              <li
                key={titulo}
                className="or-ficha"
                data-entrada="ficha"
                style={{ "--i": i }}
              >
                <h2 className="or-ficha__titulo">
                  <span className="or-ficha__icono" aria-hidden="true">
                    <Icono strokeWidth={1.6} />
                  </span>
                  {titulo}
                </h2>
                <p className="or-ficha__texto">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ BLOQUE 2 · EL PROCEDIMIENTO ============ */}
      <section className="or__proceso" id="or-proceso" aria-labelledby="or-como">
        <div className="or__proceso-rejilla">
          <div className="or__proceso-texto" data-entrada="apartado">
            <h2 id="or-como" className="or__subtitulo">
              ¿Cómo lo hacemos?
            </h2>

            <p className="or__proceso-entradilla">
              Un sistema orquestado que integra IA, datos y automatización para
              ejecutar estrategias de marketing más inteligentes.
            </p>
          </div>

          {/* <ol> y no <ul>: el orden ES la información. Con una
              lista sin orden, un lector de pantalla no anuncia que
              hay una secuencia y las flechas —decorativas— no lo
              suplen. */}
          <ol className="or__pasos">
            {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
              <li key={titulo} className="or-paso" data-entrada="paso" style={{ "--i": i }}>
                <span className="or-paso__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="or-paso__icono" aria-hidden="true">
                  <Icono size={26} strokeWidth={1.6} />
                </span>

                <h3 className="or-paso__titulo">{titulo}</h3>
                <p className="or-paso__texto">{texto}</p>

                {/* la unión vive DENTRO del paso, no entre ellos:
                    así el último no la lleva sin condicionales y la
                    rejilla no gana celdas impares */}
                {i < PASOS.length - 1 && (
                  <i className="or-paso__union" aria-hidden="true">
                    <ArrowRight size={18} strokeWidth={1.7} />
                  </i>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ BLOQUE 3 · LOS BENEFICIOS ============ */}
      <section className="or__beneficios" aria-label="Beneficios">
        <ul className="or__beneficios-rejilla">
          {BENEFICIOS.map(({ icono: Icono, titulo, texto }, i) => (
            <li
              key={titulo}
              className="or-beneficio"
              data-entrada="cierre"
              style={{ "--i": i }}
            >
              <span className="or-beneficio__icono" aria-hidden="true">
                <Icono size={30} strokeWidth={1.4} />
              </span>

              <div>
                <h3 className="or-beneficio__titulo">{titulo}</h3>
                <p className="or-beneficio__texto">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default OrquestacionIA;
