import { useLocation } from "react-router-dom";
import SkeletonPiece from "../SkeletonPiece";
import trabajos from "../../../data/trabajos";
import "../../work/detalle/WorkDetail.css";
import "./WorkDetailSkeleton.css";

/* ============================================================
   HUECO DE CARGA DEL DETALLE

   ---- REUTILIZA LAS CLASES DE LA PÁGINA REAL ----
   `.wd`, `.wd-tarjeta`, `.wd-fila`, `.wd-pila`… son las mismas de
   WorkDetail.css, no copias. Es a propósito: el hueco anterior
   replicaba las medidas a mano y con cada retoque de la página
   se iba desviando en silencio, hasta que un día el reveal daba
   un salto y nadie sabía de dónde salía.

   Reutilizando las clases, el hueco no PUEDE desviarse: si
   cambia el padding de una tarjeta, cambia en los dos sitios a
   la vez.

   ⚠️ Y por lo mismo, ESTE ARCHIVO SIGUE A WorkDetail.jsx: si
   allí se muda una sección, aquí hay que mudarla también. Ya
   pasó una vez — la página subió los vídeos al carrusel de
   cabecera y retiró el bloque destacado del final, y este hueco
   siguió pintando el destacado abajo: en los proyectos con vídeo
   el shimmer quedaba al fondo de la página y el contenido real
   aparecía arriba, cada cosa en un sitio.

   ---- Y LEE LOS DATOS DEL PROYECTO ----
   Las secciones dependen del proyecto: solo uno de los siete
   trae entregables, solo dos traen imágenes. Un hueco fijo
   pintaría una galería que luego no aparece —o al revés—, que
   es justo el salto que se quiere evitar. El id sale de la URL,
   igual que hace WorksSkeleton con la paginación.

   Importar `trabajos` aquí no engorda nada: ya está en el bundle
   principal porque LatestProjects (el home) lo importa.
   ============================================================ */

