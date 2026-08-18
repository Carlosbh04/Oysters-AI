import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { nombreDeRutaEnMano } from "./rutasNombres";

/* ============================================================
   SECCIÓN EN CURSO — lo que va en el centro de la píldora

   La píldora mide 359px en un móvil de 390 y dentro sólo hay un
   logo de 38 y una hamburguesa de 48: quedaban 273px de degradado
   sin nada. El rótulo central existía —"LOOKING SHARP TODAY"—
   pero se ocultaba por debajo de 420px, así que en el móvil de
   verdad el hueco estaba siempre vacío.

   El arreglo no es encoger la píldora: es darle algo que decir.
   Aquí el centro lleva la sección que estás mirando, y va
   cambiando conforme bajas. La píldora conserva su tamaño porque
   ahora se lo ha ganado.

   ---- LAS SECCIONES SE LEEN DEL CONTENIDO ----
   Los nombres de las SECCIONES no están escritos aquí: se toman
   de los rótulos que ya abren cada una —los mismos que se ven en
   pantalla—, así que si cambia el orden, el texto o el número,
   esto se entera solo.

   Los de las RUTAS sí son una lista, pero no una nueva: es
   `rutasNombres`, la que ya usaba el rótulo tecleado de
   escritorio. Ver abajo.

   ---- Y SIN LEER CAJAS EN CADA FOTOGRAMA ----
   Las posiciones se miden UNA vez —en coordenadas de documento, no
   de ventana— y durante el scroll sólo se compara `scrollY` contra
   esos números. Cero lecturas forzadas de maquetación mientras se
   desplaza. Se vuelven a medir al cambiar de tamaño, al cambiar de
   ruta y cuando el documento cambia de alto (imágenes que cargan,
   bloques que se despliegan).
   ============================================================ */

/* los dos rótulos que usa el sitio: el componente <Rotulo> y el
   del bloque de inteligencia, que tiene el suyo propio */
const ROTULOS = ".rotulo, .iia__rotulo-centro";

/* ============================================================
   EL NOMBRE DE LA PÁGINA — NO SE ESCRIBE AQUÍ

   Aquí hubo una segunda lista de rutas, y sobraba: `rutasNombres`
   ya existía con el mapa completo, con la herencia de subrutas
   —/works/alsea hereda de /works— y con la deducción del segmento
   para lo que no esté en el mapa. Es la misma que teclea el
   rótulo de escritorio.

   Mantener dos listas del mismo dato es exactamente lo que
   condena a que se desincronicen: bastaba con que alguien añadiera
   una ruta en una y no en la otra para que la cabecera dijera una
   cosa en escritorio y otra en la mano. Se usa la que ya estaba.
   ============================================================ */

function SeccionEnCurso() {
  const { pathname } = useLocation();
  const [nombre, setNombre] = useState(null);

  useEffect(() => {
    let vivo = true;
    let textos = [];
    let topes = [];
    let pedido = false;

    /* el nombre de partida: nada en la portada, el de la ruta en
       cualquier otra. Es lo que se ve mientras no se haya pasado
       ningún rótulo de sección. */
    let base = nombreDeRutaEnMano(pathname);

    const medir = () => {
      base = nombreDeRutaEnMano(pathname);
      const rotulos = Array.from(document.querySelectorAll(ROTULOS));
      textos = rotulos.map((r) => r.textContent.trim().replace(/\s+/g, " "));
      topes = rotulos.map((r) => window.scrollY + r.getBoundingClientRect().top);
    };

    const mirar = () => {
      pedido = false;
      if (!vivo) return;

      /* La línea de decisión va al 45% de la ventana y no al borde
         de arriba: si estuviera pegada a la cabecera, el nombre
         cambiaría en cuanto el rótulo se metiera DEBAJO de la
         píldora — o sea, justo cuando deja de verse. A media
         altura cambia cuando la sección ocupa de verdad la
         pantalla. */
      const linea = window.scrollY + window.innerHeight * 0.45;

      /* se arranca del nombre de la ruta y lo pisa el último
         rótulo que haya cruzado la línea. En /services, que sí
         tiene rótulos, se ve "Cómo lo hacemos" hasta llegar al
         primero y a partir de ahí manda la sección. */
      let actual = base;
      for (let i = 0; i < topes.length; i++) {
        if (topes[i] < linea) actual = textos[i];
      }

      setNombre((previo) => (previo === actual ? previo : actual));
    };

    const alMover = () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(mirar);
    };

    const rehacer = () => {
      medir();
      mirar();
    };

    medir();
    mirar();

    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", rehacer);

    /* El alto del documento cambia después del primer trazado:
       entran imágenes, se despliegan bloques, llegan las fuentes.
       Sin esto, los topes se quedarían con las posiciones del
       primer instante y el nombre cambiaría a destiempo. */
    const ro = new ResizeObserver(rehacer);
    ro.observe(document.documentElement);

    return () => {
      vivo = false;
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", rehacer);
      ro.disconnect();
    };
    /* pathname en las dependencias: al cambiar de ruta el
       documento es otro, con otros rótulos en otros sitios. */
  }, [pathname]);

  /* Red de seguridad: si por lo que sea no hay nombre, no se
     pinta una píldora con un hueco raro en medio. Con
     `rutasNombres` esto no debería ocurrir nunca —siempre
     devuelve algo, aunque sea deducido del segmento—, pero el
     centro de la cabecera no es sitio para un `undefined`. */
  if (!nombre) return null;

  return (
    <p className="header__seccion" aria-hidden="true">
      {/* key: fuerza el reinicio de la animación de entrada al
          cambiar de sección. Sin él, React reutiliza el nodo, la
          animación no vuelve a correr y el texto cambia de golpe. */}
      <span key={nombre} className="header__seccion-texto">
        {nombre}
      </span>
    </p>
  );
}

export default SeccionEnCurso;
