import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import TextoArena from "../textoArena/TextoArena";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Eye,
  FileSignature,
  SlidersHorizontal,
  Target,
} from "lucide-react";

import anillo from "../../assets/inteligencia/anillo.webp";
import LuzAnillo from "./LuzAnillo";
import VideoMarco from "./VideoMarco";
import "./InteligenciaIA.css";

/* ============================================================
   INTELIGENCIA QUE IMPULSA RESULTADOS

   Recreación de la maquetación de referencia. Se monta en
   "Cómo lo hacemos" (/services, ver ComoLoHacemosPage.jsx) y en
   la sección homónima de la portada.

   ---- DOS COSAS QUE NO ESTÁN, Y ES A PROPÓSITO ----

   1· EL FONDO. La maquetación va sobre un rosado que se está
      preparando aparte, así que aquí hay un gris casi blanco de
      relleno. Está en UNA variable, --iia-fondo, para que
      cambiarlo sea una línea: no hay ningún color de fondo
      escrito en el resto de la hoja.

   2· LOS DOS BOTONES del primer bloque —"Conoce nuestros
      servicios" y "Ver casos de éxito"— se quitan por encargo.
      Sin ellos la columna de texto cierra con el párrafo en
      negrita, que es el que lleva el mensaje.

   ---- Y UNA QUE ES UN HUECO, NO UN OLVIDO ----
   El vídeo es un MARCO vacío con sus mandos dibujados. No monta
   ningún <video> ni ningún iframe porque todavía no hay pieza:
   lo que hace falta ahora es que el hueco tenga el tamaño y la
   forma correctos para juzgar la composición. Cuando llegue el
   vídeo, se sustituye el contenido de .iia__marco y el resto no
   se entera.
   ============================================================ */

/* Los cuatro apartados. El orden del array ES el orden visual y
   además el que empareja con los conectores: 0 y 2 caen en la
   columna izquierda, 1 y 3 en la derecha. Si algún día son seis,
   hay que tocar la rejilla — el dibujo de los conectores no, que
   se mide solo. */
const APARTADOS = [
  {
    id: "aprendizaje",
    icono: BookOpen,
    titulo: ["Aprendizaje", "impulsado por IA"],
    lado: "izq",
    texto: (
      <>
        OYSTERS analiza el comportamiento de las audiencias, generando insights
        y estrategia mediante el uso de herramientas como{" "}
        <b>Brand24, ChatGPT, Perplexity o Similarweb</b>.
      </>
    ),
  },
  {
    id: "contenido",
    icono: FileSignature,
    titulo: ["Contenido", "impulsado por IA"],
    lado: "der",
    texto: (
      <>
        Gracias al dominio de herramientas de IA como{" "}
        <b>
          Adobe Firefly, ElevenLabs, Leonardo, Midjourney, Flux, Freepik Runway,
          Seadance, Google Veo 3, Kling o Suno
        </b>
        , OYSTERS crea contenido audiovisual distintivo, original e innovador.
      </>
    ),
  },
  {
    id: "personalizacion",
    icono: SlidersHorizontal,
    titulo: ["Personalización", "impulsada por IA"],
    lado: "izq",
    texto: (
      <>
        OYSTERS personaliza, adapta y escala la creatividad a cientos de piezas
        en muy poco tiempo con herramientas de IA y automatización como{" "}
        <b>Magnific, accreative, CapCut, Filmora, Peech, thebrief o predis.ai</b>
        .
      </>
    ),
  },
  {
    id: "orquestacion",
    icono: BarChart3,
    titulo: ["Orquestación", "impulsada por IA"],
    lado: "der",
    texto: (
      <>
        OYSTERS utiliza herramientas como{" "}
        <b>Metricool, Google Analytics, SE Ranking, o Polymer</b> para optimizar
        la distribución de mensajes, supervisar su rendimiento y garantizar la
        mejora continua de cada campaña.
      </>
    ),
  },
];

