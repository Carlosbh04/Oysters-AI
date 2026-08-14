import { useEffect, useRef, useState } from "react";
import "./IntroAnimation.css";
import LogoOverlay from "../logoOverlay/LogoOverlay.jsx";
import { TEXTO_PLANO } from "../logoOverlay/logotipo";

const COLORS = {
  bg: "#15161c",
  p1: "#f7b8eb",
  p2: "#f3bdf1",
  p3: "#efc3f8",
};

/* --- tiempos de la secuencia ---
   PARTICLE_DURATION calza con useDeferredMount de Home.jsx
   (2600): la escena 3D monta justo cuando el rAF de partículas
   se detiene, en la ventana de calma del tipeo (que es DOM
   barato), sin robarle frames. No bajar la una sin revalidar
   la otra. */
const PARTICLE_DURATION = 2600; // partículas: ensamblaje + disolución
const ASSEMBLE_END = 0.62;
const DISSOLVE_END = 0.82;

/* Cuántas piezas hay que teclear. Sale del propio logotipo (ver
   LogoOverlay.jsx, que es donde está escrito) y NO de un número
   a mano: los dos tienen que coincidir exactamente —si sobra,
   el tipeo espera a una letra que no existe; si falta, la última
   no llega a escribirse— y un literal aquí es una copia más que
   mantener sincronizada. */
const TOTAL_CHARS = TEXTO_PLANO.length;
const TYPE_MS = 110; // ms por letra del tipeo
/* Pausa con el logo completo antes de salir.

   Estaba en 600ms y se leía como que la intro SE COLGABA, no
   como una pausa. El motivo: en ese tramo no se mueve nada de
   nada — las partículas ya se han disuelto, el tipeo ha
   terminado y el cursor ni siquiera se renderiza. Pantalla
   totalmente estática justo después de tres segundos de
   movimiento continuo. Medido con capturas seguidas: 636ms con
   la imagen idéntica píxel a píxel.

   Por encima de ~400ms, una pantalla quieta deja de leerse como
   un silencio y pasa a leerse como una avería. 260ms sigue
   dando el respiro para que el logo aterrice, y por debajo del
   umbral en que se percibe como parón. Detrás va el fundido de
   800ms, que SÍ está animado, así que la salida no queda seca. */
const HOLD_MS = 260;
const FADE_MS = 800; // fundido de salida (coincide con .is-leaving)

/* el mismo logotipo que teclea LogoOverlay, en cadena: las
   partículas tienen que formar EXACTAMENTE el texto que luego se
   escribe encima, así que no puede ser otra copia */
const TEXT = TEXTO_PLANO;

/* Muestrea el texto en un canvas temporal y devuelve las
   coordenadas de los píxeles encendidos → targets de partículas.
   El tamaño y peso deben calzar con .logo-overlay__text de
   LogoOverlay.css (clamp(44px, 9vw, 128px) / peso 600): así las
   partículas forman el texto EXACTAMENTE donde luego se teclea
   el logo, sin salto de tamaño entre fase y fase. */
function sampleText(dpr) {
  const tmp = document.createElement("canvas");
  const tctx = tmp.getContext("2d");
  tmp.width = window.innerWidth;
  tmp.height = window.innerHeight;

  const fontSize = Math.max(44, Math.min(window.innerWidth * 0.09, 128));
  tctx.fillStyle = "#fff";
  tctx.font = `600 ${fontSize}px "Outfit", sans-serif`;
  tctx.textAlign = "center";
  tctx.textBaseline = "middle";
  tctx.fillText(TEXT, window.innerWidth / 2, window.innerHeight / 2);

  /* ---- SOLO SE LEE LA FRANJA DEL TEXTO ----
     getImageData copiaba el viewport entero (~8MB a 1080p) para
     leer una banda de texto que ocupa ~10% de esa superficie. Se
     mide el texto y se lee solo su caja con holgura. La rejilla
     de muestreo sigue anclada a las MISMAS coordenadas globales
     (múltiplos de `step` desde 0, redondeando los bordes de la
     caja hacia fuera sobre esa retícula), así que los puntos
     resultantes son idénticos a los del barrido completo. */
  const step = 6; // densidad de muestreo
  const medida = tctx.measureText(TEXT);
  const holgura = fontSize; /* de sobra para ascendentes y trazos */

  const izq = Math.max(
    0,
    Math.floor((tmp.width / 2 - medida.width / 2 - holgura) / step) * step
  );
  const arriba = Math.max(
    0,
    Math.floor((tmp.height / 2 - fontSize - holgura) / step) * step
  );
  const der = Math.min(tmp.width, Math.ceil(tmp.width / 2 + medida.width / 2 + holgura));
  const abajo = Math.min(tmp.height, Math.ceil(tmp.height / 2 + fontSize + holgura));

  const ancho = der - izq;
  const alto = abajo - arriba;
  if (ancho <= 0 || alto <= 0) return [];

  const data = tctx.getImageData(izq, arriba, ancho, alto).data;
  const points = [];

  for (let y = arriba; y < abajo; y += step) {
    for (let x = izq; x < der; x += step) {
      if (data[((y - arriba) * ancho + (x - izq)) * 4 + 3] > 128) {
        points.push({ x: x * dpr, y: y * dpr });
      }
    }
  }
  return points;
}

