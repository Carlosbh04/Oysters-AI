import EscenaServicio from "../../componentes/escenaServicio/EscenaServicio";
import ContenidoIA from "../../componentes/contenidoIA/ContenidoIA";

/* Contenido impulsado por IA — el segundo de los cuatro apartados
   de "Cómo lo hacemos".

   El fondo lo pone EscenaServicio, compartido con los otros tres.
   Aquí solo se dice qué contenido va encima. */
function ContenidoIAPage() {
  return (
    <EscenaServicio>
      <ContenidoIA />
    </EscenaServicio>
  );
}

export default ContenidoIAPage;