/* ============================================================
   LOS CONECTORES SE MIDEN, NO SE ESCRIBEN

   Las cuatro curvas que van de cada tarjeta al anillo central
   podrían dibujarse con coordenadas a ojo sobre un viewBox fijo,
   y es exactamente lo que no funciona: la altura de una tarjeta
   depende de cuántas líneas ocupe su texto, y su texto reflowa
   con el ancho de la ventana. Cualquier número escrito a mano
   cuadra en un ancho y se despega en el siguiente.

   Así que se leen las cajas de verdad —las cuatro tarjetas y el
   núcleo— y se construyen los trazados con esas medidas. El
   viewBox se pone al tamaño real del contenedor, o sea escala
   1:1: sin preserveAspectRatio, sin deformación posible.

   Los PUNTOS de las puntas van en el mismo <svg> y en las mismas
   coordenadas que las curvas. Es la única forma de que no se
   desincronicen: si el punto fuera un ::after de la tarjeta y la
   curva viviera aquí, serían dos sistemas distintos apuntando al
   mismo sitio por casualidad.
   ============================================================ */
function useConectores(mapaRef, nucleoRef, tarjetaRefs, activo) {
  const [trazado, setTrazado] = useState(null);

  const medir = useCallback(() => {
    const mapa = mapaRef.current;
    const nucleo = nucleoRef.current;
    if (!mapa || !nucleo || !activo) return setTrazado(null);

    const base = mapa.getBoundingClientRect();
    const n = nucleo.getBoundingClientRect();

    /* centro y radio del núcleo en coordenadas del contenedor.
       El radio es el del círculo dibujado, no el de la caja: la
       caja es cuadrada y el círculo va inscrito. */
    const cx = n.left - base.left + n.width / 2;
    const cy = n.top - base.top + n.height / 2;
    const r = Math.min(n.width, n.height) / 2;

    const rutas = [];
    const puntos = [];

    tarjetaRefs.current.forEach((el, i) => {
      if (!el) return;
      const t = el.getBoundingClientRect();
      const izq = APARTADOS[i].lado === "izq";

      /* arranque: el borde INTERIOR de la tarjeta, a media
         altura. Media altura y no un porcentaje fijo — así da
         igual que una tarjeta tenga tres líneas y otra cinco. */
      const x1 = (izq ? t.right : t.left) - base.left;
      const y1 = t.top - base.top + t.height / 2;

      /* llegada: el punto del círculo que mira a ese arranque.
         Se calcula por el ángulo, así que la curva siempre
         aterriza perpendicular al borde y nunca lo atraviesa. */
      const ang = Math.atan2(y1 - cy, x1 - cx);
      const x2 = cx + Math.cos(ang) * r;
      const y2 = cy + Math.sin(ang) * r;

      /* La curva sale HORIZONTAL de la tarjeta y entra
         horizontal en el anillo: los dos tiradores van en el eje
         x. Es lo que le da la forma de ese tumbada de la
         referencia en vez de una diagonal recta. */
      const tirador = Math.abs(x2 - x1) * 0.55;
      const s = izq ? 1 : -1;

      rutas.push(
        `M ${x1} ${y1} C ${x1 + s * tirador} ${y1}, ${x2 - s * tirador} ${y2}, ${x2} ${y2}`
      );
      puntos.push({ x: x1, y: y1 });
    });

    /* el centro y el radio salen también hacia fuera: los necesita
       la luz que orbita (LuzAnillo). Antes se quedaban aquí dentro
       porque solo servían para construir las curvas. */
    setTrazado({
      w: base.width,
      h: base.height,
      rutas,
      puntos,
      centro: { x: cx, y: cy },
      radio: r,
    });
  }, [mapaRef, nucleoRef, tarjetaRefs, activo]);

  /* useLayoutEffect y no useEffect: el trazado se calcula a
     partir de cajas ya maquetadas, y hacerlo antes de pintar
     evita el fotograma en el que las curvas aún no existen. */
  useLayoutEffect(() => {
    medir();
  }, [medir]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || typeof ResizeObserver === "undefined") return;

    /* Observa el CONTENEDOR y no la ventana: así también
       responde a que una tarjeta cambie de alto sin que la
       ventana se mueva (una fuente que carga tarde, por
       ejemplo). */
    const ro = new ResizeObserver(medir);
    ro.observe(mapa);
    return () => ro.disconnect();
  }, [mapaRef, medir]);

  /* Las fuentes son el caso que más se escapa: el texto reflowa
     cuando la webfont sustituye a la de respaldo, y eso pasa
     DESPUÉS del primer trazado. */
  useEffect(() => {
    if (!document.fonts?.ready) return;
    document.fonts.ready.then(medir);
  }, [medir]);

  return trazado;
}

