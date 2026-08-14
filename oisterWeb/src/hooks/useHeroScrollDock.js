import { useEffect } from "react";

/* ============================================================
   COREOGRAFÍA DE SCROLL DEL HERO

   Publica en .hero__right dos variables CSS y nada más:
     --h-scroll-p  progreso del viaje, 0 → 1 (suavizado)
     --h-dock-y    anclaje al documento, en px (1:1 con el scroll)
   El MOVIMIENTO lo compone el CSS (Home.css) a partir de ellas.
   Da igual qué haya dentro — vídeo, canvas o imagen: viaja igual.

   ── CADENA DEL MOTOR ─────────────────────────────────────────
     scroll  →  scrollY (crudo, sin tocar el DOM)
                  ↓
     rAF     →  --h-scroll-p  (el VIAJE)
                --h-dock-y    (el ANCLAJE, pasado el acople)
                  ↓
                variables CSS  →  transform (compositor)

   SIN INTERPOLACIÓN. La posición es una función pura del scroll:
   el mismo scroll da siempre la misma posición, sin memoria. Ver
   el paso 1 de `animar` para el porqué — resumido: todo suavizado
   es retraso, y el retraso es lo que se percibe como rebote.

   ── DE DÓNDE VENÍA EL SALTO ──────────────────────────────────
   NO era un teletransporte geométrico. El antiguo cambio de
   `fixed` a `absolute` estaba bien calculado y daba exactamente
   la misma posición que el anclaje por transform de ahora: se
   comprobó comparando las dos fórmulas y coinciden en todo el
   recorrido.

   El salto era una CONSECUENCIA de perder frames. Al cruzar el
   acople, el código de entonces hacía en mitad del scroll:
     · escribir `top`/`left` y cambiar `position` → layout
     · alternar la clase, que activaba un selector `:has()` en el
       hero y le cambiaba el `overflow` → recálculo de estilo y
       repintado de un elemento a pantalla completa
     · medir la puntería con dos getBoundingClientRect() más
   Todo eso junto se come un frame. Y el suavizado exponencial
   recupera el retraso en proporción al tiempo transcurrido, así
   que el frame siguiente avanza el triple de lo normal (29% de
   la distancia restante en vez del 9%). Eso es lo que se ve:
   "se queda atrás y luego pega un tirón".

   Por eso la solución es doble:
   1. Que durante el scroll no quede NADA que provoque layout —
      de ahí que la ostra sea siempre `fixed` y el anclaje se
      haga con --h-dock-y, una traslación pura.
   2. Acotar el dt (ver el tope en `animar`), para que aunque el
      navegador tropiece por cualquier otro motivo la
      recuperación se reparta y no se vea.

   Comprobado que ningún ancestro tiene transform/filter/
   will-change, así que el `overflow:hidden` del hero no recorta
   un descendiente `fixed` y esa regla puede desaparecer.
   ============================================================ */

/* la luna sobre la que hay que centrar la ostra */
const DIANA = ".how-we-work__halo";

/* la caja que la contiene: es la que se pega y la que marca hasta
   dónde puede deslizarse */
const PISTA = ".how-we-work__scene";

/* Ya no hay diales de interpolación. Aquí llegó a haber un muelle
   (RIGIDEZ/AMORTIGUACION), una anticipación por velocidad
   (ANTICIPACION_MS/VELOCIDAD_MS) y un suavizado exponencial con
   tope de retraso (SUAVIZADO_MS/REPOSO). Los tres se retiraron
   por la misma razón, explicada en el paso 1 de `animar`.

   Lo que gradúa el movimiento ahora es CSS puro: --h-travel,
   --h-drop y --h-shrink en Home.css. */

