import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ============================================================
   IR A UNA SECCIÓN DEL HOME

   "Nosotros" y "Qué hacemos" no son páginas: son dos secciones
   que viven en la portada, más abajo. Apuntaban a /about y
   /services, rutas que NO EXISTEN — comprobado, las dos caían en
   la página de "no encontrado".

   Este hook las lleva a donde están de verdad, y con scroll
   suave.

   ---- POR QUÉ NO BASTA CON UN ENLACE A "/#nosotros" ----
   Estando ya en la portada, cambiar solo el hash no mueve la
   página: el router lo trata como una navegación más y no hay
   salto de documento que dispare el desplazamiento del navegador.
   Hay que hacerlo a mano.

   Y estando en OTRA página hay que navegar primero y esperar a
   que la portada se monte: el destino todavía no existe en el
   DOM cuando se pulsa. De ahí las dos ramas.
   ============================================================ */

/* Lo que hay que descontar por la cabecera, que va flotando
   encima: sin esto la sección aterriza con su título debajo de la
   píldora del menú.

   Sale de la misma variable que usa el layout, así que si la
   cabecera cambia de alto esto la sigue.

   (Ojo: esta es la cuenta de ESCRITORIO. En la mano manda `metaDe`,
   unas líneas más abajo, que ancla al rótulo y mide la píldora de
   verdad.) */
function margenDeCabecera() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  return (parseFloat(v) || 96) + 16;
}

/* ============================================================
   DÓNDE ATERRIZA DE VERDAD (solo en la mano)

   El problema, medido a 390px: se descontaba el alto de la
   CABECERA a la caja de la SECCIÓN, y las dos cosas suman.
   Aterrizando así quedaban 162px por encima del rótulo cuando la
   píldora sólo llega a 84 — o sea, 78px de vacío bajo la píldora
   y, por encima, el final de la sección anterior asomando. Se
   pedía "Nosotros" y lo primero que se veía era el final de
   "Trabajos".

   Sumaban dos cosas que nadie sumó a propósito:
     · el margen de cabecera, 96 + 16 = 112;
     · el relleno superior de la sección, otros 34-50.

   Se arregla cambiando las DOS referencias:

   1· El ancla ya no es la caja de la sección sino su RÓTULO, que
      es lo primero que se lee. Así el relleno de la sección deja
      de contar: da igual que mañana sea 0 o 120.

   2· La línea de aterrizaje ya no sale de una variable de alto,
      sino del borde INFERIOR real de la píldora. Es lo que hay
      que esquivar, y se mide donde está — la píldora va fija en
      este ancho, así que el número no cambia con el scroll.

   Resultado: el rótulo queda 22px por debajo de la píldora. Un
   poco de aire y a leer.

   ---- Y EN ESCRITORIO NO SE TOCA NADA ----
   Allí la cabecera no va fija: se marcha con la página, así que
   ni hay píldora que esquivar ni tiene sentido medirla — su rect
   sería negativo en cuanto se baja. Se conserva el cálculo de
   siempre, intacto. El corte es el mismo que usa la cabecera para
   decidir si se queda fija (ver Header.css).
   ============================================================ */
const AIRE_BAJO_LA_PILDORA = 22;

/* mismos rótulos que lee la cabecera para decir en qué sección
   estás (ver SeccionEnCurso.jsx) */
const ROTULO_DE_SECCION = ".rotulo, .iia__rotulo-centro";

const enLaMano = () => !window.matchMedia("(min-width: 1101px)").matches;

/* ---- LA POSICIÓN DE REPOSO, NO LA DE AHORA ----
   `getBoundingClientRect()` devuelve la caja PINTADA, y eso
   incluye los `transform` de las animaciones de entrada. El
   rótulo de destino casi nunca está quieto cuando se le apunta:
   viene desplazado por su propia entrada —el telón lo baja 10px,
   el Reveal de "Nosotros" 26— y aterrizar sobre esa medida deja
   la sección corrida hacia abajo justo esos píxeles. Medido: la
   llegada a "Cómo lo hacemos" caía 10px larga y la de "Nosotros",
   42. Y no se corrige sola después, porque el scroll ya se ha
   quedado donde se quedó.

   `offsetTop` es de MAQUETACIÓN: ignora los transform y devuelve
   dónde va a estar el elemento cuando su entrada termine, que es
   lo único que interesa aquí. Subiendo por `offsetParent` se
   acumula hasta el documento.

   (Es el mismo motivo por el que el telón se dispara con un
   listener de scroll y no con IntersectionObserver: hay que medir
   la maquetación, no lo pintado. Ver InteligenciaIA.jsx.) */