/* `sobreFondo` enciende la variante para fondo OSCURO. La
   maquetación nace clara —con su propio gris de pared a pared— y
   esta prop la desmonta: fondo transparente y toda la tinta y los
   trazos girados al otro lado.

   Va como prop y no como dos componentes ni dos hojas de estilo
   porque el bloque es el mismo: cambia la piel, no la estructura.
   Y así el banco de pruebas y la página real comparten la MISMA
   variante en vez de mantener cada uno su copia. */
/* `pista` es lo que va en la COLUMNA IZQUIERDA del primer bloque,
   la que se reservó para la esfera. El componente no decide qué
   pone ahí: en el banco de pruebas va vacía y en la home recibe la
   pista de aterrizaje de la ostra que viaja desde el hero. */
function InteligenciaIA({ sobreFondo = false, pista = null }) {
  const mapaRef = useRef(null);
  const nucleoRef = useRef(null);
  const tarjetaRefs = useRef([]);

  /* ---- LA LLEGADA DE LA LUZ ENCIENDE LA TARJETA ----
     Toca la clase del nodo directamente en vez de pasar por
     estado. Con estado, cada llegada re-renderizaría el bloque
     entero —cuatro tarjetas, el anillo y el SVG de los hilos— para
     cambiar una clase; y como el trazado se recalcula al
     renderizar, sería recalcular geometría por un destello.

     El temporizador se guarda por tarjeta: si la luz vuelve a la
     misma antes de que termine el anterior, se reinicia la
     animación en vez de apagarse a media. */
  const pulsos = useRef({});
  const encender = useCallback((i) => {
    const el = tarjetaRefs.current[i];
    if (!el) return;

    const mapa = mapaRef.current;

    clearTimeout(pulsos.current[i]);
    el.classList.remove("iia__tarjeta--pulso");
    /* reflow forzado: sin él, quitar y poner la clase en el mismo
       fotograma no reinicia la animación — el navegador no ve
       ningún cambio */
    void el.offsetWidth;
    el.classList.add("iia__tarjeta--pulso");

    /* la marca del contenedor es la que apaga a las OTRAS tres
       (ver `.iia__mapa--enfoque` en el CSS) */
    mapa?.classList.add("iia__mapa--enfoque");

    /* 1,6s: lo que dura la subida, la espera arriba y la bajada
       lenta. Tiene que cuadrar con `iia-alza` y con la parada de
       LuzAnillo — si se acorta aquí, la tarjeta baja de golpe a
       mitad de animación. */
    pulsos.current[i] = setTimeout(() => {
      el.classList.remove("iia__tarjeta--pulso");
      mapa?.classList.remove("iia__mapa--enfoque");
    }, 1600);
  }, [tarjetaRefs, mapaRef]);

  useEffect(() => {
    const pendientes = pulsos.current;
    return () => Object.values(pendientes).forEach(clearTimeout);
  }, []);


  /* Los conectores solo tienen sentido con las cuatro tarjetas
     alrededor del anillo. Por debajo de 1080px la rejilla se
     apila y el anillo se va arriba: las curvas cruzarían el
     texto, así que ni se dibujan. La misma medida está en el CSS
     y por eso va escrita en las dos partes con el mismo número
     —cambiar una sin la otra deja curvas huérfanas—. */
  const [conCurvas, setConCurvas] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1080px)");
    const leer = () => setConCurvas(mq.matches);
    leer();
    mq.addEventListener("change", leer);
    return () => mq.removeEventListener("change", leer);
  }, []);

  const trazado = useConectores(mapaRef, nucleoRef, tarjetaRefs, conCurvas);

  return (
    <div className={`iia ${sobreFondo ? "iia--sobre-fondo" : ""}`}>
      {/* ================= BLOQUE 1 — COMBINAMOS ================= */}
      <section className="iia__intro" aria-labelledby="iia-titulo">
        {/* la columna reservada. Si nadie manda nada, queda vacía —
            que es lo que hace el banco de pruebas. */}
        {pista && <div className="iia__pista">{pista}</div>}

        <div className="iia__intro-texto">
          {/* Aquí iba el rótulo "03 · Inteligencia que impulsa
              resultados", con su filete corto debajo. Fuera por
              encargo: el bloque abre directamente con el titular.

              El "03" venía de la maquetación de referencia, donde
              esta pantalla era la tercera de una serie numerada.
              Suelta, esa numeración no cuenta nada. */}

          {/* ---- DOS LÍNEAS, NO TRES ----
              Antes eran tres tramos, cada uno en su línea:
              "Combinamos" / "pensamiento humano" / "y creatividad
              con la IA". Con la primera de una sola palabra, el
              titular se leía cortado y ocupaba mucho alto para lo
              poco que decía cada renglón.

              Ahora el acento va DENTRO de la primera línea, y el
              corte cae donde cambia la idea. Cada línea es más
              larga, que es lo que hace que el titular se lea
              extendido y no apilado.

              El salto sigue siendo presentación y no contenido: son
              spans con `display: block`, así que en estrecho el CSS
              puede deshacerlo y para un lector de pantalla sigue
              siendo una sola frase. */}
          <TextoArena>
            <h1 id="iia-titulo" className="iia__titulo">
              <span className="iia__titulo-linea">
                Combinamos{" "}
                <span className="iia__titulo-acento">pensamiento humano</span>
              </span>
              <span className="iia__titulo-linea">y creatividad con la IA</span>
            </h1>
          </TextoArena>

          <TextoArena>
            <p className="iia__parrafo">
              La tecnología nos permite analizar datos complejos, generar
              conceptos creativos con agilidad y optimizar continuamente los
              resultados. Al mismo tiempo, el instinto humano, la intuición y la
              empatía aportan contexto, significado y valor a nuestras
              recomendaciones estratégicas y creativas, siempre potenciadas por
              herramientas avanzadas.
            </p>
          </TextoArena>

          <TextoArena>
            <p className="iia__parrafo iia__parrafo--fuerte">
              Hoy, la inteligencia artificial facilita la creación, gestión y
              escalabilidad del proceso de generación de campañas publicitarias
              de forma más eficiente, precisa y veloz que nunca.
            </p>
          </TextoArena>

          {/* Aquí iban "Conoce nuestros servicios" y "Ver casos
              de éxito". Fuera por encargo. */}
        </div>

        {/* El vídeo. Era un marco vacío con los mandos dibujados
            esperando a que llegara la pieza; ya está, así que el
            dibujo pasa a funcionar (ver VideoMarco.jsx). */}
        <VideoMarco />

      </section>

      {/* ================= BLOQUE 2 — MISIÓN Y VISIÓN ================= */}
      {/* Una sola tarjeta partida por un filete, no dos tarjetas
          juntas: misión y visión son las dos caras de lo mismo y
          separarlas en dos cajas las enfrentaría. */}
      <section className="iia__proposito">
        <div className="iia__proposito-mitad">
          <span className="iia__medallon" aria-hidden="true">
            <Target strokeWidth={1.7} />
          </span>
          <div>
            <h2>Nuestra Misión</h2>
            <p>
              Para aquellas marcas que puedan sentirse abrumadas o carezcan de
              experiencia, OYSTERS AI aprovecha el poder de la inteligencia
              artificial para ayudarlas a alcanzar sus objetivos de marketing y
              comunicación.
            </p>
          </div>
        </div>

        <div className="iia__proposito-mitad">
          <span className="iia__medallon" aria-hidden="true">
            <Eye strokeWidth={1.7} />
          </span>
          <div>
            <h2>Nuestra Visión</h2>
            <p>
              Simplificar el proceso publicitario, haciéndolo accesible para un
              espectro más amplio de empresas, incluidas las PYMES, al disminuir
              los costes en talento y facilitar la accesibilidad a aplicaciones
              y soluciones de inteligencia artificial.
            </p>
          </div>
        </div>
      </section>

      {/* ================= BLOQUE 3 — ¿CÓMO LO HACEMOS? ================= */}
      <section className="iia__metodo" aria-labelledby="iia-metodo-titulo">
        <p className="iia__rotulo-centro">
          <ChevronRight className="iia__rotulo-flecha" aria-hidden="true" />
          ¿Cómo lo hacemos?
          <ChevronRight
            className="iia__rotulo-flecha iia__rotulo-flecha--der"
            aria-hidden="true"
          />
        </p>

        <TextoArena>
          <h2 id="iia-metodo-titulo" className="iia__metodo-titulo">
            Con soluciones impulsadas por IA que abarcan todo el proceso de una
            campaña
          </h2>
        </TextoArena>

        <TextoArena>
          <p className="iia__metodo-entrada">
            OYSTERS AI se apalanca en un{" "}
            <b>ecosistema avanzado de herramientas de IA</b>, que cubre desde la
            escucha digital y la generación de contenido innovador hasta la
            distribución orgánica, la monitorización y el análisis en tiempo real
            de los contenidos.
          </p>
        </TextoArena>

        <div className="iia__mapa" ref={mapaRef}>
          {/* Las curvas van DEBAJO de las tarjetas y del anillo
              (z-index 0 contra 1) para que ninguna línea cruce
              por encima de un texto. */}
          {trazado && (
            <svg
              className="iia__hilos"
              width={trazado.w}
              height={trazado.h}
              viewBox={`0 0 ${trazado.w} ${trazado.h}`}
              aria-hidden="true"
            >
              {trazado.rutas.map((d, i) => (
                <path key={i} d={d} />
              ))}
              {trazado.puntos.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4.5" />
              ))}
            </svg>
          )}

          {/* la luz que recorre el aro y se desvía por los hilos.
              Se monta con la misma geometría que acaba de medirse,
              así que no puede desalinearse con lo que se ve. */}
          {trazado && (
            <LuzAnillo
              ancho={trazado.w}
              alto={trazado.h}
              centro={trazado.centro}
              radio={trazado.radio}
              rutas={trazado.rutas}
              alLlegar={encender}
            />
          )}

          <div className="iia__columna">
            {APARTADOS.filter((a) => a.lado === "izq").map((a) => (
              <Tarjeta
                key={a.id}
                {...a}
                refCb={(el) => {
                  tarjetaRefs.current[APARTADOS.indexOf(a)] = el;
                }}
              />
            ))}
          </div>

          {/* ---- EL NÚCLEO ----
              El resplandor y el aro son dos capas distintas y no
              un solo elemento con sombra: el aro tiene que
              quedar nítido mientras el resplandor está muy
              desenfocado, y un `filter` los borraría a los dos.
              El aro es además quien mide el radio de llegada de
              las curvas (ver useConectores). */}
          <div className="iia__nucleo" ref={nucleoRef} aria-hidden="true">
            <span className="iia__nucleo-brillo" />
            <span className="iia__nucleo-aro" />
            <img
              className="iia__anillo"
              src={anillo}
              alt=""
              width={300}
              height={300}
              decoding="async"
            />
          </div>

          <div className="iia__columna">
            {APARTADOS.filter((a) => a.lado === "der").map((a) => (
              <Tarjeta
                key={a.id}
                {...a}
                refCb={(el) => {
                  tarjetaRefs.current[APARTADOS.indexOf(a)] = el;
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Aquí iba la banda morada de cierre —"IA y talento
          humano..."— con sus dos botones. Fuera por encargo.

          Se fue con ella lo único de esta página que llevaba a
          alguna parte: eran los dos únicos enlaces del bloque
          (a /contact y a /works). Lo que queda es una página
          que solo se lee — algo hay que tener en cuenta si un
          día se monta como página del sitio y no como banco. */}
    </div>
  );
}

/* El titular va partido en dos líneas a mano —"Aprendizaje" /
   "impulsado por IA"— porque así está en la referencia y porque
   el reparto automático dejaba "por IA" solo en la segunda. Es
   un <span> con display:block y no un <br>: el salto es
   presentación, y en móvil el CSS puede deshacerlo. */
function Tarjeta({ icono: Icono, titulo, texto, refCb }) {
  return (
    <article className="iia__tarjeta" ref={refCb}>
      <span className="iia__tarjeta-icono" aria-hidden="true">
        <Icono strokeWidth={1.7} />
      </span>

      <div className="iia__tarjeta-cuerpo">
        <h3>
          <span>{titulo[0]}</span>
          <span>{titulo[1]}</span>
        </h3>
        <p>{texto}</p>
      </div>
    </article>
  );
}

export default InteligenciaIA;
