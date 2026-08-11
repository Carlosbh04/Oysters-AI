import { lazy } from "react";

/* ===== lazyWithMin =====
   Como React.lazy, pero con TIEMPO MÍNIMO en pantalla para
   el fallback: la página no resuelve antes de `min` ms,
   aunque el chunk descargue al instante. Así el skeleton
   siempre se VE (un flash de 30ms se percibe como glitch;
   ~600ms se percibe como carga intencionada).

   Uso: const WorksPage = lazyWithMin(() => import("./pages/work/WorkPage"));

   Expone `.preload()`: devuelve la MISMA promesa que usará
   Suspense. Si la página se precarga mientras el skeleton
   está activo, al revelar (skeletonVisible → false) el
   chunk ya está en memoria y Suspense resuelve al instante:
   el fallback no se ve después de que el header entró.

   Nota honesta: esto aplica a la PRIMERA visita de cada
   página (después el chunk queda en memoria y React no
   vuelve a suspender — y está bien: retrasar artificialmente
   contenido ya cargado es anti-patrón; la sensación "brutal"
   en revisitas la pone la animación de entrada, no un loader
   falso). */
const lazyWithMin = (factory, min = 600) => {
  let sharedPromise = null;

  const load = () => {
    if (!sharedPromise) {
      sharedPromise = Promise.all([
        factory(),
        new Promise((resolve) => setTimeout(resolve, min)),
      ]).then(([moduleExports]) => moduleExports);
    }
    return sharedPromise;
  };

  const Lazy = lazy(load);
  Lazy.preload = load;
  return Lazy;
};

export default lazyWithMin;