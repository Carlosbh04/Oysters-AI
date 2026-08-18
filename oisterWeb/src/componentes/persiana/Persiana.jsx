import { useSyncExternalStore } from "react";
import { leerFase, suscribir } from "./persianaEstado";
import "./Persiana.css";

/* ============================================================
   PERSIANA INVERSA — la transición entre páginas

   Cinco columnas suben escalonadas hasta tapar la pantalla y,
   cuando la página nueva ya está montada detrás, SE RETIRAN EN
   ORDEN INVERSO y hacia arriba, descubriéndola de abajo a arriba.

   ---- POR QUÉ EL ORDEN SE INVIERTE ----
   Si las columnas se fueran en el mismo orden en que vinieron, y
   por donde vinieron, se leería como la misma animación puesta
   del revés — un deshacer, no un avanzar. Cambiando las dos
   cosas (la última en llegar es la primera en irse, y salen por
   arriba en vez de bajar) el gesto se lee como que la persiana
   SIGUE su camino en lugar de volver sobre sus pasos.

   ---- SIEMPRE MONTADA, NUNCA null ----
   Tentador devolver null cuando no hay viaje, y está mal: al
   montar el elemento con la fase ya puesta, el navegador no tiene
   fotograma de partida que interpolar y las columnas aparecerían
   tapando de golpe, sin transición. Montada siempre y sin fase,
   las columnas están a scaleY(0): no ocupan nada, no capturan el
   ratón y no pintan un solo píxel.
   ============================================================ */

const COLUMNAS = 5;

function Persiana() {
  /* la herramienta de React para leer algo que vive fuera de su
     árbol; ver persianaEstado.js para el porqué del almacén */
  const fase = useSyncExternalStore(suscribir, leerFase, leerFase);

  return (
    <div
      className="persiana"
      data-fase={fase || undefined}
      /* decorativa de principio a fin: quien navega con lector de
         pantalla ya recibe el cambio de página por la ruta, y
         anunciar además "cinco columnas" sería ruido */
      aria-hidden="true"
    >
      {Array.from({ length: COLUMNAS }, (_, i) => (
        /* --c es el índice: de él salen los dos escalonados, el de
           subida y el de bajada (ver Persiana.css). Con esto,
           cambiar COLUMNAS aquí arriba basta — no hay que ir a
           escribir una regla nth-child por columna. */
        <i key={i} style={{ "--c": i }} />
      ))}
    </div>
  );
}

export default Persiana;