function IntroAnimation({ onFinish, onLeaving }) {
  const canvasRef = useRef(null);
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [charsShown, setCharsShown] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  /* el callback más reciente en un ref: el efecto de arranque
     queda desacoplado de su identidad — un re-render del padre
     NO vuelve a disparar el intro desde cero */
  const onFinishRef = useRef(onFinish);
  const onLeavingRef = useRef(onLeaving);

  /* temporizadores del tipeo: en refs para poder limpiarlos
     si el componente se desmonta a mitad de secuencia */
  const typeTimerRef = useRef(null);
  const holdTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    onLeavingRef.current = onLeaving;
  }, [onLeaving]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    let W = 0;
    let H = 0;
    let nodes = [];
    let startTime = 0;
    let rafId = null;
    let finished = false;

    /* ---- REJILLA ESPACIAL DE LAS CONEXIONES ----
       El barrido de parejas era todos-contra-todos (~405k
       comparaciones/frame con los 901 nodos activos). Con celdas
       de lado EXACTAMENTE maxDist, dos nodos a menos de maxDist
       caen como mucho a una celda de distancia — también los que
       vuelan fuera del lienzo: la proyección al borde de la
       rejilla nunca separa dos coordenadas más de lo que ya lo
       están, así que el clamp no puede perder parejas, solo
       meter de más en las celdas del borde (y esas las descarta
       la distancia). Mirar la propia celda y las vecinas cubre
       TODAS las parejas posibles del algoritmo original.

       Los arrays se crean UNA vez (en init, que es quien conoce
       el tamaño) y se vacían por frame con length = 0: el camino
       caliente no aloca nada. */
    let celdas = [];
    let celdasCols = 0;
    let celdasFilas = 0;

    /* semivecindario "hacia delante" (E, SO, S, SE): cada pareja
       de celdas distintas se visita desde UNA sola de las dos —
       las cuatro direcciones que faltan (O, NO, N, NE) las cubre
       la celda vecina al llegarle su turno. El índice 0 es la
       propia celda. */
    const VECINA_X = [0, 1, -1, 0, 1];
    const VECINA_Y = [0, 0, 1, 1, 1];

    /* El gradiente del glow se construye UNA vez por tamaño (se
       creaba en cada frame). Sus paradas van con alfa 1 y el
       apagado por progreso lo pone globalAlpha al pintar: la
       interpolación premultiplicada escala linealmente, así que
       el resultado por píxel es idéntico al del gradiente que
       llevaba el alfa dentro. */
    let glowGrd = null;

    const resize = () => {
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";

      glowGrd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.4);
      glowGrd.addColorStop(0, "rgba(247,184,235,1)");
      glowGrd.addColorStop(1, "rgba(21,22,28,0)");
    };

    const init = () => {
      resize();

      /* la rejilla se dimensiona con el lienzo (y se
         redimensiona con él: init corre también en el resize
         real). Celda = maxDist, el mismo 70*dpr del barrido. */
      const lado = 70 * dpr;
      celdasCols = Math.max(1, Math.ceil(W / lado));
      celdasFilas = Math.max(1, Math.ceil(H / lado));
      celdas = Array.from({ length: celdasCols * celdasFilas }, () => []);

      nodes = [];
      const targets = sampleText(dpr);
      const center = { x: W / 2, y: H / 2 };

      // nodo origen: el punto brillante central que late
      nodes.push({
        x: center.x,
        y: center.y,
        r: 3,
        born: 0,
        type: "origin",
      });

      // partículas que viajan desde fuera hasta formar el texto
      const count = Math.min(targets.length, 900);
      targets
        .sort(() => Math.random() - 0.5)
        .slice(0, count)
        .forEach((p) => {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.max(W, H) * 0.6;
          nodes.push({
            x: center.x + Math.cos(angle) * dist,
            y: center.y + Math.sin(angle) * dist,
            tx: p.x,
            ty: p.y,
            r: 1.2 + Math.random() * 0.6,
            born: 400 + Math.random() * 1200,
            color: Math.random() > 0.5 ? COLORS.p2 : COLORS.p3,
            escapeAngle: Math.random() * Math.PI * 2,
            escapeSpeed: 2 + Math.random() * 3,
          });
        });
    };

    const draw = (t) => {
      const elapsed = t - startTime;
      const progress = Math.min(elapsed / PARTICLE_DURATION, 1);

      // fases: 0→0.62 ensamblaje · 0.62→0.82 disolución · resto salida
      let dissolve = 0;

      if (progress > ASSEMBLE_END && progress < DISSOLVE_END) {
        dissolve = (progress - ASSEMBLE_END) / (DISSOLVE_END - ASSEMBLE_END);
      } else if (progress >= DISSOLVE_END) {
        dissolve = 1;
      }

      // fondo con trail (borrado parcial → estelas)
      ctx.fillStyle = "rgba(21,22,28,0.25)";
      ctx.fillRect(0, 0, W, H);

      // glow ambiental central, se apaga con el progreso
      const glowAlpha = Math.max(0, 0.25 - progress * 0.25);
      if (glowAlpha > 0) {
        ctx.globalAlpha = glowAlpha;
        ctx.fillStyle = glowGrd;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      // conexiones neuronales (solo mientras no se disuelve)
      if (dissolve < 0.5) {
        ctx.lineWidth = 0.5 * dpr;
        const connectionAlpha = 1 - dissolve * 2;
        const maxDist = 70 * dpr;
        const maxDist2 = maxDist * maxDist;

        /* vaciado + relleno de la rejilla con los nodos activos
           (mismo filtro que antes: elapsed > born). Sustituye al
           .filter() que alocaba un array por frame. */
        for (let c = 0; c < celdas.length; c++) celdas[c].length = 0;

        for (let k = 0; k < nodes.length; k++) {
          const n = nodes[k];
          if (elapsed <= n.born) continue;

          let cx = (n.x / maxDist) | 0;
          let cy = (n.y / maxDist) | 0;
          if (cx < 0) cx = 0;
          else if (cx >= celdasCols) cx = celdasCols - 1;
          if (cy < 0) cy = 0;
          else if (cy >= celdasFilas) cy = celdasFilas - 1;

          celdas[cy * celdasCols + cx].push(n);
        }

        /* Unicidad, calcada del j = i + 1 del barrido completo:
           dentro de la celda solo hacia delante por orden de
           inserción; entre celdas, solo el semivecindario. Una
           pareja no puede evaluarse dos veces. La distancia va
           al cuadrado como puerta: sqrt solo para las parejas
           que de verdad conectan (el alfa la necesita). */
        for (let cy = 0; cy < celdasFilas; cy++) {
          for (let cx = 0; cx < celdasCols; cx++) {
            const propia = celdas[cy * celdasCols + cx];
            if (!propia.length) continue;

            for (let i = 0; i < propia.length; i++) {
              const a = propia[i];

              for (let v = 0; v < 5; v++) {
                let lista = propia;
                let desde = i + 1;

                if (v > 0) {
                  const nx = cx + VECINA_X[v];
                  const ny = cy + VECINA_Y[v];
                  if (nx < 0 || nx >= celdasCols || ny >= celdasFilas) continue;
                  lista = celdas[ny * celdasCols + nx];
                  desde = 0;
                }

                for (let j = desde; j < lista.length; j++) {
                  const b = lista[j];
                  const dx = a.x - b.x;
                  const dy = a.y - b.y;
                  const dist2 = dx * dx + dy * dy;
                  if (dist2 >= maxDist2) continue;

                  const dist = Math.sqrt(dist2);
                  const alpha =
                    (1 - dist / maxDist) * 0.25 * connectionAlpha * (1 - progress * 0.5);
                  ctx.strokeStyle = `rgba(243,189,241,${alpha})`;
                  ctx.beginPath();
                  ctx.moveTo(a.x, a.y);
                  ctx.lineTo(b.x, b.y);
                  ctx.stroke();
                }
              }
            }
          }
        }
      }

      // partículas
      nodes.forEach((n) => {
        if (elapsed < n.born) return;
        const age = elapsed - n.born;

        if (n.type === "origin") {
          const pulse = 1 + Math.sin(t * 0.005) * 0.3;
          ctx.fillStyle = COLORS.p1;
          ctx.shadowColor = COLORS.p1;
          ctx.shadowBlur = 20 * dpr;
          ctx.globalAlpha = 1 - dissolve;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * dpr * pulse * (1 - dissolve * 0.8), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          return;
        }

        if (dissolve === 0) {
          // ensamblaje: atracción al target
          n.x += (n.tx - n.x) * 0.04;
          n.y += (n.ty - n.y) * 0.04;
        } else {
          // disolución: huida radial
          n.x += Math.cos(n.escapeAngle) * n.escapeSpeed * dpr * dissolve;
          n.y += Math.sin(n.escapeAngle) * n.escapeSpeed * dpr * dissolve;
        }

        const birthAlpha = Math.min(1, age / 400);
        const alpha = birthAlpha * (1 - dissolve);
        if (alpha <= 0) return;

        ctx.fillStyle = n.color;
        ctx.globalAlpha = alpha * (0.7 + Math.sin(t * 0.003 + n.born * 0.01) * 0.3);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * dpr * (1 - dissolve * 0.3), 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      if (elapsed >= PARTICLE_DURATION) {
        /* las partículas terminaron: se detiene el rAF (la escena
           3D puede montar en calma) y arranca el tipeo del logo */
        if (!finished) {
          finished = true;
          cancelAnimationFrame(rafId);
          startTypewriter();
        }
        return;
      }

      rafId = requestAnimationFrame(draw);
    };

    /* tipeo del logo: aparece letra a letra (con cursor), y al
       completar se mantiene un instante, funde el intro y avisa
       al padre (→ revela el home) */
    const startTypewriter = () => {
      setLogoOpacity(1);
      let count = 0;
      typeTimerRef.current = setInterval(() => {
        count += 1;
        setCharsShown(count);
        if (count >= TOTAL_CHARS) {
          clearInterval(typeTimerRef.current);
          holdTimerRef.current = setTimeout(() => {
            /* ---- AVISO DE SALIDA, EN EL MISMO LOTE ----
               `onLeaving` y `setFadeOut` van en el MISMO manejador
               a propósito: React los agrupa en un único commit, así
               que el velo del hero (que cuelga de este aviso, ver
               App.jsx) y la clase de fundido del telón llegan al
               mismo fotograma. Si fueran en commits distintos
               podría colarse un fotograma con el telón ya
               fundiendo y el hero aún destapado. */
            if (typeof onLeavingRef.current === "function") {
              onLeavingRef.current();
            }
            setFadeOut(true);
            fadeTimerRef.current = setTimeout(() => {
              if (typeof onFinishRef.current === "function") {
                onFinishRef.current();
              }
            }, FADE_MS);
          }, HOLD_MS);
        }
      }, TYPE_MS);
    };

    /* dimensiones con las que se muestreó el texto por última
       vez: el resize solo obliga a repetir si cambian de verdad */
    let muestraW = 0;
    let muestraH = 0;
    let muestraDpr = 0;

    const start = () => {
      muestraW = window.innerWidth;
      muestraH = window.innerHeight;
      muestraDpr = window.devicePixelRatio || 1;
      init();
      startTime = performance.now();
      rafId = requestAnimationFrame(draw);
    };

    /* ---- RESIZE, AMORTIGUADO ----
       Recalcular los targets exige re-rasterizar el texto y leer
       sus píxeles a viewport completo (init → getImageData), y
       cada pasada además REINICIA el reloj de la intro. En una
       ráfaga (un arrastre son decenas de eventos; en móvil, el
       colapso de la barra del navegador) eso era un remuestreo
       por evento con la intro congelada en el segundo 0. Solo
       importa el tamaño FINAL: se espera a que la ráfaga pare y
       se reinicia UNA vez — y si las dimensiones reales (viewport
       y dpr, que es lo que init muestrea) no cambiaron, ni eso:
       reiniciar con el mismo tamaño solo tira la intro. */
    let resizeTimer = null;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (cancelled || finished || !rafId) return;
        if (
          window.innerWidth === muestraW &&
          window.innerHeight === muestraH &&
          (window.devicePixelRatio || 1) === muestraDpr
        ) {
          return;
        }
        cancelAnimationFrame(rafId);
        start();
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    /* arrancar cuando la fuente esté lista (si no, el muestreo
       del texto se hace con la fuente fallback y sale deforme).
       Con watchdog: si `document.fonts.ready` nunca resuelve
       (fuente de Google bloqueada/lenta), el intro arranca igual
       a los 2500ms con la fuente fallback — nunca se queda
       colgado en negro sin hacer nada. */
    let cancelled = false;
    let started = false;
    let watchdog = null;

    const kickoff = () => {
      if (cancelled || started) return;
      started = true;
      clearTimeout(watchdog);
      start();
    };

    document.fonts.ready.then(kickoff);
    watchdog = setTimeout(kickoff, 2500);

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
      clearTimeout(resizeTimer);
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(typeTimerRef.current);
      clearTimeout(holdTimerRef.current);
      clearTimeout(fadeTimerRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className={`intro-animation ${fadeOut ? "is-leaving" : ""}`}>
      <canvas ref={canvasRef} />
      {/* cursorApagado va atado al FUNDIDO, no al fin del tipeo:
          así el cursor sigue parpadeando durante la pausa y hay
          algo vivo en pantalla hasta que la intro se va */}
      <LogoOverlay
        opacity={logoOpacity}
        charsShown={charsShown}
        cursorApagado={fadeOut}
      />
    </section>
  );
}

export default IntroAnimation;