function arribaEnReposo(el) {
  let y = 0;
  let n = el;
  while (n) {
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return y;
}

/* Se exporta porque el botón "Descubre cómo" del hero lleva al
   MISMO sitio y no hacía ninguna de estas cuentas: usaba
   `scrollIntoView`, que pega la sección al borde de la ventana. En
   la mano eso dejaba el rótulo "¿Qué hacemos?" tapado por la
   píldora y se aterrizaba directamente en el titular — el mismo
   destino, dos sitios distintos según por dónde entraras.

   Comparte la función entera y no el número: si mañana cambia el
   aire bajo la píldora o el ancla deja de ser el rótulo, los dos
   caminos siguen aterrizando igual sin que nadie se acuerde de
   tocar el segundo. */
export function metaDe(destino) {
  if (!enLaMano()) {
    return destino.getBoundingClientRect().top + window.scrollY - margenDeCabecera();
  }

  const ancla = destino.querySelector(ROTULO_DE_SECCION) || destino;
  const pildora = document.querySelector(".header__container");
  const bajoLaPildora = pildora
    ? pildora.getBoundingClientRect().bottom
    : margenDeCabecera();

  return arribaEnReposo(ancla) - (bajoLaPildora + AIRE_BAJO_LA_PILDORA);
}

/* ---- EL DESPLAZAMIENTO ES PROPIO, NO EL DEL NAVEGADOR ----
   `scrollTo({ behavior: "smooth" })` no se puede regular: cada
   navegador elige su duración y su curva, y en Chrome es un
   trayecto corto y seco. Para un salto de 2.400px —lo que hay
   desde la portada hasta "Nosotros"— eso pasa la página entera de
   golpe: no da tiempo a ver nada y las animaciones de entrada de
   las secciones se disparan todas juntas al final.

   Con un recorrido propio se controlan las tres cosas que
   importan: cuánto dura, con qué curva y cuándo hay que rendirse.
   Y al ir despacio, cada sección que se cruza entra en pantalla a
   su tiempo y su animación se ve — que es justo lo que hace que
   el trayecto valga la pena en vez de estorbar. */

/* ============================================================
   LA LLEGADA SE COMPONE PIEZA A PIEZA

   Al terminar el viaje se marca la sección de destino, y ella se
   ARMA delante: rótulo, titular, texto y tarjetas, cada uno un
   paso después del anterior. El momento se aprovecha porque es
   cuando más se mira — el visitante acaba de PEDIR ir ahí.

   Aquí solo se pone la marca; QUÉ se anima lo decide la hoja de
   estilos (buscar `.llega` en globales.css). De los tres destinos
   del menú hoy solo responde Casos de uso: los otros dos ya se
   componen por su cuenta al llegar y añadirles esto les pisaba lo
   suyo. La explicación larga está junto al CSS.

   La marca se pone igual en los tres. Es deliberado: sale gratis
   —una clase sin reglas no hace nada— y deja el enganche puesto
   para una sección futura que sí lo necesite.

   ---- SOLO AL LLEGAR DESDE EL MENÚ ----
   Esto NO es una animación de scroll: no se dispara paseando por
   la página, solo cuando alguien pulsa un destino y el recorrido
   termina. Es la diferencia con lo que se probó y se retiró: allí
   el movimiento aparecía sin que nadie lo pidiera.

   ---- SE LIMPIA SOLA ----
   La clase se quita al acabar la cascada. Si no, una segunda
   visita a la misma sección no volvería a animarse (la clase ya
   estaría puesta) y además dejaría estilos colgando sin motivo.

   ---- Y RESPETA LA PREFERENCIA DE MOVIMIENTO ----
   Con `prefers-reduced-motion` no se marca nada: la sección
   aparece entera, como hasta ahora. */
/* Tope para retirar la clase. Tiene que cubrir la cascada entera
   —la última pieza arranca a 0,33s y dura 0,52s— con margen de
   sobra: si se retirase antes de tiempo, la pieza que aún estuviera
   entrando se cortaría a media animación y saltaría a su sitio. */
const CASCADA_MAX = 1800;

function marcarLlegada(destino) {
  if (!destino) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* reinicia por si se vuelve a la misma sección: sin quitarla y
     forzar un reflow, el navegador no rearranca la animación */
  destino.classList.remove("llega");
  void destino.offsetWidth;
  destino.classList.add("llega");

  clearTimeout(destino.__tLlega);
  destino.__tLlega = setTimeout(
    () => destino.classList.remove("llega"),
    CASCADA_MAX,
  );
}

/* Un cuarto de segundo por cada mil píxeles, entre 900ms y 2,2s.
   Proporcional y no fijo: con duración constante, un salto corto
   se arrastra y uno largo va disparado. */
/* ============================================================
   LAS DOS PIEZAS QUE USA LA PERSIANA

   Con la persiana tapando no hay recorrido que enseñar: la
   pantalla está cubierta, así que el scroll animado se gastaría
   entero detrás de la cortina. Lo que hace falta ahí es lo
   contrario —colocarse de golpe— y poder encender la cascada de
   llegada APARTE, cuando la cortina ya se ha ido.

   De ahí que sean dos funciones y no una: saltar y marcar ocurren
   en momentos distintos del viaje. Ver useViajeConPersiana.js.
   ============================================================ */

/* Coloca la página en la sección sin recorrido. Devuelve false si
   el destino todavía no está en el DOM —la portada monta sus
   secciones de forma diferida— para que quien llame reintente. */
export function saltarASeccion(id) {
  const destino = document.getElementById(id);
  if (!destino) return false;

  if (animacion) cancelAnimationFrame(animacion);
  animacion = null;

  window.scrollTo(0, metaDe(destino));
  return true;
}

export function marcarLlegadaDe(id) {
  marcarLlegada(document.getElementById(id));
}

function duracionPara(distancia) {
  return Math.min(2200, Math.max(900, Math.abs(distancia) * 0.55));
}

/* Arranca despacio, coge velocidad en el centro y frena largo al
   final. La entrada suave evita el tirón inicial y la salida
   larga es la que hace que "aterrice" en la sección en vez de
   pararse en seco. */
function suavizado(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let animacion = null;

/* la búsqueda diferida en curso (ver abajo): a nivel de módulo
   para que una navegación nueva cancele la anterior — dos clics
   seguidos en el menú encadenaban dos búsquedas y la vieja podía
   disparar un scroll a la sección equivocada */
let busqueda = null;

/* ============================================================
   EL RECORRIDO, SIN DESTINO FIJO

   Esto vivía dentro de `desplazar` y solo sabía ir a secciones.
   Se saca porque el botón de "volver arriba" necesita EXACTAMENTE
   lo mismo —recorrido regulado, curva propia, abandono al primer
   gesto— y estaba usando `scrollTo({behavior:"smooth"})`, que es
   justo lo que este archivo explica arriba que no vale.

   `meta` es una FUNCIÓN y no un número: se re-mide en cada
   fotograma porque el documento cambia de alto mientras se viaja
   (entran imágenes diferidas, se revelan secciones). Con un número
   tomado al salir, se llega desfasado — y volviendo arriba eso se
   traduce en quedarse a medio camino.
   ============================================================ */
function recorrer(meta, alLlegar = null) {
  if (animacion) cancelAnimationFrame(animacion);

  /* quien pide menos movimiento salta directo: el recorrido largo
     y animado es justo lo que le molesta */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: meta(), behavior: "auto" });
    alLlegar?.();
    return;
  }

  const salida = window.scrollY;
  const total = duracionPara(meta() - salida);
  const inicio = performance.now();

  /* ---- SE ABANDONA SI EL USUARIO TOCA ALGO ----
     Un recorrido de dos segundos que ignora la rueda del ratón se
     siente como que la página se ha quedado colgada. Cualquier
     gesto lo cancela al instante y devuelve el control. */
  const soltar = () => {
    if (animacion) cancelAnimationFrame(animacion);
    animacion = null;
    quitarEscuchas();
  };
  const eventos = ["wheel", "touchstart", "keydown", "pointerdown"];
  const quitarEscuchas = () =>
    eventos.forEach((e) => window.removeEventListener(e, soltar));
  eventos.forEach((e) =>
    window.addEventListener(e, soltar, { passive: true, once: true })
  );

  const paso = (ahora) => {
    const t = Math.min(1, (ahora - inicio) / total);
    window.scrollTo(0, salida + (meta() - salida) * suavizado(t));

    if (t < 1) {
      animacion = requestAnimationFrame(paso);
    } else {
      animacion = null;
      quitarEscuchas();
      alLlegar?.();
    }
  };

  animacion = requestAnimationFrame(paso);
}

