import { useEffect, useRef, useState, useId } from "react";
import "./FondoTrama.css";

/* ============================================================
   FONDO TRAMA — tira ancha tecnológica

   Degradado violeta → magenta → rosa, retícula de puntos, trazas
   de circuito con codos a 45°, dos hexágonos recortados por los
   bordes y cintas de luz difusas cruzando en diagonal.

   ---- POR QUÉ NO ES UNA IMAGEN ----
   El PNG de referencia pesa cientos de KB, no se repite sin
   costura y se pixela al estirarlo. Esto son ~4 KB de marcado que
   escalan a cualquier ancho y toman el color de sus variables, así
   que si cambia la paleta el fondo la sigue solo.

   ---- REPARTO DE CAPAS ----
   El problema de fondo de una tira que puede medir 600px o 2400px
   es que cada elemento se deforma distinto al estirarla. Cada capa
   usa la técnica que lo aguanta:

     retícula     CSS radial-gradient repetido — el punto nunca se
                  vuelve óvalo porque el patrón no se escala, se
                  repite.
     cintas       SVG con preserveAspectRatio="none". Van tan
                  desenfocadas que la deformación es invisible.
     trazas       SVG estirado + vector-effect: la línea conserva
                  1px real aunque el lienzo se estire. Los codos
                  cambian de ángulo unos grados y no se nota.
     nodos        divs redondos posicionados en %. Dentro del SVG
                  estirado saldrían elípticos.
     hexágonos    SVG propio con aspecto fijo, anclado a un borde.
                  Estirados se deformarían de forma evidente.
   ============================================================ */

/* Trazas en el lienzo de referencia 2400×750. Casi todo son tramos
   horizontales unidos por codos a 45°, que es lo que da la lectura
   de "placa de circuito" y no de "rayas". */
const TRAZAS = [
  /* --- grupo izquierdo --- */
  "M0,118 H186 L246,58 H530",
  "M0,172 H124 L174,122 H436 L476,92 H712",
  "M0,252 H62 L112,202 H256",
  "M0,300 H92 L142,250 H302",
  "M296,142 H624 L664,106 H764",
  "M0,392 H150 L196,438 H470",
  "M182,486 H404 L444,526 H706",
  "M118,566 H332 L382,616 H624",
  "M0,660 H210 L256,614 H520",

  /* --- grupo derecho --- */
  "M1246,92 H1502",
  "M1198,302 H1562 L1602,262 H1904",
  "M1402,256 H1752 L1792,216 H2104",
  "M1498,344 H1822 L1862,304 H2400",
  "M1352,522 H1602 L1652,562 H1902",
  "M1702,432 H2002 L2042,472 H2400",
  "M1592,616 H1846 L1892,662 H2400",
  "M2008,124 H2400",
  "M1904,190 H2148 L2192,146 H2400",
];

/* Nodos: el punto luminoso donde una traza nace o muere. En % para
   que caigan en el mismo sitio a cualquier ancho. */
const NODOS = [
  { x: 7.8, y: 15.7, r: 4 }, { x: 20.0, y: 16.3, r: 3 },
  { x: 29.7, y: 11.2, r: 4 }, { x: 33.3, y: 11.2, r: 2.5 },
  { x: 3.9, y: 33.5, r: 3 }, { x: 12.6, y: 26.9, r: 2.5 },
  { x: 42.6, y: 24.9, r: 3.5 }, { x: 51.0, y: 40.3, r: 3 },
  { x: 63.5, y: 34.1, r: 4 }, { x: 76.0, y: 33.9, r: 3 },
  { x: 87.7, y: 32.5, r: 2.5 }, { x: 79.3, y: 57.7, r: 3 },
  { x: 20.5, y: 64.9, r: 3 }, { x: 29.4, y: 70.1, r: 2.5 },
  { x: 5.2, y: 88.0, r: 3 }, { x: 66.4, y: 82.1, r: 3 },
  { x: 93.1, y: 69.9, r: 2.5 },
];

/* Racimos: tres o cuatro puntitos seguidos sobre una traza. Es el
   detalle que hace que el circuito parezca transportar algo. */
