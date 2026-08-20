import { useEffect } from "react";
import { enLetras, enPalabras, marcarTrozos } from "../utils/partirTexto";

/* ============================================================
   LA SALIDA DEL HOME — «se aleja»

   Elegida entre diez propuestas (galería de prueba, «Salidas del
   home»). Al hacer scroll, cada pieza del home —rótulo, titular,
   texto, tarjetas— se suelta hacia atrás mientras se apaga, en
   vez de limitarse a desaparecer por el borde de la pantalla.

   ---- Y ENCIMA, LA ONDA ----
   Sobre eso va la salida 10 de la segunda galería: una ola que
   recorre el texto y lo desarma. Las dos cosas se suman en vez
   de competir, y cada una manda en su nivel — el BLOQUE se
   aleja, y sus LETRAS (o sus palabras) montan la onda encima.

   Repartirlo así no es un capricho: son dos transformaciones
   sobre el mismo eje, y en CSS la segunda pisa a la primera. En
   niveles distintos se componen solas, que es lo que se quería.

   Es la salida que usan Apple, Vercel o Framer, y se eligió por
   lo que NO hace: no tira a un lado, no gira, no inventa
   dirección. Así nunca compite con lo que está entrando.

   ---- ATADA AL SCROLL, NO DISPARADA ----
   No es un `keyframes` que arranca al cruzar una línea: el
   progreso se calcula en cada fotograma a partir de dónde está
   la pieza. Eso significa que va y VUELVE con el dedo — si subes,
   la pieza se rehace. Un keyframe disparado no se puede deshacer
   a media reproducción, y al subir daría un salto.

   ---- POR QUÉ CADA PIEZA MIDE SU PROPIA ALTURA ----
   La maqueta calculaba un progreso por SECCIÓN y repartía un
   retraso entre sus hijas (`--i`). Aquí no vale: en la maqueta
   cada sección medía una pantalla justa, y en el home real
   «Qué hacemos» mide 2.515px. Con un progreso por sección, sus
   piezas tardarían tres pantallas en irse.

   Midiendo cada pieza contra su propia posición, la cascada sale
   sola: las piezas que están más arriba cruzan la línea antes, y
   el escalonado es exactamente el que dicta la maqueta de la
   página. Además funciona igual en una sección de una pantalla
   que en una de cinco, sin números que ajustar a mano.
   ============================================================ */

/* La línea donde una pieza empieza a irse y donde termina de
   hacerlo, en fracción de pantalla contada desde arriba.

   No arranca en 0 —al tocar el borde de arriba— porque entonces
   la pieza se iría de golpe en los últimos píxeles, cuando ya
   casi no se ve. Arrancando a un 18% de pantalla, el efecto pasa
   donde el ojo todavía está puesto.

   Pero tampoco puede arrancar demasiado abajo: a 0,30 el titular
   del hero, que en reposo cae al 27,6% de la pantalla, YA nacía
   con un 5% de salida hecha — se veía al 95% de tinta sin que
   nadie hubiera tocado nada. La línea tiene que quedar por
   ENCIMA de la pieza más alta en reposo, y 0,18 lo cumple con
   margen.

   Y termina en -0,22, o sea con la pieza ya fuera por arriba:
   así acaba de apagarse ANTES de salir de plano y nunca se ve el
   corte del borde. */
const EMPIEZA = 0.18;
const TERMINA = -0.22;

/* Margen de guardia del observador: qué se considera "cerca de
   la pantalla" y por tanto merece medirse en cada fotograma. Un
   home de 7.400px tiene muchas piezas, y medirlas todas en cada
   scroll es trabajo tirado — `getBoundingClientRect` obliga al
   navegador a recalcular maqueta. */
const GUARDIA = "120% 0px 120% 0px";

/* ---- LAS PIEZAS, SECCIÓN A SECCIÓN ----
   Se listan aquí y no se marcan en el JSX a propósito: así se
   añade una sección tocando UN fichero, y los componentes del
   home se quedan exactamente como están. Si un selector deja de
   existir, esa pieza simplemente no se anima — no rompe nada. */