function WorkDetailSkeleton() {
  const { pathname } = useLocation();

  const id = Number(pathname.split("/").filter(Boolean)[1]);
  const trabajo = trabajos.find((t) => t.id === id);

  /* Sin proyecto (id inventado) el hueco se queda en lo mínimo
     común: cabecera y cierre. La página real dirá "no
     encontrado", que también es corto. */

  /* misma regla y mismo orden que WorkDetail: UNA galería de
     cabecera con todo el material, imágenes primero y vídeos
     detrás. La normalización de `video`/`videos` es la misma
     línea que la de allí, incluido el caso de un `videos: []`
     vacío con `video` suelto. */
  const imagenes = trabajo?.imagenes ?? [];
  const listaVideos =
    trabajo?.videos?.length > 0
      ? trabajo.videos
      : trabajo?.video
        ? [trabajo.video]
        : [];
  const medios = imagenes.length + listaVideos.length;

  const hayFicha = Boolean(
    trabajo?.cliente || trabajo?.industria || trabajo?.anio || trabajo?.url
  );
  /* con su rótulo y su valor REALES: hay valores que ocupan dos
     líneas ("Infraestructura y Energía Sostenible") y con una
     altura fija la barra medía 17px de menos */
  const celdas = [
    trabajo?.cliente && ["Cliente", trabajo.cliente],
    trabajo?.industria && ["Industria", trabajo.industria],
    trabajo?.anio && ["Año", trabajo.anio],
    trabajo?.url && [
      "Web",
      trabajo.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    ],
  ].filter(Boolean);

  const parrafos = Array.isArray(trabajo?.texto)
    ? trabajo.texto
    : trabajo?.texto
      ? [trabajo.texto]
      : [];
  const servicios = trabajo?.servicios ?? [];
  const ias = trabajo?.ias ?? [];
  const proyectos = trabajo?.proyectos ?? [];

  /* misma condición que WorkDetail para montar las dos pilas */
  const hayCuerpo =
    parrafos.length > 0 ||
    Boolean(trabajo?.objetivo) ||
    Boolean(trabajo?.resultado) ||
    proyectos.length > 0 ||
    servicios.length > 0 ||
    ias.length > 0;

  return (
    <article className="wd wd-hueco">
      {/* ---- 1 · hero ---- */}
      <div className="wd-hero">
        <SkeletonPiece variant="line" width="164px" height="14px" className="wd-hueco__volver" />
        <SkeletonPiece variant="line" width="159px" height="26px" className="wd-hueco__pildora" />
        <SkeletonPiece variant="title" width="280px" className="wd-hueco__titulo" />
        <SkeletonPiece variant="line" width="min(46ch, 90%)" height="28px" className="wd-hueco__sub" />

        {/* Solo si el proyecto TIENE etiquetas. Antes había un
            `|| 3` de respaldo y pintaba tres píldoras en los
            proyectos que no llevan ninguna: 38px de salto al
            cargar. Un respaldo que inventa contenido es peor que
            no tener respaldo. */}
        {trabajo?.etiquetas?.length > 0 && (
          <div className="wd-hueco__etiquetas">
            {trabajo.etiquetas.map((e) => (
              /* con su texto real dentro, invisible: así el ancho
                 lo mide el navegador y no hay que estimarlo */
              <span className="skeleton wd-hueco__etiqueta" key={e}>
                #{e}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ---- 2 · galería ----
          el eco de .wd-carrusel: marco 16/9 y, con más de un
          medio, el contador debajo a la derecha */}
      {medios > 0 && (
        <div>
          <div className="wd-hueco__marco" />
          {medios > 1 && (
            <SkeletonPiece
              variant="line"
              width="42px"
              height="11px"
              className="wd-hueco__contador"
            />
          )}
        </div>
      )}

      {/* ---- 3 · ficha ---- */}
      {hayFicha && (
        <div className="wd-tarjeta wd-meta">
          {celdas.map(([rotulo, valor]) => (
            <div className="wd-meta__celda" key={rotulo}>
              <SkeletonPiece variant="block" className="wd-hueco__icono" />
              <span className="wd-meta__texto">
                <span className="skeleton wd-hueco__meta-rotulo">{rotulo}</span>
                <span className="skeleton wd-hueco__meta-valor">{valor}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ---- 4 · cuerpo: dos pilas, mismo reparto que WorkDetail ----
          Izquierda: descripción y entregables. Derecha: objetivo,
          resultado, proyectos y herramientas. Las dos pilas se
          montan siempre que haya cuerpo, como en la página.

          La tarjeta de "siguiente proyecto" NO se modela: la
          página la coloca midiendo qué columna queda corta, y
          como rellena el hueco de la columna corta no cambia la
          altura total de la fila — sin ella el hueco mide lo
          mismo. */}
      {hayCuerpo && (
        <div className="wd-fila wd-fila--7-5">
          <div className="wd-pila">
            {parrafos.length > 0 && (
              /* .wd-descripcion es la clase de la página real:
                 mismo max-width, mismo tamaño y mismo
                 interlineado. Dentro va el texto DE VERDAD,
                 invisible.

                 Estimar líneas no funciona: había 4 por
                 párrafo y un proyecto con una frase corta daba
                 67px de salto. El navegador ya sabe cuántas
                 líneas ocupa; solo hay que dejarle medirlo. */
              <div className="wd-tarjeta wd-descripcion">
                <SkeletonPiece variant="line" width="190px" height="14px" className="wd-hueco__rotulo" />
                {parrafos.map((texto, i) => (
                  <p className="wd-hueco__parrafo" key={i}>
                    {texto}
                  </p>
                ))}
              </div>
            )}

            {servicios.length > 0 && (
              <div className="wd-tarjeta">
                <SkeletonPiece variant="line" width="110px" height="14px" className="wd-hueco__rotulo" />
                {/* a dos columnas, como los entregables reales */}
                <ul className="wd-lista wd-lista--dos">
                  {servicios.map((n) => (
                    <li className="wd-hueco__item" key={n}>
                      <span className="skeleton wd-hueco__caja" />
                      <span className="skeleton wd-hueco__texto-item">{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="wd-pila">
            {[trabajo?.objetivo, trabajo?.resultado]
              .filter(Boolean)
              .map((texto, i) => (
                <div className="wd-tarjeta wd-descripcion" key={i}>
                  <SkeletonPiece variant="line" width="90px" height="14px" className="wd-hueco__rotulo" />
                  <p className="wd-hueco__parrafo">{texto}</p>
                </div>
              ))}

            {proyectos.length > 0 && (
              <div className="wd-tarjeta">
                <SkeletonPiece variant="line" width="90px" height="14px" className="wd-hueco__rotulo" />
                <ul className="wd-lista">
                  {proyectos.map((n) => (
                    <li className="wd-hueco__item" key={n}>
                      <span className="skeleton wd-hueco__caja" />
                      <span className="skeleton wd-hueco__texto-item">{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* herramientas: tarjeta PROPIA, como en la página —
                antes compartía caja con los entregables y un
                filete que ya no existe */}
            {ias.length > 0 && (
              <div className="wd-tarjeta">
                <SkeletonPiece
                  variant="line"
                  width="180px"
                  height="13px"
                  className="wd-hueco__rotulo"
                />
                <div className="wd-hueco__chips">
                  {ias.map((n, i) => (
                    /* la píldora lleva DENTRO el texto real,
                       invisible: así el navegador la mide con la
                       misma tipografía y no hay que estimar el
                       ancho, que es lo que siempre falla */
                    <span className="skeleton wd-hueco__chip" key={i}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- 5 · cierre ---- */}
      <div className="wd-tarjeta wd-cta">
        <div className="wd-cta__izq">
          <SkeletonPiece variant="block" className="wd-hueco__cta-icono" />
          <div className="wd-hueco__cta-texto">
            <SkeletonPiece variant="line" width="260px" height="26px" />
            <SkeletonPiece variant="line" width="190px" height="18px" />
          </div>
        </div>
        <SkeletonPiece variant="block" className="wd-hueco__cta-boton" />
      </div>
    </article>
  );
}

export default WorkDetailSkeleton;
