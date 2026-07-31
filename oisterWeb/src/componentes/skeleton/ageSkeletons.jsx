import Skeleton from "./Skeleton";
import "./PageSkeleton.css"; /* base compartida: nav, body */
import "./pageSkeletons.css"; /* específicos de cada página */

/* ===== Skeletons por página =====
   Cada uno calca el layout real de su vista, compuesto con
   los primitivos. Se registran en skeletonMap.js y el
   resolutor decide cuál mostrar según la ruta destino.
   La Home no necesita uno propio: el genérico (PageSkeleton)
   ya calca su estructura hero + cards. */

/* píldora fantasma del navbar, compartida por todos */
function GhostNav() {
  return (
    <div className="page-skeleton__nav">
      <Skeleton variant="block" height={48} />
    </div>
  );
}

/* ---- /works: titular + grid de proyectos ---- */
export function WorksSkeleton() {
  return (
    <div className="page-skeleton">
      <GhostNav />

      <div className="page-skeleton__body">
        <Skeleton variant="line" width="16%" />
        <Skeleton variant="title" width="42%" />

        <div className="sk-works__grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="sk-works__project" key={i}>
              <Skeleton variant="block" height={230} />
              <Skeleton variant="line" width="55%" />
              <Skeleton variant="line" width="35%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- /works/:id: imagen hero + texto a dos columnas ---- */
export function WorkDetailSkeleton() {
  return (
    <div className="page-skeleton">
      <GhostNav />

      <div className="page-skeleton__body">
        <Skeleton variant="line" width="14%" />
        <Skeleton variant="title" width="58%" />

        <Skeleton
          variant="block"
          height="min(440px, 48vh)"
          className="sk-detail__hero"
        />

        <div className="sk-detail__columns">
          <div className="sk-detail__col">
            <Skeleton variant="line" width="90%" />
            <Skeleton variant="line" width="84%" />
            <Skeleton variant="line" width="88%" />
            <Skeleton variant="line" width="60%" />
          </div>

          <div className="sk-detail__col">
            <Skeleton variant="line" width="40%" />
            <Skeleton variant="line" width="70%" />
            <Skeleton variant="line" width="55%" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- /contact: calca la página real de Hablemos ----
   Izquierda: título grande + subrayado + dos párrafos +
   filas de contacto (icono redondo + texto) + redes.
   Derecha: card de formulario con 4 campos, textarea y
   botón a todo el ancho. */
export function ContactSkeleton() {
  return (
    <div className="page-skeleton">
      <GhostNav />

      <div className="page-skeleton__body">
        <div className="sk-contact">
          <div className="sk-contact__text">
            {/* título "Hablemos" + subrayado corto */}
            <Skeleton variant="title" width="52%" height="3rem" />
            <Skeleton variant="line" width="18%" height={5} />

            {/* dos párrafos */}
            <div className="sk-contact__paragraph">
              <Skeleton variant="line" width="86%" />
              <Skeleton variant="line" width="62%" />
            </div>

            <div className="sk-contact__paragraph">
              <Skeleton variant="line" width="82%" />
              <Skeleton variant="line" width="78%" />
              <Skeleton variant="line" width="48%" />
            </div>

            {/* filas de contacto: icono redondo + texto */}
            <div className="sk-contact__row">
              <Skeleton variant="circle" size={46} />
              <Skeleton variant="line" width="46%" />
            </div>

            <div className="sk-contact__row">
              <Skeleton variant="circle" size={46} />
              <Skeleton variant="line" width="38%" />
            </div>

            {/* síguenos + redes */}
            <Skeleton
              variant="line"
              width="20%"
              className="sk-contact__follow"
            />

            <div className="sk-contact__socials">
              <Skeleton variant="circle" size={44} />
              <Skeleton variant="circle" size={44} />
              <Skeleton variant="circle" size={44} />
            </div>
          </div>

          {/* card del formulario — cada campo con la anatomía
              real: barra redondeada con iconito + label dentro */}
          <div className="sk-contact__form">
            {["28%", "32%", "26%", "42%"].map((w, i) => (
              <div className="sk-contact__field" key={i}>
                <Skeleton variant="circle" size={18} />
                <Skeleton variant="line" width={w} />
              </div>
            ))}

            {/* textarea: campo alto con icono+label arriba */}
            <div className="sk-contact__field sk-contact__field--area">
              <Skeleton variant="circle" size={18} />
              <Skeleton variant="line" width="48%" />
            </div>

            <Skeleton
              variant="block"
              height={50}
              className="sk-contact__button"
            />
          </div>
        </div>
      </div>
    </div>
  );
}