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

/* los rótulos que usa el sitio: el componente <Rotulo>, el del
   bloque de inteligencia —que tiene el suyo propio— y el TITULAR
   de un artículo del blog.

   El titular entra aquí porque en una ficha de blog no hay
   rótulos: la píldora se quedaba diciendo "Blog" de arriba abajo,
   que es cierto y no sirve de nada — ya sabes que estás en el
   blog, lo que se pierde de vista al bajar es EN QUÉ ARTÍCULO.

   Con esto, en cuanto el titular grande sale por arriba, su texto
   pasa a la píldora. El titular no se pierde: cambia de sitio.
   Ver el encogido que lo acompaña en BlogDetailPage.css. */
const ROTULOS = ".rotulo, .iia__rotulo-centro, .bd-titulo";

/* ============================================================
   EL TITULAR NO CABE ENTERO — Y NO DEBE

   La barra deja unos 280px para el título. "La inteligencia
   artificial explicada para todos" son 46 caracteres: recortado
   por letra queda "La inteligencia arti…", que no dice nada y se
   lee como un fallo.

   Se cogen las PRIMERAS PALABRAS enteras que quepan en el
   presupuesto. Cortar por palabra y no por letra es lo que hace
   que el trozo siga significando algo.
   ============================================================ */
const PRESUPUESTO = 38;
const MIN_PALABRAS = 2;
const MAX_PALABRAS = 6;

/* Palabras que NO pueden quedar las últimas: solas dejan la frase
   colgando. Sin esto salían cosas como "Cada empanada, una…" o
   "VTech lanza en…". */
const VACIAS = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas",
  "y", "o", "en", "a", "al", "que", "con", "por", "para", "su", "sus", "lo",
]);

function primerasPalabras(texto = "") {
  const palabras = texto.trim().split(/\s+/);
  const trozo = [];

  for (const palabra of palabras) {
    if (trozo.length >= MAX_PALABRAS) break;
    if (
      [...trozo, palabra].join(" ").length > PRESUPUESTO &&
      trozo.length >= MIN_PALABRAS
    ) {
      break;
    }
    trozo.push(palabra);
  }

  while (
    trozo.length > 1 &&
    VACIAS.has(trozo[trozo.length - 1].toLowerCase().replace(/[^\p{L}]/gu, ""))
  ) {
    trozo.pop();
  }

  /* y sin arrastrar la puntuación por donde se cortó: "IA para
     marcas:…" y "Esta Navidad..,…" se leían como un error */
  const corto = trozo.join(" ").replace(/[\s.,;:–—-]+$/u, "");

  return corto + (trozo.length < palabras.length ? "…" : "");
}

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

  /* si lo que se está enseñando es el TITULAR de un artículo, la
     barra pone además de qué sección viene: «Blog │ titular» */
  const [esTitular, setEsTitular] = useState(false);

  useEffect(() => {
    let vivo = true;
    let textos = [];
    let topes = [];
    let esTitulo = [];
    let pedido = false;

    /* el nombre de partida: nada en la portada, el de la ruta en
       cualquier otra. Es lo que se ve mientras no se haya pasado
       ningún rótulo de sección. */
    let base = nombreDeRutaEnMano(pathname);

    const medir = () => {
      base = nombreDeRutaEnMano(pathname);
      const rotulos = Array.from(document.querySelectorAll(ROTULOS));
      esTitulo = rotulos.map((r) => r.classList.contains("bd-titulo"));
      textos = rotulos.map((r) => {
        const t = r.textContent.trim().replace(/\s+/g, " ");
        /* solo el titular se recorta: los rótulos de sección ya son
           cortos por definición */
        return r.classList.contains("bd-titulo") ? primerasPalabras(t) : t;
      });

      /* ---- EL TITULAR DE UN ARTÍCULO CRUZA MÁS TARDE ----
         Un rótulo de sección se da por "en curso" en cuanto pasa
         la línea del 45%, y está bien: es una etiqueta pequeña que
         encabeza lo que viene.

         Un titular de artículo no. Ese ocupa media pantalla y
         SIGUE LEYÉNDOSE mientras cruza, así que copiarlo a la
         píldora en ese momento lo pone dos veces a la vista — que
         es justo lo que este relevo tenía que evitar.

         Así que para el titular el tope NO sale de dónde está,
         sino de cuándo termina de apagarse: el mismo recorrido con
         el que se encoge (ver BlogDetailPage.jsx).

         El número se despeja de la comparación que hace `mirar`,
         que es `tope < scrollY + alto*0.45`. Poniendo
         `tope = RECORRIDO + alto*0.45`, esa comparación se
         convierte exactamente en `RECORRIDO < scrollY` — o sea,
         entra en la píldora justo cuando el grande ha terminado de
         desaparecer, ni antes ni después. */
      const RECORRIDO_TITULAR = 110;

      topes = rotulos.map((r) =>
        r.classList.contains("bd-titulo")
          ? RECORRIDO_TITULAR + window.innerHeight * 0.45
          : window.scrollY + r.getBoundingClientRect().top
      );
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
      let deTitular = false;
      for (let i = 0; i < topes.length; i++) {
        if (topes[i] < linea) {
          actual = textos[i];
          deTitular = esTitulo[i];
        }
      }

      setNombre((previo) => (previo === actual ? previo : actual));
      setEsTitular((previo) => (previo === deTitular ? previo : deTitular));
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
    <p
      className="header__seccion"
      /* el CSS de la cabecera se apoya en esto para pasar de rótulo
         centrado a «Blog │ titular» alineado a la izquierda */
      data-titular={esTitular ? "" : undefined}
      aria-hidden="true"
    >
      {esTitular && (
        <>
          <span className="header__seccion-pre">
            {nombreDeRutaEnMano(pathname)}
          </span>
          <span className="header__seccion-filo" />
        </>
      )}
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
