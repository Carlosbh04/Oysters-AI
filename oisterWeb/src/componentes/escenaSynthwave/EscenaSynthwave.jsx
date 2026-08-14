import "./EscenaSynthwave.css";
import { useEffect, useRef, useState } from "react";
import {
  LIENZO,
  HORIZONTE,
  SUELO,
  FUGA,
  aleatorio,
  generarEstrellas,
  generarTraviesas,
  generarTraviesasSecundarias,
  generarVerticales,
  generarVerticalesSecundarias,
  generarBokeh,
  generarVetas,
  nubePath,
} from "./geometria";

/* ============================================================
   ESCENA SYNTHWAVE — SVG puro, por capas

   Paisaje retrowave: cielo, estrellas, nubes, halo, horizonte y
   suelo en perspectiva. Sin imágenes ni dependencias: todo son
   primitivas SVG.

   ---- SIETE GRUPOS, UNO POR CAPA ----
   Cada `<g>` lleva su id y es independiente, así que se puede
   animar por separado desde CSS o JS sin tocar el resto:

       #background-sky   #stars        #clouds-back
       #clouds-front     #horizon-glow #horizon-line
       #ground-grid

   ---- LA GEOMETRÍA VIVE APARTE ----
   En geometria.js. No es por ordenar: ese archivo es el que
   garantiza que el dibujo sea REPETIBLE (generador con semilla,
   no Math.random) y que la perspectiva sea la de verdad y no una
   aproximación a ojo. El porqué de cada fórmula está allí.

   ---- CÓMO SE MONTA ----
       <section className="loQueSea">   // position: relative
         <EscenaSynthwave />
         ...
       </section>
   ============================================================ */

const ESTRELLAS = generarEstrellas();
const TRAVIESAS = generarTraviesas();
const VERTICALES = generarVerticales();
const TRAVIESAS_2 = generarTraviesasSecundarias();
const VERTICALES_2 = generarVerticalesSecundarias();
const BOKEH = generarBokeh();
const VETAS = generarVetas();

/* ---- LAS NUBES ----
   Se reparten a los dos lados y dejan el centro despejado, que
   es donde está el punto de fuga y la parte más brillante del
   halo. Cada entrada genera VARIOS paths superpuestos (ver el
   render): una sola forma se lee como una mancha recortada, no
   como vapor.

   `capa` decide si va detrás o delante; `luz`, cuánto le llega
   del horizonte — las de abajo reciben más. */
const NUBES = [
  { capa: "back", x: -240, y: 286, ancho: 620, alto: 132, bultos: 7, luz: 0.3, semilla: 11 },
  { capa: "back", x: 1220, y: 262, ancho: 660, alto: 145, bultos: 8, luz: 0.28, semilla: 22 },
  { capa: "back", x: -60, y: 186, ancho: 420, alto: 92, bultos: 6, luz: 0.16, semilla: 33 },
  { capa: "back", x: 1300, y: 168, ancho: 450, alto: 100, bultos: 6, luz: 0.15, semilla: 44 },
  /* dos jirones extremadamente tenues en el centro alto: el
     documento señalaba que esa zona seguía vacía. Van con `luz`
     baja y muy anchos para que se lean como bruma lejana, no
     como nubes — ahí arriba una nube con cuerpo taparía el
     campo de estrellas, que es lo que da la sensación de
     profundidad. */
  { capa: "back", x: 430, y: 148, ancho: 480, alto: 46, bultos: 7, luz: 0.08, semilla: 121 },
  { capa: "back", x: 780, y: 118, ancho: 520, alto: 38, bultos: 8, luz: 0.06, semilla: 131 },
  { capa: "front", x: -220, y: 468, ancho: 560, alto: 104, bultos: 8, luz: 0.72, semilla: 55 },
  { capa: "front", x: 1280, y: 458, ancho: 600, alto: 112, bultos: 8, luz: 0.7, semilla: 66 },
  { capa: "front", x: 150, y: 412, ancho: 300, alto: 62, bultos: 5, luz: 0.5, semilla: 77 },
  { capa: "front", x: 1160, y: 404, ancho: 320, alto: 66, bultos: 5, luz: 0.52, semilla: 88 },
];

/* Una nube = tres paths con la misma silueta base pero distinta
   semilla, tamaño y opacidad. Superpuestos y desenfocados dan
   volumen; uno solo, una silueta plana. */
