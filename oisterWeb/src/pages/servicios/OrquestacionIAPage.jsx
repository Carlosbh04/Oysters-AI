import EscenaServicio from "../../componentes/escenaServicio/EscenaServicio";
import OrquestacionIA from "../../componentes/orquestacionIA/OrquestacionIA";

/* Orquestación impulsada por IA — el cuarto de los cuatro
   apartados de "Cómo lo hacemos".

   El fondo lo pone EscenaServicio, compartido con los otros tres.
   Aquí solo se dice qué contenido va encima. */
function OrquestacionIAPage() {
  return (
    <EscenaServicio>
      <OrquestacionIA />
    </EscenaServicio>
  );
}

export default OrquestacionIAPage;
