import { Link } from "react-router-dom";
import { Send, ArrowRight } from "lucide-react";

/* ============================================================
   CTA DE CIERRE

   Lo único de la página que no sale de los datos del proyecto,
   porque no es información del proyecto: es la salida hacia
   contacto y es la misma en todos.
   ============================================================ */
function ContactCTA() {
  return (
    <div className="wd-tarjeta wd-cta">
      <div className="wd-cta__izq">
        <span className="wd-cta__icono" aria-hidden="true">
          <Send strokeWidth={1.6} />
        </span>

        <div>
          <h2 className="wd-cta__titulo">
            ¿Tienes un <span className="wd-hero__destacado">proyecto en mente</span>?
          </h2>
          <p className="wd-cta__sub">Hablemos y hagámoslo realidad.</p>
        </div>
      </div>

      <Link to="/contact" className="wd-cta__boton">
        Contactar
        <span className="wd-cta__flecha" aria-hidden="true">
          <ArrowRight strokeWidth={2} />
        </span>
      </Link>
    </div>
  );
}

export default ContactCTA;
