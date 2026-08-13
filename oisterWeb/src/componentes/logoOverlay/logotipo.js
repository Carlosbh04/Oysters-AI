/* ============================================================
   EL LOGOTIPO DEL INTRO, ESCRITO UNA SOLA VEZ

   De aquí lo sacan los dos que lo necesitan: LogoOverlay para
   teclearlo letra a letra e IntroAnimation para muestrear sus
   píxeles en un canvas —las partículas forman el texto EXACTAMENTE
   donde después se escribe— y para saber cuántas piezas hay que
   teclear.

   ---- POR QUÉ UN ARCHIVO PARA ESTO ----
   El texto estaba escrito en DOS sitios y además en dos formas
   distintas —una cadena para el canvas y un array para el tipeo—,
   más dos números a mano: el total de piezas y el índice donde
   empieza "AI". Cuatro cosas que tenían que cuadrar entre sí y
   que nadie ataba. Por ahí se coló un "OISTER" sin la Y, que
   llegó a producción y sobrevivió justamente porque corregirlo
   en un sitio no corregía el otro.

   Ahora las cuatro se derivan de las dos constantes de abajo:
   cambiar la marca es cambiar la palabra y ya está.

   Y va en un módulo aparte, no exportado desde LogoOverlay.jsx,
   porque el lint del repo lo exige: un archivo de componente que
   además exporta constantes rompe el fast refresh
   (react-refresh/only-export-components).
   ============================================================ */

const MARCA = "OYSTERS";
const SUFIJO = "AI";

/* Las PIEZAS que se teclean, en orden: cada letra por separado y
   el espacio como una más — el tipeo revela de una en una y el
   cursor se coloca entre ellas. */
export const TEXTO = [...MARCA, " ", ...SUFIJO];

/* lo mismo en cadena, que es lo que sabe pintar un canvas */
export const TEXTO_PLANO = TEXTO.join("");

/* Dónde empieza el sufijo, que se pinta destacado. Sale de la
   longitud de la marca (+1 por el espacio) y no de un número
   escrito a mano, que es lo que había: con "OISTER" valía 7 y al
   pasar a "OYSTERS" habría que haberse acordado de subirlo a 8 —
   si no, la S final se pintaría con el estilo de "AI". */
export const INICIO_SUFIJO = MARCA.length + 1;
