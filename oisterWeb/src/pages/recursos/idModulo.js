/* ============================================================
   EL ID DE UN MÓDULO

   Nació para el índice pegajoso, que se quitó. Sigue aquí porque
   los `id` de los módulos NO eran suyos: hacen que
   /resources#gt-modulo-04 lleve directamente a ese módulo, que es
   la forma de enlazar un módulo suelto desde fuera. Sin el índice
   siguen valiendo, así que se quedan.

   "02 y 03" no vale como id: los espacios y la conjunción lo
   convierten en un selector inválido. Se queda con el primer
   número, que es el que identifica al bloque.
   ============================================================ */
export function idDe(numero) {
  return String(numero).trim().split(/\s+/)[0];
}