const PIEZAS = [
  /* ---- 1 · INICIO ---- */
  ".hero__title",
  ".hero__description",
  ".hero__buttons",

  /* ---- 2 · QUÉ HACEMOS + CÓMO LO HACEMOS ----
     Las dos viven dentro de la misma sección (`#que-hacemos` →
     `.iia`): «Qué hacemos» es `.iia__intro` y «¿Cómo lo hacemos?»
     es `.iia__metodo`, con «Nuestra Misión / Visión» en medio.

     Los selectores no son inventados: son LOS MISMOS que ya usa
     el telón para saber qué destapar (ver TELON_PIEZAS en
     InteligenciaIA.jsx). Si esas son las piezas al entrar, esas
     son las piezas al salir — y así una sola lista se queda
     desactualizada en vez de dos. */
  ".iia__intro-texto > *",
  ".iia__marco",

  /* ---- LA CAJA, NO SUS MITADES ----
     Aquí ponía `.iia__proposito-mitad`, que es lo que lista el
     telón. Para entrar está bien —el telón destapa cada mitad por
     separado—, pero para salir estaba mal: medido sobre la
     página, una mitad NO TIENE FONDO NI BORDE (`background: none`,
     `border: 0`). El panel que se ve —degradado, borde de 1px,
     radio de 22px y sombra— es de `.iia__proposito`.

     O sea que se estaba animando el aire: el texto de dentro se
     iba con su onda y la caja se quedaba entera y a plena luz,
     que es exactamente lo que se veía. */
  ".iia__proposito",
  ".iia__metodo > .iia__rotulo-centro",
  ".iia__metodo-titulo",
  ".iia__metodo-entrada",

  /* La excepción: el telón destapa `.iia__paso`, que es la FILA
     de dentro de cada tarjeta. Para salir se usa la tarjeta
     entera, porque encogiendo solo su contenido quedarían cuatro
     marcos vacíos flotando mientras el texto se va. */
  ".iia__tarjeta",

  /* ---- 3 · NUESTROS TRABAJOS ----
     `.latest-projects__all` («Ver todos los proyectos») se queda
     FUERA a propósito: lleva `lpAllPulse`, una animación infinita
     sobre su transform, y una animación gana a una declaración
     pase lo que pase. Añadirlo no haría nada y solo confundiría a
     quien viniera después a mirar por qué no se mueve. */
  "#proyectos .latest-projects__intro .rotulo",
  ".latest-projects__title",
  ".latest-projects__description",

  /* ---- LA VITRINA SALE ENTERA, AUNQUE ENTRE POR PIEZAS ----
     Aquí ponían `.lp-mano__perla` y `.lp-mano__turnos` sueltas —
     los mismos selectores del telón, según la regla de una sola
     lista. Para SALIR estaba mal: la perla mide ~360px y la tira
     de turnos ~95, así que la perla se apagaba con su recorrido y
     la tira, cuyo borde aún no había cruzado la línea, se quedaba
     SOLA y a plena luz con un vacío encima — tres circulitos
     huérfanos en mitad del morado (medido: perla a 0,78 bajando y
     turnos a f=0, opacidad 1).

     La entrada y la salida no tienen por qué compartir grano: el
     telón descubre pieza a pieza porque eso es lo que se quiere
     al LLEGAR —cada cosa a su ritmo—, pero al irse son UNA
     vitrina: el destacado y su índice. Animando el contenedor, la
     tira se va con su perla, y con el recorrido que ya cuenta el
     alto de la pieza (ver pintar), el bloque entero sigue visible
     mientras ocupe pantalla. */
  ".lp-mano",

  /* ---- 4 · NOSOTROS ----
     De `.ab-gente` se animan sus DOS fichas y no el bloque: mide
     886px, y una pieza tan alta tardaría dos pantallas en irse
     porque el progreso se mide contra su borde de arriba. Además
     el bloque lleva `about-copy-in`, una animación con relleno
     que ganaría a la salida. */
  "#nosotros .about-hero__text .rotulo",
  ".about-hero__title",
  ".about-hero__desc",
  ".ab-gente__persona",
  ".ab-valores__rotulo",
  ".ab-valores__pieza",

  /* ---- 5 · CASOS DE USO ----
     De los cuatro `.uc__pane` se anima su CONTENEDOR: son cuatro
     paneles apilados de los que solo uno se ve a la vez (es un
     control por pestañas), así que marcarlos por separado sería
     animar tres cosas invisibles y una visible. */
  "#casos-de-uso .uc__portada .rotulo",
  ".uc__titulo",
  ".uc__entradilla",
  ".uc__seg",
  ".uc__panes",

  /* `.uc__pieza` NO está, y no es un olvido: mide 250px pero
     está vacía —sin fondo, sin pseudo-elementos y sin hijos—.
     Animarla es animar el aire, que es el mismo fallo que hubo
     con las mitades de «Nuestra Misión». Se comprobó midiendo,
     no leyendo el CSS. */
];

