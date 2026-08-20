import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ponerFase } from "../componentes/persiana/persianaEstado";
import { precargarRuta } from "../utils/precargaRuta";
import { marcarLlegadaDe, saltarASeccion } from "./useIrASeccion";

/* ============================================================
   NAVEGAR CON LA PERSIANA DELANTE

   Cubrir → cambiar de sitio → descubrir. El cambio ocurre con la
   pantalla TAPADA, que es lo que convierte un corte seco en una
   transición: nadie ve el salto, solo la persiana que pasa.

   Vale para los dos destinos que ofrece el menú, que por dentro
   no se parecen en nada:

     · aRuta    — cambia de página (Trabajos, Blog, Hablemos...)
     · aSeccion — se coloca en una sección de la portada

   ---- POR QUÉ LA SECCIÓN SALTA EN VEZ DE RECORRER ----
   Fuera de la persiana, las anclas van con el scroll animado de
   useIrASeccion: dos segundos de viaje en los que se ven pasar
   las secciones intermedias. Con la cortina puesta ese recorrido
   no lo ve nadie —está tapado— así que serían dos segundos de
   pantalla quieta. Cubierta la pantalla, la colocación es
   instantánea y el tiempo se lo queda la transición.

   El menú de escritorio NO pasa por aquí: conserva su recorrido
   animado, que ahí sí se ve.
   ============================================================ */

/* 0,42s de subida + 4 columnas × 50ms de desfase = 620ms. Se
   espera un pelo más para no cambiar de sitio mientras la última
   columna aún está llegando arriba. */
const CUBRIR_MS = 640;
const REVELAR_MS = 640;

/* Lo que se le da a React para montar lo que toque y a ScrollToTop
   para dejarlo colocado, ANTES de descubrir. Sin esto se
   descubría a media colocación y se veía el salto. */
const ASENTARSE_MS = 60;

/* Cuánto se insiste en encontrar una sección de la portada, que se
   monta de forma diferida y puede no existir aún si se viene de
   otra página. */
const ESPERA_MAX_MS = 900;

/* ---- SE MIRA SI HAY PÁGINA, NO EL RELOJ ----
   Esto esperaba a que el esqueleto se fuera. Funcionaba de
   casualidad: el esqueleto tapaba hasta que la página estaba, así
   que su marcha valía de aviso. Al quitarlo en móvil se quedó sin
   aviso y la persiana descubría el hueco vacío — medido a 250
   kB/s, se retiraba a los 788ms sobre un `main` de 0 caracteres.

   El siguiente intento fue esperar a la promesa del chunk. Tampoco:
   en desarrollo esa promesa tardó SIETE SEGUNDOS, porque Vite sirve
   los módulos sueltos y son decenas de peticiones; en producción es
   un archivo y va en un suspiro. Cualquier tope elegido servía para
   un caso y era absurdo en el otro.

   Así que no se cronometra nada: se mira el `main` hasta que tiene
   algo dentro. Da igual si el retraso vino de la red, del chunk o
   de React — se pregunta por lo único que de verdad importa, que es
   si hay algo que descubrir. */
const PAGINA_MAX_MS = 2000;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const dosFotogramas = () =>
  new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

/* Todos los esqueletos del proyecto cuelgan de una clase que
   acaba en "-skeleton" (page-skeleton, ws-skeleton...). Se
   pregunta por el DOM y no por un estado de React porque el
   estado vive en App y llegar hasta aquí exigiría pasarlo por
   media aplicación para saber una cosa que la pantalla ya dice. */
const hayEsqueleto = () => !!document.querySelector('[class*="-skeleton"]');

/* Hay página cuando el esqueleto (que sigue vivo en escritorio) se
   ha ido Y el main tiene contenido. Lo segundo es lo que cubre el
   móvil, donde ya no hay esqueleto que consultar. */
const hayPagina = () =>
  !hayEsqueleto() &&
  (document.querySelector("main")?.textContent.trim().length ?? 0) > 0;

/* El tope está para que una conexión mala no deje la pantalla
   tapada sin final. Si se agota se descubre igual: más vale ver
   una página terminando de montarse que una cortina eterna. */
async function esperarALaPagina() {
  const limite = performance.now() + PAGINA_MAX_MS;
  while (!hayPagina() && performance.now() < limite) {
    await dosFotogramas();
  }
}

/* La sección puede no existir todavía si se viene de otra página:
   la portada monta sus bloques poco a poco. Se reintenta cada
   fotograma hasta que aparece o se agota el tope. */
