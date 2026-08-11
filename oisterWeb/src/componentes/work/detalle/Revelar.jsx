import { useEffect, useRef, useState } from "react";

/* ============================================================
   REVELAR — aparición al entrar en pantalla

   Envuelve una sección y la hace entrar con fundido + 24px de
   desplazamiento. El escalonado se pasa por `indice`: cada
   sección arranca 80ms después que la anterior.

   ---- SE DESCONECTA AL DISPARAR ----
   `once` no es un detalle de rendimiento: una sección que se
   desvanece al salir de pantalla y vuelve a entrar cada vez que
   subes y bajas convierte el scroll en un parpadeo. Se revela
   una vez y se queda.

   ---- Y ARRANCA VISIBLE SI NO HAY OBSERVADOR ----
   Si IntersectionObserver no existiese, o si el elemento nunca
   llegara a cruzar el umbral, el contenido se quedaría en
   opacidad 0 para siempre. El fallo silencioso más caro de esta
   clase de efectos es ese, así que el estado por defecto cuando
   algo va mal es "visible".
   ============================================================ */

function Revelar({ children, indice = 0, className = "", como: Como = "section" }) {
  const nodo = useRef(null);

  /* El caso "no hay observador" se resuelve en el estado INICIAL
     y no dentro del efecto. Puesto en el efecto habría un primer
     render en opacidad 0 y un setState inmediato después: un
     parpadeo, y además React avisa de ello con razón. */
  const [visto, setVisto] = useState(
    () => typeof IntersectionObserver === "undefined"
  );

  useEffect(() => {
    const el = nodo.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setVisto(true);
        observador.disconnect();
      },
      /* 12% basta: con un umbral alto, una sección más alta que
         la ventana no llega a cumplirlo nunca y no se revela */
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <Como
      ref={nodo}
      className={`wd-revelar ${visto ? "wd-revelar--visto" : ""} ${className}`}
      style={{ "--i": indice }}
    >
      {children}
    </Como>
  );
}

export default Revelar;
