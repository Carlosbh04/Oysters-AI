import "./Reveal.css";
import { useEffect, useRef, useState } from "react";

/* ===== Reveal =====
   Envuelve CUALQUIER componente y le da entrada animada
   cuando entra en pantalla (IntersectionObserver).

   Reset ASIMÉTRICO (por defecto): solo se re-oculta si sale
   del viewport por ABAJO (has vuelto arriba) → al volver a
   bajar rehace su entrada. Si sale por ARRIBA porque sigues
   bajando, se queda visible.
   Con `once` no se re-oculta nunca.

   Props:
   · variant: "up" (default) | "left" | "right" | "blur" | "fade"
   · delay: segundos de retardo (para cascadas manuales)
   · once: true → anima solo la primera vez
   · threshold: cuánto debe verse para disparar (0–1, def 0.2)
   · rootMargin: recorta la zona que cuenta como "en pantalla"

   ---- CUÁNDO HACE FALTA rootMargin ----
   `threshold` es una FRACCIÓN del elemento, así que en un bloque
   alto dispara enseguida: el 20% de 700px son 140px, y con eso
   basta para que la entrada entera ocurra mientras el bloque
   todavía asoma por abajo. Medido en "Nosotros", arrancaba 600px
   antes de que su borde superior llegara a pantalla — a
   velocidad normal de scroll, la cascada acababa antes de que
   nadie la mirara, y la sección parecía no tener animación.

   Con un margen inferior negativo la zona de disparo sube, y el
   umbral pasa a depender de dónde está el elemento en la ventana
   y no de lo alto que sea. Por defecto "0px": no cambia el
   comportamiento de ningún uso existente. */
function Reveal({
  children,
  variant = "up",
  delay = 0,
  once = false,
  threshold = 0.2,
  rootMargin = "0px",
  className = "",
}) {
  const ref = useRef(null);

  /* Sin observador, visible desde el estado inicial: la única
     misión del componente es un efecto de entrada, y su estado
     de fallo no puede ser "contenido invisible para siempre"
     (mismo criterio que Revelar.jsx, la variante de una sola
     pasada que usa el detalle de trabajo). */
  const [shown, setShown] = useState(
    () => typeof IntersectionObserver === "undefined"
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) observer.disconnect();
        } else if (!once && entry.boundingClientRect.top > 0) {
          setShown(false); // salió por abajo: subiste
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

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