function Nube({ x, y, ancho, alto, bultos, luz, semilla }) {
  const capas = [
    { k: 1, dy: 0, op: 0.5, relleno: "url(#nube-sombra)" },
    { k: 0.82, dy: 10, op: 0.55, relleno: "url(#nube-cuerpo)" },
    { k: 0.6, dy: 22, op: 0.5 + luz * 0.5, relleno: "url(#nube-luz)" },
  ];

  return (
    <g>
      {capas.map((c, i) => {
        const rnd = aleatorio(semilla * 97 + i * 13);
        const w = ancho * c.k;
        return (
          <path
            key={i}
            d={nubePath({
              x: x + (ancho - w) / 2,
              y: y + c.dy,
              ancho: w,
              alto: alto * c.k,
              bultos,
              rnd,
            })}
            fill={c.relleno}
            opacity={c.op}
          />
        );
      })}
    </g>
  );
}

function EscenaSynthwave({ className = "", semillaEstrellas }) {
  const estrellas = semillaEstrellas
    ? generarEstrellas(340, semillaEstrellas)
    : ESTRELLAS;

  const raizRef = useRef(null);

  /* ---- DESTELLOS SOLO CON LA ESCENA A LA VISTA ----
     La única animación de la escena son los ~98 destellos, y
     seguían corriendo con la escena entera fuera del viewport
     (en /contact: scrolleada hasta el pie). Observador SIMÉTRICO
     propio, como LightDust/FondoTrama — useEnPantalla no vale
     aquí a propósito: su reset asimétrico mantendría los
     destellos vivos justo en la única salida realista, por
     ARRIBA hacia el pie. Sin margen de precarga: la pausa por
     play-state conserva la fase, así que reanudar al primer
     píxel visible es invisible, y un margen solo mantendría la
     animación corriendo más tiempo — lo contrario del objetivo.
     Arranca en marcha (estado inicial false): sin observador
     (navegador viejo) todo queda como estaba. */
  const [fuera, setFuera] = useState(false);

  useEffect(() => {
    const el = raizRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observador = new IntersectionObserver(
      ([e]) => setFuera(!e.isIntersecting),
      { threshold: 0 }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <svg
      ref={raizRef}
      className={`escena ${fuera ? "escena--fuera" : ""} ${className}`}
      viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`}
      /* `slice`: la escena CUBRE la caja recortando lo que
         sobre, en vez de encajar dentro dejando franjas. Con
         `meet` aparecerían barras a los lados en pantallas
         anchas. */
      preserveAspectRatio="xMidYMid slice"
      /* decoración pura: ni se anuncia ni recibe foco */
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* ---- cielo: oscuro arriba, magenta al llegar abajo ---- */}
        <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0417" />
          <stop offset="26%" stopColor="#1b0b33" />
          <stop offset="52%" stopColor="#3a1163" />
          <stop offset="74%" stopColor="#6a1a8e" />
          <stop offset="90%" stopColor="#a8248f" />
          <stop offset="100%" stopColor="#d94a9e" />
        </linearGradient>

        {/* variación tonal del cielo: el documento pide que NO
            sea un color plano. Dos manchas muy tenues rompen la
            uniformidad sin que se note de dónde vienen. */}
        <radialGradient id="cielo-aire" cx="24%" cy="18%" r="62%">
          <stop offset="0%" stopColor="#7b3ad6" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#7b3ad6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cielo-aire-2" cx="80%" cy="30%" r="55%">
          <stop offset="0%" stopColor="#c04ad0" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#c04ad0" stopOpacity="0" />
        </radialGradient>

        {/* ---- nubes: sombra, cuerpo y borde iluminado ----
            El degradado va de arriba (oscuro) a abajo (rosa):
            así el lomo queda en sombra y la panza recibe la luz
            del horizonte, que es la única fuente de la escena. */}
        <linearGradient id="nube-sombra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e0b38" />
          <stop offset="100%" stopColor="#4a1a72" />
        </linearGradient>
        <linearGradient id="nube-cuerpo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d1264" />
          <stop offset="60%" stopColor="#7b2a9c" />
          <stop offset="100%" stopColor="#b93fa8" />
        </linearGradient>
        <linearGradient id="nube-luz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b3aa8" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#d95cb4" />
          <stop offset="100%" stopColor="#ffb3e8" />
        </linearGradient>

        {/* ---- halo: tres radiales encadenados ----
            Elipses MUY estiradas, no círculos: el resplandor
            recorre el horizonte, no irradia desde un punto. */}
        <radialGradient id="halo-1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff0fb" stopOpacity="0.95" />
          <stop offset="18%" stopColor="#ffb8ec" stopOpacity="0.7" />
          <stop offset="45%" stopColor="#ff6fd0" stopOpacity="0.34" />
          <stop offset="72%" stopColor="#c93fb4" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#7a2a9e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="halo-2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff8fdd" stopOpacity="0.5" />
          <stop offset="40%" stopColor="#e055c0" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8b2fa8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="halo-3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd9f4" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#ff9ae0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ff6fd0" stopOpacity="0" />
        </radialGradient>

        {/* ---- EL NÚCLEO DEL PUNTO DE FUGA ----
            Una cuarta elipse, pequeña y ceñida al centro. Sube el
            brillo justo donde converge todo sin tocar el resto
            del horizonte: subir el halo grande habría aclarado la
            banda entera y se habría perdido la naturalidad. */}
        <radialGradient id="halo-nucleo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffdff" stopOpacity="0.75" />
          <stop offset="30%" stopColor="#ffd0f2" stopOpacity="0.4" />
          <stop offset="65%" stopColor="#ff9ae0" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ff6fd0" stopOpacity="0" />
        </radialGradient>

        {/* ---- suelo: violeta oscuro que se aclara al fondo ---- */}
        <linearGradient id="suelo-fondo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a1c86" />
          <stop offset="22%" stopColor="#3a1160" />
          <stop offset="100%" stopColor="#14062a" />
        </linearGradient>

        {/* La rejilla se apaga hacia el horizonte: sin esto las
            traviesas del fondo se amontonan en una banda sólida.

            ⚠️ EN BLANCO, NO EN NEGRO. Una <mask> de SVG usa la
            LUMINANCIA por defecto: lo blanco se ve y lo negro se
            oculta, y la opacidad del stop solo gradúa esa
            luminancia. Escrito con `#000` —el reflejo de cómo
            funciona `mask-image` en CSS— la luminancia es 0 en
            todas las paradas y el suelo desaparecía entero. Eso
            pasó: la rejilla no se pintaba y parecía un problema
            de color. */}
        <linearGradient id="desvanecido-suelo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="8%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="20%" stopColor="#fff" stopOpacity="0.72" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        {/* el desvanecido del RESPLANDOR, más corto que el de las
            líneas: el brillo se pierde antes que el trazo */}
        <linearGradient id="desvanecido-halo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="14%" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="34%" stopColor="#fff" stopOpacity="0.48" />
          <stop offset="62%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="mascara-halo">
          <rect
            x="0"
            y={HORIZONTE}
            width={LIENZO.ancho}
            height={SUELO}
            fill="url(#desvanecido-halo)"
          />
        </mask>

        <mask id="mascara-suelo">
          <rect
            x="0"
            y={HORIZONTE}
            width={LIENZO.ancho}
            height={SUELO}
            fill="url(#desvanecido-suelo)"
          />
        </mask>

        {/* ---- desenfoques ---- */}
        <filter id="borrar-nube" x="-30%" y="-60%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id="borrar-nube-suave" x="-30%" y="-60%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="brillo-estrella" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id="brillo-linea" x="-10%" y="-900%" width="120%" height="1900%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="brillo-rejilla" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id="estrella-difusa" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id="polvo" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="veta" x="-30%" y="-400%" width="160%" height="900%">
          <feGaussianBlur stdDeviation="7" />
        </filter>

        {/* ---- NIEBLA DE LA DISTANCIA (punto 6) ----
            Se posa sobre la rejilla en la franja pegada al
            horizonte. Sin ella la cuadrícula llega al fondo con
            el mismo contraste que en primer plano, y eso es lo
            que la hacía parecer "demasiado perfecta": en un
            espacio real, lo lejano pierde contraste antes que
            detalle. */}
        <linearGradient id="niebla-suelo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e79aec" stopOpacity="0.52" />
          <stop offset="12%" stopColor="#d178e4" stopOpacity="0.32" />
          <stop offset="30%" stopColor="#ab5ecf" stopOpacity="0.14" />
          <stop offset="58%" stopColor="#8b47b8" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#7a3aae" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ===== CAPA 1 · CIELO ===== */}
      <g id="background-sky">
        <rect width={LIENZO.ancho} height={LIENZO.alto} fill="url(#cielo)" />
        <rect width={LIENZO.ancho} height={HORIZONTE} fill="url(#cielo-aire)" />
        <rect width={LIENZO.ancho} height={HORIZONTE} fill="url(#cielo-aire-2)" />
      </g>

      {/* ===== CAPA 2 · ESTRELLAS ===== */}
      {/* ===== CAPA 2 · ESTRELLAS =====
           Cuatro tipos, no uno (ver generarEstrellas): polvo
           casi invisible, normales, difusas fuera de foco y unas
           pocas brillantes con resplandor. Un cielo con un solo
           tipo de punto se lee como un patrón, no como estrellas. */}
      <g id="stars" fill="#ffffff">
        {estrellas.map((e, i) => {
          /* Las que destellan llevan su tiempo en variables CSS.
             Va así y no en `style={{animation}}` porque el
             keyframe necesita la opacidad BASE de cada estrella
             para volver a ella tras el chispazo — y esa base es
             distinta en cada una. Con `--o` publicada, un único
             keyframe sirve para las 98. */
          const anim = e.destella
            ? {
                "--o": e.o,
                "--retraso": `${e.retraso}s`,
                "--dur": `${e.duracion}s`,
              }
            : undefined;
          const clase = e.destella ? "escena__destello" : undefined;

          if (e.tipo === "brillante") {
            return (
              <g key={i} className={clase} style={anim}>
                <circle
                  cx={e.x}
                  cy={e.y}
                  r={e.r * 3.2}
                  opacity={e.o * 0.3}
                  filter="url(#brillo-estrella)"
                />
                <circle cx={e.x} cy={e.y} r={e.r} opacity={e.o} />
              </g>
            );
          }

          if (e.tipo === "difusa") {
            return (
              <circle
                key={i}
                className={clase}
                style={anim}
                cx={e.x}
                cy={e.y}
                r={e.r}
                opacity={e.o}
                filter="url(#estrella-difusa)"
              />
            );
          }

          return (
            <circle
              key={i}
              className={clase}
              style={anim}
              cx={e.x}
              cy={e.y}
              r={e.r}
              opacity={e.o}
            />
          );
        })}
      </g>

      {/* ===== CAPA 3 · NUBES (fondo) ===== */}
      <g id="clouds-back" filter="url(#borrar-nube)" opacity="0.6">
        {NUBES.filter((n) => n.capa === "back").map((n, i) => (
          <Nube key={i} {...n} />
        ))}
      </g>

      {/* ===== CAPA 3b · NUBES (frente) ===== */}
      <g id="clouds-front" filter="url(#borrar-nube-suave)" opacity="0.72">
        {NUBES.filter((n) => n.capa === "front").map((n, i) => (
          <Nube key={i} {...n} />
        ))}
      </g>

      {/* ===== CAPA 4 · HALO DEL HORIZONTE =====
           Va DESPUÉS de las nubes: así las ilumina por debajo,
           que es lo que pide el documento. Tres elipses muy
           estiradas, de la más ancha y tenue a la más ceñida y
           brillante. */}
      <g id="horizon-glow">
        <ellipse
          cx={FUGA.x}
          cy={HORIZONTE}
          rx={LIENZO.ancho * 0.78}
          ry={230}
          fill="url(#halo-2)"
        />
        <ellipse
          cx={FUGA.x}
          cy={HORIZONTE}
          rx={LIENZO.ancho * 0.56}
          ry={120}
          fill="url(#halo-1)"
        />
        <ellipse
          cx={FUGA.x}
          cy={HORIZONTE}
          rx={LIENZO.ancho * 0.3}
          ry={34}
          fill="url(#halo-3)"
        />

        <ellipse
          cx={FUGA.x}
          cy={HORIZONTE}
          rx={LIENZO.ancho * 0.14}
          ry={16}
          fill="url(#halo-nucleo)"
        />

        {/* ---- VETAS ----
            Las tres elipses de arriba son concéntricas, así que
            por fuerza se leen como anillos regulares. Estas van
            sueltas: cada una con su largo, grosor, altura,
            posición y opacidad, y ninguna centrada. Es lo que
            convierte el resplandor en un fenómeno atmosférico en
            vez de una decoración dibujada. */}
        <g filter="url(#veta)">
          {VETAS.map((v, i) => (
            <ellipse
              key={i}
              cx={v.cx}
              cy={v.cy}
              rx={v.rx}
              ry={v.ry}
              fill="#ffb3e8"
              opacity={v.o}
            />
          ))}
        </g>
      </g>

      {/* ===== CAPA 5 · LÍNEA DEL HORIZONTE =====
           Fina de verdad (1.6px) con un resplandor por detrás.
           Marca dónde acaba el cielo y empieza el suelo. */}
      <g id="horizon-line">
        <line
          x1="0"
          y1={HORIZONTE}
          x2={LIENZO.ancho}
          y2={HORIZONTE}
          stroke="#ff9ce4"
          strokeWidth="7"
          opacity="0.5"
          filter="url(#brillo-linea)"
        />
        <line
          x1="0"
          y1={HORIZONTE}
          x2={LIENZO.ancho}
          y2={HORIZONTE}
          stroke="#ffe6f9"
          strokeWidth="1.6"
          opacity="0.95"
        />
      </g>

      {/* ===== CAPA 6 · REJILLA DEL SUELO ===== */}
      <g id="ground-grid">
        <rect
          x="0"
          y={HORIZONTE}
          width={LIENZO.ancho}
          height={SUELO}
          fill="url(#suelo-fondo)"
        />

        {/* ---- DOS NIVELES Y DOS PASADAS ----
            Cuatro grupos en total, y cada uno resuelve algo:

            NIVELES (densidad)
              principales  2px al 45%  · la estructura
              secundarias  1px al 15%  · una entre cada dos
            Con un solo nivel la cuadrícula se lee simple; con
            dos, la mirada encuentra detalle sin que la escena se
            recargue, porque las finas apenas pesan.

            PASADAS (presencia)
              halo   grueso y desenfocado
              trazo  fino y sin filtro
            El primer intento tenía un `blur` sobre las propias
            líneas y ése era el fallo: desenfocar una línea la
            vuelve borrosa Y la apaga a la vez, porque reparte la
            misma tinta sobre más píxeles. Un neón real son dos
            cosas, y ninguna capa puede hacer las dos. */}
        <g mask="url(#mascara-suelo)">
          {/* ---- EL HALO, CON SU PROPIO DESVANECIDO ----
              Va enmascarado aparte y más agresivo que las líneas:
              el resplandor es lo que más delata la distancia. Con
              la misma máscara que el trazo, las filas del fondo
              conservaban un brillo que en un espacio real ya se
              habría perdido en el aire.

              Solo lo llevan las principales: dárselo también a
              las secundarias emborronaría el conjunto. */}
          <g
            mask="url(#mascara-halo)"
            stroke="#c46bff"
            strokeWidth="4"
            opacity="0.3"
            filter="url(#brillo-rejilla)"
          >
            {VERTICALES.map((x2) => (
              <line
                key={`v-halo-${x2}`}
                x1={FUGA.x}
                y1={FUGA.y}
                x2={x2}
                y2={LIENZO.alto}
              />
            ))}
            {TRAVIESAS.map((y) => (
              <line key={`h-halo-${y}`} x1="0" y1={y} x2={LIENZO.ancho} y2={y} />
            ))}
          </g>

          {/* secundarias: finas y apagadas, entre las principales */}
          <g stroke="#e9b6ff" strokeWidth="1" opacity="0.15">
            <g className="escena__verticales-2">
              {VERTICALES_2.map((x2) => (
                <line
                  key={`v2-${x2}`}
                  x1={FUGA.x}
                  y1={FUGA.y}
                  x2={x2}
                  y2={LIENZO.alto}
                />
              ))}
            </g>
            <g className="escena__traviesas-2">
              {TRAVIESAS_2.map((y) => (
                <line key={`h2-${y}`} x1="0" y1={y} x2={LIENZO.ancho} y2={y} />
              ))}
            </g>
          </g>

          {/* principales */}
          <g stroke="#e9b6ff" strokeWidth="2" opacity="0.45">
            <g className="escena__verticales">
              {VERTICALES.map((x2) => (
                <line
                  key={x2}
                  x1={FUGA.x}
                  y1={FUGA.y}
                  x2={x2}
                  y2={LIENZO.alto}
                />
              ))}
            </g>

            <g className="escena__traviesas">
              {TRAVIESAS.map((y) => (
                <line key={y} x1="0" y1={y} x2={LIENZO.ancho} y2={y} />
              ))}
            </g>
          </g>
        </g>

        {/* ---- NIEBLA DE LA DISTANCIA ----
            Va ENCIMA de la rejilla, no debajo: su trabajo es
            restarle contraste a lo lejano, y eso solo funciona
            si se interpone. Sin ella la cuadrícula llega al
            horizonte igual de definida que en primer plano, que
            es lo que la hacía parecer demasiado perfecta. */}
        <rect
          x="0"
          y={HORIZONTE}
          width={LIENZO.ancho}
          height={SUELO}
          fill="url(#niebla-suelo)"
        />
      </g>

      {/* ===== CAPA 12 · POLVO ATMOSFÉRICO =====
           Bokeh muy desenfocado entre el cielo y el suelo. Mete
           un plano intermedio: sin él la escena solo tiene fondo
           y frente. Va al 5-10% de opacidad — por encima deja de
           leerse como aire y parecen manchas. */}
      <g id="atmosphere" filter="url(#polvo)">
        {BOKEH.map((m, i) => (
          <circle
            key={i}
            cx={m.x}
            cy={m.y}
            r={m.r}
            fill="#ffc2f0"
            opacity={m.o}
          />
        ))}
      </g>
    </svg>
  );
}

export default EscenaSynthwave;
