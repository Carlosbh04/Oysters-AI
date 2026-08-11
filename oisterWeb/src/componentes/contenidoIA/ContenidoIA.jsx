import {
  Lightbulb,
  PenLine,
  Target,
  Send,
  BarChart3,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

import holograma from "../../assets/servicios/contenido-holograma.webp";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import "./ContenidoIA.css";

/* ============================================================
   CONTENIDO IMPULSADO POR IA

   El segundo de los cuatro apartados de "Cómo lo hacemos". Mismo
   reparto que Aprendizaje: primero el argumento —titular y la
   pieza rodeada de sus capacidades— y después el procedimiento
   numerado.

   El fondo lo pone EscenaServicio; aquí no se toca nada de él.
   ============================================================ */

/* Las CAPACIDADES orbitan el holograma. Van en dos grupos porque
   la rejilla las reparte a izquierda y derecha, y el orden de
   lectura tiene que seguir siendo el del proceso: ideación y
   creación a la izquierda, el resto a la derecha. */
/* Cada ficha trae SU SITIO en el escenario, en % sobre una caja de
   proporción fija. En la maqueta no están repartidas en columnas
   simétricas: se escalonan —dos arriba a la izquierda, una arriba
   al centro y dos bajando por la derecha— y esa asimetría es lo
   que hace que parezcan flotando y no tabuladas.

   Una rejilla no puede reproducir eso sin celdas vacías por todas
   partes. Con caja de proporción fija y posiciones en %, el
   conjunto escala entero y nunca se solapa; por debajo del
   breakpoint la caja se deshace y las fichas caen en columna. */
/* Las cinco capacidades y su CENTRO en el anillo, en porcentaje
   del cuadro. Los cinco pares salen de medir la maqueta, no de
   repartir 360/5: en ella el reparto no es regular —la derecha va
   algo más comprimida— y forzar la simetría cambiaba la
   composición.

   El centro es su CENTRO, no la esquina: así la ficha queda
   equilibrada sobre su punto pase lo que pase con el alto de su
   texto, que es lo que descuadró las dos versiones anteriores. */
const CAPACIDADES = [
  {
    icono: Lightbulb,
    titulo: "Ideación",
    texto:
      "La IA identifica tendencias y oportunidades para crear contenido relevante.",
    cx: 49.8,
    cy: 11.1,
  },
  {
    icono: PenLine,
    titulo: "Creación",
    texto:
      "Generamos contenido original, atractivo y optimizado para cada plataforma.",
    cx: 18.1,
    cy: 43.3,
  },
  {
    icono: Target,
    titulo: "Optimización",
    texto:
      "La IA optimiza el contenido para mejorar el alcance, el engagement y las conversiones.",
    cx: 81.7,
    cy: 36.0,
  },
  {
    icono: Send,
    titulo: "Distribución",
    texto: "Publicamos en el canal ideal en el momento perfecto.",
    /* Estas dos van más a la derecha que las otras, y su ancho
       baja para poder hacerlo: medido, con w:29 el borde caía
       justo en el 100 del cuadro, así que empujarlas sin
       estrecharlas las sacaba de la escena. */
    cx: 75.6,
    cy: 75.3,
  },
  {
    icono: BarChart3,
    titulo: "Análisis",
    texto: "Medimos el rendimiento y aprendemos para seguir mejorando.",
    cx: 28.2,
    cy: 81.1,
  },
];

/* Los PASOS son la misma cadena, contada como compromiso. Se
   mantienen aparte de CAPACIDADES a propósito: arriba se explica
   qué hace la IA, abajo qué hacemos nosotros, y el texto cambia.
   Fundirlos en una sola lista obligaría a que una de las dos
   voces sonara forzada. */
const PASOS = [
  {
    icono: Lightbulb,
    titulo: "Investigamos",
    texto: "Analizamos tu marca, audiencia y objetivos con IA.",
  },
  {
    icono: PenLine,
    titulo: "Creamos",
    texto: "Generamos contenido original y alineado con tu estrategia.",
  },
  {
    icono: Target,
    titulo: "Optimizamos",
    texto: "Ajustamos el contenido para máximo rendimiento con IA.",
  },
  {
    icono: Send,
    titulo: "Publicamos",
    texto: "Distribuimos en los canales ideales para tu audiencia.",
  },
  {
    icono: BarChart3,
    titulo: "Medimos",
    texto: "Evaluamos resultados y mejoramos de forma continua.",
  },
];

/* ---- EL ORDEN DEL RECORRIDO ----
   No es el del array: el array va en orden de discurso y esto en
   orden de GIRO. Va en el sentido del reloj, que es el de la
   maqueta: sube por la izquierda hasta Ideación, cruza por arriba
   y baja por la derecha hasta cerrar en Creación.

   ⚠️ Ojo si se toca: el sentido de la maqueta NO coincide con el
   del proceso. Empieza en Creación y va a Ideación, cuando por
   contenido sería al revés — primero se idea y luego se crea.
   Se ha dejado como la maqueta a propósito; invertirlo es dar la
   vuelta a este array y nada más. */
const RECORRIDO = [
  "Creación",
  "Ideación",
  "Optimización",
  "Distribución",
  "Análisis",
];

/* ---- TODOS LOS ARCOS, DE LA MISMA ELIPSE ----
   Este es el punto que hacía que el recorrido no "circulara". La
   versión anterior dibujaba cada tramo por su cuenta, abombándolo
   desde el punto medio entre dos fichas. Como las distancias
   entre ellas son muy distintas, cada curva salía con una
   curvatura distinta: cinco manguerazos sueltos en vez de un
   círculo.

   Ahora hay UNA elipse y los cinco tramos son trozos suyos. Lo
   único que se mide de las fichas es su ÁNGULO respecto al
   centro, para saber dónde abrir el hueco de cada una. La forma
   la pone la elipse, así que la curvatura es idéntica en los
   cinco y el conjunto se lee como una circunferencia.

   Radios: el holograma ocupa ±20 en x y ±19 en y desde el centro,
   y las fichas están a 32-36. 30 x 33 cae en medio — por fuera de
   la imagen y por dentro de las tarjetas. */
/* ---- EL LIENZO VA EN PROPORCIÓN, NO ESTIRADO ----
   Antes el viewBox era 0-100 en los dos ejes y se estiraba a la
   caja con preserveAspectRatio="none". Eso escala distinto en x
   que en y, y ahí se rompían las puntas: `orient="auto"` primero
   las ROTA y el estirado después las CIZALLA, así que en vez de
   una punta salía una loseta torcida. Solo se veían bien las de
   los tramos horizontales o verticales.

   Con el viewBox a 100 x 69 —la misma proporción que la caja— la
   escala es uniforme y la punta llega entera, apunte a donde
   apunte.

   El precio es que ahora TODO va en unidades de "porcentaje del
   ancho": una y del 45% de alto son 45 x 0,69 unidades. De ahí
   ALTO_VB y la conversión de abajo. */
const ALTO_VB = 69;
const aVB = (porcentajeDeAlto) => (porcentajeDeAlto * ALTO_VB) / 100;

const ANILLO = { cx: 49, cy: aVB(45), rx: 30, ry: aVB(33) };

const punto = (grados) => {
  const a = (grados * Math.PI) / 180;
  return {
    x: ANILLO.cx + ANILLO.rx * Math.sin(a),
    y: ANILLO.cy - ANILLO.ry * Math.cos(a),
  };
};

/* Un trozo de la elipse entre dos ángulos, en el sentido del
   reloj. `sweep` 1 y `large-arc` 0 porque ningún tramo pasa de
   media vuelta con cinco fichas. */
function arco(desde, hasta) {
  const a = punto(desde);
  const b = punto(hasta);
  return `M${a.x.toFixed(1)},${a.y.toFixed(1)} A${ANILLO.rx},${ANILLO.ry} 0 0 1 ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
}

function ContenidoIA() {
  /* ---- LAS FLECHAS SE MIDEN, NO SE ESCRIBEN ----
     Dos intentos anteriores llevaban las coordenadas puestas a
     mano y los dos se rompieron: el alto de cada ficha depende de
     en cuántas líneas parta su texto, y eso cambia con el ancho.
     Medido, Ideación ocupa el 14% de alto a 1600px y el 18% a
     1280 — cuatro puntos, suficientes para que una flecha
     calculada para un ancho quede flotando en otro.

     Así que se miden las cinco cajas de verdad y se recalculan
     cuando la escena cambia de tamaño. El ResizeObserver dispara
     también al empezar a observar, así que la primera medida sale
     de su callback y no del cuerpo del efecto — eso evita el
     setState en cascada que marca el linter. */
  const escenaRef = useRef(null);
  const [flechas, setFlechas] = useState([]);

  const medir = useCallback(() => {
    const esc = escenaRef.current;
    if (!esc) return;
    const r = esc.getBoundingClientRect();
    if (!r.width || !r.height) return;

    /* De cada ficha solo interesan dos cosas: en qué ÁNGULO del
       anillo cae y cuánto hueco angular hay que dejarle para que
       el arco no se le meta por debajo. Lo segundo sale de su
       tamaño real, así que el hueco se ajusta solo cuando el
       texto parte en más o menos líneas. */
    const ang = {};
    esc.querySelectorAll("[data-ficha]").forEach((n) => {
      const b = n.getBoundingClientRect();
      const cx = ((b.x + b.width / 2 - r.x) / r.width) * 100;
      /* a unidades del lienzo: si se comparan % de ancho con % de
         alto, el ángulo sale torcido porque no miden lo mismo */
      const cy = aVB(((b.y + b.height / 2 - r.y) / r.height) * 100);
      const dx = cx - ANILLO.cx;
      const dy = cy - ANILLO.cy;
      const grados = (Math.atan2(dx, -dy) * 180) / Math.PI;
      /* ---- CUÁNTO HUECO DEJARLE ----
         Tiene que ser la extensión angular ENTERA de la ficha, no
         una fracción. Se probó con la mitad de su diagonal y el
         resultado es el que se veía: los arcos se metían por
         debajo de las tarjetas y algunas flechas desaparecían.

         El motivo es que el anillo NO pasa por fuera de las
         fichas. Medido: Ideación está a 23,4 del centro y el
         anillo pasa a 22,8 — por su mitad. Las otras cuatro están
         a 31-34, así que a ellas sí las esquiva, pero un único
         radio no puede quedar fuera de las cinco y a la vez
         rodear la imagen, que llega a 25.

         Como el arco va por debajo, lo que hay que hacer es
         cortarlo ANTES: el hueco es el ángulo que la ficha ocupa
         vista desde el centro, más un par de grados de aire. */
      const radio = Math.hypot(dx, dy) || 1;

      /* Lo que tapa el arco no es la diagonal de la ficha sino su
         anchura PERPENDICULAR al radio: una tarjeta a la derecha
         estorba con su alto, y una arriba con su ancho. Usando la
         diagonal, el hueco salía tan grande que dos tramos —los de
         la derecha y la izquierda, donde las fichas están más
         juntas— quedaban en menos de 4° y desaparecían.

         La proyección sobre la tangente es |a·cos| + |b·sen|. */
      const t = Math.atan2(dx, -dy);
      const semiX = ((b.width / r.width) * 100) / 2;
      const semiY = aVB((b.height / r.height) * 100) / 2;
      const semi = Math.abs(semiX * Math.cos(t)) + Math.abs(semiY * Math.sin(t));

      ang[n.dataset.ficha] = {
        grados: (grados + 360) % 360,
        hueco: Math.min(34, (Math.atan2(semi, radio) * 180) / Math.PI + 1.5),
      };
    });

    const ruta = [];
    for (let i = 0; i < RECORRIDO.length; i++) {
      const a = ang[RECORRIDO[i]];
      const b = ang[RECORRIDO[(i + 1) % RECORRIDO.length]];
      if (!a || !b) continue;
      let desde = a.grados + a.hueco;
      let hasta = b.grados - b.hueco;
      /* normalizar para que el tramo siempre avance en el sentido
         del reloj, incluso al cruzar el 0 */
      while (hasta < desde) hasta += 360;
      /* 2° y no 4: los dos tramos más cortos rondan los 10° y con
         el umbral alto se descartaban enteros */
      if (hasta - desde < 2) continue;
      ruta.push(arco(desde, hasta));
    }
    setFlechas(ruta);
  }, []);

  useLayoutEffect(() => {
    const esc = escenaRef.current;
    if (!esc) return;
    const obs = new ResizeObserver(medir);
    obs.observe(esc);
    return () => obs.disconnect();
  }, [medir]);

  return (
    <div className="co">
      {/* ============ BLOQUE 1 · EL ARGUMENTO ============ */}
      <section className="co__cabecera" aria-labelledby="co-titulo">
        <div className="co__intro">
          <div className="co__discurso">
            <h1 id="co-titulo" className="co__titulo" data-entrada="titulo">
              Contenido
              <span>impulsado por IA</span>
            </h1>

            <p className="co__entradilla" data-entrada="texto">
              Creamos contenido estratégico y de alto impacto utilizando{" "}
              <strong>inteligencia artificial</strong> para conectar con tu
              audiencia, potenciar tu marca y generar{" "}
              <strong>resultados medibles</strong>.
            </p>

            {/* enlace de ancla y no botón con scrollIntoView: sin
                JavaScript sigue funcionando, respeta el "abrir en
                pestaña nueva" y el navegador ya aplica el
                desplazamiento suave del sitio */}
            <a className="co__ancla" href="#co-proceso" data-entrada="accion">
              Ver cómo funciona
              <span className="co__ancla-icono" aria-hidden="true">
                <ArrowDown size={16} strokeWidth={2.2} />
              </span>
            </a>
          </div>

          {/* ---- LA PIEZA Y SUS CAPACIDADES ----
              `alt=""`: el holograma es decorativo. Todo lo que
              cuenta —las cinco capacidades— está en HTML de
              verdad, en las fichas de al lado, así que describir
              la imagen haría que un lector de pantalla leyese lo
              mismo dos veces.

              Es la diferencia con el ciclo de Aprendizaje, donde
              la imagen SÍ lleva descripción larga porque en ancho
              sustituye a las fichas. */}
          <figure className="co__escena" ref={escenaRef}>
            <img
              className="co__holograma"
              data-entrada="pieza"
              src={holograma}
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              alt=""
            />

            {/* ---- LAS UNIONES ----
                Las curvas que bajan de "Ideación" y "Optimización"
                hasta la píldora. Van en SVG y no con bordes
                redondeados de CSS porque son curvas abiertas con
                punta de flecha, y eso con divs no sale.

                El viewBox es el mismo sistema de coordenadas que
                usan las fichas (0-100 en las dos direcciones), así
                que los puntos de las curvas se leen contra las
                mismas cifras del array de arriba. */}
            <svg
              className="co__uniones"
              data-entrada="pieza"
              viewBox="0 0 100 69"
              aria-hidden="true"
            >
              <defs>
                {/* ---- TAMAÑO DE LA PUNTA ----
                    El lienzo es 0-100 en los dos ejes pero se
                    estira a 884x654, así que una unidad NO mide lo
                    mismo a lo ancho que a lo alto: 8,84px contra
                    6,54. Con markerWidth/Height a 5 la punta salía
                    a 44x33px — un triangulote achatado más grande
                    que el propio tramo que remata.

                    1.4 x 1.9 compensa esa diferencia (1,4x8,84 =
                    12,4px y 1,9x6,54 = 12,4px): cuadrada en
                    pantalla y del tamaño del trazo.

                    Y `auto`, no `auto-start-reverse`: el reverse
                    solo afecta a marker-start, pero algunos
                    motores lo aplicaban igual y las puntas salían
                    mirando hacia atrás. */}
                <marker
                  id="co-punta"
                  viewBox="0 0 10 10"
                  /* refX en la PUNTA (9) y no antes: así el
                     triángulo se apoya en el final del trazo y lo
                     cubre hacia atrás. Con refX=8 asomaba un
                     trocito de línea por delante y, sobre todo,
                     el remate del trazo se veía sobresalir por los
                     lados del triángulo — que es la "raya" que se
                     notaba detrás de la flecha. */
                  refX="9"
                  refY="5"
                  markerWidth="3.4"
                  markerHeight="3.4"
                  orient="auto"
                >
                  {/* base cóncava: además de leerse mejor como
                      flecha, los dos picos traseros tapan el final
                      del trazo aunque quede algo desalineado */}
                  <path d="M0,0.5 L9.4,5 L0,9.5 L2.6,5 z" fill="currentColor" />
                </marker>
              </defs>

              {/* Un tramo por pareja consecutiva del recorrido, con
                  las coordenadas que salen de medir las fichas.
                  Hasta que la primera medición llega, no se pinta
                  nada — mejor vacío un fotograma que flechas en
                  el sitio equivocado. */}
              {flechas.map((d, i) => (
                <path key={i} d={d} markerEnd="url(#co-punta)" />
              ))}

            </svg>

            <figcaption className="co__lema" data-entrada="pieza">
              Creamos contenido que conecta
            </figcaption>

            {/* ---- ESTAS ENTRAN QUIETAS, Y NO ES UN CAPRICHO ----
                `data-entrada-quieta` les quita el desplazamiento de
                la animación de llegada y las deja entrar solo con
                opacidad. El motivo es el anillo: sus tramos se
                calculan midiendo ESTAS cajas con
                getBoundingClientRect(), que devuelve la caja ya
                transformada. Una ficha a medio entrar se mediría 22px
                más abajo, y como quien dispara la medición es el
                ResizeObserver de la escena —que no se entera de que
                sus hijas se muevan—, las flechas se quedarían
                torcidas para siempre. Ver EntradaServicio.css. */}
            {CAPACIDADES.map(({ icono: Icono, titulo, texto, cx, cy }, i) => (
              <article
                key={titulo}
                className="co-ficha"
                data-ficha={titulo}
                data-entrada="ficha"
                data-entrada-quieta
                style={{ "--x": `${cx}%`, "--y": `${cy}%`, "--i": i }}
              >
                <span className="co-ficha__icono" aria-hidden="true">
                  <Icono strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className="co-ficha__titulo">{titulo}</h2>
                  <p className="co-ficha__texto">{texto}</p>
                </div>
              </article>
            ))}

          </figure>
        </div>
      </section>

      {/* ============ BLOQUE 2 · EL PROCEDIMIENTO ============ */}
      <section
        className="co__proceso"
        id="co-proceso"
        aria-labelledby="co-como"
      >
        <div className="co__proceso-rejilla">
          <div className="co__proceso-texto" data-entrada="apartado">
            <h2 id="co-como" className="co__subtitulo">
              ¿Cómo lo hacemos?
            </h2>
            <p className="co__proceso-entradilla">
              Un proceso inteligente que combina creatividad humana e
              inteligencia artificial para generar contenido que impacta.
            </p>
          </div>

          {/* <ol> y no <ul>: el orden ES la información. Con una
              lista sin orden, un lector de pantalla no anuncia
              que hay una secuencia y las flechas —que son
              decorativas— no lo suplen. */}
          <ol className="co__pasos">
            {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
              <li key={titulo} className="co-paso" data-entrada="paso" style={{ "--i": i }}>
                <span className="co-paso__num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="co-paso__icono" aria-hidden="true">
                  <Icono size={22} strokeWidth={1.6} />
                </span>

                <h3 className="co-paso__titulo">{titulo}</h3>
                <p className="co-paso__texto">{texto}</p>

                {/* la unión vive DENTRO del paso, no entre ellos:
                    así el último no la lleva sin condicionales y
                    la rejilla no gana celdas impares */}
                {i < PASOS.length - 1 && (
                  <i className="co-paso__union" aria-hidden="true">
                    <ArrowRight size={18} strokeWidth={1.7} />
                  </i>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default ContenidoIA;
