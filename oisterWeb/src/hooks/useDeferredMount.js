import { useEffect, useState } from "react";

/* ===== useDeferredMount =====
   Devuelve false hasta que se cumplan DOS condiciones:
   1. Ha pasado un mínimo de tiempo (minDelay ms) — deja que
      la animación principal arranque limpia con todo el hilo
   2. El navegador declara un hueco de ociosidad
      (requestIdleCallback) — el trabajo pesado del montaje
      (parseo de GLB, compilación de shaders) cae en calma

   Uso típico: diferir el montaje de un canvas WebGL para que
   no le robe frames al intro que corre por encima.

   const ready = useDeferredMount(1200);
   ...
   {ready && <HeroScene />}
*/
function useDeferredMount(minDelay = 1000) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId = null;
    let cancelled = false;

    const timer = setTimeout(() => {
      /* pasado el mínimo, esperamos el primer hueco ocioso.
         Fallback con setTimeout para Safari, que aún no
         soporta requestIdleCallback */
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(
          () => !cancelled && setReady(true),
          { timeout: 1500 } // techo: nunca esperar de más
        );
      } else {
        idleId = setTimeout(() => !cancelled && setReady(true), 200);
      }
    }, minDelay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (idleId) {
        if ("cancelIdleCallback" in window) {
          window.cancelIdleCallback(idleId);
        } else {
          clearTimeout(idleId);
        }
      }
    };
  }, [minDelay]);

  return ready;
}

export default useDeferredMount;