/* ---- POR QUÉ AQUÍ NO SE PARTE NINGÚN TEXTO ----
   Hubo una versión que partía los titulares en letras y los
   párrafos en palabras, para que la onda recorriera el texto trozo
   a trozo como en la maqueta. Se retiró, y conviene dejar escrito
   el motivo para que nadie lo reintente sin saberlo.

   Partir un texto CAMBIA CÓMO SE VE, aunque las letras sean las
   mismas:

     · se pierde el kerning. Dos letras dentro de un mismo texto se
       ajustan entre sí; metidas en cajas distintas, no. Medido
       contra la página sin partir, los titulares cambiaban entre
       un 12% y un 52% de sus píxeles.

     · se rompen los degradados. Cuatro de los cinco titulares
       llevan un `<span>` de acento, y si ese acento pinta con un
       degradado recortado al texto, al partirlo cada letra pasa a
       llevar el degradado ENTERO en lugar de su porción. El color
       cambia, y es lo que se vio.

     · y las reglas de cada sección apuntan a `span`. En «Casos de
       uso» hay `.uc__titulo span { display: block }` para que el
       acento caiga a su línea; esa regla alcanzaba también a las
       palabras partidas y el titular salía a palabra por línea.

   Así que la onda se queda a nivel de BLOQUE: el titular entero
   cabalga la ola en vez de desarmarse letra a letra. Se pierde
   parte del efecto y se gana que el texto se vea exactamente como
   estaba, que es lo que se pidió.

   El partidor sigue en utils/partirTexto.js —ya sabe respetar el
   marcado de dentro— por si algún día se quiere aplicar a un texto
   que no tenga acento ni reglas propias. */
const TITULARES = [];

const PARRAFOS = [];

/* El titular del hero ya viene partido desde el JSX con su propia
   cascada de entrada. Se le marcan las letras que ya tiene en vez
   de volver a partirlo, que sería cargarse esa entrada. */
const YA_PARTIDOS = [[".hero__title", ".hero__title-letra"]];

