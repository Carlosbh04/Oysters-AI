import { useEffect, useRef, useState } from "react";
import oraculo from "../../assets/hero/oraculo.webp";
import "./EscenaOraculo.css";

/* ============================================================
   ESCENA ORÁCULO — corredor de datos con figura de mármol

   Un busto clásico con venda iridiscente a la derecha, y a su
   izquierda un corredor de luz que se pierde en un punto de fuga,
   con poliedros de alambre flotando y barras de neón sueltas.

   ---- QUÉ ES IMAGEN Y QUÉ ES CÓDIGO ----
   Lo ÚNICO que es imagen es la figura (`oraculo.webp`, con alfa
   real: el 61% de su lienzo es transparente y el resplandor
   violeta viene integrado en el canal alfa, así que se funde con
   el fondo sin recorte visible).

   Todo lo demás está dibujado: el corredor, la rejilla del suelo,
   los poliedros, las barras y las partículas. Así la escena se
   adapta a cualquier proporción de pantalla —una imagen se
   recortaría por donde no toca— y pesa unos pocos KB.

   ---- EL PUNTO DE FUGA MANDA ----
   Casi toda la geometría nace del mismo punto (--eo-fuga-x/y).
   Los rayos salen de ahí, la rejilla converge ahí y el
   resplandor está centrado ahí. Moviendo esas dos variables se
   recoloca la escena entera de forma coherente; tocando cada
   pieza por separado, se rompe la perspectiva enseguida.
   ============================================================ */

/* Rayos del corredor. Se generan en vez de escribirse a mano
   porque son treinta y dos y solo cambian en ángulo, longitud y
   opacidad — a mano serían 32 líneas de ruido. */
/* ---- POR QUÉ 54 Y NO 32 ----
   Con 32 se veían los rayos uno a uno y el resultado parecía un
   sol dibujado. En la referencia no se distingue ninguno: lo que
   se lee es una MASA de luz saliendo del fondo, con algunos
   trazos destacando por delante. Hace falta densidad.

   Y el abanico se abre a 128° (era 68°): en la referencia la luz
   sale hacia arriba, hacia los lados y hacia el suelo, no en una
   franja horizontal. */
const RAYOS = Array.from({ length: 54 }, (_, i) => {
  const t = i / 53;
  const ang = -64 + t * 128;

  /* longitudes muy dispares y con huecos: unos pocos rayos largos
     que cruzan la escena y muchos cortos pegados al núcleo. Si
     todos midieran parecido, el borde exterior dibujaría un arco
     y volvería a leerse como abanico. */
  const semilla = (i * 37) % 100;
  const largo = semilla > 78 ? 62 + (semilla % 34) : 14 + (semilla % 38);

  /* los rayos casi horizontales son los más brillantes: son los
     que marcan la dirección del corredor */
  const horizontalidad = 1 - Math.min(Math.abs(ang) / 64, 1);
  const op = (0.08 + ((i * 53) % 55) / 150) * (0.45 + horizontalidad * 0.75);

  return { ang, largo, op, ancho: semilla > 88 ? 2.4 : semilla > 60 ? 1.4 : 0.8 };
});

/* Barras de neón sueltas: los destellos alargados del fondo. En %
   sobre la caja, con su propio ancho y brillo. */
const BARRAS = [
  { x: 2, y: 41, w: 13, op: 0.9 }, { x: 0, y: 47, w: 8, op: 0.55 },
  { x: 4, y: 55, w: 17, op: 0.85 }, { x: 1, y: 63, w: 10, op: 0.5 },
  { x: 6, y: 70, w: 14, op: 0.75 }, { x: 0, y: 79, w: 19, op: 0.9 },
  { x: 9, y: 86, w: 11, op: 0.6 }, { x: 3, y: 92, w: 15, op: 0.7 },
  { x: 27, y: 44, w: 6, op: 0.45 }, { x: 31, y: 74, w: 7, op: 0.5 },
  { x: 86, y: 13, w: 9, op: 0.8 }, { x: 90, y: 22, w: 6, op: 0.55 },
  { x: 88, y: 57, w: 8, op: 0.65 }, { x: 93, y: 66, w: 5, op: 0.4 },
];

/* Poliedros de alambre. `caras` son polígonos en una caja de
   100×100 que luego se escala; así el mismo dibujo sirve a
   cualquier tamaño. */
const OCTAEDRO = ["50,4 92,50 50,96 8,50", "50,4 50,96", "8,50 92,50"];
const ICOSAEDRO = [
  "50,3 88,26 88,74 50,97 12,74 12,26",
  "50,3 12,74", "50,3 88,74", "50,97 12,26", "50,97 88,26",
  "12,26 88,74", "12,74 88,26",
];

