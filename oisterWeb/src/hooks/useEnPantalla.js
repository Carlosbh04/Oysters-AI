import { useEffect, useRef, useState } from "react";

/* ============================================================
   useEnPantalla — ¿está esta sección a la vista?

   Devuelve [ref, dentro]. Se cuelga la ref del elemento y
   `dentro` pasa a true cuando entra en pantalla.

   ---- EL RESET ES ASIMÉTRICO, Y ES A PROPÓSITO ----
   Solo se apaga si el elemento sale del viewport por ABAJO
   (boundingClientRect.top > 0 = has vuelto arriba), de modo que
   al volver a bajar rehace su entrada. Si sale por ARRIBA
   porque sigues bajando, se queda encendido: nadie quiere que
   una sección se apague a su espalda.

   ---- POR QUÉ rootMargin Y NO SOLO threshold ----
   `threshold` es una FRACCIÓN del elemento, así que en un bloque
   alto dispara enseguida: el 20% de 700px son 140px, y con eso
   la entrada entera puede ocurrir mientras el bloque todavía
   asoma por abajo. Medido en "Nosotros", arrancaba 600px antes
   de que su borde superior llegara a pantalla.

   Con un margen inferior negativo el umbral deja de depender de
   lo alto que sea la sección y pasa a ser "su borde superior ha
   subido por encima de tanto por ciento de la ventana", que es
   lo que uno quiere decir en realidad.
   ============================================================ */
function useEnPantalla({ margen = "0px 0px -35% 0px", umbral = 0 } = {}) {
  const ref = useRef(null);
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) setDentro(true);
        else if (entrada.boundingClientRect.top > 0) setDentro(false);
      },
      { threshold: umbral, rootMargin: margen }
    );

    observador.observe(el);
    return () => observador.disconnect();
  }, [margen, umbral]);

  return [ref, dentro];
}

export default useEnPantalla;
