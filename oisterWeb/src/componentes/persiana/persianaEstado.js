/* ============================================================
   EL ESTADO DE LA PERSIANA, FUERA DE REACT

   La persiana la pinta un componente montado en la raíz (App), y
   quien la dispara es un enlace del menú, tres niveles más abajo.
   Para que uno hable con el otro había dos caminos:

     · un contexto que envuelva toda la app, o
     · un almacén externo diminuto como este.

   Se elige el segundo. El contexto obligaba a envolver el return
   entero de App —que es largo— solo para pasar un dato que cambia
   tres veces por navegación, y `useSyncExternalStore` es
   exactamente la herramienta que React da para suscribirse a algo
   que vive fuera de su árbol.

   Vive en un módulo y no en un `useState` a propósito: la
   secuencia del viaje (cubrir → navegar → descubrir) tiene que
   sobrevivir a que el menú se desmonte a mitad, y un estado
   colgado del menú se iría con él.
   ============================================================ */

/* null = no hay viaje | "cubrir" = subiendo | "revelar" = bajando */
let fase = null;

const oyentes = new Set();

export const leerFase = () => fase;

export function suscribir(avisar) {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
}

export function ponerFase(nueva) {
  if (nueva === fase) return;
  fase = nueva;
  oyentes.forEach((avisar) => avisar());
}

/* ---- PARA QUE EL ESQUELETO SE APARTE ----
   App muestra un pulso de esqueleto de 1,1s en cada navegación
   interna. Con la persiana tapando, ese pulso no lo ve nadie: son
   1,1 segundos de cortina quieta esperando a un cargador
   invisible. Los dos resuelven lo mismo —cubrir el hueco mientras
   llega la página— así que cuando hay persiana, el esqueleto
   sobra. Ver dónde se consulta en App.jsx. */
export const hayViaje = () => fase !== null;
