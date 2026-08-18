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
  "/resources": "GEN AI TRAINING",
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

/* ============================================================
   Y LOS NOMBRES DE LA MANO

   Son OTROS, y no por descuido. Arriba está el vocabulario del
   rótulo tecleado de escritorio, que es el que había y va en
   inglés —"WORKS", "GEN AI TRAINING"—. En el móvil, el centro de
   la píldora dice en qué apartado estás, y ahí tiene que decir lo
   mismo que el menú por el que has llegado: si el menú dice
   "Trabajos", la cabecera no puede decir "WORKS".

   Van en ESTE archivo, junto a los otros, y no en el componente:
   el primer intento fue una segunda lista dentro de
   SeccionEnCurso, y dos listas del mismo dato acaban
   desincronizadas en cuanto alguien añade una ruta en una sola.
   Aquí se ven las dos de un vistazo.

   El texto de la portada NO se repite: es POR_DEFECTO, el mismo
   eslogan de arriba. Sale del mismo sitio en los dos anchos.
   ============================================================ */
const NOMBRES_MANO = {
  "/works": "Trabajos",
  "/contact": "Contacto",
  "/blog": "Blog",
  "/resources": "Formación IA",
  "/services": "Cómo lo hacemos",
};

export function nombreDeRutaEnMano(pathname) {
  if (!pathname) return POR_DEFECTO;

  const limpia = pathname.replace(/\/+$/, "") || "/";
  if (limpia === "/") return POR_DEFECTO;

  if (NOMBRES_MANO[limpia]) return NOMBRES_MANO[limpia];

  /* subrutas: /works/alsea hereda de /works */
  const primero = pathname.split("/").filter(Boolean)[0];
  if (primero && NOMBRES_MANO[`/${primero}`]) return NOMBRES_MANO[`/${primero}`];

  /* lo que no esté aquí cae al vocabulario de escritorio, que sí
     deduce del segmento: una ruta nueva dirá algo desde el primer
     día, aunque sea en la otra voz. Mejor eso que el silencio —
     que es como se coló el fallo que hubo que corregir. */
  return nombreDeRuta(pathname);
}
