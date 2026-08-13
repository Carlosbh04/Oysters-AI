/* ============================================================
   NOMBRE DE LA RUTA PARA EL HEADER

   Traduce la ruta actual al rótulo que se teclea en el centro
   de la píldora.

   ---- MAPA PRIMERO, DERIVACIÓN DESPUÉS ----
   Las rutas conocidas tienen su nombre escrito a mano, porque
   algunas no coinciden con su URL —"/" no se llama "HOME" sino
   con el eslogan— y otras podrían querer un rótulo distinto al
   segmento.

   Lo que no esté en el mapa se deduce del primer segmento en
   mayúsculas. Así una ruta nueva funciona el día que se cree,
   sin tener que acordarse de tocar este archivo: si mañana
   aparece /servicios, el header dirá SERVICIOS solo.
   ============================================================ */

const NOMBRES = {
  "/": "LOOKING SHARP TODAY",
  "/works": "WORKS",
  /* sin esto el rótulo se deduciría del segmento y diría
     "SERVICES", que es la URL pero no el nombre del apartado */
  "/services": "CÓMO LO HACEMOS",
  "/resources": "RESOURCES",
  "/blog": "BLOG",
  "/about": "ABOUT",
  "/contact": "CONTACT",
  "/fondo-trama": "FONDO TRAMA",
  "/escena-oraculo": "ESCENA ORÁCULO",
};

/* Lo que se enseña cuando no hay ruta que reconocer. Va aquí y
   no repetido en el componente para que solo exista en un sitio. */
export const POR_DEFECTO = NOMBRES["/"];

export function nombreDeRuta(pathname) {
  if (!pathname) return POR_DEFECTO;

  /* la ruta exacta manda */
  const exacta = NOMBRES[pathname.replace(/\/+$/, "") || "/"];
  if (exacta) return exacta;

  /* subrutas: /works/12 hereda el nombre de /works. Sin esto, la
     ficha de un proyecto enseñaría "12". */
  const primero = pathname.split("/").filter(Boolean)[0];
  if (!primero) return POR_DEFECTO;

  const padre = NOMBRES[`/${primero}`];
  if (padre) return padre;

  /* y lo que no conozcamos, del segmento: guiones a espacios y
     a mayúsculas, que es como se escriben el resto de rótulos */
  return primero.replace(/-/g, " ").toUpperCase();
}
