import { useEffect } from "react";

/* ============================================================
   LOS BOTONES FLOTANTES SE APARTAN DEL PIE

   En la mano hay dos controles fijos en las esquinas de abajo: la
   perla de volver arriba (derecha) y, en /contact, el desplegable
   de canales (izquierda). Al llegar al final de la página, los
   dos quedaban a la misma altura que la fila legal del pie
   —«Privacidad | Aviso legal»— uno a cada lado, enmarcándola como
   dos paréntesis rosas. No llegaban a solaparse, y aun así se
   leía mal: dos círculos grandes de color abrazando la letra
   pequeña.

   ---- APARTARSE, NO ESCONDERSE ----
   Lo fácil habría sido apagarlos al ver el pie. Sería peor: el
   final de la página es justo donde MÁS falta hace volver arriba,
   y quitarlo ahí es quitarlo en el único momento en que se busca.

   Así que se apartan: suben lo justo para dejar la fila legal
   libre y se quedan ahí. Nada aparece ni desaparece — solo se
   corren.

   ---- CÓMO SE CALCULA ----
   Se mide dónde está el borde de arriba de la fila legal. Si
   sube por encima de donde descansan los botones, se les pide que
   suban esa diferencia más un respiro. Como la fila legal deja de
   moverse cuando la página toca fondo, la subida se acota sola —
   no hace falta ningún tope inventado.

   El resultado se escribe en `--flotante-sube`, del que tiran los
   dos botones en su `bottom`. Un solo número en la raíz para los
   dos: así no pueden descoordinarse, y quien monte un tercer
   botón flotante mañana solo tiene que sumarlo a su `bottom`.
   ============================================================ */

/* lo que descansan los botones sobre el borde inferior, sin
   contar el área segura. Es el mismo 22 que declaran los dos en
   su CSS; si allí cambia, aquí también. */
const REPOSO = 22;

/* aire entre el botón ya subido y la fila legal */
const RESPIRO = 14;

const FILA_LEGAL = ".pie__legales";

/* ---- LA POSICIÓN DE REPOSO, NO LA DE AHORA ----
   `getBoundingClientRect()` incluye los transforms, y el pie entra
   con uno (`pie--dentro`). Midiéndolo con el rect, la cuenta salía
   con la fila 18px más abajo de donde iba a quedarse, y los
   botones subían de menos: medido en /contact, se quedaban 4px
   POR ENCIMA de la línea legal, o sea todavía pisándola.

   La cadena de `offsetTop` da la posición de MAQUETACIÓN, que es
   la definitiva, y no se entera de la animación. Es el mismo
   recurso —y el mismo tropiezo— que el aterrizaje del menú
   (useIrASeccion.js). */
function arribaEnReposo(el) {
  let y = 0;
  let n = el;
  while (n) {
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return y;
}

export default function useApartarDelPie() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    /* solo en la mano: en escritorio no hay botones flotantes que
       apartar (la perla no se monta y los canales van en el flujo) */
    const mano = window.matchMedia("(max-width: 1079px)");
    if (!mano.matches) return undefined;

    const raiz = document.documentElement;
    let pedido = false;

    const pintar = () => {
      pedido = false;

      const fila = document.querySelector(FILA_LEGAL);
      if (!fila) {
        raiz.style.setProperty("--flotante-sube", "0px");
        return;
      }

      /* cuánto asoma la fila legal por encima del borde inferior */
      const asoma =
        window.innerHeight - (arribaEnReposo(fila) - window.scrollY);

      /* si asoma menos de lo que descansan los botones, no estorba */
      const sube = Math.max(0, asoma + RESPIRO - REPOSO);

      raiz.style.setProperty("--flotante-sube", `${Math.round(sube)}px`);
    };

    const alMover = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(pintar);
    };

    pintar();

    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);

    /* el pie cambia de sitio cuando el documento cambia de alto:
       entran imágenes, se despliegan bloques */
    const ro = new ResizeObserver(alMover);
    ro.observe(document.documentElement);

    return () => {
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
      ro.disconnect();
      raiz.style.removeProperty("--flotante-sube");
    };
  }, []);
}