export default function useSalidaHome(activo = true) {
  useEffect(() => {
    if (!activo) return;
    if (typeof window === "undefined") return;

    /* con movimiento reducido no se monta nada: ni observador ni
       escucha de scroll. El home se queda quieto y entero. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* solo en la mano. En escritorio el home se queda como está:
       toda esta tanda de diseño es del móvil, y la salida se
       eligió mirando un teléfono. */
    const mano = window.matchMedia("(max-width: 1079px)");
    if (!mano.matches) return;

    const piezas = PIEZAS.flatMap((sel) => [...document.querySelectorAll(sel)]);
    if (!piezas.length) return;

    piezas.forEach((p) => p.setAttribute("data-salida", ""));

    /* ---- SE PARTE EL TEXTO ----
       Antes de la primera medición, para que nada llegue a
       pintarse sin sus trozos. Cada partición devuelve cómo
       deshacerse; se guardan todas y se aplican al desmontar. */
    const deshacer = [
      ...YA_PARTIDOS.flatMap(([contenedor, trozo]) =>
        [...document.querySelectorAll(contenedor)].map((el) =>
          marcarTrozos(el, trozo),
        ),
      ),
      ...TITULARES.flatMap((sel) =>
        [...document.querySelectorAll(sel)].map(enLetras),
      ),
      ...PARRAFOS.flatMap((sel) =>
        [...document.querySelectorAll(sel)].map(enPalabras),
      ),
    ].filter(Boolean);

    /* las que ahora mismo merece la pena medir */
    const cerca = new Set();

    let pedido = false;

    const pintar = () => {
      pedido = false;

      const alto = window.innerHeight;
      const arranque = alto * EMPIEZA;
      const recorrido = alto * (EMPIEZA - TERMINA);

      for (const p of cerca) {
        const y = p.getBoundingClientRect().top;

        /* ---- EL RECORRIDO CUENTA EL ALTO DE LA PIEZA ----
           El progreso se mide desde el borde de ARRIBA, y con el
           recorrido fijo eso condenaba a las piezas altas: la caja
           de Misión/Visión mide ~400px, y cuando su borde superior
           completaba el recorrido, la caja entera estaba apagada
           con la mitad aún en mitad de la pantalla. Medido: 398px
           de pantalla ocupados por un bloque al 73% yendo a 0 — el
           hueco muerto que se veía entre «Qué hacemos» y «¿Cómo lo
           hacemos?».

           Sumando el alto de la pieza al recorrido, apagarse del
           todo exige que también su borde de ABAJO haya salido:
           una pieza no puede quedar invisible mientras siga
           ocupando pantalla. Para las piezas de una línea el
           sumando es ~0 y nada cambia — la coreografía aprobada se
           conserva tal cual donde se aprobó.

           `offsetHeight` y no el alto del rect: el rect encoge con
           el scale de la propia salida, y metería el resultado en
           la fórmula que lo produce — una realimentación que
           acelera el final. El alto de maquetación es estable. */
        const f = Math.min(
          1,
          Math.max(0, (arranque - y) / (recorrido + p.offsetHeight))
        );
        p.style.setProperty("--f", f.toFixed(4));

        /* ---- Y SE LE RETIRA LA ENTRADA, UNA VEZ ----
           Varias piezas llegan con su propia animación de entrada
           y relleno `forwards` —«Nosotros» usa `about-copy-in`—, y
           una animación con relleno gana a CUALQUIER declaración
           de estilo, para siempre. Medido: su rótulo, su titular y
           su texto se quedaban a opacidad 1 con la salida al 40%
           del recorrido. No es un empate de especificidad: la
           salida ni siquiera entra en la puja.

           Se retira JUSTO cuando la pieza empieza a irse, y no
           antes: si la pieza está saliendo, su entrada ya terminó
           —no hay forma de que no— así que no se rompe nada.

           El primer intento fue mirar `getAnimations()` al montar
           y esperar su promesa. No valía: la animación de esa
           sección todavía NO EXISTE al montar, porque arranca
           cuando la sección entra en pantalla. La lista salía
           vacía y no se programaba nada. */
        if (f > 0 && !p.dataset.sinEntrada) {
          p.dataset.sinEntrada = "1";
          p.style.animation = "none";
        }
      }
    };

    /* se lee dentro de un rAF y no en el propio evento: en un
       móvil el scroll llega decenas de veces por segundo, y medir
       en cada aviso es la receta clásica del scroll a tirones */
    const alRodar = () => {
      if (!pedido) {
        pedido = true;
        requestAnimationFrame(pintar);
      }
    };

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) cerca.add(e.target);
          else {
            cerca.delete(e.target);

            /* al salir de la zona de guardia se deja en su estado
               final, no a medias: una pieza que se va por arriba
               queda ida (1) y una que aún no ha llegado queda
               entera (0). Sin esto se quedaría congelada en el
               valor del último fotograma medido, y al volver a
               entrar daría un salto. */
            e.target.style.setProperty(
              "--f",
              e.boundingClientRect.top < 0 ? "1" : "0",
            );
          }
        }

        /* ---- Y SE REPINTA ----
           Sin esta línea, una pieza que VUELVE a la zona de
           guardia se quedaba con el valor que tenía al salir.
           Pasaba de verdad: bajando el home y volviendo arriba de
           un salto, el titular del hero se quedaba en `--f: 1`,
           o sea invisible, con la página entera quieta y él en
           mitad de la pantalla.

           El motivo es que el observador avisa DESPUÉS del
           scroll, en su propio turno: para cuando dice «esta ya
           está cerca», el último evento de scroll ya se atendió y
           no queda nadie que vaya a medirla. Así que el aviso
           tiene que pedir el repintado él mismo. */
        alRodar();
      },
      { rootMargin: GUARDIA },
    );

    piezas.forEach((p) => observador.observe(p));

    window.addEventListener("scroll", alRodar, { passive: true });
    window.addEventListener("resize", alRodar, { passive: true });
    pintar();

    return () => {
      window.removeEventListener("scroll", alRodar);
      window.removeEventListener("resize", alRodar);
      observador.disconnect();

      /* al desmontar se limpia: si no, una pieza que se quedó a
         medio irse volvería a montarse translúcida y encogida */
      piezas.forEach((p) => {
        p.removeAttribute("data-salida");
        p.style.removeProperty("--f");
        p.style.removeProperty("animation");
        delete p.dataset.sinEntrada;
      });

      /* y los textos se vuelven a juntar: un texto partido que se
         queda partido acumularía trozos dentro de trozos la
         próxima vez que se monte el home */
      deshacer.forEach((juntar) => juntar());
    };
  }, [activo]);
}