async function colocarseEn(id) {
  const limite = performance.now() + ESPERA_MAX_MS;
  while (performance.now() < limite) {
    if (saltarASeccion(id)) return true;
    await dosFotogramas();
  }
  return false;
}

const sinMovimiento = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- EL CERROJO VIVE EN EL MÓDULO, NO EN EL COMPONENTE ----
   Un `useRef` se iría con el menú, y el menú se cierra A MITAD del
   viaje (justo cuando la persiana tapa). El cerrojo tiene que
   sobrevivir a eso o el segundo toque colaría un viaje encima del
   primero. */
let viajando = false;

/* ---- Y SE SUELTA PASE LO QUE PASE ----
   Antes se ponía a false en la última línea de la secuencia, y esa
   línea solo se alcanza si NADA falla por el camino. Cualquier
   excepción entre medias —`navigate` sobre una ruta que revienta,
   un fallo montando la página nueva, lo que sea— dejaba dos cosas
   rotas a la vez y de forma permanente:

     · el cerrojo en true, así que TODOS los enlaces del menú
       dejaban de responder a partir de ese momento, y
     · la fase en "cubrir", o sea la cortina tapando la pantalla
       para siempre.

   De ahí no se sale sin recargar. Envuelto así, si algo revienta
   la pantalla se descubre y el menú sigue vivo: se pierde la
   transición, que es lo de menos, y no la aplicación.

   El error se deja subir en vez de tragárselo — que la consola lo
   cuente— pero la limpieza ya está hecha. */
async function conCerrojo(secuencia) {
  viajando = true;
  try {
    await secuencia();
  } finally {
    ponerFase(null);
    viajando = false;
  }
}

export default function useViajeConPersiana() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /* ---------- destino: otra página ---------- */
  const aRuta = useCallback(
    (destino, cerrarMenu) => async (e) => {
      e.preventDefault();
      if (viajando) return;

      /* ---- YA ESTAMOS AHÍ ----
         Sin esto, pulsar en el menú la página que estás viendo
         monta la persiana entera para no cambiar nada: medio
         segundo de cortina y la misma pantalla al levantarla. */
      if (destino === pathname) {
        cerrarMenu?.();
        return;
      }

      if (sinMovimiento()) {
        cerrarMenu?.();
        navigate(destino);
        return;
      }

      await conCerrojo(async () => {
        /* la descarga arranca YA, no después de cubrir: así el
           chunk viaja mientras las columnas suben en vez de empezar
           a bajar cuando ya están arriba */
        precargarRuta(destino);

        ponerFase("cubrir");
        await esperar(CUBRIR_MS);

        /* Con la pantalla tapada: el menú se retira y la ruta
           cambia. El orden importa —cerrar primero— para que el
           panel no siga ahí si algo tarda en la navegación. */
        cerrarMenu?.();
        navigate(destino);

        await dosFotogramas();
        await esperarALaPagina();
        await esperar(ASENTARSE_MS);

        ponerFase("revelar");
        await esperar(REVELAR_MS);
      });
    },
    [navigate, pathname]
  );

  /* ---------- destino: una sección de la portada ---------- */
  const aSeccion = useCallback(
    (id, cerrarMenu) => async (e) => {
      e.preventDefault();
      if (viajando) return;

      const fuera = pathname !== "/";

      if (sinMovimiento()) {
        cerrarMenu?.();
        if (fuera) navigate("/");
        await colocarseEn(id);
        return;
      }

      await conCerrojo(async () => {
        if (fuera) precargarRuta("/");

        ponerFase("cubrir");
        await esperar(CUBRIR_MS);

        cerrarMenu?.();

        if (fuera) {
          navigate("/");
          await dosFotogramas();
          await esperarALaPagina();
        }

        await colocarseEn(id);

        await dosFotogramas();
        await esperar(ASENTARSE_MS);

        ponerFase("revelar");
        await esperar(REVELAR_MS);
      });

      /* ---- LA CASCADA, DESPUÉS DE LA CORTINA ----
         Marcar la llegada antes habría gastado la composición
         —rótulo, titular, texto, tarjetas— detrás de la persiana,
         y al levantarse estaría todo ya puesto. Encendida aquí,
         las dos cosas se ven en orden: primero pasa la cortina,
         después la sección se arma. Ver `.llega` en globales.css. */
      marcarLlegadaDe(id);
    },
    [navigate, pathname]
  );

  return { aRuta, aSeccion };
}
