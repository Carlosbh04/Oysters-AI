import "./Reveal.css";
import { useEffect, useRef, useState } from "react";

/* ===== Reveal =====
   Envuelve CUALQUIER componente y le da entrada animada
   cuando entra en pantalla (IntersectionObserver). Reversible:
   al salir del viewport se oculta, al volver reaparece.

   Uso:
   <Reveal><MiSeccion /></Reveal>
   <Reveal delay={0.2} variant="left"><Card /></Reveal>
   <Reveal variant="blur" once><Titulo /></Reveal>

   Props:
   · variant: "up" (default) | "left" | "right" | "blur" | "fade"
   · delay: segundos de retardo (para cascadas manuales)
   · once: true → anima solo la primera vez (no se re-oculta)
   · threshold: cuánto debe verse para disparar (0–1, def 0.2) */
function Reveal({
  children,
  variant = "up",
  delay = 0,
  once = false,
  threshold = 0.2,
  className = "",
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={`reveal reveal--${variant} ${
        shown ? "reveal--shown" : ""
      } ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default Reveal;