/* ---- VOLVER ARRIBA DEL TODO ----
   El botón de la perla usaba `scrollTo({behavior:"smooth"})` y se
   quedaba a medio camino: es el desplazamiento del navegador, que
   ni se regula ni se puede rematar, y en un móvil real lo corta
   cualquier cosa —el dedo aún apoyado, la inercia del scroll, o el
   alto del documento cambiando mientras sube porque las secciones
   que se cruzan van soltando sus imágenes—.

   Con el recorrido propio se acaba SIEMPRE en 0: la meta se
   re-mide cada fotograma y el último la clava. Y si alguien toca
   la pantalla por el camino, se abandona como en cualquier otro
   viaje del sitio. */
export function subirArriba() {
  recorrer(() => 0);
}

function desplazar(id) {
  const destino = document.getElementById(id);
  if (!destino) return false;

  /* la meta va como función: se re-mide cada fotograma porque las
     secciones que se cruzan cambian el alto del documento mientras
     se viaja (ver recorrer, arriba) */
  recorrer(
    () => metaDe(destino),
    () => marcarLlegada(destino)
  );

  return true;
}

export default function useIrASeccion() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (id) => (e) => {
      e.preventDefault();

      /* cualquier navegación nueva mata la búsqueda pendiente de
         la anterior */
      clearTimeout(busqueda);
      busqueda = null;

      if (pathname === "/") {
        desplazar(id);
        return;
      }

      /* Desde otra página: se navega y se busca el destino en los
         siguientes fotogramas. Se reintenta porque la portada
         monta sus secciones de forma diferida y el nodo puede
         tardar en aparecer; a los ~2s se deja de insistir para no
         quedarse mirando un id que no existe. */
      navigate("/");

      let intentos = 0;
      const buscar = () => {
        if (desplazar(id) || ++intentos > 40) {
          busqueda = null;
          return;
        }
        busqueda = setTimeout(buscar, 50);
      };
      busqueda = setTimeout(buscar, 50);
    },
    [navigate, pathname]
  );
}
