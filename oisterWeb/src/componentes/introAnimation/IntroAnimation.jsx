import { useEffect, useRef, useState } from "react";
import "./IntroAnimation.css";
import LogoOverlay from "../logoOverlay/LogoOverlay.jsx";

const COLORS = {
  bg: "#15161c",
  p1: "#f7b8eb",
  p2: "#f3bdf1",
  p3: "#efc3f8",
};

const DURATION = 3800; // duración total de la animación (ms)
const TEXT = "Oysters·IA";

/* Muestrea el texto en un canvas temporal y devuelve las
   coordenadas de los píxeles encendidos → targets de partículas */
function sampleText(dpr) {
  const tmp = document.createElement("canvas");
  const tctx = tmp.getContext("2d");
  tmp.width = window.innerWidth;
  tmp.height = window.innerHeight;

  const fontSize = Math.min(window.innerWidth * 0.11, 140);
  tctx.fillStyle = "#fff";
  tctx.font = `500 ${fontSize}px "Space Grotesk", sans-serif`;
  tctx.textAlign = "center";
  tctx.textBaseline = "middle";
  tctx.fillText(TEXT, window.innerWidth / 2, window.innerHeight / 2);

  const data = tctx.getImageData(0, 0, tmp.width, tmp.height).data;
  const points = [];
  const step = 6; // densidad de muestreo

  for (let y = 0; y < tmp.height; y += step) {
    for (let x = 0; x < tmp.width; x += step) {
      if (data[(y * tmp.width + x) * 4 + 3] > 128) {
        points.push({ x: x * dpr, y: y * dpr });
      }
    }
  }
  return points;
}

function IntroAnimation({ onFinish }) {
  const canvasRef = useRef(null);
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

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

    const resize = () => {
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };

    const init = () => {
      resize();
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
      const progress = Math.min(elapsed / DURATION, 1);

      // fases: 0→0.55 ensamblaje · 0.55→0.75 disolución · resto salida
      const assembleEnd = 0.55;
      const dissolveEnd = 0.75;
      let dissolve = 0;

      if (progress > assembleEnd && progress < dissolveEnd) {
        dissolve = (progress - assembleEnd) / (dissolveEnd - assembleEnd);
      } else if (progress >= dissolveEnd) {
        dissolve = 1;
      }

      // fondo con trail (borrado parcial → estelas)
      ctx.fillStyle = "rgba(21,22,28,0.25)";
      ctx.fillRect(0, 0, W, H);

      // glow ambiental central, se apaga con el progreso
      const glowAlpha = Math.max(0, 0.25 - progress * 0.25);
      const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.4);
      grd.addColorStop(0, `rgba(247,184,235,${glowAlpha})`);
      grd.addColorStop(1, "rgba(21,22,28,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      const activeNodes = nodes.filter((n) => elapsed > n.born);

      // conexiones neuronales (solo mientras no se disuelve)
      if (dissolve < 0.5) {
        ctx.lineWidth = 0.5 * dpr;
        const connectionAlpha = 1 - dissolve * 2;

        for (let i = 0; i < activeNodes.length; i++) {
          for (let j = i + 1; j < activeNodes.length; j++) {
            const a = activeNodes[i];
            const b = activeNodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 70 * dpr;

            if (dist < maxDist) {
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

      // aparición del logo tipográfico tras la disolución
      if (progress > 0.7 && progress <= 0.85) {
        setLogoOpacity((progress - 0.7) / 0.15);
      } else if (progress > 0.85) {
        setLogoOpacity(1);
      }

      if (progress >= 1) {
        // salida: fade del conjunto y aviso al padre
        if (!finished) {
          finished = true;
          setFadeOut(true);
          setTimeout(() => {
            if (typeof onFinish === "function") onFinish();
          }, 800); // coincide con la transición de .is-leaving en CSS
        }
        return; // detener bucle
      }

      rafId = requestAnimationFrame(draw);
    };

    const start = () => {
      init();
      startTime = performance.now();
      rafId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      // recalcular targets del texto si cambia el tamaño en pleno vuelo
      if (rafId && !finished) {
        cancelAnimationFrame(rafId);
        start();
      }
    };

    window.addEventListener("resize", handleResize);

    // arrancar cuando la fuente esté lista (si no, el muestreo
    // del texto se hace con la fuente fallback y sale deforme)
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) start();
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [onFinish]);

  return (
    <section className={`intro-animation ${fadeOut ? "is-leaving" : ""}`}>
      <canvas ref={canvasRef} />
      <LogoOverlay opacity={logoOpacity} />
    </section>
  );
}

export default IntroAnimation;