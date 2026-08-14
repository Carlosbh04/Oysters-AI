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
   píldora del menú. Sale de la misma variable que usa el layout,
   así que si la cabecera cambia de alto esto la sigue. */
function margenDeCabecera() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  return (parseFloat(v) || 96) + 16;
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

/* Un cuarto de segundo por cada mil píxeles, entre 900ms y 2,2s.
   Proporcional y no fijo: con duración constante, un salto corto
   se arrastra y uno largo va disparado. */
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

function desplazar(id) {
  const destino = document.getElementById(id);
  if (!destino) return false;

  if (animacion) cancelAnimationFrame(animacion);

  /* quien pide menos movimiento salta directo: el recorrido largo
     y animado es justo lo que le molesta */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({
      top: destino.getBoundingClientRect().top + window.scrollY - margenDeCabecera(),
      behavior: "auto",
    });
    return true;
  }

  const salida = window.scrollY;

  /* el margen de la cabecera es constante durante el trayecto:
     se lee UNA vez (getComputedStyle por frame era la única
     lectura evitable del bucle; el rect del destino sí tiene que
     re-medirse — la meta se mueve, ver el comentario de abajo) */
  const margen = margenDeCabecera();
  const meta = () =>
    destino.getBoundingClientRect().top + window.scrollY - margen;

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
  eventos.forEach((e) => window.addEventListener(e, soltar, { passive: true, once: true }));

  const paso = (ahora) => {
    const t = Math.min(1, (ahora - inicio) / total);

    /* La meta se recalcula EN CADA FOTOGRAMA. Durante el trayecto
       entran imágenes diferidas y se revelan secciones, y
       cualquiera de esas cosas mueve el destino: con la meta fija
       se aterriza descuadrado. Recalculándola, el recorrido
       persigue la sección hasta el final. */
    const y = salida + (meta() - salida) * suavizado(t);
    window.scrollTo(0, y);

    if (t < 1) {
      animacion = requestAnimationFrame(paso);
    } else {
      animacion = null;
      quitarEscuchas();
    }
  };

  animacion = requestAnimationFrame(paso);
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
