import EscenaServicio from "../../componentes/escenaServicio/EscenaServicio";
import AprendizajeIA from "../../componentes/aprendizajeIA/AprendizajeIA";

/* Aprendizaje impulsado por IA — el primero de los cuatro
   apartados de "Cómo lo hacemos".

   El fondo lo pone EscenaServicio, compartido con los otros tres.
   Aquí solo se dice qué contenido va encima. */
function AprendizajeIAPage() {
  return (
    <EscenaServicio>
      <AprendizajeIA />
    </EscenaServicio>
  );
}

export default AprendizajeIAPage;
