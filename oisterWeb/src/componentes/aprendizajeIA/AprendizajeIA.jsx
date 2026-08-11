import {
  ArrowRight,
  BarChart3,
  Brain,
  ChartPie,
  Database,
  Gauge,
  Lightbulb,
  Network,
  RefreshCw,
  Rocket,
  Search,
  Share2,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import cicloImg from "../../assets/servicios/ciclo-aprendizaje.webp";
import "./AprendizajeIA.css";

/* ============================================================
   APRENDIZAJE IMPULSADO POR IA

   El primero de los cuatro apartados de "Cómo lo hacemos". Son
   dos bloques con papeles distintos:

     · arriba, el ARGUMENTO — titular, promesa y un diagrama del
       ciclo, que es lo que explica de un vistazo qué se hace;
     · abajo, el PROCEDIMIENTO — los seis pasos en orden y las
       cuatro razones por las que funciona.

   ---- EL FONDO NO ES SUYO ----
   Va sobre EscenaOraculo, que lo pone la página. Por eso aquí no
   hay ni un color de fondo: si este componente trajera el suyo,
   taparía la escena y habría que ir apagándolo cada vez que se
   monte en otro sitio. Lo único que se declara es que el
   contenido va por encima.
   ============================================================ */

/* Las cinco fichas del ciclo. El orden del array ES el orden de
   lectura para un lector de pantalla; dónde cae cada una en
   pantalla lo decide `zona`, que es su celda de la rejilla. */
const CICLO = [
  {
    zona: "datos",
    icono: Database,
    titulo: "Datos",
    texto: "Recopilamos información de múltiples fuentes.",
  },
  {
    zona: "analisis",
    icono: Search,
    titulo: "Análisis",
    texto: "Interpretamos los datos y encontramos oportunidades.",
  },
  {
    zona: "aprendizaje",
    icono: Share2,
    titulo: "Aprendizaje",
    texto: "La IA detecta patrones y genera conocimiento.",
  },
  {
    zona: "accion",
    icono: Zap,
    titulo: "Acción",
    texto: "Aplicamos estrategias inteligentes y automatizadas.",
  },
  {
    zona: "resultados",
    icono: BarChart3,
    titulo: "Resultados",
    texto: "Medimos, aprendemos y mejoramos continuamente.",
  },
];

const PASOS = [
  {
    icono: Database,
    titulo: "Recopilamos",
    texto: "Obtenemos datos de campañas, audiencias, webs, CRM y más.",
  },
  {
    icono: TrendingUp,
    titulo: "Analizamos",
    texto: "La IA procesa la información y detecta patrones clave.",
  },
  {
    icono: Brain,
    titulo: "Aprendemos",
    texto: "Generamos conocimiento predictivo y oportunidades.",
  },
  {
    icono: Target,
    titulo: "Actuamos",
    texto: "Implementamos estrategias optimizadas automáticamente.",
  },
  {
    icono: Gauge,
    titulo: "Medimos",
    texto: "Evaluamos el impacto en tiempo real con métricas precisas.",
  },
  {
    icono: RefreshCw,
    titulo: "Mejoramos",
    texto:
      "Aprendemos del resultado y el sistema se optimiza para crecer sin parar.",
  },
];

const RAZONES = [
  {
    icono: Network,
    titulo: "IA + Marketing",
    texto: "Unimos datos, creatividad y tecnología para multiplicar resultados.",
  },
  {
    icono: ChartPie,
    titulo: "Decisiones basadas en datos",
    texto: "Menos suposiciones, más precisión y mejor ROI.",
  },
  {
    icono: Lightbulb,
    titulo: "Optimización constante",
    texto: "Cada interacción alimenta al sistema para hacerlo mejor.",
  },
  {
    icono: Rocket,
    titulo: "Resultados que escalan",
    texto: "Estrategias que crecen junto con tu negocio.",
  },
];

function AprendizajeIA() {
  return (
    <div className="ap">
      {/* ============ BLOQUE 1 · EL ARGUMENTO ============ */}
      <section className="ap__cabecera" aria-labelledby="ap-titulo">
        <div className="ap__intro">
          <div className="ap__discurso">
            <h1 id="ap-titulo" className="ap__titulo" data-entrada="titulo">
              Aprendizaje
              <span>impulsado por IA</span>
            </h1>

            <p className="ap__entradilla" data-entrada="texto">
              Utilizamos inteligencia artificial para analizar datos, aprender
              de cada interacción y optimizar continuamente las estrategias de
              marketing que generan resultados reales.
            </p>
          </div>

          {/* ---- EL DIAGRAMA ----
              Es una FIGURA, no una lista: las cinco fichas se leen
              como un ciclo y el orden importa. Por eso va en
              <figure> con su descripción, y las flechas quedan
              fuera del árbol de accesibilidad — para quien no ve
              el dibujo, el orden del marcado ya cuenta la
              historia. */}
          {/* ---- EL DIAGRAMA VIENE RENDERIZADO ----
              La imagen trae DENTRO las cinco fichas, las flechas
              y el podio. Eso resuelve el dibujo y abre un
              problema: el texto va incrustado, así que no se
              puede leer con un lector de pantalla ni se reescala
              como texto.

              Por eso conviven las dos versiones y se turnan por
              ancho, nunca a la vez:

                · ancho  -> la imagen. Su alt lleva el ciclo
                  entero escrito, que es la única forma de que
                  ese contenido exista para quien no la ve;
                · estrecho -> las fichas en HTML. Medido, el
                  texto incrustado mide 28px en un render de
                  1536, o sea ~7px en un móvil de 430: ilegible.

              `display: none` saca del árbol de accesibilidad, así
              que la que está oculta tampoco se lee dos veces. */}
          <figure className="ap__ciclo">
            <img
              className="ap__ciclo-img"
              data-entrada="pieza"
              src={cicloImg}
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
              alt="Ciclo de aprendizaje impulsado por IA. Datos: recopilamos información de múltiples fuentes. Análisis: interpretamos los datos y encontramos oportunidades. Aprendizaje: la IA detecta patrones y genera conocimiento. Acción: aplicamos estrategias inteligentes y automatizadas. Resultados: medimos, aprendemos y mejoramos continuamente, y los resultados vuelven a alimentar los datos."
            />

            <figcaption className="ap__ciclo-desc">
              Ciclo de aprendizaje: los datos alimentan el análisis, el análisis
              genera aprendizaje, el aprendizaje dispara la acción y la acción
              produce resultados que vuelven a alimentar los datos.
            </figcaption>

            {CICLO.map(({ zona, icono: Icono, titulo, texto }, i) => (
              <article
                key={zona}
                className={`ap-ficha ap-ficha--${zona}`}
                data-entrada="ficha"
                style={{ "--i": i }}
              >
                <span className="ap-ficha__icono" aria-hidden="true">
                  <Icono strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="ap-ficha__titulo">{titulo}</h2>
                  <p className="ap-ficha__texto">{texto}</p>
                </div>
              </article>
            ))}

          </figure>
        </div>
      </section>

      {/* ============ BLOQUE 2 · EL PROCEDIMIENTO ============ */}
      <section className="ap__proceso" id="ap-proceso" aria-labelledby="ap-como">
        <div className="ap__proceso-rejilla">
          <div className="ap__proceso-texto" data-entrada="apartado">
            <h2 id="ap-como" className="ap__subtitulo">
              ¿Cómo lo hacemos?
            </h2>
            <p className="ap__proceso-entradilla">
              Un ciclo continuo donde la IA aprende, optimiza y potencia cada
              decisión de marketing.
            </p>          </div>

          {/* Lista ORDENADA: son pasos numerados, y el número no es
              decoración sino la información. Con <ul> habría que
              escribir el "01" a mano y un lector de pantalla no
              sabría que hay una secuencia. */}
          <ol className="ap__pasos">
            {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
              <li key={titulo} className="ap-paso" data-entrada="paso" style={{ "--i": i }}>
                <span className="ap-paso__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ap-paso__icono" aria-hidden="true">
                  <Icono strokeWidth={1.4} />
                </span>
                <h3 className="ap-paso__titulo">{titulo}</h3>
                <p className="ap-paso__texto">{texto}</p>

                {/* la flecha entre pasos es del hueco, no del paso:
                    la última no la lleva y se quita sola con
                    :last-child en el CSS */}
                <i className="ap-paso__union" aria-hidden="true">
                  <ArrowRight strokeWidth={1.6} />
                </i>
              </li>
            ))}
          </ol>
        </div>

        <ul className="ap__razones">
          {RAZONES.map(({ icono: Icono, titulo, texto }, i) => (
            <li
              key={titulo}
              className="ap-razon"
              data-entrada="cierre"
              style={{ "--i": i }}
            >
              <span className="ap-razon__icono" aria-hidden="true">
                <Icono strokeWidth={1.4} />
              </span>
              <div>
                <h3 className="ap-razon__titulo">{titulo}</h3>
                <p className="ap-razon__texto">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AprendizajeIA;