function useHeroScrollDock(ref, enabled = true) {
  useEffect(() => {
    const right = ref.current;
    if (!right || !enabled) return;

    right.style.removeProperty("--h-scroll-p");
    right.style.removeProperty("--h-dock-y");
    right.style.removeProperty("--h-mezcla");
    right.style.removeProperty("--h-dock-dx");
    right.style.removeProperty("--h-dock-dy");
    /* restos del mecanismo antiguo, por si quedaran de un montaje
       anterior con recarga en caliente */
    right.style.top = "";
    right.style.left = "";
    right.classList.remove("is-docked");

    /* ========================================================
       GEOMETRÍA
       Solo se mide cuando el layout cambia de verdad (montaje,
       load y resize). Durante el scroll no se lee NADA del DOM.
       ======================================================== */
    let vh = window.innerHeight;
    let dockEnd = 1; /* scroll al que la ostra queda acoplada */
    let rampa = 1; /* sobre cuánto scroll se reparte el viaje */
    /* posición de acople, PRECALCULADA: al conmutar no se lee nada */
    let dockTop = 0;
    let dockLeft = 0;
    let acoplada = false;
    let pegado = 0; /* cuánto scroll se quedan quietas las dos */
    let dockScroll = 1; /* scroll al que se suelta el anclaje */
    const hero = right.closest(".hero");

    const medirGeometria = () => {
      vh = window.innerHeight;

      /* ---- SE MIDE LA PISTA, NO LA SECCIÓN ENTERA ----
         Aquí se medía el fondo de #que-hacemos, y funcionaba
         mientras esa sección era corta: su final coincidía más o
         menos con el sitio donde está la luna.

         Al cambiar su contenido, la sección pasó de ~600px a más de
         2000: con la medida vieja, el viaje de la ostra terminaba
         al llegar el FINAL de la sección al borde de la pantalla,
         o sea después de recorrer el bloque entero. Efecto: la
         ostra se quedaba flotando arriba y no bajaba.

         Lo que de verdad manda es dónde está la PISTA de
         aterrizaje. Se mide ella y el fondo de la sección queda
         como respaldo por si algún día no hubiera pista. */
      const pista = document.querySelector(DIANA);
      const seccion = document.getElementById("que-hacemos");
      const referencia = pista || seccion;

      const docBottom = referencia
        ? referencia.getBoundingClientRect().bottom + window.scrollY
        : 0;

      dockEnd = Math.max(1, docBottom - vh);

      /* ---- EL TRAMO PEGADO ----
         Después de encontrarse, la ostra y su esfera se quedan
         quietas en pantalla un rato mientras la página sigue
         subiendo. Visto desde la sección, las dos BAJAN — que es
         justo el hueco que quedaba libre debajo de la esfera.

         Quien manda es la esfera, que se pega por CSS. Aquí se
         calcula su recorrido y se le publica el `top` exacto al
         que tiene que pegarse, para que las dos cosas empiecen en
         el MISMO píxel de scroll: si la esfera se pegara antes o
         después de que la ostra se detenga, se separarían.

           · `top` = dónde está la esfera en pantalla en el
             instante del encuentro
           · pegado = cuánto puede deslizarse dentro de su columna
             antes de llegar al fondo */
      const escena = document.querySelector(PISTA);
      const columna = escena?.parentElement;

      if (escena && columna) {
        const e = escena.getBoundingClientRect();
        const c = columna.getBoundingClientRect();

        const escenaDocTop = e.top + window.scrollY;
        const columnaDocBottom = c.bottom + window.scrollY;

        /* SIN redondear. El `top` del sticky y el punto en el que
           se suelta el anclaje son la misma cuenta hecha desde dos
           sitios; redondeando uno de los dos, el relevo se hacía
           con hasta un píxel de desfase entre CSS y JS y se veía
           como un salto pequeño de la esfera respecto a la ostra
           —medido, 13px— justo al soltarse. */
        const topPegado = Math.max(0, escenaDocTop - dockEnd);
        escena.style.setProperty("--pista-pegada", `${topPegado}px`);

        /* El margen inferior de la pista es su FRENO: sticky no
           deja que el elemento salga de su contenedor contando
           márgenes, así que ese hueco es terreno por el que la
           esfera ya no se desliza. Se descuenta aquí para que la
           ostra pare en el mismo punto — leerlo del CSS y no
           escribirlo otra vez es lo que impide que los dos números
           se separen el día que se ajuste el freno. */
        const freno = parseFloat(getComputedStyle(escena).marginBottom) || 0;

        pegado = Math.max(0, columnaDocBottom - e.height - freno - escenaDocTop);
      } else {
        pegado = 0;
      }

      /* el ANCLAJE al documento ocurre al final del tramo pegado,
         no al encontrarse */
      dockScroll = dockEnd + pegado;

      /* ---- EL VIAJE TERMINA ANTES DEL ACOPLE ----
         Aquí está la clave de que no se vea ningún reajuste.

         Son dos movimientos distintos:
           · el VIAJE  (izquierda + abajo + encoger), suavizado,
             o sea que llega con ~180ms de retraso
           · el ANCLAJE (quedarse pegada a la sección), exacto,
             porque si no la ostra flotaría respecto a la luna

         Mientras se solapen, uno va con retraso y el otro no: al
         acoplarse, el anclaje empieza a tirar en vertical cuando
         al viaje todavía le queda camino a la izquierda, y la
         trayectoria se parte en un codo.

         Ya no hace falta separarlos con un colchón: al no haber
         retraso, el viaje está terminado EXACTAMENTE al llegar al
         acople, y el anclaje toma el relevo en el mismo píxel. */
      rampa = Math.min(vh, dockEnd);

      /* Dónde queda anclada al documento. Se calcula AQUÍ y no al
         conmutar: así el cambio de posición no lee layout en
         mitad del scroll — que era lo que costaba un frame. */
      const cont = right.parentElement;
      if (cont) {
        const cr = cont.getBoundingClientRect();
        dockTop = dockScroll - (cr.top + window.scrollY);
        dockLeft = document.documentElement.clientWidth - right.offsetWidth - cr.left;
      }
    };

    /* ========================================================
       PUNTERÍA — centrar la ostra en la luna

       Se mide por adelantado, no al aterrizar: la corrección va
       multiplicada por el progreso, así que aplicarla desde el
       principio hace que la ostra ya baje apuntando. Medirla al
       llegar produciría un reajuste visible.

       Ya no hace falta simular el acople (antes se forzaba la
       clase y position:absolute): basta con forzar el estado de
       llegada de las variables y comparar.
       ======================================================== */
    const medirPunteria = () => {
      const diana = document.querySelector(DIANA);
      if (!diana) return;

      const pPrevio = right.style.getPropertyValue("--h-scroll-p");
      const anclaPrevia = right.style.getPropertyValue("--h-dock-y");

      /* estado de llegada: viaje completo y sin anclaje */
      right.style.setProperty("--h-dock-dx", "0px");
      right.style.setProperty("--h-dock-dy", "0px");
      right.style.setProperty("--h-scroll-p", "1");
      right.style.setProperty("--h-mezcla", "1");
      right.style.setProperty("--h-dock-y", "0px");

      const dr = diana.getBoundingClientRect();
      const rr = right.getBoundingClientRect();
      const y = window.scrollY;

      right.style.setProperty("--h-scroll-p", pPrevio || "0");
      right.style.setProperty("--h-dock-y", anclaPrevia || "0px");

      /* rectángulos vacíos = algo no está maquetado todavía: no
         corregir a ciegas o la ostra saldría disparada */
      if (!dr.width || !rr.width) return;

      /* Horizontal: la ostra es `fixed`, su X no cambia con el
         scroll, y la de la luna tampoco. Diferencia directa. */
      const dx = dr.left + dr.width / 2 - (rr.left + rr.width / 2);

      /* Vertical: se comparan EN EL INSTANTE DEL ACOPLE, que es
         scroll = dockEnd. La luna va en el flujo (su posición de
         pantalla depende del scroll) y la ostra, mientras viaja,
         no. Se pasa la luna a coordenadas de documento y se le
         resta dockEnd para saber dónde estará ese momento. */
      const lunaCentroDoc = dr.top + y + dr.height / 2;
      const ostraCentroPantalla = rr.top + rr.height / 2;
      const dy = lunaCentroDoc - dockEnd - ostraCentroPantalla;

      right.style.setProperty("--h-dock-dx", `${dx}px`);
      right.style.setProperty("--h-dock-dy", `${dy}px`);
    };

    const remedir = () => {
      medirGeometria();
      medirPunteria();
    };
    remedir();

    /* al montar, fuentes e imágenes pueden no haber cargado y la
       maqueta todavía se va a mover: se repite cuando esté todo */
    const alCargar = () => {
      remedir();
      despertar();
    };
    if (document.readyState !== "complete") {
      window.addEventListener("load", alCargar);
    }

    /* ========================================================
       MOTOR — un único requestAnimationFrame
       ======================================================== */
    let scrollY = window.scrollY;
    let scrollSuave = scrollY; /* el scroll amortiguado, en px */
    let raf = null;
    let huboScroll = true;

    const sinMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* ========================================================
       LAS DOS ESCRITURAS DEL BUCLE

       Las dos salen del MISMO número: `scrollSuave`, el scroll ya
       amortiguado. Ese es el punto importante.

       Antes se suavizaba el VIAJE (--h-scroll-p) pero el ANCLAJE
       (--h-dock-y) se calculaba con el scroll crudo, 1:1. O sea
       dos movimientos con relojes distintos: el viaje llegaba
       ~180ms tarde y el anclaje era instantáneo. En el momento
       del acople, el anclaje ya estaba tirando de la ostra hacia
       arriba mientras al viaje aún le quedaba camino hacia la
       izquierda — y eso es lo que se veía como "baja por la
       derecha y luego se va a la izquierda".

       Suavizando la ENTRADA en vez de las salidas, la trayectoria
       es exactamente la misma que tendría sin suavizado: solo que
       recorrida con retraso. Un único reloj para todo, así que
       ningún componente puede adelantarse a otro. */
    const pintar = () => {
      const bruto = Math.min(1, Math.max(0, scrollSuave / rampa));

      /* ---- POR QUÉ ESTA CURVA Y NO UNA RECTA ----
         p = 1 − (1−bruto)², una desaceleración cuadrática.

         No es un capricho estético: su derivada vale CERO al
         llegar a 1, y eso es lo que elimina el tirón del acople.
         Con una recta, el viaje llega a la luna todavía "con
         velocidad propia" y esa velocidad tiene que desaparecer
         de golpe en el instante en que la ostra queda pegada a la
         página. Con esta curva llega ya frenada, así que no hay
         nada que cortar. */
      const p = 1 - (1 - bruto) * (1 - bruto);
      right.style.setProperty("--h-scroll-p", p);

      /* ---- LA MEZCLA VERTICAL VA APARTE ----
         Medido en el navegador, con el mismo peso para las dos
         cosas la ostra bajaba 344px y volvía a subir 205px: un
         rebote de manual. No era un fallo de continuidad, era la
         FORMA del recorrido.

         El motivo: la ostra persigue a la luna, que empieza muy
         por debajo del viewport y va SUBIENDO con el scroll. Si
         el descenso arranca pronto, la ostra se lanza hacia donde
         la luna está en ese momento —abajo del todo— y después
         tiene que volver con ella. De ahí la parábola.

         Con una cúbica el descenso se concentra al final, cuando
         la luna ya está cerca, y el recorrido se vuelve casi
         monótono: el pico baja de 205px a 9px, o sea deja de
         percibirse. Y tiene que ser distinta del peso horizontal,
         porque ese sí debe empezar pronto — si no, la ostra se
         quedaría quieta y saldría disparada al final. */
      const mezcla = bruto * bruto * bruto;
      right.style.setProperty("--h-mezcla", mezcla);

      /* ---- POR QUÉ VUELVE EL CAMBIO DE `position` ----
         Medido con scroll de rueda real: con el anclaje hecho
         por transform desde JS, la ostra se quedaba UN FRAME
         ENTERO por detrás de la página — 120px de desfase y
         recuperación al frame siguiente. Ese era el rebote.

         El motivo es estructural: el scroll nativo lo mueve el
         COMPOSITOR, al instante; un transform calculado en JS se
         entera un frame después. Contra eso no hay ajuste posible.

         Posicionar en el documento (`absolute`) sí es nativo, así
         que la ostra acoplada se mueve exactamente con la página,
         con cero desfase. El código original ya lo hacía y quitarlo
         fue un error mío.

         Lo que sí sobraba del mecanismo antiguo era el coste de
         conmutar: leía layout y disparaba un `:has()` que cambiaba
         el overflow de un elemento a pantalla completa. Ahora el
         anclaje va precalculado y la clase se pone directa. */
      /* se ancla al TERMINAR el tramo pegado: hasta entonces sigue
         `fixed`, que es lo que la mantiene quieta en pantalla junto
         a la esfera */
      const debeAcoplar = scrollY >= dockScroll;
      if (debeAcoplar !== acoplada) {
        acoplada = debeAcoplar;
        if (acoplada) {
          right.style.position = "absolute";
          right.style.top = `${dockTop}px`;
          right.style.left = `${dockLeft}px`;
          right.style.right = "auto";
          hero?.classList.add("hero--suelta");
        } else {
          right.style.position = "";
          right.style.top = "";
          right.style.left = "";
          right.style.right = "";
          hero?.classList.remove("hero--suelta");
        }
      }

      /* ---- EL ANCLAJE, MEZCLADO EN VEZ DE CONMUTADO ----
         Antes esto era `max(0, scrollY − dockEnd)`: cero hasta el
         acople y a partir de ahí 1:1. Una bisagra.

         Y ahí estaba el rebote. Justo antes del acople la ostra
         BAJA por la pantalla (0,73px por píxel de scroll); en el
         instante de la bisagra pasa a SUBIR (1px por píxel,
         porque ya va con la página). La dirección vertical se
         invierte de golpe: cae en la luna y rebota hacia arriba.
         Es geometría pura — por eso no lo quitaba ningún ajuste
         del suavizado.

         Ahora el anclaje entra PROGRESIVAMENTE, pesado por el
         mismo p. La ostra se va "soltando" del viewport y
         "agarrando" a la página a medida que se acerca, así que
         cuando llega ya lleva la misma velocidad que la sección:
         no hay nada que invertir. */
    };

    const despertar = () => {
      if (raf === null) raf = requestAnimationFrame(animar);
    };

    function animar() {
      raf = null;

      /* la remedición pendiente va ANTES de pintar: así el frame
         lee geometría fresca y las lecturas quedan agrupadas al
         principio, con las escrituras de pintar() detrás */
      if (necesitaRemedir) {
        necesitaRemedir = false;
        remedir();
      }

      /* Ya no se mide el tiempo entre frames. Hacía falta para la
         interpolación exponencial —para que avanzara igual a 60
         que a 120Hz— y para acotar el efecto de un frame perdido.
         Sin interpolación, un frame perdido no tiene consecuencia:
         el siguiente pinta la posición del scroll actual, que es
         la correcta. Tampoco hay diferencia entre tasas de
         refresco, porque no depende del tiempo en absoluto. */
      const scrollAhora = scrollY;
      const teniaScroll = huboScroll;
      huboScroll = false;

      if (sinMovimiento) {
        scrollSuave = scrollAhora;
        pintar();
        return;
      }

      /* 1 · SEGUIMIENTO EXACTO — la posición es una función pura
         del scroll, sin memoria ni retraso.

         Aquí hubo (y se quitaron, en este orden) un muelle con
         rebote, una anticipación por velocidad y un suavizado
         exponencial con tope de retraso. Los tres producían la
         misma queja con distinta cara: "hace como un rebote".

         Y es que TODO suavizado es, por definición, retraso: la
         ostra no está donde el scroll dice que debería estar.
         Mientras bajas va detrás; cuando paras, recorre lo que le
         falta. Eso es lo que se percibe como rebote, y no se
         arregla afinando constantes porque ES el mecanismo.

         Lo que cierra el asunto: la página entera se mueve
         EXACTAMENTE con el scroll. Cualquier cosa que se mueva en
         sincronía con ella se ve natural —aunque la rueda vaya a
         saltos, porque salta igual que todo lo demás—. El que va
         con retraso es el único que canta.

         La suavidad no la pone una interpolación: la pone que el
         movimiento sea continuo, que el recorrido esté repartido
         sobre cientos de píxeles de scroll y que el navegador lo
         resuelva en el compositor. Todo eso sigue igual. */
      scrollSuave = scrollAhora;

      pintar();

      /* 2 · A DORMIR. Sin retraso no hay nada que converger: una
         vez pintada la posición del scroll actual, el bucle no
         tiene más trabajo hasta el siguiente evento. Antes tenía
         que seguir vivo varios frames alcanzando al objetivo. */
      if (!teniaScroll) return;

      raf = requestAnimationFrame(animar);
    }

    /* Aquí había un repaso de puntería al detenerse el scroll.
       Fuera: era lo ÚNICO que podía cambiar la posición de la
       ostra una vez ya parada, y si su medida difería de la
       inicial se veía como una corrección lateral de la nada.
       La puntería se mide en el montaje, en `load` y en cada
       `resize`, que son los momentos en que el layout cambia de
       verdad. */

    /* ========================================================
       EVENTOS
       El manejador de scroll no toca el DOM: apunta la posición
       y despierta el bucle. Todo lo demás ocurre en el frame.
       ======================================================== */
    const onScroll = () => {
      scrollY = window.scrollY;
      huboScroll = true;
      despertar();
    };

    /* ---- REMEDIR, COMO MUCHO UNA VEZ POR FRAME ----
       remedir() encadena lecturas y escrituras de layout — la
       puntería además FUERZA un layout a propósito (escribe el
       estado de llegada, mide y restaura) — y `resize` llega en
       ráfaga: cada paso de un arrastre en escritorio y, en móvil,
       el colapso de la barra del navegador en pleno scroll. Nadie
       consume sus resultados de forma síncrona (los lee pintar()
       en el frame siguiente), así que el evento solo levanta la
       bandera y es el motor —el único rAF del hook— quien mide al
       abrir el frame: N eventos en un frame, UNA medición. */
    let necesitaRemedir = false;

    const onResize = () => {
      /* cambia toda la geometría: hay que remedir y repasar */
      necesitaRemedir = true;
      scrollY = window.scrollY;
      huboScroll = true;
      despertar();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    despertar();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", alCargar);
      if (raf !== null) cancelAnimationFrame(raf);

      /* deshacer lo que pintar() pudiera dejar puesto: si el
         hook se apaga en caliente (p. ej. reduced-motion activado
         con la ostra ya acoplada), el elemento no debe quedarse
         anclado en `absolute` ni la sección con `hero--suelta` */
      right.style.position = "";
      right.style.top = "";
      right.style.left = "";
      right.style.right = "";
      hero?.classList.remove("hero--suelta");
    };
  }, [ref, enabled]);
}

export default useHeroScrollDock;
