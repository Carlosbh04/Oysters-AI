import { useRef } from "react";
import BucleVideo from "../../componentes/bucleVideo/BucleVideo";
import "./HeroVideo.css";

import useHeroScrollDock from "../../hooks/useHeroScrollDock";
import useMediaQuery from "../../hooks/useMediaQuery";

/* La ostra del hero, en VÍDEO — ahora con canal alfa DE VERDAD.

   Historia corta, para entender por qué este archivo es tan
   pequeño: el primer vídeo llegó en mp4 sobre negro, sin alfa, y
   la transparencia hubo que fabricarla — un canvas WebGL derivaba
   el alfa del brillo de cada píxel, con tres bandas de umbrales,
   una máscara de suelo y una doble rampa para la gema, todo
   medido fotograma a fotograma. Aquel código ya avisaba de cuál
   era LA SOLUCIÓN DE VERDAD: exportar el vídeo con canal alfa
   real. Es lo que hay ahora, así que el keying entero se ha ido y
   el navegador compone la transparencia solo.

   Si algún día el vídeo vuelve a llegar sin alfa, no resucites el
   keying de memoria: está en el historial de git (busca
   "KEY_INVISIBLE" en este archivo).

   ---- LA LECCIÓN DE SAFARI, para no repetirla ----
   Safari evalúa su política de autoplay cuando el vídeo tiene
   datos, y si en ese instante el elemento es INVISIBLE decide
   "no", planta su botón de play con una sombra oscura encima de
   toda la caja del vídeo, y no re-evalúa al aparecer. Por eso:
   · la escena monta al TERMINAR la intro (ver Home.jsx), nunca
     escondida detrás de ella con opacity 0;
   · aquí no hay fundido propio ni fase invisible — con alfa real
     un <video> sin datos no pinta ni un píxel, así que puede
     nacer visible, que es lo que Safari exige. La entrada visual
     la orquesta Home.css (.hero--enter).
   Chrome ignora la visibilidad para vídeo silenciado; que algo
   funcione ahí no dice nada de Safari.

   La coreografía de scroll (viajar hacia HowWeWork y acoplarse)
   es la misma de siempre: useHeroScrollDock actúa sobre
   .hero__right y le da igual qué haya dentro. */

/* ---- DÓNDE VIVEN LOS VÍDEOS ----
   En public/videos/hero/ (ver el LEEME.md de esa carpeta): se
   sirven tal cual, sin pasar por Vite.

   EL ORDEN ES CRÍTICO: el navegador se queda con la PRIMERA
   fuente que sepa reproducir.
   · el mov (HEVC con alfa) va PRIMERO — es el formato con
     transparencia que entienden Safari y iOS. Va en contenedor
     QuickTime y no mp4 A PROPÓSITO: el codificador nativo de
     Apple (AVAssetWriter/VideoToolbox, que es quien generó este
     archivo) solo escribe HEVC-con-alfa en .mov, y el intento de
     remultiplexarlo a .mp4 con ffmpeg producía un archivo que
     Safari ACEPTA pero no sabe DECODIFICAR (MEDIA_ERR_DECODE,
     hero en blanco). El .mov tal cual sale del códec de Apple
     reproduce garantizado.
   · el webm (VP9 con alfa) va después, para Chrome/Firefox/Edge —
     que responden "" a video/quicktime y saltan limpiamente al
     webm. Al revés, Safari podría quedarse con un webm que no
     sabe componer y pintar la ostra sobre un rectángulo. */
const SOURCES = [
  { src: "/videos/hero/videoOstraSafari_web.mov", type: "video/quicktime" },
  { src: "/videos/hero/videoOstra_web.webm", type: "video/webm" },
];

function HeroVideo() {
  const rightRef = useRef(null);

  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useHeroScrollDock(rightRef, !reduceMotion);

  /* La reproducción, los reintentos de autoplay, la pausa en
     pestaña de fondo y el respeto a `prefers-reduced-motion` los
     lleva ahora BucleVideo: aquí eran de este vídeo y allí sirven
     a todos. */


  return (
    <div className="hero__right hero-video" ref={rightRef}>
      <div className="hero-video__marco">
        {/* Dos pistas relevándose en vez de `loop`: el rebobinado
            del bucle nativo daba un enganchón muy visible en este
            clip, que lleva canal alfa y es caro de descomprimir.
            Ver BucleVideo.jsx. */}
        {/* La clase de estilo va a las PISTAS y no al envoltorio:
            `.hero__right .hero-video__fuente` lleva el encuadre y
            el object-fit de la ostra, y eso tiene que caer sobre
            los <video>, no sobre la caja que los contiene. */}
        <BucleVideo
          className="hero-video__caja"
          clasePista="hero-video__fuente"
          sources={SOURCES}
        />
      </div>

      <div className="hero__floor"></div>
    </div>
  );
}

export default HeroVideo;
