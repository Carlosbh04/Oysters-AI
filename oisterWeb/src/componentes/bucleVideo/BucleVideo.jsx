import { useEffect, useRef } from "react";
import "./BucleVideo.css";

/* ============================================================
   VÍDEO EN BUCLE SIN TIRÓN

   El atributo `loop` de HTML rebobina: al llegar al final busca
   el segundo cero y vuelve a arrancar. Ese ir y venir del
   decodificador se ve como un enganchón, y es lo que delata que
   es un clip corto repitiéndose — sobre todo con vídeo de canal
   alfa, que es caro de descomprimir.

   Aquí hay DOS elementos con la misma fuente. Antes de que uno
   termine, el otro ya está rodando desde el principio; en el
   momento del relevo solo se intercambia cuál se ve. No hay
   rebobinado que esperar, así que no hay tirón.

   ---- POR QUÉ EL RELEVO ES SECO Y NO UNA FUNDIDA ----
   La primera versión los cruzaba en 0,7s. Está mal para estos
   clips: llevan canal alfa, y dos capas semitransparentes del
   MISMO objeto no suman opaco —dos al 50% dan 75%, no 100%—, así
   que la figura se aclararía en cada vuelta. Justo el defecto que
   se venía a quitar, cambiado de forma.

   Y no hace falta: medido sobre los dos clips, entre el último
   fotograma y el primero la silueta es idéntica (diferencia
   máxima 0) y el color cambia 3 y 5 sobre 255 de media. El corte
   no se ve. Lo que se veía era el enganchón.

   ---- POR QUÉ NO SE USA `timeupdate` ----
   Es el evento natural para vigilar el minutado y no sirve: el
   navegador lo dispara unas cuatro veces por segundo, así que el
   relevo llegaría hasta 250ms tarde. Se vigila con
   requestAnimationFrame, que da precisión de fotograma.

   ---- Y SOLO MIENTRAS SE VE ----
   Fuera de pantalla se para todo: el bucle, el vigilante y los
   dos decodificadores. En la portada hay varios vídeos a la vez y
   uno que nadie mira no tiene por qué gastar CPU.

   ---- LO QUE VINO DE HeroVideo ----
   Este componente sustituyó al <video> suelto que había en el
   hero, y con él se habría perdido lo que aquel llevaba encima y
   no se ve en el marcado. Está todo aquí porque le sirve a
   cualquiera que use el componente, no solo a la ostra:

     · el atributo `muted` además de la propiedad — React solo
       pone la propiedad, y los Safari viejos miran el marcado al
       decidir si permiten el autoplay;
     · reintento al primer gesto si el navegador bloquea el
       autoplay (ahorro de datos, modo de bajo consumo): no hay
       controles que ofrecer, así que el único plan B es
       aprovechar el primer clic o scroll;
     · reintento cuando el vídeo avisa de que ya puede reproducir,
       porque Safari rechaza el play() que llega sin datos;
     · pausa en pestaña de fondo, que decodificar ahí es batería
       tirada;
     · con `prefers-reduced-motion` no se reproduce nada y se
       queda el primer fotograma: un bucle infinito es movimiento,
       y aquí es puramente decorativo.
   ============================================================ */

/* Cuánto antes del final arranca el suplente. Tiene que bastar
   para que su decodificador coja ritmo: por debajo de ~0,2s
   vuelve a aparecer el enganchón, ahora en el que entra. */
const ADELANTO = 0.35;

/* `className` viste la caja; `clasePista` viste cada <video>. Hay
   que poder separarlas: en el hero, el encuadre y el object-fit de
   la ostra son del vídeo, no del contenedor. */