const POLIEDROS = [
  { x: 71, y: 2, s: 11, forma: ICOSAEDRO, op: 0.5, giro: 12 },
  { x: 85, y: 17, s: 8, forma: OCTAEDRO, op: 0.42, giro: -8 },
  { x: 47, y: 60, s: 15, forma: ICOSAEDRO, op: 0.34, giro: 4 },
  { x: 12, y: 10, s: 6, forma: OCTAEDRO, op: 0.45, giro: 18 },
  { x: 60, y: 8, s: 5, forma: OCTAEDRO, op: 0.3, giro: -14 },
  { x: 78, y: 40, s: 6, forma: ICOSAEDRO, op: 0.28, giro: 9 },
];

/* Cristales macizos diminutos, los que se leen como esquirlas */
const ESQUIRLAS = Array.from({ length: 18 }, (_, i) => ({
  x: 8 + ((i * 4271) % 62),
  y: 6 + ((i * 2833) % 82),
  s: 5 + ((i * 7) % 9),
  op: 0.25 + ((i * 31) % 50) / 100,
  giro: (i * 47) % 360,
}));

/* Motas del campo de partículas */
const MOTAS = Array.from({ length: 46 }, (_, i) => ({
  x: ((i * 1733) % 1000) / 10,
  y: ((i * 977) % 1000) / 10,
  s: 1 + ((i * 13) % 3),
  op: 0.2 + ((i * 29) % 60) / 100,
}));

function EscenaOraculo({ className = "", animar = true }) {
  const raizRef = useRef(null);

  /* El caso "no hay observador" se resuelve en el estado INICIAL,
     no dentro del efecto: puesto allí habría un primer render
     apagado y un setState inmediato después (mismo criterio que
     Revelar.jsx). */
  const [dentro, setDentro] = useState(
    () => !animar || typeof IntersectionObserver === "undefined"
  );

  useEffect(() => {
    if (!animar) return;
    const el = raizRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.2) setDentro(true);
        else if (!e.isIntersecting) setDentro(false);
      },
      { threshold: [0, 0.2] }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [animar]);

  return (
    <div
      ref={raizRef}
      className={`eo ${dentro ? "eo--dentro" : ""} ${className}`}
    >
      {/* ---- corredor de luz ----
          Los rayos se dibujan con un transform-origin en el punto
          de fuga y una rotación por rayo: así todos nacen
          exactamente del mismo sitio sin tener que calcular sus
          coordenadas finales. */}
      <div className="eo__corredor" aria-hidden="true">
        {RAYOS.map((r, i) => (
          <span
            key={i}
            className="eo__rayo"
            style={{
              "--ang": `${r.ang}deg`,
              "--largo": `${r.largo}%`,
              "--op": r.op,
              "--ancho": `${r.ancho}px`,
              "--i": i,
            }}
          />
        ))}
      </div>

      {/* núcleo del punto de fuga: el destello del que sale todo */}
      <div className="eo__nucleo" aria-hidden="true" />

      {/* ---- rejilla del suelo ----
          Un plano en perspectiva con rotateX. Las líneas son un
          repeating-linear-gradient, así que la profundidad la da
          el transform y no hay que dibujar cada una. */}
      <div className="eo__suelo" aria-hidden="true">
        <div className="eo__suelo-rejilla" />
      </div>

      {/* ---- poliedros de alambre ---- */}
      <div className="eo__geometria" aria-hidden="true">
        {POLIEDROS.map((p, i) => (
          <svg
            key={i}
            className="eo__poliedro"
            viewBox="0 0 100 100"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.s}%`,
              opacity: p.op,
              "--giro": `${p.giro}deg`,
              "--i": i,
            }}
          >
            {p.forma.map((puntos, j) => (
              <polyline
                key={j}
                points={puntos}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        ))}

        {ESQUIRLAS.map((e, i) => (
          <span
            key={`e${i}`}
            className="eo__esquirla"
            style={{
              left: `${e.x}%`,
              top: `${e.y}%`,
              width: `${e.s}px`,
              height: `${e.s}px`,
              opacity: e.op,
              "--giro": `${e.giro}deg`,
            }}
          />
        ))}
      </div>

      {/* ---- barras de neón ---- */}
      <div className="eo__barras" aria-hidden="true">
        {BARRAS.map((b, i) => (
          <span
            key={i}
            className="eo__barra"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              opacity: b.op,
              "--i": i,
            }}
          />
        ))}
      </div>

      {/* ---- paneles de cristal ----
          Solo el marco y un relleno casi nulo: son profundidad,
          no objetos. */}
      <span className="eo__panel eo__panel--izq" aria-hidden="true" />
      <span className="eo__panel eo__panel--der" aria-hidden="true" />

      {/* ---- campo de partículas ---- */}
      <div className="eo__motas" aria-hidden="true">
        {MOTAS.map((m, i) => (
          <span
            key={i}
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: `${m.s}px`,
              height: `${m.s}px`,
              opacity: m.op,
            }}
          />
        ))}
      </div>

      {/* ---- la figura ----
          `alt` vacío y aria-hidden: es atmósfera. El PNG ya trae
          su propio resplandor en el alfa, así que no lleva ningún
          filtro encima — añadirle glow por CSS lo duplicaría. */}
      <img
        className="eo__figura"
        src={oraculo}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export default EscenaOraculo;
