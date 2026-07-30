import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Work.css";

/**
 * Detalle de proyecto. Soporta la estructura fija de
 * trabajos.js (ver plantilla-proyecto.js): los campos
 * opcionales que falten simplemente no se pintan.
 *
 * Imágenes: imagen grande + miniaturas clicables debajo
 * (sin flechas) + contador.
 * Videos: acepta "video" (string, legado) o "videos"
 * (array). Con 1 se muestra grande; con 2+ va en
 * carrusel con flechas y dots.
 */
function Work({
  titulo,
  subtitulo,
  texto,
  imagenes = [],
  video,
  videos = [],
  ias = [],
  categoria,
  etiquetas = [],
  servicios = [],
  objetivo,
  resultado,
  proyectos = [],
  cliente,
  industria,
  anio,
  url,
}) {
  const [imagenActual, setImagenActual] = useState(0);

  const [mostrarThumbs, setMostrarThumbs] = useState(true);

  const [videoActual, setVideoActual] = useState(0);

  useEffect(() => {
    if (window.innerWidth <= 800) return;

    if (imagenes.length <= 1) return;

    setMostrarThumbs(true);
  }, [imagenActual, imagenes.length]);

  /* acepta "video" (string, legado) o "videos" (array) */
  const listaVideos = videos.length > 0 ? videos : video ? [video] : [];

  const siguienteVideo = () => {
    setVideoActual((videoActual + 1) % listaVideos.length);
  };

  const anteriorVideo = () => {
    setVideoActual((videoActual - 1 + listaVideos.length) % listaVideos.length);
  };

  /* texto acepta string o array de párrafos */
  const parrafos = Array.isArray(texto) ? texto : [texto];

  /* ¿hay datos para la ficha? */
  const hayFicha = cliente || industria || anio || url;

  return (
    <article className="project">
      {/* Volver al listado */}
      <Link to="/works" className="project-back">
        <span aria-hidden="true">←</span> Todos los trabajos
      </Link>

      <header className="project-header">
        {categoria && <span className="project-category">{categoria}</span>}

        <h1>{titulo}</h1>

        <h3>{subtitulo}</h3>

        {etiquetas.length > 0 && (
          <ul className="project-tags">
            {etiquetas.map((etiqueta, index) => (
              <li key={index}>#{etiqueta}</li>
            ))}
          </ul>
        )}

        <span className="project-header-glow" aria-hidden="true"></span>
      </header>

      <section className="project-content">
        {/* FICHA: cliente / industria / año / web */}
        {hayFicha && (
          <dl className="project-meta">
            {cliente && (
              <div className="project-meta-item">
                <dt>Cliente</dt>
                <dd>{cliente}</dd>
              </div>
            )}

            {industria && (
              <div className="project-meta-item">
                <dt>Industria</dt>
                <dd>{industria}</dd>
              </div>
            )}

            {anio && (
              <div className="project-meta-item">
                <dt>Año</dt>
                <dd>{anio}</dd>
              </div>
            )}

            {url && (
              <div className="project-meta-item">
                <dt>Web</dt>
                <dd>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {url.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        )}

        {/* TEXTO */}
        <div className="project-text">
          {parrafos.map((parrafo, index) => (
            <p key={index}>{parrafo}</p>
          ))}
        </div>

        {/* OBJETIVO / RESULTADO */}
        {(objetivo || resultado) && (
          <div className="project-highlights">
            {objetivo && (
              <div className="project-highlight">
                <h4>Objetivo</h4>
                <p>{objetivo}</p>
              </div>
            )}

            {resultado && (
              <div className="project-highlight">
                <h4>Resultado</h4>
                <p>{resultado}</p>
              </div>
            )}
          </div>
        )}

        {/* GALERÍA DE IMÁGENES */}
        {imagenes.length > 0 && (
          <div className="carousel">
            <div className="carousel-frame">
              <img
                key={imagenActual}
                src={imagenes[imagenActual]}
                alt={`${titulo} — imagen ${imagenActual + 1}`}
              />

              <span className="carousel-counter">
                {imagenActual + 1} / {imagenes.length}
              </span>

              {imagenes.length > 1 && (
                <div className="carousel-thumbs">
                  {imagenes.map((src, index) => (
                    <button
                      key={index}
                      className={
                        index === imagenActual
                          ? "carousel-thumb carousel-thumb--active"
                          : "carousel-thumb"
                      }
                      onClick={() => setImagenActual(index)}
                      aria-label={`Ir a la imagen ${index + 1}`}
                    >
                      <img src={src} alt={`Miniatura ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIDEOS: 1 solo → grande; 2+ → carrusel */}
        {listaVideos.length === 1 && (
          <div className="project-video">
            <video controls>
              <source src={listaVideos[0]} type="video/mp4" />
              Tu navegador no soporta vídeos.
            </video>
          </div>
        )}

        {listaVideos.length > 1 && (
          <>
            <div className="carousel carousel--video">
              <button
                className="carousel-btn"
                onClick={anteriorVideo}
                aria-label="Video anterior"
              >
                ❮
              </button>

              <div className="carousel-frame">
                {/* key={videoActual}: al cambiar, React
                                    remonta el <video> → el anterior se
                                    detiene y el nuevo entra con fundido */}
                <video key={videoActual} controls>
                  <source src={listaVideos[videoActual]} type="video/mp4" />
                  Tu navegador no soporta vídeos.
                </video>

                <span className="carousel-counter">
                  {videoActual + 1} / {listaVideos.length}
                </span>
              </div>

              <button
                className="carousel-btn"
                onClick={siguienteVideo}
                aria-label="Video siguiente"
              >
                ❯
              </button>
            </div>

            {/* Dots del carrusel de videos */}
            <div className="carousel-dots">
              {listaVideos.map((_, index) => (
                <button
                  key={index}
                  className={
                    index === videoActual
                      ? "carousel-dot carousel-dot--active"
                      : "carousel-dot"
                  }
                  onClick={() => setVideoActual(index)}
                  aria-label={`Ir al video ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* SUB-PROYECTOS DE LA COLABORACIÓN */}
        {proyectos.length > 0 && (
          <div className="project-list-section">
            <h3>Proyectos</h3>

            <ul>
              {proyectos.map((proyecto, index) => (
                <li key={index}>{proyecto}</li>
              ))}
            </ul>
          </div>
        )}

        {/* SERVICIOS */}
        {servicios.length > 0 && (
          <div className="chip-section">
            <h3>Servicios</h3>

            <ul>
              {servicios.map((servicio, index) => (
                <li key={index}>{servicio}</li>
              ))}
            </ul>
          </div>
        )}

        {/* IA UTILIZADAS */}
        {ias.length > 0 && (
          <div className="chip-section">
            <h3>Inteligencias artificiales utilizadas</h3>

            <ul>
              {ias.map((ia, index) => (
                <li key={index}>{ia}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </article>
  );
}

export default Work;
