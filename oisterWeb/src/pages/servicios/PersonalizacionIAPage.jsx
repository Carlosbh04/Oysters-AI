import EscenaServicio from "../../componentes/escenaServicio/EscenaServicio";
import PersonalizacionIA from "../../componentes/personalizacionIA/PersonalizacionIA";

/* Personalización impulsada por IA — el tercero de los cuatro
   apartados de "Cómo lo hacemos".

   El fondo lo pone EscenaServicio, compartido con los otros tres.
   Aquí solo se dice qué contenido va encima. */
function PersonalizacionIAPage() {
  return (
    <EscenaServicio>
      <PersonalizacionIA />
    </EscenaServicio>
  );
}

export default PersonalizacionIAPage;
