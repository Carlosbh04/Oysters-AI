import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import CortinaPixeles from "./CortinaPixeles";
import useMediaQuery from "../../hooks/useMediaQuery";

/* ============================================================
   EL VÍDEO DEL BLOQUE, CON SUS PROPIOS MANDOS

   Aquí había un marco vacío: un lienzo con un botón de play
   dibujado y una barra de mandos que no mandaba nada, esperando a
   que llegara la pieza. Ya está, así que el dibujo pasa a
   funcionar.

   ---- POR QUÉ NO SE USAN LOS MANDOS DEL NAVEGADOR ----
   Sería una línea (`controls`) y se acabó. El problema es que cada
   navegador pinta los suyos: Safari unos, Chrome otros, y ninguno
   se parece a la maqueta. Como la barra ya estaba diseñada y
   dibujada, hacerla funcionar cuesta menos que renunciar a ella.

   Lo que NO se hereda del dibujo es el engranaje de ajustes: no
   había nada detrás. Un botón que no hace nada es peor que no
   tenerlo, así que se va y en su lugar queda el de silencio, que
   sí tiene sentido en un vídeo con voz.

   ---- LO QUE SE LEE DEL VÍDEO Y NO SE ESCRIBE ----
   La duración salía escrita a mano en el marcado ("0:00 / 1:13").
   Ahora se pregunta al archivo: si mañana se cambia la pieza por
   otra más larga, el marcador se entera solo.
   ============================================================ */

/* El mismo corte que el resto del proyecto para decidir "esto es
   una mano" (About, VolverArriba, LatestProjects). */
const CORTE_MANO = "(max-width: 1079px)";

/* Cuánto hay que arrastrar hacia abajo para que se cierre. Por
   debajo de esto se entiende que ha sido un roce y la pieza vuelve
   a su sitio. */
const ARRASTRE_CIERRA = 90;

const FUENTE = "/videos/como-lo-hacemos/oysters.mp4";
const POSTER = "/img/como-lo-hacemos/oysters-poster.jpg";

/* segundos → m:ss. Sin ceros a la izquierda en los minutos, que es
   como lo escribe cualquier reproductor para piezas de menos de
   una hora. */
const reloj = (s) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const seg = Math.floor(s % 60);
  return `${m}:${String(seg).padStart(2, "0")}`;
};