const RACIMOS = [
  { x: 30.4, y: 16.3, n: 3 }, { x: 45.5, y: 31.5, n: 4 },
  { x: 58.9, y: 36.7, n: 3 }, { x: 60.6, y: 45.2, n: 3 },
  { x: 70.2, y: 40.1, n: 4 }, { x: 20.6, y: 68.5, n: 3 },
  { x: 80.1, y: 55.1, n: 3 },
];

/* Hexágono suelto: solo el contorno, y a medio salir del encuadre.
   Entero se leería como un icono; recortado se lee como trama. */
function Hexagono({ className }) {
  return (
    <svg className={`ft__hex ${className}`} viewBox="0 0 100 116" aria-hidden="true">
      <polygon
        points="50,2 97,30 97,86 50,114 3,86 3,30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* `aria-hidden`: es atmósfera, no información. Un lector de
   pantalla no tiene nada que anunciar aquí.

   `animar`: las trazas se dibujan solas al entrar la sección en
   pantalla. Se puede apagar para usos donde el fondo ya está a la
   vista desde el principio y la animación no aportaría. */
function FondoTrama({ className = "", animar = true }) {
  /* ---- LOS FILTROS NECESITAN UN ID ÚNICO POR INSTANCIA ----
     Iban fijos ("ft-difuso"), y con una sola copia en la página
     funcionaba. Al montar el fondo en varias secciones a la vez
     eso se rompe: quedan varios elementos con el MISMO id, y
     `url(#id)` resuelve siempre al primero del documento. Todas
     las copias acabarían usando el filtro de la primera y, si esa
     se desmontara, las demás se quedarían sin él.

     useId da un identificador estable y distinto por instancia,
     igual en servidor y en cliente. */
  const uid = useId().replace(/:/g, "");
  const difuso = `ft-difuso-${uid}`;
  const difusoSuave = `ft-difuso-suave-${uid}`;

  const raizRef = useRef(null);

  /* dos estados, porque son dos cosas distintas:

     dentro → el circuito se traza. Se enciende al asomar y se
              APAGA al salir del todo, para que el trazado se
              rehaga en cada pasada.

     activo → el pulso de luz recorre el cable. Solo en la sección
              que ocupa el centro de la pantalla, nunca en dos a
              la vez. */
  /* El caso "no hay observador" se resuelve en el estado INICIAL
     (todo encendido y ya), no dentro del efecto: puesto allí
     habría un primer render apagado y un setState inmediato
     después (mismo criterio que Revelar.jsx). */
  const [dentro, setDentro] = useState(
    () => !animar || typeof IntersectionObserver === "undefined"
  );
  const [activo, setActivo] = useState(
    () => !animar || typeof IntersectionObserver === "undefined"
  );

  useEffect(() => {
    if (!animar) return;

    const el = raizRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    /* ---- 1 · TRAZADO ----
       Enciende al 15% de visibilidad y apaga solo cuando la
       sección sale ENTERA. Sin ese apagado el efecto se vería una
       única vez en toda la sesión. */
    const obsTrazado = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.15) setDentro(true);
        else if (!e.isIntersecting) setDentro(false);
      },
      { threshold: [0, 0.15] }
    );

    /* ---- 2 · PULSO ----
       El rootMargin de -50% arriba y abajo deja el área de
       observación reducida a una LÍNEA en mitad de la pantalla.
       Así `isIntersecting` solo es cierto para la sección que
       cruza ese centro — y como el centro es un único punto, no
       puede haber dos secciones activas a la vez.

       Con un umbral normal no valdría: dos secciones altas pueden
       estar ambas visibles a la vez y las dos pulsarían. */
    const obsPulso = new IntersectionObserver(
      ([e]) => setActivo(e.isIntersecting),
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    obsTrazado.observe(el);
    obsPulso.observe(el);

    return () => {
      obsTrazado.disconnect();
      obsPulso.disconnect();
    };
  }, [animar]);

  return (
    <div
      ref={raizRef}
      className={`ft ${dentro ? "ft--dentro" : ""} ${
        activo ? "ft--activo" : ""
      } ${className}`}
      aria-hidden="true"
    >
      {/* ---- cintas de luz ----
          Trazos gruesos y curvos pasados por un desenfoque fuerte.
          Es lo que da el efecto de seda, y lo que más pesa
          visualmente pese a ser solo cuatro paths. */}
      <svg className="ft__cintas" viewBox="0 0 2400 750" preserveAspectRatio="none">
        <defs>
          <filter id={difuso} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
          <filter id={difusoSuave} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="52" />
          </filter>
        </defs>

        {/* Sobre la base morada oscura el blanco puro se leía como
            un brochazo de tiza. Tintadas de lila, la luz parece
            del propio ambiente y no una capa pegada encima. */}
        <g fill="none" strokeLinecap="round" filter={`url(#${difuso})`}>
          <path d="M-60,300 C420,250 900,120 1500,52" stroke="rgba(214,180,255,.26)" strokeWidth="46" />
          <path d="M-60,430 C480,400 1020,250 1720,140" stroke="rgba(214,180,255,.16)" strokeWidth="30" />
        </g>
        <g fill="none" strokeLinecap="round" filter={`url(#${difusoSuave})`}>
          <path d="M-40,360 C520,330 1080,190 1780,88" stroke="rgba(198,160,255,.18)" strokeWidth="96" />
          <path d="M980,742 C1300,690 1560,600 2000,470" stroke="rgba(198,160,255,.15)" strokeWidth="66" />
        </g>
      </svg>

      {/* ---- retícula de puntos ----
          En su propia capa y no en el SVG: como CSS la repite en
          vez de escalarla, el punto sigue redondo y del mismo
          tamaño mida lo que mida la tira. */}
      <div className="ft__reticula" />

      {/* ---- hexágonos ----
          Aspecto fijo y anclados a un borde: son las dos únicas
          piezas cuya deformación se notaría. */}
      <Hexagono className="ft__hex--izq" />
      <Hexagono className="ft__hex--der" />

      {/* ---- trazas ----
          preserveAspectRatio="none" las estira a lo ancho, y
          vector-effect les conserva el grosor de 1px real. */}
      <svg className="ft__trazas" viewBox="0 0 2400 750" preserveAspectRatio="none">
        {/* pathLength="1" normaliza la longitud de cada traza a la
            unidad. Sin esto habría que medir cada path para darle
            su stroke-dasharray, y las cortas terminarían de
            dibujarse mucho antes que las largas. Con la longitud
            normalizada, todas recorren 1 → 0 y tardan lo mismo. */}
        <g fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke">
          {TRAZAS.map((d, i) => (
            <path key={i} d={d} pathLength="1" style={{ "--i": i }} />
          ))}
        </g>
      </svg>

      {/* ---- pulso ----
          Las MISMAS trazas, en un tono más vivo y tapadas por una
          máscara con una banda estrecha que barre de izquierda a
          derecha en bucle. Solo se ve el tramo de circuito por el
          que pasa la banda, así que da la lectura de una señal
          viajando por el cable.

          Va en una capa aparte y no como estilo de las trazas de
          abajo porque hacen falta las dos a la vez: el trazo
          apagado siempre visible y el brillo recorriéndolo. */}
      <svg className="ft__pulso" viewBox="0 0 2400 750" preserveAspectRatio="none">
        <g fill="none" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke">
          {TRAZAS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>

      {/* ---- nodos y racimos ----
          Fuera del SVG estirado para que sigan siendo círculos. */}
      <div className="ft__puntos">
        {/* los puntos entran DESPUÉS de las trazas: primero se
            tiende el cable y luego se encienden los contactos */}
        {NODOS.map((n, i) => (
          <span
            key={`n${i}`}
            className="ft__nodo"
            style={{ left: `${n.x}%`, top: `${n.y}%`, "--ft-r": `${n.r}px`, "--i": i }}
          />
        ))}
        {RACIMOS.map((c, i) => (
          <span
            key={`c${i}`}
            className="ft__racimo"
            style={{ left: `${c.x}%`, top: `${c.y}%`, "--i": i }}
          >
            {Array.from({ length: c.n }, (_, j) => (
              <i key={j} />
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default FondoTrama;
