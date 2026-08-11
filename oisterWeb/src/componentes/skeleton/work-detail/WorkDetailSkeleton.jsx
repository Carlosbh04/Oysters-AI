import { useLocation } from "react-router-dom";
import SkeletonPiece from "../SkeletonPiece";
import trabajos from "../../../data/trabajos";
import "../../work/detalle/WorkDetail.css";
import "./WorkDetailSkeleton.css";

/* ============================================================
   HUECO DE CARGA DEL DETALLE

   ---- REUTILIZA LAS CLASES DE LA PÁGINA REAL ----
   `.wd`, `.wd-tarjeta`, `.wd-rejilla`… son las mismas de
   WorkDetail.css, no copias. Es a propósito: el hueco anterior
   replicaba las medidas a mano y con cada retoque de la página
   se iba desviando en silencio, hasta que un día el reveal daba
   un salto y nadie sabía de dónde salía.

   Reutilizando las clases, el hueco no PUEDE desviarse: si
   cambia el padding de una tarjeta, cambia en los dos sitios a
   la vez.

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
  /* misma regla que WorkDetail: arriba solo imágenes, los
     vídeos bajan al bloque destacado */
  const imagenes = trabajo?.imagenes ?? [];
  const videos = trabajo?.videos ?? (trabajo?.video ? [trabajo.video] : []);
  const medios = imagenes.length;
  const hayDestacado = videos.length > 0 || Boolean(trabajo?.resultado);

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
  /* Misma regla que WorkContentGrid: la barra lateral solo
     existe si tiene con qué llenarse —entregables o vídeo—. Las
     herramientas solas bajan a una franja aparte. */
  /* misma regla que WorkContentGrid: las dos columnas siempre */
  const hayDerecha = servicios.length > 0 || ias.length > 0;
  const hayIzquierda =
    parrafos.length > 0 || trabajo?.objetivo || trabajo?.resultado || proyectos.length > 0;

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

      {/* ---- 2 · galería ---- */}
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

      {/* ---- 4 · contenido ---- */}
      {(hayIzquierda || hayDerecha) && (
        <div
          className={`wd-rejilla ${
            hayIzquierda && hayDerecha ? "" : "wd-rejilla--sola wd-rejilla--estrecha"
          }`}
        >
          {hayIzquierda && (
            <div className="wd-rejilla__lado">
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

              {[trabajo?.objetivo, hayDestacado ? null : trabajo?.resultado]
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
            </div>
          )}

          {hayDerecha && (
            <div className="wd-rejilla__lado">
              <div className="wd-tarjeta">
                <SkeletonPiece variant="line" width="110px" height="14px" className="wd-hueco__rotulo" />

                {/* la lista solo existe si hay entregables: una
                    <ul> vacía no mide nada pero el margen de los
                    chips de abajo sí, y eran 20px de salto */}
                {servicios.length > 0 && (
                  <ul className="wd-lista">
                    {servicios.map((n) => (
                      <li className="wd-hueco__item" key={n}>
                        <span className="skeleton wd-hueco__caja" />
                        <span className="skeleton wd-hueco__texto-item">{n}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* el filete de verdad, no un margen que lo
                    imite: son 1px + 20px arriba + 20px abajo, y
                    con solo el margen faltaban 21px */}
                {servicios.length > 0 && ias.length > 0 && (
                  <hr className="wd-divisor" />
                )}

                {/* el rótulo de "Tecnologías / Herramientas".
                    Faltaba, y con su margen eran 27 de los 31px
                    que le sobraban a la columna. */}
                {ias.length > 0 && (
                  <SkeletonPiece
                    variant="line"
                    width="180px"
                    height="13px"
                    className="wd-hueco__rotulo"
                  />
                )}

                {ias.length > 0 && (
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
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ---- 5 · destacado ----
          misma regla que WorkHighlight: con vídeo, siempre la
          rejilla 7fr/5fr aunque no haya cita al lado */}
      {hayDestacado && (
        <div className={`wd-rejilla ${videos.length > 0 ? "" : "wd-rejilla--sola"}`}>
          {videos.length > 0 && (
            <div>
              <div className="wd-hueco__marco" />
              {videos.length > 1 && (
                <SkeletonPiece
                  variant="line"
                  width="42px"
                  height="11px"
                  className="wd-hueco__contador"
                />
              )}
            </div>
          )}

          {/* eco de la tarjeta de cita: comillas + el texto real
              invisible, que es quien marca la altura */}
          {trabajo?.resultado && (
            <div className="wd-tarjeta wd-hueco__cita-caja">
              <SkeletonPiece variant="line" width="46px" height="45px" className="wd-hueco__comillas" />
              <p className="wd-hueco__cita">{trabajo.resultado}</p>
            </div>
          )}
        </div>
      )}

      {/* ---- 6 · cierre ---- */}
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