function VideoMarco() {
  const videoRef = useRef(null);
  const cajaRef = useRef(null);

  /* ============================================================
     EN LA MANO, EL VÍDEO SE ABRE DE OTRA MANERA

     En escritorio esto se abre con la cortina de píxeles: se cierra,
     el vídeo crece detrás y se vuelve a abrir. En una mano ese
     recorrido no encaja —dura más de un segundo y en una pantalla
     estrecha se lee como una espera, no como un gesto— así que ahí
     el vídeo SALTA a ocupar la pantalla con un rebote y se cierra
     arrastrando hacia abajo, que es lo que cualquiera tiene
     aprendido de la galería de fotos del teléfono.

     Cambia además el estado de reposo: en la mano el marco es solo
     el cartel —póster, play y un sello que dice a dónde lleva— sin
     la barra de mandos debajo, que ahí solo servía para gastar alto
     en controles de algo que aún no se está viendo. Los mandos
     aparecen dentro, cuando el vídeo ya ocupa la pantalla.
     ============================================================ */
  const esMano = useMediaQuery(CORTE_MANO);

  /* ---- LA SECUENCIA DE ENTRADA ----
     Al pulsar play no se reproduce ahí mismo:

       1. se cierra la cortina de píxeles
       2. DETRÁS de ella el vídeo pasa a ocupar la pantalla
       3. la cortina se abre
       4. y ENTONCES arranca la película

     El paso 4 iba antes en el 2: el vídeo echaba a andar a oscuras y
     al descubrirlo ya llevaba medio segundo corrido, así que el
     principio se lo comía la cortina. Ahora lo que aparece es el
     primer fotograma quieto, y de ahí arranca.

       fase   "cerrando" → "abriendo" → null
       grande el vídeo ocupa la pantalla */
  const [fase, setFase] = useState(null);
  const [grande, setGrande] = useState(false);

  /* qué hacer cuando la cortina acaba de cerrarse (a oscuras) y qué
     hacer cuando acaba de abrirse (ya a la vista) */
  const alCerrarse = useRef(null);
  const alAbrirse = useRef(null);

  const [sonando, setSonando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [t, setT] = useState(0);
  const [duracion, setDuracion] = useState(0);

  /* `arrancado` distingue "no ha empezado nunca" de "está en
     pausa": solo en el primero se enseña el botón grande del
     centro, que es una invitación, no un control. */
  const [arrancado, setArrancado] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const alTiempo = () => setT(v.currentTime);
    const alCargar = () => setDuracion(v.duration || 0);
    const alSonar = () => setSonando(true);
    const alParar = () => setSonando(false);
    const alTerminar = () => {
      setSonando(false);
      setArrancado(false); /* vuelve el botón grande: se puede repetir */
    };

    v.addEventListener("timeupdate", alTiempo);
    v.addEventListener("loadedmetadata", alCargar);
    v.addEventListener("play", alSonar);
    v.addEventListener("pause", alParar);
    v.addEventListener("ended", alTerminar);

    /* por si los metadatos ya estaban cuando montó */
    if (v.readyState >= 1) alCargar();

    return () => {
      v.removeEventListener("timeupdate", alTiempo);
      v.removeEventListener("loadedmetadata", alCargar);
      v.removeEventListener("play", alSonar);
      v.removeEventListener("pause", alParar);
      v.removeEventListener("ended", alTerminar);
    };
  }, []);

  /* ---- FUERA DE PANTALLA, EL VÍDEO SE PAUSA ----
     Si el visitante lo deja sonando y sigue scrolleando por la
     home, el vídeo continuaba decodificando (y sonando) sin nadie
     delante. Se pausa conservando currentTime; NO se reanuda solo
     al volver — reanudar es del usuario, y la interfaz ya refleja
     la pausa por su propio listener de `pause`. En grande no
     aplica: el marco es quien ocupa la pantalla y sigue
     intersectando. */
  useEffect(() => {
    const caja = cajaRef.current;
    if (!caja || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) return;
        const v = videoRef.current;
        if (v && !v.paused) v.pause();
      },
      { threshold: 0 }
    );
    io.observe(caja);
    return () => io.disconnect();
  }, []);

  /* ---- ABRIR Y CERRAR EN GRANDE ----
     Las dos hacen lo mismo: cerrar la cortina, cambiar el mundo
     detrás y volver a abrirla. Lo que cambia es qué se hace en
     medio —y, al abrir, qué se hace DESPUÉS—, y eso viaja en dos
     funciones que se guardan hasta que toque. */
  const conCortina = useCallback(
    (enMedio, alFinal = null) => {
      /* con una cortina en marcha no se admite otra: dos
         pulsaciones seguidas dejarían la secuencia a medias */
      if (fase) return;
      alCerrarse.current = enMedio;
      alAbrirse.current = alFinal;
      setFase("cerrando");
    },
    [fase]
  );

  const cortinaCerrada = useCallback(() => {
    if (fase !== "cerrando") return;
    alCerrarse.current?.();
    alCerrarse.current = null;
    setFase("abriendo");
  }, [fase]);

  const cortinaAbierta = useCallback(() => {
    if (fase !== "abriendo") return;
    setFase(null);
    alAbrirse.current?.();
    alAbrirse.current = null;
  }, [fase]);

  const abrirEnGrande = useCallback(() => {
    /* ---- EL PERMISO DE SONIDO SE PIDE AQUÍ, EN EL PROPIO CLIC ----
       El navegador solo deja reproducir CON SONIDO si la orden nace
       de un gesto del usuario. Y el play de verdad ya no ocurre
       cerca del clic: ahora espera a que la cortina se abra del
       todo, más de un segundo después. Safari, para entonces, ya no
       lo cuenta como gesto.

       Este play seguido de pausa NO reproduce nada: al pausar en el
       mismo turno del bucle de eventos no llega a sonar ni a pintar
       un fotograma —la promesa se rompe con AbortError, de ahí el
       catch—. Lo que sí hace es dejar el elemento marcado como
       "iniciado por el usuario", que es lo que abre la puerta al
       play de después. */
    const v = videoRef.current;
    if (v && v.paused) {
      v.play().catch(() => {});
      v.pause();
    }

    /* ---- LA MANO NO PASA POR LA CORTINA ----
       Salta directa: el marco pasa a ocupar la pantalla y el CSS le
       pone el rebote. El play va aquí mismo y no un segundo después,
       así que sigue pegado al gesto — que es justo lo que el
       navegador exige para dejar que suene. */
    if (esMano) {
      setGrande(true);
      setArrancado(true);
      v?.play().catch(() => {
        if (!v) return;
        v.muted = true;
        setMudo(true);
        v.play().catch(() => {});
      });
      return;
    }

    conCortina(
      /* a oscuras: el salto de tamaño */
      () => {
        setGrande(true);
        setArrancado(true);
      },
      /* ya con la cortina fuera: arranca */
      () => {
        const vid = videoRef.current;
        if (!vid) return;
        /* si aun así lo rechazara, suena mudo en vez de quedarse
           congelado; el botón de sonido está a un clic */
        vid.play().catch(() => {
          vid.muted = true;
          setMudo(true);
          vid.play().catch(() => {});
        });
      }
    );
  }, [conCortina, esMano]);

  const cerrarGrande = useCallback(() => {
    if (esMano) {
      videoRef.current?.pause();
      setGrande(false);
      setArrancado(false);
      return;
    }

    conCortina(() => {
      videoRef.current?.pause();
      setGrande(false);
      /* ---- Y VUELVE EL BOTÓN GRANDE DEL CENTRO ----
         Sin esto el recuadro pequeño se quedaba con cara de
         reproductor a medio usar: el vídeo pausado, sin invitación
         visible, y el único play a mano era el de la barra. */
      setArrancado(false);
    });
  }, [conCortina, esMano]);

  /* ---- DARLE AL PLAY ES SIEMPRE VERLO EN GRANDE ----
     Salvo que ya lo esté. Aquí estaba el fallo: al cerrar con la X,
     el vídeo volvía a su recuadro pero se quedaba `arrancado`, así
     que el siguiente play era un play a secas —sin cortina— y la
     película seguía dentro del cuadrito.

     El recuadro es el cartel, no la sala: o se ve en grande, o no se
     ve. Por eso todo lo que signifique "reproducir" —el botón del
     centro, el de la barra y el clic sobre el propio vídeo— pasa por
     aquí, y desde el recuadro cualquiera de los tres abre la
     cortina. */
  const reproducir = useCallback(() => {
    if (!grande) {
      abrirEnGrande();
      return;
    }

    const v = videoRef.current;
    if (!v) return;
    /* si ya había terminado, volver a pulsar es empezar de nuevo y
       no quedarse clavado en el último fotograma */
    if (v.ended) v.currentTime = 0;
    setArrancado(true);
    v.play().catch(() => {});
  }, [grande, abrirEnGrande]);

  /* pausar es siempre pausar; reproducir es lo de arriba */
  const alternar = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) reproducir();
    else v.pause();
  }, [reproducir]);

  /* en grande, la página de detrás no debe moverse: el vídeo ocupa
     la pantalla y el scroll ahí es del ratón perdido, no una
     intención */
  useEffect(() => {
    if (!grande) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const alTeclear = (e) => {
      if (e.key === "Escape") cerrarGrande();
    };
    window.addEventListener("keydown", alTeclear);

    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", alTeclear);
    };
  }, [grande, cerrarGrande]);

  /* ---- ARRASTRAR HACIA ABAJO PARA CERRAR ----
     El vídeo sigue al dedo y se encoge y se apaga a la vez, así que
     durante el gesto ya se ve a dónde lleva: soltarlo cierra. Si no
     se baja lo suficiente vuelve a su sitio, que es la mitad que
     suele olvidarse y la que hace que probar el gesto no dé miedo.

     Los mandos quedan fuera: arrastrar la barra de avance es
     buscar en la película, no cerrarla. */
  const [arrastre, setArrastre] = useState(0);
  const origenY = useRef(null);

  const alPulsar = (e) => {
    if (!grande || !esMano) return;
    if (e.target.closest(".iia__mandos")) return;
    origenY.current = e.clientY;
  };

  const alMover = (e) => {
    if (origenY.current === null) return;
    setArrastre(Math.max(0, e.clientY - origenY.current));
  };

  const alSoltar = () => {
    if (origenY.current === null) return;
    const recorrido = arrastre;
    origenY.current = null;
    setArrastre(0);
    if (recorrido > ARRASTRE_CIERRA) cerrarGrande();
  };

  const silenciar = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMudo(v.muted);
  }, []);

  const pantallaCompleta = useCallback(() => {
    const caja = cajaRef.current;
    if (!caja) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else caja.requestFullscreen?.();
  }, []);

  /* ---- LA BARRA ES UN <input type="range"> ----
     Y no un <div> con un `onClick` que calcula el porcentaje, que
     es lo que suele hacerse. Con el input, arrastrar, pulsar en un
     punto y moverse con las flechas del teclado vienen de fábrica,
     y además es un control que un lector de pantalla sabe anunciar.
     Lo que se pinta encima es solo apariencia. */
  const buscar = (e) => {
    const v = videoRef.current;
    if (!v || !duracion) return;
    v.currentTime = (Number(e.target.value) / 1000) * duracion;
    setT(v.currentTime);
  };

  const avance = duracion ? (t / duracion) * 1000 : 0;

  return (
    <div
      className={`iia__marco ${grande ? "iia__marco--grande" : ""}`}
      /* ---- ABIERTO, SE SALE DEL FLUJO ----
         Al ocupar la pantalla esto pasa a `position: fixed`, así
         que deja de ser una pieza de la página que sube con el
         scroll. La salida del home tiene que soltarlo: seguía
         escribiéndole su progreso y el vídeo salía encogido al
         82,9% y translúcido, dejando ver la página por debajo.
         Ver el porqué completo en salidaHome.css. */
      data-fuera-de-flujo={grande || undefined}
      ref={cajaRef}
      onPointerDown={alPulsar}
      onPointerMove={alMover}
      onPointerUp={alSoltar}
      onPointerCancel={alSoltar}
      /* durante el arrastre manda el dedo, no la transición: sin
         desactivarla el vídeo iría siempre un poco por detrás */
      style={
        arrastre
          ? {
              transform: `translateY(${arrastre}px) scale(${1 - arrastre / 1400})`,
              opacity: Math.max(0, 1 - arrastre / 380),
              transition: "none",
            }
          : undefined
      }
    >
      <div className="iia__marco-lienzo">
        <video
          ref={videoRef}
          className="iia__video"
          src={FUENTE}
          poster={POSTER}
          /* metadata y no auto: en la home este bloque está bien
             abajo, y precargar 16MB que quizá nadie reproduzca es
             gastar los datos del visitante por él. Con metadata
             llegan la duración y el póster, que es lo que hace
             falta para pintar el marco. */
          preload="metadata"
          playsInline
          onClick={alternar}
        />

        {/* el botón grande: solo antes de empezar */}
        {!arrancado && (
          <button
            type="button"
            className="iia__play"
            onClick={reproducir}
            aria-label="Reproducir el vídeo a pantalla completa"
          >
            <Play strokeWidth={0} fill="currentColor" aria-hidden="true" />
          </button>
        )}

        {/* solo se ve en la mano y en reposo: dice a dónde lleva el
            play, que sin barra de mandos debajo no se daba por
            supuesto (ver el bloque de esMano arriba) */}
        {!grande && esMano && (
          <span className="iia__sello">Ver a pantalla completa</span>
        )}
      </div>

      {/* el vídeo es 16:9 y una pantalla de mano es alta: arriba
          sobra negro. En vez de dejarlo muerto, lleva el rótulo de
          la pieza — y el tirador dice que esto se arrastra. */}
      {grande && esMano && (
        <div className="iia__cabecera" aria-hidden="true">
          <span className="iia__tirador" />
          <p className="iia__cabecera-rotulo">¿Cómo lo hacemos?</p>
          <p className="iia__cabecera-titulo">Oysters AI · la pieza</p>
        </div>
      )}

      <div className="iia__mandos">
        <button
          type="button"
          className="iia__mando"
          onClick={alternar}
          aria-label={sonando ? "Pausar" : "Reproducir"}
        >
          {sonando ? (
            <Pause className="iia__mando-icono" strokeWidth={0} fill="currentColor" />
          ) : (
            <Play className="iia__mando-icono" strokeWidth={0} fill="currentColor" />
          )}
        </button>

        <span className="iia__tiempo">
          {reloj(t)} / {reloj(duracion)}
        </span>

        <input
          className="iia__barra"
          type="range"
          min="0"
          max="1000"
          value={avance}
          onChange={buscar}
          aria-label="Avance del vídeo"
          /* el relleno de la izquierda se pinta con un degradado
             cuyo corte sigue al valor: una variable y ya, sin un
             segundo elemento que mantener sincronizado */
          style={{ "--avance": `${avance / 10}%` }}
        />

        <button
          type="button"
          className="iia__mando"
          onClick={silenciar}
          aria-label={mudo ? "Activar el sonido" : "Silenciar"}
        >
          {mudo ? (
            <VolumeX className="iia__mando-icono" strokeWidth={1.9} />
          ) : (
            <Volume2 className="iia__mando-icono" strokeWidth={1.9} />
          )}
        </button>

        <button
          type="button"
          className="iia__mando"
          onClick={pantallaCompleta}
          aria-label="Pantalla completa"
        >
          <Maximize className="iia__mando-icono" strokeWidth={1.9} />
        </button>
      </div>

      {grande && (
        <button
          type="button"
          className="iia__cerrar"
          onClick={cerrarGrande}
          aria-label="Cerrar el vídeo"
        >
          <X strokeWidth={2.2} />
        </button>
      )}

      {/* montada SOLO durante la coreografía: sin fase devolvía
          null pero pagaba sus hooks (el useMemo de ~450 retardos
          y su listener de resize) durante toda la vida de la
          portada. La fase cubre cerrar y abrir enteros, así que
          el resultado visual es el mismo. */}
      {fase && (
        <CortinaPixeles
          fase={fase}
          alTerminar={fase === "cerrando" ? cortinaCerrada : cortinaAbierta}
        />
      )}
    </div>
  );
}

export default VideoMarco;
