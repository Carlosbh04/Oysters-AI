/* ============================================================
   LA ESPIRAL

   Una cinta de luz que envuelve al grupo subiendo desde la peana.
   Es lo que más profundidad da de toda la escena, y por una razón
   concreta: al enrollarse, la cinta pasa POR DETRÁS de la figura
   en su medio giro de atrás y POR DELANTE en el de delante. Un
   objeto que ocluye y es ocluido por lo mismo solo puede estar
   rodeándolo, y el ojo lo resuelve al instante.

   ---- POR QUÉ NO SON ELIPSES ----
   Hubo dos intentos antes, los dos equivocados:

     · elipses anchas y concéntricas, todas a la misma altura: se
       leían como un halo tumbado en el suelo alrededor del
       cristal;
     · elipses altas y estrechas: se leían como aros DE PIE,
       clavados verticalmente alrededor de la figura.

   Ninguna de las dos envuelve. Envolver es SUBIR MIENTRAS SE
   GIRA, y eso es una hélice: cada vuelta es una elipse aplastada
   —aplastada porque se mira desde un poco por encima— y cada una
   está más arriba que la anterior. Por eso el trazado se calcula
   punto a punto en vez de dibujarse con <ellipse>.

   ---- Y POR QUÉ SE PINTA DOS VECES ----
   El componente se monta con la misma geometría en dos capas del
   apilamiento: la de atrás por debajo de las imágenes y la de
   delante por encima. Cada una dibuja solo los tramos que le
   tocan. Si fuera un único dibujo, la espiral se leería como una
   pegatina delante o detrás de todo, que es lo que no se busca.
   ============================================================ */

const CX = 200;

/* Arranca abajo, a la altura de la peana, y sube 2,4 vueltas hasta
   pasar por encima de la cabeza. El paso —lo que sube por vuelta—
   decide si se lee apretada como un muelle o suelta como una
   cinta. */
const BASE = 348;

/* 1,6 vueltas y paso 150: en la referencia la cinta no es un
   muelle de tres espiras juntas sino UNA curva en S que barre del
   podio a la cabeza. Menos vueltas y más subida por vuelta es
   exactamente esa S. */
const VUELTAS = 1.6;
const PASO = 150;

/* RY muy por debajo de RX: cada vuelta se ve casi de canto porque
   la cámara está poco por encima del plano de la espiral. Si RY
   subiera, las vueltas se abrirían en círculos y el conjunto
   volvería a leerse como aros sueltos. */
const RX = 140;
const RY = 38;

/* Se abre un poco al subir, como una voluta. Con radio constante
   se lee como un cilindro de alambre. */
const APERTURA = 0.16;

const PASOS = 260;

/* Devuelve los tramos ya separados en los que van por detrás y los
   que van por delante.

   El criterio es el signo del seno: cuando es negativo el punto
   está en la mitad lejana de la vuelta, y la perspectiva lo sube
   en pantalla. Ese mismo signo decide a la vez dónde cae el punto
   y en qué capa se pinta, así que geometría y oclusión no pueden
   contradecirse. */
function tramos(lejos) {
  const salida = [];
  let actual = null;

  for (let i = 0; i <= PASOS; i++) {
    const u = i / PASOS;
    const t = u * VUELTAS * Math.PI * 2;
    const r = RX * (1 + APERTURA * u);
    const punto = `${(CX + r * Math.cos(t)).toFixed(1)},${(
      BASE +
      RY * Math.sin(t) -
      (t / (Math.PI * 2)) * PASO
    ).toFixed(1)}`;

    if ((Math.sin(t) < 0) === lejos) {
      if (!actual) {
        actual = [];
        salida.push(actual);
      }
      actual.push(punto);
    } else {
      /* un punto de solape al cambiar de mitad: sin él, cada
         cambio dejaría una muesca visible en la cinta */
      if (actual) actual.push(punto);
      actual = null;
    }
  }
  return salida.filter((t) => t.length > 1);
}

function OrbitRings({ capa }) {
  const id = `hbEspiral-${capa}`;
  const trozos = tramos(capa === "atras");

  return (
    <svg
      className={`hb-orbitas hb-orbitas--${capa}`}
      viewBox="0 0 400 400"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* ---- EL BRILLO VA ABAJO, NO A UN LADO ----
            En la referencia la cinta se enciende en su barrido
            frontal inferior —el que abraza el podio— y se apaga
            hacia arriba. Antes el máximo estaba en el lado
            derecho, puesto ahí para no pisar la franja del
            titular, y dejaba las curvas delanteras como hilos
            fantasma.

            El degradado en VERTICAL resuelve las dos cosas a la
            vez: los arcos de arriba —los únicos que entran en la
            franja reservada (que termina en el 68% de alto)— van
            tenues, y el arco del podio, que queda por debajo de
            esa franja, puede ir a plena luz en todo su recorrido,
            también por la izquierda. */}
        <linearGradient id={`${id}-luz`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.1" />
          <stop offset="45%" stopColor="#e9d5ff" stopOpacity="0.3" />
          <stop offset="78%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#e0c9ff" stopOpacity="0.85" />
        </linearGradient>

        <filter id={`${id}-halo`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      {/* el halo primero y el trazo nítido encima: es lo que hace
          que la cinta parezca emitir en vez de estar desenfocada */}
      <g fill="none" stroke={`url(#${id}-luz)`} strokeLinecap="round">
        {trozos.map((p, i) => (
          <polyline
            key={`h${i}`}
            points={p.join(" ")}
            strokeWidth="11"
            opacity="0.5"
            filter={`url(#${id}-halo)`}
          />
        ))}
        {trozos.map((p, i) => (
          <polyline key={`n${i}`} points={p.join(" ")} strokeWidth="2.6" opacity="0.95" />
        ))}
      </g>
    </svg>
  );
}

export default OrbitRings;
