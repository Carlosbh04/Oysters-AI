import { useEffect } from "react";

/* ============================================================
   EL TELÓN DE NÁCAR — la entrada al hacer scroll

   La pieza no se mueve ni se funde: SE DESCUBRE. Un corte recto
   sube revelándola, y en el borde del corte viaja un filo de
   perla que se apaga al llegar arriba. Desde el primer fotograma
   lo que se ve está nítido y en su sitio; lo único que cambia es
   cuánto de ello se ve.

   ---- POR QUÉ UN LISTENER Y NO UN INTERSECTIONOBSERVER ----
   Esta es la razón de fondo y conviene que no se pierda:
   `clip-path` e IntersectionObserver NO se llevan. La intersección
   se calcula DESPUÉS de aplicar el recorte, así que una pieza
   recortada a altura cero no interseca nunca — no se enciende,
   luego no se desrecorta. El estado oculto impide su propio
   disparo, y parece que la animación está rota cuando en realidad
   no llega a empezar.

   `getBoundingClientRect()` no tiene ese problema: devuelve la
   caja de MAQUETACIÓN, y `clip-path` sólo afecta al pintado. Por
   eso se mide con un listener de scroll y se puede recortar la
   misma pieza que se mide, sin envolver nada — que es lo que
   descarta usar <Reveal>, cuyo div extra rompe cualquier flex o
   grid al que se le meta dentro.

   ---- POR QUÉ NO SE USA <Reveal> ----
   Además de lo anterior: en `.iia__mapa` las tarjetas son hijas
   directas de un flex —las columnas van en `display: contents`— y
   su orden lo pone `order`. Un div de más entre medias rompe las
   tres cosas a la vez.

   ---- EL FALLO SEGURO ES "VISIBLE" ----
   Todo el CSS cuelga de `data-telon`, que pone este hook. Si el JS
   no corre —o si hay movimiento reducido—, el atributo no llega,
   no hay recorte y el contenido se ve puesto. Nunca al revés.
   ============================================================ */

/* La línea de agua. 0,88 y no 0,5: el telón se descubre nada más
   asomar la pieza por abajo, no cuando ya está a media pantalla —
   a media pantalla el visitante ya la ha visto entrar recortada. */
const LINEA = 0.88;

/**
 * @param {object}   raizRef   ref al contenedor que se observa
 * @param {string}   piezas    selector de lo que se descubre
 * @param {string}   conFilo   cuáles llevan además el filo de nácar
 * @param {boolean}  activo    normalmente `esMano`: fuera, ni se monta
 */
function useTelonNacar(raizRef, { piezas, conFilo = "", activo = true } = {}) {
  useEffect(() => {
    if (!activo) return undefined;

    const raiz = raizRef.current;
    if (!raiz) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lista = Array.from(raiz.querySelectorAll(piezas));
    if (!lista.length) return undefined;

    for (const pieza of lista) {
      pieza.setAttribute("data-telon-pieza", "");
      if (conFilo && pieza.matches(conFilo)) {
        pieza.setAttribute("data-telon-filo", "");
      }
    }

    raiz.setAttribute("data-telon", "");

    /* Los desplazamientos se cachean respecto a la raíz y durante
       el scroll sólo se pregunta dónde está ella: UNA caja por
       fotograma en vez de una por pieza. */
    let topes = [];
    const medir = () => {
      const base = raiz.getBoundingClientRect().top;
      topes = lista.map((p) => p.getBoundingClientRect().top - base);
    };

    let pedido = false;
    const pintar = () => {
      pedido = false;
      const base = raiz.getBoundingClientRect().top;
      const marca = window.innerHeight * LINEA;

      /* ---- EL TELÓN NO SE VUELVE A ECHAR ----
         Aquí había un `else removeAttribute("data-ver")`: al subir,
         la pieza que bajaba de la línea perdía el atributo y se
         RE-ESCONDÍA. Y la línea está al 88%, no en el borde: entre
         ella y el borde de abajo hay ~100px de pantalla, así que un
         texto que se estaba leyendo desaparecía de golpe delante
         del lector. Medido: tras bajar y subir un poco, el rótulo
         de «Qué hacemos» quedaba a opacidad 0 con su caja en
         pantalla.

         El descubrimiento es de ida: una pieza vista queda vista.
         Es además lo que el resto del sitio ya asume — el CSS de
         la salida («se aleja») documenta que en reposo estas
         piezas llevan `data-ver` puesto, y su variante para
         piezas del telón lo EXIGE en el selector: al re-esconderse,
         la salida dejaba de aplicarse a mitad de gesto.

         La entrada se repite en cada montaje de la página, que es
         cuando se espera verla; no en cada pasada de scroll. */
      for (let i = 0; i < lista.length; i++) {
        if (base + topes[i] < marca) lista[i].setAttribute("data-ver", "");
      }
    };

    const alMover = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(pintar);
    };

    medir();
    pintar();

    window.addEventListener("scroll", alMover, { passive: true });
    const ro = new ResizeObserver(() => {
      medir();
      pintar();
    });
    ro.observe(raiz);

    return () => {
      window.removeEventListener("scroll", alMover);
      ro.disconnect();
      raiz.removeAttribute("data-telon");
      for (const pieza of lista) {
        pieza.removeAttribute("data-telon-pieza");
        pieza.removeAttribute("data-telon-filo");
        pieza.removeAttribute("data-ver");
      }
    };
  }, [raizRef, piezas, conFilo, activo]);
}

export default useTelonNacar;
