/* ============================================================
   REGLAS PURAS DE PAGINACIÓN — compartidas por /works y /blog

   Cada sección conserva lo que es SUYO: cuántas piezas caben por
   página y de dónde sale el número en la URL (/works lo lleva en
   ?pagina=, el blog en el segmento /blog/page/N). Lo que aquí
   vive es lo que era idéntico en las dos y estaba escrito dos
   veces: el total de páginas y el acotado defensivo.

   Acotar SIEMPRE al leer: la URL la escribe cualquiera, y una
   página inventada (0, -3, 99, "abc") debe caer dentro de rango
   en vez de dejar la rejilla vacía. Acotar al leer y no al
   guardar cubre además el caso de que la colección encoja
   estando tú en la última página.
   ============================================================ */

export function totalDePaginas(cuantos, porPagina) {
  return Math.max(1, Math.ceil(cuantos / porPagina));
}

/* `pedida` llega ya convertida a número por quien lee la URL
   (cada sección parsea su propio formato); aquí solo se valida y
   se acota. Todo lo que no sea un entero cae en la página 1. */
export function paginaEnRango(pedida, cuantos, porPagina) {
  if (!Number.isInteger(pedida)) return 1;

  return Math.min(Math.max(pedida, 1), totalDePaginas(cuantos, porPagina));
}
