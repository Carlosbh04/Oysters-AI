import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import TextoArena from "../textoArena/TextoArena";
import useMediaQuery from "../../hooks/useMediaQuery";
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
/* ---- POR QUÉ CADA APARTADO SE CUENTA DOS VECES ----
   `texto` es la versión de ESCRITORIO: un párrafo con las
   herramientas en negrita dentro de la frase, tal cual estaba.

   `resumen` + `herramientas` son la de MÓVIL, y no es una copia
   por comodidad: ahí el párrafo largo era el problema. Medido en
   un móvil de 844px, los cuatro apartados sumaban ~1.400px de
   texto seguido, con los nombres de herramienta enterrados en
   negrita a mitad de frase. Separándolos, la prosa se queda en
   una línea y las herramientas se leen de un vistazo como
   etiquetas — que es como se consultan de verdad.

   No se ha intentado derivar una de la otra con CSS: cada frase
   coloca las herramientas en un sitio distinto (unas al final,
   otras a mitad), así que cualquier reconstrucción automática
   saldría coja en alguna. */
const APARTADOS = [
  {
    id: "aprendizaje",
    numero: "01",
    resumen:
      "Analiza el comportamiento de las audiencias y genera insights y estrategia.",
    herramientas: ["Brand24", "ChatGPT", "Perplexity", "Similarweb"],
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
    numero: "02",
    resumen:
      "Crea contenido audiovisual distintivo, original e innovador.",
    herramientas: ["Adobe Firefly", "ElevenLabs", "Leonardo", "Midjourney",
      "Flux", "Freepik", "Runway", "Seadance", "Google Veo 3", "Kling", "Suno"],
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
    numero: "03",
    resumen:
      "Adapta y escala la creatividad a cientos de piezas en muy poco tiempo.",
    herramientas: ["Magnific", "accreative", "CapCut", "Filmora", "Peech",
      "thebrief", "predis.ai"],
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
    numero: "04",
    resumen:
      "Optimiza la distribución, supervisa el rendimiento y mejora cada campaña.",
    herramientas: ["Metricool", "Google Analytics", "SE Ranking", "Polymer"],
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
   EL TELÓN DE NÁCAR — QUÉ SE DESCUBRE Y QUÉ NO

   Las piezas se eligen a mano y no con un "todos los hijos"
   porque la sección tiene tres maquetaciones distintas dentro
   (columna de texto, pieza partida y la cadena) y en cada una lo
   que se lee como UNA pieza es otra cosa.

   Ojo con la última: se descubre `.iia__paso` —el plegable— y no
   la tarjeta entera. El nodo de la perla es hermano suyo, así que
   se queda fuera del recorte y conserva su propio encendido. Sale
   una entrada de dos tiempos: primero se descubre el contenido y
   después prende la perla, porque su línea de agua está más
   arriba (0,72 contra 0,88).
   ============================================================ */
const TELON_PIEZAS = [
  ".iia__intro-texto > *",
  ".iia__marco",
  ".iia__proposito-mitad",
  ".iia__metodo > .iia__rotulo-centro",
  ".iia__metodo-titulo",
  ".iia__metodo-entrada",
  ".iia__tarjeta .iia__paso",
].join(", ");

/* El filo de nácar que viaja en el corte sólo se pone en las
   piezas ALTAS. En un rótulo de 16px el barrido dura lo mismo
   pero no recorre nada: se ve un destello, que es ruido y no
   gesto. */
const TELON_CON_FILO = [
  ".iia__titulo",
  ".iia__metodo-titulo",
  ".iia__marco",
  ".iia__proposito-mitad",
  ".iia__paso",
].join(", ");

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
/* ¿Miden lo mismo dos trazados? Comparar las rutas basta para
   toda la geometría de las curvas (los puntos de las puntas van
   embebidos en el propio string del path); w/h/centro/radio se
   comparan aparte porque no viajan en las rutas. No es un deep
   equal genérico: son los campos exactos y solo corre al medir. */
const esMismoTrazado = (a, b) =>
  a.w === b.w &&
  a.h === b.h &&
  a.radio === b.radio &&
  a.centro.x === b.centro.x &&
  a.centro.y === b.centro.y &&
  a.rutas.length === b.rutas.length &&
  a.rutas.every((d, i) => d === b.rutas[i]);

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
    /* ---- LA IDENTIDAD SOLO CAMBIA SI CAMBIA LA GEOMETRÍA ----
       medir() corre en el montaje, con cada aviso del
       ResizeObserver (que entrega una observación inicial nada
       más observar) y al llegar las fuentes. Publicar SIEMPRE un
       objeto nuevo hacía que LuzAnillo —cuyo efecto depende de
       `centro` y `rutas` por identidad— rearrancara su máquina de
       estados con geometría idéntica: la luz saltaba a otro punto
       del aro sin que nada hubiera cambiado. Si la medición sale
       igual, se conserva el objeto anterior: misma referencia →
       React ni re-renderiza ni relanza efectos. */
    setTrazado((previo) => {
      const nuevo = {
        w: base.width,
        h: base.height,
        rutas,
        puntos,
        centro: { x: cx, y: cy },
        radio: r,
      };

      return previo && esMismoTrazado(previo, nuevo) ? previo : nuevo;
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
/* ---- POR QUÉ EL TITULAR ELIGE SU NIVEL ----
   Este bloque se monta en DOS sitios y el nivel correcto no es el
   mismo en los dos:

     · en /services es el titular de la página — su único <h1>;
     · en la portada es UNA sección más, y ahí ya hay un <h1>
       ("CRAFTING AI"). Con este también en h1 había dos, y el
       resto de secciones del home (Últimos proyectos, Nosotros,
       Casos de uso) son todas <h2>: esta era la excepción.

   Por defecto <h1>, que es lo que necesita la página propia;
   quien lo monte dentro de otra le pasa "h2". */
function InteligenciaIA({ sobreFondo = false, pista = null, nivelTitulo: NivelTitulo = "h1" }) {
  const mapaRef = useRef(null);
  const nucleoRef = useRef(null);
  const tarjetaRefs = useRef([]);
  const hiloRef = useRef(null);
  const raizRef = useRef(null);

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
  /* Se lee con useMediaQuery y no con un useState+useEffect
     propio porque ese arrancaba SIEMPRE en false: en escritorio
     el primer trazado salía con la maqueta de móvil y corregía
     después. Daba igual mientras la diferencia era solo dibujar
     unas curvas; ahora que el móvil monta otra composición —la
     cadena— ese primer fotograma se vería. El hook inicializa
     con matchMedia de forma síncrona, así que no hay salto. */
  const conCurvas = useMediaQuery("(min-width: 1080px)");

  /* Mismo interruptor, otra lectura: donde no caben las curvas es
     donde Misión y Visión van plegadas. Se deriva del estado que ya
     existe en vez de montar otro matchMedia — dos observadores del
     mismo ancho acabarían discrepando el día que alguien cambie
     uno solo. */
  const esMovil = !conCurvas;

  /* ============================================================
     EL HILO DE LA CADENA (solo móvil)

     El hilo no se dibuja con medidas escritas a mano por la misma
     razón que las curvas del escritorio: la altura de cada paso
     depende de cuántas líneas ocupen su resumen y sus etiquetas,
     y eso reflowa con el ancho. Un `top` y un `height` fijos
     cuadran en un móvil y se despegan en el siguiente.

     Así que se miden los NODOS —los círculos numerados— y el hilo
     se tiende del centro del 01 al centro del 04. Ni un píxel de
     hilo por encima del primero ni por debajo del último: lleno
     del todo significa exactamente "has llegado al final".

     El relleno va en un scaleY sobre un pseudoelemento, que
     resuelve el compositor. Con `height` habría repintado en cada
     fotograma de scroll.

     Y se lee UNA caja por fotograma: los desplazamientos de los
     cuatro nodos se cachean al medir, y durante el scroll solo se
     pregunta dónde está el mapa. */
  useEffect(() => {
    if (!esMovil) return undefined;

    const mapa = mapaRef.current;
    const hilo = hiloRef.current;
    const pasos = tarjetaRefs.current.filter(Boolean);
    if (!mapa || !hilo || pasos.length < 2) return undefined;

    const nodos = pasos.map((p) => p.querySelector(".iia__paso-numero"));
    if (nodos.some((n) => !n)) return undefined;

    /* desplazamiento del centro de cada nodo DENTRO del mapa */
    let centros = [];
    let largo = 1;

    const medir = () => {
      const base = mapa.getBoundingClientRect().top;
      centros = nodos.map((n) => {
        const c = n.getBoundingClientRect();
        return c.top + c.height / 2 - base;
      });
      largo = Math.max(1, centros[centros.length - 1] - centros[0]);
      hilo.style.top = `${centros[0]}px`;
      hilo.style.setProperty("--iia-hilo-largo", `${largo}px`);
    };

    medir();

    const limpiar = () => {
      hilo.style.removeProperty("top");
      hilo.style.removeProperty("--iia-hilo-largo");
      hilo.style.removeProperty("--iia-hilo-avance");
      pasos.forEach((p) => p.removeAttribute("data-visto"));
    };

    /* Con movimiento reducido el hilo no se llena a plazos: nace
       lleno y los cuatro nodos encendidos. Sigue contando el
       recorrido; lo que se retira es la animación, no la idea. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hilo.style.setProperty("--iia-hilo-avance", "1");
      pasos.forEach((p) => p.setAttribute("data-visto", ""));
      return limpiar;
    }

    let pedido = false;
    const pintar = () => {
      pedido = false;
      const base = mapa.getBoundingClientRect().top;

      /* la línea de agua: el hilo se llena hasta donde el lector
         está mirando, no hasta el borde inferior de la pantalla */
      const marca = window.innerHeight * 0.72;

      const avance = (marca - (base + centros[0])) / largo;
      hilo.style.setProperty(
        "--iia-hilo-avance",
        String(Math.min(1, Math.max(0, avance)))
      );

      pasos.forEach((p, i) => {
        if (base + centros[i] < marca) p.setAttribute("data-visto", "");
        else p.removeAttribute("data-visto");
      });
    };

    const alMover = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(pintar);
    };

    pintar();

    window.addEventListener("scroll", alMover, { passive: true });
    const ro = new ResizeObserver(() => {
      medir();
      pintar();
    });
    ro.observe(mapa);

    return () => {
      window.removeEventListener("scroll", alMover);
      ro.disconnect();
      limpiar();
    };
  }, [esMovil]);

  /* ============================================================
     EL TELÓN DE NÁCAR (solo móvil)

     ---- POR QUÉ NO SE USA <Reveal> ----
     El componente del sitio envuelve a sus hijos en un div, y
     aquí eso no vale: dentro de `.iia__mapa` las tarjetas son
     hijas directas de un flex —las columnas van en
     `display: contents`— y su orden lo pone `order`. Un div de
     más entre medias rompe las tres cosas a la vez.

     ---- Y POR QUÉ UN LISTENER Y NO UN INTERSECTIONOBSERVER ----
     Esta es la razón de fondo, y conviene que no se pierda:
     `clip-path` y IntersectionObserver NO se llevan. La
     intersección se calcula DESPUÉS de aplicar el recorte, así
     que una pieza recortada a altura cero no interseca nunca —
     no se enciende, luego no se desrecorta. El estado oculto
     impide su propio disparo, y parece que la animación está
     rota cuando en realidad no llega a empezar.

     `getBoundingClientRect()` no tiene ese problema: devuelve la
     caja de MAQUETACIÓN, y `clip-path` sólo afecta al pintado.
     Por eso aquí se mide con un listener de scroll, igual que el
     hilo de la cadena, y se puede recortar la propia pieza que se
     mide sin envolver nada.

     ---- EL FALLO SEGURO ES "VISIBLE" ----
     Todo el CSS del telón cuelga de `data-telon`, que lo pone
     ESTE efecto. Si el JS no corre —o si hay movimiento
     reducido—, el atributo no llega, no hay recorte y el
     contenido se ve puesto. Nunca al revés. */
  useEffect(() => {
    if (!esMovil) return undefined;

    const raiz = raizRef.current;
    if (!raiz) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const piezas = Array.from(raiz.querySelectorAll(TELON_PIEZAS));
    if (!piezas.length) return undefined;

    for (const pieza of piezas) {
      pieza.setAttribute("data-telon-pieza", "");
      if (pieza.matches(TELON_CON_FILO)) pieza.setAttribute("data-telon-filo", "");
    }
    raiz.setAttribute("data-telon", "");

    /* Los desplazamientos se cachean respecto a la raíz y durante
       el scroll sólo se pregunta dónde está ella: UNA caja por
       fotograma en vez de una por pieza. Con once piezas, la
       diferencia son once lecturas forzadas de maquetación por
       fotograma o una. */
    let topes = [];
    const medir = () => {
      const base = raiz.getBoundingClientRect().top;
      topes = piezas.map((p) => p.getBoundingClientRect().top - base);
    };

    let pedido = false;
    const pintar = () => {
      pedido = false;
      const base = raiz.getBoundingClientRect().top;

      /* 0,88 y no 0,72 como el hilo: el telón se descubre nada
         más asomar la pieza, y la perla se enciende después,
         cuando ya has llegado a ella. Son dos tiempos a
         propósito, no dos umbrales sin coordinar. */
      const marca = window.innerHeight * 0.88;

      for (let i = 0; i < piezas.length; i++) {
        if (base + topes[i] < marca) piezas[i].setAttribute("data-ver", "");
        else piezas[i].removeAttribute("data-ver");
      }
    };

    const alMover = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(pintar);
    };

    medir();
    pintar();

    window.addEventListener("scroll", alMover, { passive: true });
    const ro = new ResizeObserver(() => {
      medir();
      pintar();
    });
    ro.observe(raiz);

    return () => {
      window.removeEventListener("scroll", alMover);
      ro.disconnect();
      raiz.removeAttribute("data-telon");
      for (const pieza of piezas) {
        pieza.removeAttribute("data-telon-pieza");
        pieza.removeAttribute("data-telon-filo");
        pieza.removeAttribute("data-ver");
      }
    };
  }, [esMovil]);

  const trazado = useConectores(mapaRef, nucleoRef, tarjetaRefs, conCurvas);

  return (
    <div
      ref={raizRef}
      className={`iia ${sobreFondo ? "iia--sobre-fondo" : ""}`}
    >
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
          {/* ---- EL RÓTULO QUE ABRE EL BLOQUE ----
              Mismo componente visual que el "¿Cómo lo hacemos?" del
              segundo bloque —flechas, versalitas y guía en
              degradado—, para que los dos apartados de la sección
              se anuncien igual, centrado como él.

              ⚠️ VA FUERA DE <TextoArena>, Y NO ES CAPRICHO: ese
              componente hace `cloneElement` sobre UN hijo único
              (le inyecta su ref y su clase). Metiéndolo dentro,
              recibía dos y `children.props` pasaba a ser undefined
              — la portada entera se quedaba en blanco. */}
          <p className="iia__rotulo-centro">
            <ChevronRight className="iia__rotulo-flecha" aria-hidden="true" />
            Qué hacemos
            <ChevronRight
              className="iia__rotulo-flecha iia__rotulo-flecha--der"
              aria-hidden="true"
            />
          </p>

          <TextoArena>
            <NivelTitulo id="iia-titulo" className="iia__titulo">
              <span className="iia__titulo-linea">
                Combinamos{" "}
                <span className="iia__titulo-acento">pensamiento humano</span>
              </span>
              {/* Este espacio NO sobra. Las dos líneas son bloque en
                  escritorio —y ahí un espacio entre bloques no pinta
                  nada—, pero por debajo de 560px pasan a `inline`
                  para que el titular fluya. Sin él, JSX se come el
                  salto de línea del código y las dos piezas quedan
                  pegadas: se leía "pensamiento humanoy creatividad". */}{" "}
              <span className="iia__titulo-linea">y creatividad con la IA</span>
            </NivelTitulo>
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
            {/* ---- PLEGABLE, PERO SOLO EN MÓVIL ----
                <details> nativo: cero JS y accesible de serie
                (teclado y lector de pantalla incluidos). El
                atributo `open` se calcula una vez con el mismo
                punto de corte que el resto del bloque, así que en
                escritorio nace abierto; allí el CSS además le
                quita el cursor y el triángulo, y no hay manera de
                cerrarlo: se lee exactamente como antes.

                ---- Y ABRE COMO LAS TARJETAS ----
                Abría en seco, que es lo que hace <details> por su
                cuenta, mientras los pasos del recorrido se
                desplegaban con recorrido. Dos plegables con el
                mismo aspecto y distinta manera de abrirse se leen
                como dos componentes distintos, y no lo son.

                Se reutiliza el manejador de las tarjetas tal cual
                —misma duración y misma curva— pasándole su propio
                grupo, para que este par y los cuatro pasos no se
                cierren entre sí. Ver alPulsarPlegable.

                ---- Y AHORA NACEN ABIERTAS TAMBIÉN EN LA MANO ----
                Se plegaron para ahorrar altura, y el ahorro era
                real: dos titulares en vez de dos párrafos. Pero
                con la cadena debajo enseñando sus 26 herramientas
                sin pedir un toque, este par era lo ÚNICO que
                quedaba escondido en toda la sección — y encima
                justo antes: el lector llegaba al método habiendo
                leído dos rótulos y ningún contenido.

                `open` a secas, sin condición: el marcado es el
                mismo en los dos anchos y el <details> se queda
                como envoltorio semántico. La manija sigue
                existiendo en móvil por si se quiere cerrar. */}
            <details className="iia__desplegable" open>
              {/* ---- EL CIERRE, BLOQUEADO DE VERDAD ----
                  El CSS le quita el puntero al summary, y con eso
                  bastaba para el dedo y para el ratón. Pero no
                  para el TECLADO: <summary> sigue siendo
                  enfocable, e Intro con el foco encima dispara un
                  click que lo pliega — y entonces se queda
                  plegado, porque ya no hay flecha ni manija con la
                  que volver a abrirlo.

                  preventDefault cancela el toggle nativo venga de
                  donde venga. Una línea, y cubre puntero, teclado
                  y cualquier click disparado por código. */}
              <summary onClick={(e) => e.preventDefault()}>
                <h2>Nuestra Misión</h2>
              </summary>
              <p>
                Para aquellas marcas que puedan sentirse abrumadas o carezcan de
                experiencia, OYSTERS AI aprovecha el poder de la inteligencia
                artificial para ayudarlas a alcanzar sus objetivos de marketing y
                comunicación.
              </p>
            </details>
          </div>
        </div>

        <div className="iia__proposito-mitad">
          <span className="iia__medallon" aria-hidden="true">
            <Eye strokeWidth={1.7} />
          </span>
          <div>
            <details className="iia__desplegable" open>
              {/* ---- EL CIERRE, BLOQUEADO DE VERDAD ----
                  El CSS le quita el puntero al summary, y con eso
                  bastaba para el dedo y para el ratón. Pero no
                  para el TECLADO: <summary> sigue siendo
                  enfocable, e Intro con el foco encima dispara un
                  click que lo pliega — y entonces se queda
                  plegado, porque ya no hay flecha ni manija con la
                  que volver a abrirlo.

                  preventDefault cancela el toggle nativo venga de
                  donde venga. Una línea, y cubre puntero, teclado
                  y cualquier click disparado por código. */}
              <summary onClick={(e) => e.preventDefault()}>
                <h2>Nuestra Visión</h2>
              </summary>
              <p>
                Simplificar el proceso publicitario, haciéndolo accesible para un
                espectro más amplio de empresas, incluidas las PYMES, al disminuir
                los costes en talento y facilitar la accesibilidad a aplicaciones
                y soluciones de inteligencia artificial.
              </p>
            </details>
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
          {/* "ecosistema avanzado de herramientas de IA" iba aquí en <b>,
              pintado en rosa. Se quita el realce: ocupaba línea y media de
              un párrafo de cinco, así que en el móvil no se leía como un
              énfasis dentro de la frase sino como un segundo titular
              debajo del titular. Un destacado que abarca un tercio del
              texto ya no destaca nada — solo parte el párrafo en dos.
              La frase entera va ahora del mismo color que el resto. */}
          <p className="iia__metodo-entrada">
            OYSTERS AI se apalanca en un ecosistema avanzado de herramientas de
            IA, que cubre desde la escucha digital y la generación de contenido
            innovador hasta la distribución orgánica, la monitorización y el
            análisis en tiempo real de los contenidos.
          </p>
        </TextoArena>

        <div className="iia__mapa" ref={mapaRef}>
          {/* ---- EL HILO DE LA CADENA ----
              Va DENTRO del mapa porque se posiciona contra él, y
              solo se monta en móvil: en escritorio quien cuenta el
              recorrido son el anillo y las cuatro curvas, y una
              línea vertical más ahí no significaría nada.
              Sus medidas las pone el efecto del hilo (arriba). */}
          {esMovil && (
            <span className="iia__hilo" ref={hiloRef} aria-hidden="true" />
          )}

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
                esCadena={esMovil}
                esFin={a === APARTADOS[APARTADOS.length - 1]}
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
                esCadena={esMovil}
                esFin={a === APARTADOS[APARTADOS.length - 1]}
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
/* Pinta LAS DOS versiones —la de escritorio y la de móvil— y deja
   que el CSS enseñe la que toca en cada ancho. Se hace así, y no
   condicionando con JS, porque el punto de corte es el mismo 1079
   que ya usan las curvas: mantenerlo en un solo sitio (el CSS)
   evita que dos sistemas se desincronicen, que es el problema que
   documenta el comentario del breakpoint.

   El coste es unos nodos de más en el DOM; a cambio, no hay
   ningún salto al cambiar de tamaño ni un re-render por resize. */
/* ============================================================
   EL ACORDEÓN DE HERRAMIENTAS (MÓVIL)

   Abrir un paso cierra el que estuviera abierto, y las dos cosas
   ocurren a la vez y con recorrido: uno se pliega mientras el
   otro se despliega.

   ---- POR QUÉ ESTO ES CÓDIGO Y NO CSS ----
   La primera versión lo resolvía sin JS: `name` compartido en los
   <details> para la exclusividad, y `::details-content` +
   `interpolate-size` para animar la altura. Funciona, es elegante
   y se queda en dos reglas... en Chrome 131+. En Safari y Firefox
   la apertura salía instantánea, o sea que la mitad del encargo
   —que la animación se note— no llegaba a la mitad de la gente.

   Medir con la API de animaciones da el MISMO gesto en todos los
   navegadores, que es lo que se pedía. El precio es tener que
   hacer a mano lo que el elemento hacía solo, incluida la
   exclusividad: `name` se retira a propósito, porque al abrir un
   paso el navegador cerraría al instante a su compañero y se
   llevaría por delante la animación de cierre a media reproducción.

   El <details> se queda como elemento: sigue dando el plegado
   accesible y el teclado (Intro y Espacio sobre la cabecera
   disparan un click, así que caen en este mismo manejador).
   ============================================================ */
const ACORDEON_MS = 420;
const ACORDEON_CURVA = "cubic-bezier(.22,.8,.36,1)";

/* el mismo 1079 que usan el CSS y los conectores */
const ACORDEON_MOVIL = "(max-width: 1079px)";

const consulta = (q) =>
  typeof window !== "undefined" && window.matchMedia(q).matches;

/* Anima un paso midiendo sus DOS alturas reales —la de la fila
   sola y la del conjunto con las etiquetas—, que es la única
   forma de que valga igual para el paso de 4 herramientas y el de
   11 sin escribir ninguna altura a mano. */
function animarPaso(det, abrir) {
  /* si venía animándose (alguien pulsa rápido), esa animación se
     descarta antes de medir: si no, se mediría a media altura */
  det.__anim?.cancel();
  det.__anim = null;

  /* La cabecera que queda a la vista al plegar. Se busca como
     `summary` hijo directo y no por su clase: así la misma función
     sirve para los pasos del recorrido y para Misión/Visión, que
     no comparten clase pero sí la estructura que aquí importa
     —un <details> con su cabecera y, debajo, lo que se despliega—. */
  const fila = det.querySelector(":scope > summary");
  if (!fila) return;

  const desde = det.getBoundingClientRect().height;

  /* abierto para poder medir el total. Al CERRAR ya lo estaba, y
     tiene que seguir estándolo durante todo el recorrido: es lo
     que mantiene las etiquetas a la vista mientras se pliegan. */
  det.open = true;

  const hasta = abrir
    ? det.getBoundingClientRect().height
    : fila.getBoundingClientRect().height;

  det.style.overflow = "hidden";

  const anim = det.animate(
    [{ height: `${desde}px` }, { height: `${hasta}px` }],
    { duration: ACORDEON_MS, easing: ACORDEON_CURVA, fill: "forwards" },
  );
  det.__anim = anim;

  anim.onfinish = () => {
    /* el orden importa: primero se pliega de verdad y DESPUÉS se
       suelta el `fill`. Al revés, la altura volvería a `auto` —o
       sea, a la de abierto— durante el fotograma que va hasta que
       `open` pasa a false, y se vería un parpadeo. */
    if (!abrir) det.open = false;
    anim.cancel();
    det.style.overflow = "";
    det.__anim = null;
  };
}

/* ============================================================
   EL MISMO ACORDEÓN, DOS GRUPOS INDEPENDIENTES

   Este manejador lo comparten los cuatro pasos del recorrido y el
   par Misión/Visión. No es que se parezcan: es literalmente el
   mismo código, para que si mañana se cambia la curva o la
   duración cambien los dos a la vez.

   ---- POR QUÉ EL GRUPO ES UN PARÁMETRO ----
   Lo único que no pueden compartir es con quién compiten. La
   exclusividad se hace a mano (ver arriba por qué se retiró
   `name`), y con un selector fijo los seis plegables serían un
   solo acordeón: abrir "Nuestra Visión" cerraría "Contenido
   impulsado por IA", que está en otro bloque, más abajo y fuera de
   pantalla. El usuario vería colapsar algo que no ha tocado y que
   ni siquiera está mirando.

   Así que cada bloque pasa el suyo y los dos acordeones se ignoran
   entre sí. Dentro de cada uno sí hay exclusividad: abrir Misión
   cierra Visión, igual que abrir un paso cierra a sus compañeros.

   `raiz` sigue acotando a `.iia` y no al documento porque esta
   sección se monta en dos sitios —la portada y "Cómo lo
   hacemos"—, y sin acotar, abrir en una cerraría en la otra.
   ============================================================ */
function alPulsarPlegable(e, grupo) {
  /* En escritorio no hay nada que animar: los pasos son
     `display: contents` (sin caja que medir) con el cajón oculto, y
     Misión/Visión nacen abiertos y con la cabecera sin ratón. Se
     deja pasar el comportamiento nativo. */
  if (!consulta(ACORDEON_MOVIL)) return;

  e.preventDefault();

  const det = e.currentTarget.parentElement;
  const raiz = det.closest(".iia") ?? document;
  const abrir = !det.open;

  const hermanos = [...raiz.querySelectorAll(`${grupo}[open]`)].filter(
    (otro) => otro !== det
  );

  /* con movimiento reducido no hay recorrido: se abre y se cierra
     en seco, que es justo lo que pide la preferencia */
  if (consulta("(prefers-reduced-motion: reduce)")) {
    hermanos.forEach((otro) => (otro.open = false));
    det.open = abrir;
    return;
  }

  hermanos.forEach((otro) => animarPaso(otro, false));
  animarPaso(det, abrir);
}

/* ============================================================
   UN PASO DEL RECORRIDO

   La misma tarjeta sirve para los dos anchos, y el reparto es
   este:

     · dentro de <summary> va TODO lo que se ve sin abrir —el
       icono, el titular, el texto y la cuenta de herramientas—,
       porque es lo único que el escritorio enseña;
     · fuera, como contenido del <details>, van solo las
       etiquetas, que en escritorio están ocultas.

   Por eso NO hace falta forzar `open` en escritorio: allí el
   contenido plegable no aporta nada, y el CSS le quita a la
   cabecera el cursor y la flecha para que se lea como lo que era,
   una tarjeta normal. En móvil, en cambio, la fila entera es el
   interruptor —tocar en cualquier punto abre—, que es mucho mejor
   diana que un enlace de texto.
   ============================================================ */
function Tarjeta({
  icono: Icono,
  numero,
  titulo,
  texto,
  resumen,
  herramientas,
  esCadena,
  esFin,
  refCb,
}) {
  /* ---- QUIÉN ABRE Y QUIÉN CIERRA ----
     Se toma el control del toggle para poder animar los dos pasos
     implicados; el navegador, por su cuenta, abre y cierra en seco.
     La mecánica está en alPulsarPlegable, que comparte con
     Misión/Visión; aquí solo se dice contra quién compite este
     plegable — los otros tres pasos, y nadie más. */
  /* ---- EN LA CADENA NO HAY NADA QUE PLEGAR ----
     El móvil enseña las herramientas puestas, así que el plegable
     nace abierto y aquí se le corta el paso: preventDefault sobre
     el click del <summary> cancela el toggle nativo, y como pulsar
     Intro con el foco encima también dispara un click, cubre
     ratón, dedo y teclado con una sola línea. Escritorio conserva
     su acordeón intacto. */
  const alPulsarFila = (e) => {
    if (esCadena) {
      e.preventDefault();
      return;
    }
    alPulsarPlegable(e, "details.iia__paso");
  };

  return (
    <article
      className="iia__tarjeta"
      ref={refCb}
      /* `numero` ya no se PINTA —se retiró el distintivo—, pero
         sigue siendo el que ordena: en móvil las tarjetas llegan
         repartidas en dos columnas y este es el valor que las
         recoloca (ver `order` en el CSS). */
      style={{ "--paso": Number(numero) }}
      /* marca el ÚLTIMO paso. Va como dato y no con
         `:last-of-type` porque las tarjetas viven repartidas en
         DOS columnas del DOM (el reparto de escritorio), y ese
         selector marcaba como última a la de cada columna. */
      data-fin={esFin || undefined}
      /* y el PRIMERO, por el mismo motivo: en la cadena es quien
         no lleva filete encima ni relleno superior. */
      data-inicio={numero === "01" || undefined}
    >
      {/* SIN `name`: la exclusividad la lleva alPulsarFila (ver el
          bloque del acordeón, arriba). Con `name`, el navegador
          cerraría al compañero de golpe y se comería su animación
          de cierre. */}
      {/* El nodo del hilo. Va FUERA del <details> y no dentro del
          summary porque se posiciona contra la tarjeta —se sale
          por su izquierda, sobre el hilo—, y porque el número es
          el mismo dato que ya ordenaba los pasos en móvil: hasta
          ahora estaba en el DOM sin verse. En escritorio se
          apaga. */}
      <span className="iia__paso-numero" aria-hidden="true">
        {numero}
      </span>

      <details className="iia__paso" open={esCadena || undefined}>
        <summary className="iia__paso-fila" onClick={alPulsarFila}>
          <span className="iia__tarjeta-icono" aria-hidden="true">
            <Icono strokeWidth={1.7} />
          </span>

          <div className="iia__tarjeta-cuerpo">
            <h3>
              <span>{titulo[0]}</span>
              <span>{titulo[1]}</span>
            </h3>

            {/* escritorio */}
            <p className="iia__tarjeta-texto">{texto}</p>

            {/* móvil */}
            <p className="iia__tarjeta-resumen">{resumen}</p>

            {/* La flecha va AQUÍ y no al borde de la tarjeta: lo
                que se abre son las herramientas, así que el
                indicador tiene que estar donde está la promesa.
                Al borde derecho quedaba flotando a media altura,
                sin decir qué desplegaba. */}
            <p className="iia__tarjeta-cuenta">
              {herramientas.length} herramientas
              <ChevronRight className="iia__paso-flecha" aria-hidden="true" />
            </p>
          </div>
        </summary>

        {/* --t alimenta el escalonado de la entrada en CSS: las
            etiquetas no aparecen de golpe, entran una detrás de
            otra. Con motion reducido el CSS lo desactiva. */}
        <ul className="iia__tarjeta-tags">
          {herramientas.map((h, i) => (
            <li key={h} style={{ "--t": i }}>
              {h}
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}

export default InteligenciaIA;
