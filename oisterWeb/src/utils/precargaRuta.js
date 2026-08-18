/* ============================================================
   UN BUZÓN PARA EL PRECARGADOR DE RUTAS

   App.jsx tiene `getRouteChunk(pathname)`, que sabe qué chunk hay
   que descargar para cada ruta. La persiana lo necesita: mientras
   sus columnas suben hay medio segundo largo en el que la
   pantalla ya no se ve, y es el momento perfecto para ir trayendo
   la página a la que se va.

   ---- POR QUÉ NO SE IMPORTA Y YA ----
   Importar App.jsx desde el hook cierra un círculo:

     App → Header → MobileMenu → useViajeConPersiana → App

   Los módulos en círculo se evalúan a medias y dejan variables
   sin inicializar; funciona hasta el día que deja de funcionar,
   por un cambio de orden que nadie relaciona.

   Con este buzón no hay círculo: App deja aquí su precargador al
   montarse, el hook lo recoge. Los dos apuntan a este módulo y
   este módulo no importa a nadie.

   ---- Y POR QUÉ NO SE COPIA EL MAPA DE RUTAS ----
   Sería más corto duplicar en el hook un `path → import()`. Y
   sería la clase de duplicado que se rompe sola: se añade una
   ruta en App, nadie se acuerda de esta copia, y esa página
   —solo esa— empieza a descubrirse con el esqueleto puesto, sin
   que nada avise.
   ============================================================ */

let precargador = null;

export function registrarPrecarga(fn) {
  precargador = fn;
}

/* Devuelve la promesa de la descarga, o null si nadie ha
   registrado nada todavía (o si esa ruta no va en lazy: las que
   viajan en el bundle inicial no tienen nada que precargar). */
export function precargarRuta(pathname) {
  const traer = precargador?.(pathname);
  return typeof traer === "function" ? traer() : null;
}
