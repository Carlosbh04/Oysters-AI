import { useEffect, useRef, useState } from "react";
import "./FondoNuevo.css";
import FondoTrama from "../fondoTrama/FondoTrama";

/* ============================================================
   FONDO NUEVO — degradado diagonal violeta → rosa que se invierte

   Cero JS: el fondo son gradientes y una sola animación CSS.

   ---- QUÉ HACE ----
   El degradado GIRA muy despacio. Como el oscuro y el rosa están
   en esquinas opuestas, media vuelta basta para que intercambien
   sitio: donde había sombra hay rosa y al revés. Sigue girando y
   vuelven a su posición. O sea que los colores se invierten y se
   recomponen sin parar, sin un solo corte.

   ---- POR QUÉ GIRA Y NO SE FUNDE ----
   Lo obvio para invertir dos colores es cruzar dos capas con
   opacidad: la normal se va, la invertida llega. No vale, y el
   motivo es aritmético: a mitad del cruce cada punto vale la
   MEDIA de los dos, y la media entre el oscuro de una esquina y
   el rosa de la otra es el mismo tono en todas partes. El fondo
   se queda literalmente PLANO durante un segundo, como si se
   hubiera roto, y luego se recompone.

   Girando no pasa: en cada instante hay un extremo oscuro y otro
   rosa, solo que en otra dirección. La imagen nunca pierde
   contraste, y aun así al cabo de media vuelta los colores han
   cambiado de lado. El giro es el camino largo entre A y B, y es
   el único que no pasa por el charco.

   ---- POR QUÉ UN CUADRADO GIRANDO Y NO UN ÁNGULO ANIMADO ----
   Se puede animar el ángulo del degradado con @property. Pero
   eso REPINTA el gradiente entero en cada fotograma, y a pantalla
   completa son millones de píxeles 60 veces por segundo. Girando
   una capa lo que se anima es `rotate`, que no repinta: se pinta
   una vez, sube a la GPU y de ahí en adelante solo se orienta.
   El tamaño de esa capa —y por qué es un cuadrado— está explicado
   en FondoNuevo.css, que es donde se toca todo.

   Lo demás sigue igual: rellena a su padre (absolute + inset), va
   con aria-hidden y pointer-events:none porque es decorado, y
   acepta `className` para colocarlo o repintarlo desde fuera.
   ============================================================ */
/* `enPausa` congela la llegada ANTES de empezarla, para quien
   monta el fondo debajo de algo que todavía lo tapa —el caso real
   es la portada: Home monta durante la intro, que dura unos cinco
   segundos a pantalla completa. Sin esto, la entrada entera
   ocurriría detrás del telón y el visitante se encontraría el
   fondo ya puesto.

   Se hace con `animation-play-state` y no montando el componente
   más tarde a propósito: pausado, el fondo YA está en el DOM y su
   trama ya ha resuelto su observador, así que al soltarlo arranca
   en el fotograma siguiente. Montándolo tarde, la primera imagen
   llegaría con el retraso de crear todo. */
function FondoNuevo({ className = "", enPausa = false }) {
  /* ---- DORMIDO CUANDO NADIE LO VE ----
     El home monta CINCO copias de este fondo, una por sección, y
     cada una gira en bucle para siempre. Medido con el recorrido
     de scroll instrumentado: los giros costaban ~17ms por
     fotograma — pagados también por las secciones a tres
     pantallas de distancia.

     Este observador vigila el propio fondo y lo duerme
     (`fn--lejos`, animation-play-state: paused) cuando queda
     fuera de pantalla, con un margen del 35% de ventana para que
     al volver ya esté girando desde antes de asomar. El giro se
     REANUDA donde estaba, no se reinicia: pausar no pone el reloj
     a cero. Nadie puede ver la diferencia porque solo pasa
     cuando no se ve.

     Es un observador POR INSTANCIA y no uno compartido a
     propósito: el umbral se mide contra la caja del propio fondo,
     que es la de su sección, y un IO cuesta prácticamente nada. */
  const raizRef = useRef(null);
  const [lejos, setLejos] = useState(false);

  useEffect(() => {
    const el = raizRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setLejos(!e.isIntersecting),
      { rootMargin: "35%" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={raizRef}
      className={`fn ${enPausa ? "fn--en-pausa" : ""} ${
        lejos ? "fn--lejos" : ""
      } ${className}`}
      aria-hidden="true"
    >
      {/* ---- EL COLUMPIO DE LA ENTRADA ----
          Este <div> existe SOLO para la llegada, y no se podía
          ahorrar: la entrada quiere que el campo de color entre
          girado y se enderece, y su hijo ya está girando en bucle
          con `rotate`. Dos animaciones sobre la misma propiedad no
          se suman, se pisan — la última de la lista gana, y al
          acabar la de entrada habría un salto.

          Puestas en padre e hijo, los dos giros SÍ se componen: el
          padre se endereza una vez y el hijo sigue su vuelta sin
          enterarse. */}
      <div className="fn__entrada">
        <div className="fn__giro" />
      </div>

      {/* ---- EL CIRCUITO DEL HOME ----
          Las líneas, la retícula de puntos, los hexágonos y las
          cintas de luz son las MISMAS que llevan el hero y "Qué
          hacemos": es el componente FondoTrama montado aquí, no
          una copia. Cambiar el dibujo en un sitio lo cambia en
          todos, que es de lo que sirve tenerlo en un componente.

          `ft--sin-base` le quita su degradado propio y deja solo
          el dibujo. Es obligatorio aquí: con su base puesta, su
          degradado —horizontal y de tono fijo— taparía por
          completo el nuestro, que es justo el que gira. Misma
          razón por la que lo usan About y HowWeWork.

          Va DESPUÉS de .fn__giro para quedar por encima: el color
          se invierte por debajo y el circuito se mantiene quieto
          encima. Al revés no se vería. */}
      <FondoTrama className="fn__trama ft--sin-base" />
    </div>
  );
}

export default FondoNuevo;
