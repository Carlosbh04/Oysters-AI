import { useLayoutEffect, useRef, useState } from "react";
import Revelar from "./Revelar.jsx";
import WorkHero from "./WorkHero.jsx";
import WorkCarousel from "./WorkCarousel.jsx";
import WorkMetaBar from "./WorkMetaBar.jsx";
import {
  Descripcion,
  Objetivo,
  Resultado,
  Proyectos,
  Entregables,
  Herramientas,
} from "./WorkContentGrid.jsx";
import NextWork from "./NextWork.jsx";
import ContactCTA from "./ContactCTA.jsx";
import "./WorkDetail.css";

/* ============================================================
   DETALLE DE TRABAJO — orquestador

   Monta las seis secciones a partir de los datos del proyecto.
   No hay contenido escrito a mano en ninguna de ellas salvo los
   rótulos de interfaz y el CTA de cierre, que no es información
   del proyecto sino la salida hacia contacto.

   ---- LA PÁGINA SE ADAPTA A LO QUE HAY, Y HACE FALTA ----
   Los datos son muy desiguales, y no es una hipótesis: de los
   siete proyectos del catálogo, solo UNO trae entregables,
   objetivo y resultado; solo dos traen imágenes; los cuatro
   demos apenas traen texto y herramientas.

   Por eso cada sección decide si existe. Una plantilla rígida
   dejaría seis de siete detalles llenos de tarjetas vacías, que
   es peor que no tenerlas.

   ---- EL ORDEN DE LA PÁGINA VIVE AQUÍ ----
   Cada tarjeta se sabe dibujar sola (WorkContentGrid.jsx) y es
   este componente el que decide en qué fila va. Antes la
   maquetación estaba dentro de la rejilla, y reordenar la página
   obligaba a reescribirla.

   Se quitó el bloque destacado —la cita junto al vídeo— y con él
   se habrían ido los VÍDEOS, que era lo único que lo justificaba
   además de la cita. Van ahora al carrusel de cabecera, detrás de
   las imágenes: una sola galería con todo el material del
   proyecto en vez de dos repartidas por la página.

   ---- RENDIMIENTO ----
   Detrás va la escena del hero. Las tarjetas llevan
   backdrop-filter y está medido en A/B: no cuesta nada
   apreciable, incluso con la CPU frenada 6x (ver el detalle en
   WorkDetail.css).
   ============================================================ */