function BucleVideo({ src, sources, poster, className = "", clasePista = "", ...resto }) {
  const caja = useRef(null);
  const unoRef = useRef(null);
  const dosRef = useRef(null);

  useEffect(() => {
    const uno = unoRef.current;
    const dos = dosRef.current;
    const contenedor = caja.current;
    if (!uno || !dos || !contenedor) return;

    /* React pone `muted` como propiedad pero no como atributo del
       DOM. La propiedad basta en los Safari actuales; el atributo
       es un cinturón gratis para los viejos. */
    for (const v of [uno, dos]) {
      v.defaultMuted = true;
      v.setAttribute("muted", "");
    }

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quieto) {
      /* Con motion reducido no se reproduce nada y se ve el primer
         fotograma. Ese fotograma hay que TRAERLO: el marcado va en
         `preload="none"` (ver abajo por qué), así que sin esta
         línea el hueco se quedaría en el póster — o en nada.
         Solo la pista visible; el suplente jamás llega a verse. */
      uno.preload = "auto";
      uno.load();
      return;
    }

    let raf = null;
    let activo = uno;
    let espera = dos;
    let lanzado = false;
    let vivo = false;
    let aLaVista = false;
    let cancelado = false;

    /* ============================================================
       LA DESCARGA, EN DOS TIEMPOS

       El marcado declara `preload="none"`: montar el componente ya
       no cuesta ni un byte de vídeo. Antes iba en "auto", y con el
       doble búfer eso significaba bajar CADA clip DOS VECES nada
       más montar, estuviera o no en pantalla — medido en la
       portada: la ostra del hero y el cristal de proyectos
       sumaban ~15,6MB de descarga inmediata, la mitad duplicada y
       el cristal entero bajo el pliegue.

       1º tiempo — la pista TITULAR se ceba cuando el observador
       de visibilidad dispara (600px antes de entrar en cuadro,
       para que la descarga gane la carrera al scroll).

       2º tiempo — el SUPLENTE se ceba cuando la titular avisa de
       que tiene cuerda (`canplaythrough`), con una red por si el
       aviso no llega: a media primera vuelta lo ceba el
       vigilante. Así las dos descargas van EN FILA y no en
       paralelo — y la segunda suele salir del caché de disco que
       acaba de llenar la primera. El relevo del bucle no corre
       peligro: el suplente tiene toda la primera reproducción
       para cargarse, y no le hacen falta más que los primeros
       fotogramas para arrancar su turno.
       ============================================================ */
    const cebar = (v) => {
      if (v.preload !== "none") return;
      v.preload = "auto";
      /* load() solo si aún no hay nada: con datos ya pedidos
         reiniciaría la descarga y el tiempo */
      if (v.readyState === 0) v.load();
    };

    const cebarSuplente = () => cebar(dos);
    uno.addEventListener("canplaythrough", cebarSuplente, { once: true });

    const reproducir = (v) => {
      const p = v.play();
      if (!p || typeof p.catch !== "function") return;

      p.catch(() => {
        if (cancelado) return;
        /* bloqueado: se reintenta con el primer gesto */
        const reintento = () => reproducir(v);
        window.addEventListener("pointerdown", reintento, { once: true });
        window.addEventListener("scroll", reintento, { once: true, passive: true });
      });
    };

    const vigilar = () => {
      raf = requestAnimationFrame(vigilar);

      const fin = activo.duration;
      if (!fin || !isFinite(fin)) return;

      const restante = fin - activo.currentTime;

      /* la red del 2º tiempo: si `canplaythrough` no llegó (hay
         navegadores que lo callan con el clip ya en caché), a
         media vuelta el suplente se ceba igual */
      if (restante <= fin * 0.5) cebar(espera);

      if (!lanzado && restante <= ADELANTO) {
        lanzado = true;
        espera.currentTime = 0;
        reproducir(espera);
      }

      /* El relevo se decide por tiempo y no con el evento `ended`:
         `ended` no llega si el vídeo se para por quedarse sin
         búfer justo al final, y el bucle se quedaría clavado. */
      if (lanzado && restante <= 0.05) {
        espera.classList.add("bucle__pista--activa");
        activo.classList.remove("bucle__pista--activa");

        activo.pause();
        activo.currentTime = 0;

        const antes = activo;
        activo = espera;
        espera = antes;
        lanzado = false;
      }
    };

    const arrancar = () => {
      if (vivo || document.hidden || !aLaVista) return;
      vivo = true;
      cebar(activo); /* 1º tiempo: la titular, al hacerse visible */
      reproducir(activo);
      raf = requestAnimationFrame(vigilar);
    };

    const parar = () => {
      vivo = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      uno.pause();
      dos.pause();
    };

    /* Safari rechaza el play() que llega antes de tener datos: se
       reintenta cuando el propio vídeo avisa de que ya puede. */
    const alPoder = () => {
      if (vivo && activo.paused) reproducir(activo);
    };
    uno.addEventListener("canplay", alPoder);
    dos.addEventListener("canplay", alPoder);

    const alCambiarPestana = () => (document.hidden ? parar() : arrancar());
    document.addEventListener("visibilitychange", alCambiarPestana);

    /* ---- DOS OBSERVADORES, DOS TRABAJOS ----
       El de 600px CEBA (arranca la descarga con ventaja para que
       gane la carrera al scroll). El de 10% REPRODUCE: medido, un
       vídeo con alfa decodificando costaba ~11ms por fotograma, y
       con el margen único de 600px los clips reproducían —y
       decodificaban— desde tres cuartos de pantalla antes de
       verse y hasta mucho después de salir. Ahora la descarga
       conserva su colchón y la decodificación solo corre cuando
       el clip está de verdad en pantalla (o a un 10% de entrar:
       el primer fotograma visible ya llega en marcha, como
       siempre). */
    const ioCeba = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) cebar(uno); },
      { rootMargin: "600px" }
    );
    ioCeba.observe(contenedor);

    const io = new IntersectionObserver(
      ([e]) => {
        aLaVista = e.isIntersecting;
        if (aLaVista) arrancar();
        else parar();
      },
      { rootMargin: "10%" }
    );
    io.observe(contenedor);

    return () => {
      cancelado = true;
      io.disconnect();
      ioCeba.disconnect();
      document.removeEventListener("visibilitychange", alCambiarPestana);
      uno.removeEventListener("canplay", alPoder);
      dos.removeEventListener("canplay", alPoder);
      uno.removeEventListener("canplaythrough", cebarSuplente);
      parar();
    };
  }, [src, sources]);

  /* Una fuente suelta o una lista con alternativas por formato:
     los clips con alfa necesitan webm para casi todo y un .mov
     aparte para Safari, que no lee alfa en webm. */
  const pistas = sources ?? (src ? [{ src }] : []);

  const comun = {
    muted: true,
    playsInline: true,
    /* "none": montar no descarga nada. La descarga la administra
       el efecto en dos tiempos — ver "LA DESCARGA, EN DOS
       TIEMPOS" arriba. */
    preload: "none",
    disablePictureInPicture: true,
    "aria-hidden": true,
    tabIndex: -1,
    ...resto,
  };

  return (
    <span ref={caja} className={`bucle ${className}`}>
      <video
        ref={unoRef}
        poster={poster}
        className={`bucle__pista bucle__pista--activa ${clasePista}`}
        {...comun}
      >
        {pistas.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>

      {/* el suplente: invisible y parado salvo en el relevo */}
      <video ref={dosRef} className={`bucle__pista ${clasePista}`} {...comun}>
        {pistas.map((s) => (
          <source key={s.src} src={s.src} type={s.type} />
        ))}
      </video>
    </span>
  );
}

export default BucleVideo;
