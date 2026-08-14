import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./WorkCarousel.css";

/* ============================================================
   CARRUSEL DE LA GALERÍA

   Recibe una lista de medios ya normalizada:
     [{ tipo: "imagen" | "video", src, alt }]

   ---- POR QUÉ TODOS LOS MEDIOS SIGUEN MONTADOS ----
   Se apilan y solo cambia la opacidad. Desmontar el anterior
   haría imposible el fundido cruzado (no habría con qué fundir)
   y además obligaría a recargar el vídeo cada vez que se vuelve
   a él.

   El precio es que los vídeos que no se ven siguen en el DOM;
   por eso van con preload="metadata": traen la cabecera para
   poder pintar el primer fotograma y nada más.
   ============================================================ */

/* Umbral del gesto, en píxeles. Por debajo de 45 el carrusel
   cambia de imagen cuando en realidad estabas haciendo scroll
   vertical y te has desviado un poco al arrastrar. */
const UMBRAL_GESTO = 45;

/* Proporción de partida, mientras no se conoce la real. Sirve
   para reservar el hueco antes de que cargue nada; en cuanto
   llegan los metadatos se sustituye por la de verdad. */

function WorkCarousel({ medios, titulo }) {
  const [actual, setActual] = useState(0);
  const inicioX = useRef(null);
  const videosRef = useRef([]);

  /* ---- EL VÍDEO QUE DEJA DE VERSE, SE PAUSA ----
     Los medios siguen montados a propósito (ver el porqué arriba),
     pero sin esto un vídeo en marcha seguía REPRODUCIÉNDOSE al
     cambiar de diapositiva: invisible, decodificando y con audio
     — y sin controles para pararlo, porque `controls` solo lo
     lleva el activo. Se pausa sin tocar currentTime: al volver,
     el vídeo está donde lo dejaste y se reanuda con sus controles,
     que es el contrato de siempre (aquí nadie llama a play(): la
     reproducción siempre la inicia el usuario). */
  useEffect(() => {
    videosRef.current.forEach((v, i) => {
      if (v && i !== actual && !v.paused) v.pause();
    });
  }, [actual]);

  /* ---- EL MARCO ES SIEMPRE 16:9 ----
     Aquí vivía un mecanismo que leía la proporción real de cada
     archivo —`videoWidth/videoHeight` o `naturalWidth/
     naturalHeight`— y se la aplicaba al marco, con reintentos
     porque los vídeos no avisan cuando la tienen.

     Funcionaba, y era el problema: el marco cambiaba de forma
     entre proyectos y entre diapositivas del mismo proyecto, así
     que ninguna ficha se parecía a otra. Con el formato fijo y
     `object-fit: contain`, todos los detalles tienen la misma
     silueta y ningún medio se recorta — un vertical se ve entero,
     con banda a los lados, que es lo que hace cualquier
     reproductor.

     Se fueron con ello sesenta líneas: el estado de las
     proporciones, la ref de sondeo con sus doce reintentos y el
     modo vertical con su tope de altura. */

  if (!medios.length) return null;

  const total = medios.length;


  /* el módulo con el ajuste del negativo da el bucle infinito en
     los dos sentidos: en JS, -1 % 3 es -1, no 2 */
  const ir = (i) => setActual(((i % total) + total) % total);

  const alTeclado = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      ir(actual + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      ir(actual - 1);
    }
  };

  const alEmpezarGesto = (e) => {
    inicioX.current = e.changedTouches[0].clientX;
  };

  const alTerminarGesto = (e) => {
    if (inicioX.current === null) return;
    const avance = e.changedTouches[0].clientX - inicioX.current;
    inicioX.current = null;
    if (Math.abs(avance) < UMBRAL_GESTO) return;
    ir(actual + (avance < 0 ? 1 : -1));
  };

  return (
    <div
      className={"wd-carrusel"}
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Galería de ${titulo}`}
      tabIndex={0}
      onKeyDown={alTeclado}
      onTouchStart={alEmpezarGesto}
      onTouchEnd={alTerminarGesto}
    >
      <div className="wd-carrusel__marco">
        {medios.map((m, i) => {
          const activo = i === actual;
          const clase = `wd-carrusel__medio ${
            activo ? "wd-carrusel__medio--activo" : ""
          }`;

          /* aria-hidden en los que no se ven: si no, un lector de
             pantalla anuncia los cuatro medios seguidos como si
             estuvieran todos a la vista */
          return m.tipo === "video" ? (
            <video
              key={m.src}
              ref={(el) => {
                videosRef.current[i] = el;
              }}
              className={clase}
              src={m.src}
              controls={activo}
              preload="metadata"
              playsInline
              aria-hidden={!activo}
              aria-label={m.alt}
            />
          ) : (
            <img
              key={m.src}
              className={clase}
              src={m.src}
              alt={m.alt}
              loading={i === 0 ? "eager" : "lazy"}
              aria-hidden={!activo}
            />
          );
        })}

        {total > 1 && (
          <>
            <button
              type="button"
              className="wd-carrusel__flecha wd-carrusel__flecha--prev"
              onClick={() => ir(actual - 1)}
              aria-label="Medio anterior"
            >
              <ChevronLeft strokeWidth={1.6} />
            </button>

            <button
              type="button"
              className="wd-carrusel__flecha wd-carrusel__flecha--next"
              onClick={() => ir(actual + 1)}
              aria-label="Medio siguiente"
            >
              <ChevronRight strokeWidth={1.6} />
            </button>

            {/* Aquí iba una tira de miniaturas. Quitada: con las
                flechas y el contador ya se navega, y la tira tapaba
                el borde inferior de la propia imagen —se apoyaba
                sobre ella— además de cargar una copia extra de cada
                medio, vídeos incluidos. */}
          </>
        )}
      </div>

      {total > 1 && (
        /* aria-live para que al cambiar con el teclado se anuncie
           en qué punto estás; "polite" para no cortar la lectura */
        <span className="wd-carrusel__contador" aria-live="polite">
          {actual + 1} / {total}
        </span>
      )}
    </div>
  );
}

export default WorkCarousel;