function WorkDetail({
  id,
  titulo,
  tituloDestacado,
  subtitulo,
  categoria,
  etiquetas = [],
  texto,
  imagenes = [],
  video,
  videos = [],
  objetivo,
  resultado,
  proyectos = [],
  servicios = [],
  ias = [],
  cliente,
  industria,
  anio,
  url,
}) {
  /* `texto` acepta cadena suelta o array de párrafos */
  const parrafos = Array.isArray(texto) ? texto : texto ? [texto] : [];

  /* "video" (cadena, formato antiguo) o "videos" (array) */
  const listaVideos = videos.length > 0 ? videos : video ? [video] : [];

  /* ---- ARRIBA IMÁGENES, ABAJO VÍDEOS ----
     La galería de cabecera lleva SOLO imágenes; todos los
     vídeos bajan al bloque destacado. Así la portada de todos
     los detalles es la misma clase de pieza, en vez de ser una
     foto en unos proyectos y un reproductor con controles en
     otros. */
  /* Las imágenes primero y los vídeos detrás: la portada de todos
     los detalles sigue siendo la misma clase de pieza —una
     imagen— y no un reproductor con controles en unos proyectos y
     una foto en otros. */
  const medios = [
    ...imagenes.map((src, i) => ({
      tipo: "imagen",
      src,
      alt: `${titulo} — imagen ${i + 1}`,
    })),
    ...listaVideos.map((src) => ({ tipo: "video", src })),
  ];

  /* ---- LAS SECCIONES SE NUMERAN SOLAS ----
     El escalonado del revelado necesita índices consecutivos, y
     las secciones aparecen y desaparecen según el proyecto. Con
     un contador a mano basta con olvidarse de incrementarlo en
     una rama para dejar un hueco de 80ms sin nada entrando.

     Montando la lista y filtrando lo que no existe, el índice es
     la posición: no puede desincronizarse. */
  const hayFicha = Boolean(cliente || industria || anio || url);

  /* ---- DÓNDE SOBRA SITIO, SI ES QUE SOBRA ----
     La tarjeta de "siguiente proyecto" existe para cerrar la
     columna que se queda corta. Cuál es depende del proyecto, y no
     se puede saber sin medir: en ACCIONA la corta es la izquierda
     por 372px, en ALSEA la derecha por 54.

     Ponerla siempre y en un sitio fijo empeoraba las cosas —
     medido, subía el desajuste de BESTINVER de 52 a 123px y el de
     ALSEA de 54 a 200. Así que se mide y se coloca donde hace
     falta, o no se coloca.

     El UMBRAL es la altura mínima que necesita la tarjeta para no
     salir aplastada. Por debajo de eso no hay hueco que merezca la
     pena y no se monta: un desajuste de 50px no lo ve nadie, y una
     tarjeta metida a la fuerza sí. */
  const UMBRAL = 150;

  const izq = useRef(null);
  const der = useRef(null);
  const [hueco, setHueco] = useState(null);

  useLayoutEffect(() => {
    const medir = () => {
      if (!izq.current || !der.current) return;

      /* Se suman las tarjetas EXCEPTO la de siguiente proyecto. Si
         entrara en la cuenta, montarla cambiaría la medida que
         decide si hay que montarla, y el resultado oscilaría entre
         los dos estados en bucle. */
      const alto = (pila) => {
        const fijas = [...pila.children].filter(
          (n) => !n.classList.contains("wd-siguiente")
        );
        const suma = fijas.reduce((s, n) => s + n.getBoundingClientRect().height, 0);
        return suma + Math.max(0, fijas.length - 1) * 20;
      };

      const d = alto(izq.current) - alto(der.current);
      setHueco(Math.abs(d) < UMBRAL ? null : d < 0 ? "izq" : "der");
    };

    medir();

    /* las tarjetas cambian de alto al cambiar el ancho de la
       ventana, así que la decisión se revisa con ellas */
    const ro = new ResizeObserver(medir);
    ro.observe(izq.current);
    ro.observe(der.current);
    return () => ro.disconnect();
  }, [id]);

  const hayCuerpo =
    parrafos.length > 0 ||
    Boolean(objetivo) ||
    Boolean(resultado) ||
    proyectos.length > 0 ||
    servicios.length > 0 ||
    ias.length > 0;

  const secciones = [
    <WorkHero
      key="hero"
      titulo={titulo}
      tituloDestacado={tituloDestacado}
      subtitulo={subtitulo}
      categoria={categoria}
      etiquetas={etiquetas}
    />,

    /* ---- LA GALERÍA VA SOLA Y A TODO LO ANCHO ----
       Estuvo al lado de la descripción, como en el mockup. No
       aguanta: la descripción mide un párrafo en ACCIONA y tres
       largos en BESTINVER, así que la fila salía descompensada en
       un sentido o en el otro según el proyecto — justo lo
       contrario de que todas las fichas se parezcan.

       Con la galería sola y el texto repartido en filas de dos, la
       altura de cada tarjeta ya no depende de la de un medio, y la
       página tiene la misma silueta en los tres proyectos. */
    medios.length > 0 && (
      <WorkCarousel key="galeria" medios={medios} titulo={titulo} />
    ),

    /* ---- LA FICHA, JUSTO DEBAJO DE LA GALERÍA ----
       Estaba casi al final, entre la prosa y los entregables, y
       ahí llega tarde: cliente, industria y año son lo primero
       que se quiere saber al abrir un caso, no el remate. Debajo
       de la imagen funciona como el pie de foto de una ficha
       técnica. */
    hayFicha && (
      <WorkMetaBar
        key="ficha"
        cliente={cliente}
        industria={industria}
        anio={anio}
        url={url}
      />
    ),

    /* ---- DOS COLUMNAS, Y CADA UNA ES UNA PILA ----
       Izquierda: la descripción y, debajo, los entregables.
       Derecha: objetivo, resultado, proyectos y las herramientas.

       Antes esto eran filas independientes —Descripción|Objetivo,
       Resultado|Proyectos, Entregables|Herramientas— y cada fila
       se alineaba por su cuenta: como las tarjetas de una fila
       nunca miden lo mismo, quedaban escalones entre filas.

       Con dos pilas el escalón desaparece: dentro de cada columna
       las tarjetas se encadenan a hueco fijo y el desajuste, si lo
       hay, queda una sola vez al final de la columna corta en vez
       de repetirse en cada fila. */
    hayCuerpo && (
      <div key="cuerpo" className="wd-fila wd-fila--7-5">
        <div className="wd-pila" ref={izq}>
          <Descripcion parrafos={parrafos} />
          <Entregables items={servicios} />
          {hueco === "izq" && <NextWork id={id} />}
        </div>

        <div className="wd-pila" ref={der}>
          <Objetivo texto={objetivo} />
          <Resultado texto={resultado} />
          <Proyectos items={proyectos} />
          <Herramientas items={ias} />
          {hueco === "der" && <NextWork id={id} />}
        </div>
      </div>
    ),

    <ContactCTA key="cta" />,
  ].filter(Boolean);

  return (
    <article className="wd">
      {secciones.map((seccion, i) => (
        <Revelar
          key={seccion.key}
          indice={i}
          /* el hero ya es un <header>; envolverlo en <section>
             metería una sección sin encabezado propio */
          como={seccion.key === "hero" ? "div" : "section"}
        >
          {seccion}
        </Revelar>
      ))}
    </article>
  );
}

export default WorkDetail;
