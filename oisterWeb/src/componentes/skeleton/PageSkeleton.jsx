import Skeleton from "./Skeleton";
import "./PageSkeleton.css";

/* ===== PageSkeleton =====
   Esqueleto genérico de página con estructura real:
   · píldora fantasma del navbar
   · hero de dos columnas: texto a la izquierda (eyebrow +
     titulares + párrafo + botón) y disco a la derecha
     (eco de la ostra)
   · fila de 4 cards con anatomía interna (icono + título
     + líneas de texto)
   No imita ninguna página concreta: sugiere la identidad
   del sitio mientras carga cualquiera. */
function PageSkeleton() {
  return (
    <div className="page-skeleton">
      {/* píldora fantasma del navbar */}
      <div className="page-skeleton__nav">
        <Skeleton variant="block" height={48} />
      </div>

      <div className="page-skeleton__body">
        {/* ---- hero fantasma ---- */}
        <div className="page-skeleton__hero">
          <div className="page-skeleton__hero-text">
            <Skeleton variant="line" width="22%" />
            <Skeleton variant="title" width="78%" />
            <Skeleton variant="title" width="58%" />

            <div className="page-skeleton__paragraph">
              <Skeleton variant="line" width="88%" />
              <Skeleton variant="line" width="80%" />
              <Skeleton variant="line" width="64%" />
            </div>

            <Skeleton
              variant="block"
              width={170}
              height={44}
              className="page-skeleton__button"
            />
          </div>

          {/* disco: eco de la ostra */}
          <div className="page-skeleton__hero-media">
            <Skeleton variant="circle" size="min(300px, 24vw)" />
          </div>
        </div>

        {/* ---- cards con anatomía ---- */}
        <div className="page-skeleton__grid">
          {[0, 1, 2, 3].map((i) => (
            <div className="page-skeleton__card" key={i}>
              <div className="page-skeleton__card-head">
                <Skeleton variant="circle" size={38} />
                <Skeleton variant="line" width="60%" />
              </div>

              <Skeleton variant="line" width="92%" />
              <Skeleton variant="line" width="84%" />
              <Skeleton variant="line" width="52%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PageSkeleton;