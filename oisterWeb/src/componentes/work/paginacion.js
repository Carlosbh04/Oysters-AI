/* ============================================================
   REGLAS DE PAGINACIÓN DE /works

   ---- POR QUÉ ESTO VIVE EN SU PROPIO ARCHIVO ----
   Hay DOS componentes que necesitan saber exactamente lo mismo
   —cuántas cards toca pintar— y no se pueden importar entre sí:

     · WorkList.jsx  → pinta las cards de verdad. Va en el chunk
                       de WorkPage, que se carga aparte.
     · WorksSkeleton → pinta el hueco MIENTRAS ese chunk llega.
                       Va en el bundle principal, porque tiene
                       que existir antes de que exista WorkList.

   Si el skeleton importara WorkList para leerle el número, se
   traería la página entera al bundle principal y la carga
   diferida dejaría de servir de nada.

   Y ya pasó lo contrario: el skeleton llevaba `[0, 1, 2]` a
   mano, con un comentario que decía "mismo número que
   trabajos.js (3), si se añade uno ajustar aquí". Nadie lo
   ajustó. Con la paginación puesta, el skeleton enseñaba 3
   huecos y luego aparecían 6 cards en la página 1 y 1 sola en la
   página 2 — 447px de salto en un caso y una fila que se
   evaporaba en el otro.

   Con las reglas aquí, los dos leen del mismo sitio y no pueden
   discrepar.
   ============================================================ */

/* La aritmética (total de páginas, acotado defensivo) vive en
   utils/paginacion.js desde que el blog la necesita también:
   aquí solo queda lo específico de /works — su tamaño de página
   y su parámetro de URL. */
import {
  totalDePaginas as totalCon,
  paginaEnRango,
} from "../../utils/paginacion";

/* Cuántas tarjetas caben en una página. La rejilla es de 3
   columnas en escritorio, así que 6 son DOS FILAS completas: con
   un múltiplo del número de columnas la última fila nunca queda
   coja. Si algún día la rejilla pasa a 4 columnas, este número
   debería subir a 8 por el mismo motivo. */
export const POR_PAGINA = 6;

/* Nombre del parámetro en la URL: /works?pagina=3 */
export const PARAM_PAGINA = "pagina";

export function totalDePaginas(cuantosTrabajos) {
  return totalCon(cuantosTrabajos, POR_PAGINA);
}

/* `busqueda` acepta lo que devuelve useSearchParams() y también
   el location.search en crudo: URLSearchParams traga los dos. */
export function paginaActual(busqueda, cuantosTrabajos) {
  const pedida = Number.parseInt(
    new URLSearchParams(busqueda).get(PARAM_PAGINA),
    10
  );

  return paginaEnRango(pedida, cuantosTrabajos, POR_PAGINA);
}

/* Cuántas cards se van a pintar realmente. Casi siempre es
   POR_PAGINA, pero la ÚLTIMA página va corta: con 7 trabajos, la
   página 2 tiene una sola. Es justo el número que el skeleton
   necesita para no dejar huecos de más. */
export function cardsEnPagina(busqueda, cuantosTrabajos) {
  const n = paginaActual(busqueda, cuantosTrabajos);
  const restantes = cuantosTrabajos - (n - 1) * POR_PAGINA;

  return Math.max(0, Math.min(POR_PAGINA, restantes));
}
