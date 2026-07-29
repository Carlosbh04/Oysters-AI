import "./PageSection.css";

/**
 * Sección de página estándar:
 * - ocupa el viewport completo (100svh)
 * - deja el hueco del header automáticamente
 * - centra su contenido en vertical
 *
 * Props:
 *  - center: false → el contenido fluye desde arriba
 *            (para páginas largas: blog, listados...)
 *  - className: clases extra de la página concreta
 */
function PageSection({ children, center = true, className = "" }) {
  return (
    <section
      className={`page-section ${center ? "page-section--center" : ""} ${className}`}
    >
      <div className="page-section__inner">{children}</div>
    </section>
  );
}

export default PageSection;