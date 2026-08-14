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

   ---- EL MODO `ratio`: PARA ELEMENTOS DE ALTURA CONOCIDA ----
   Lo anterior vale para SECCIONES altas. Para piezas acotadas
   (la pista de aterrizaje, el cristal, un grid de cards) lo que
   se quiere decir es "cuando se vea el X% DE LA PIEZA", y eso sí
   es un ratio. Con `ratio: 0.45` el encendido pasa a ser
   `intersectionRatio >= 0.45` (con thresholds [0, ratio, 1]) y
   el margen no aplica. El apagado asimétrico es el mismo en los
   dos modos. Antes este modo vivía copiado a mano en HowWeWork
   y tres veces en LatestProjects, cada copia con su ratio.
   ============================================================ */
function useEnPantalla({ margen = "0px 0px -35% 0px", umbral = 0, ratio = 0 } = {}) {
  const ref = useRef(null);
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const opciones = ratio > 0
      ? { threshold: [0, ratio, 1] }
      : { threshold: umbral, rootMargin: margen };

    const observador = new IntersectionObserver(
      ([entrada]) => {
        const visible = ratio > 0
          ? entrada.intersectionRatio >= ratio
          : entrada.isIntersecting;

        if (visible) setDentro(true);
        else if (entrada.boundingClientRect.top > 0) setDentro(false);
      },
      opciones
    );

    observador.observe(el);
    return () => observador.disconnect();
  }, [margen, umbral, ratio]);

  return [ref, dentro];
}

export default useEnPantalla;
