import InteligenciaIA from "../../componentes/inteligenciaIA/InteligenciaIA";
import FondoNuevo from "../../componentes/fondoNuevo/FondoNuevo";
import "./ComoLoHacemosPage.css";

/* ============================================================
   CÓMO LO HACEMOS

   La página que faltaba. Hasta ahora "Cómo lo hacemos" no tenía
   página propia: el menú apuntaba al primero de los cuatro
   apartados (/services/aprendizaje-ia) como sustituto, y así lo
   avisaba el comentario del propio menú — "cuando haya una página
   padre de verdad, este `to` es lo único que cambia".

   Esta es esa página, y lo que monta es InteligenciaIA: el
   titular, el vídeo, misión y visión, y el mapa de los cuatro
   apartados alrededor del anillo.

   ---- QUÉ CAMBIA RESPECTO AL BANCO DE PRUEBAS ----
   Nada del contenido. Solo el marco: aquí la página vive dentro
   del sitio, o sea CON cabecera y pie —los pone App.jsx—, así que
   necesita el hueco del header arriba y no lleva el enlace de
   "volver" que el banco tenía por no tener cabecera.

   El banco se queda donde está y sigue sirviendo: es el sitio
   donde probar cambios sin la intro de cinco segundos por delante.
   ============================================================ */
function ComoLoHacemosPage() {
  return (
    <div className="clh">
      {/* el fondo del sitio. `fixed` desde el CSS: la página mide
          varias pantallas y el degradado tiene que acompañarla */}
      <FondoNuevo className="clh__fondo" />

      {/* `sobreFondo`: el bloque nace CLARO, con su propio gris de
          pared a pared. La prop apaga ese fondo y gira la tinta y
          los trazos al lado oscuro. Es la misma variante que usa el
          banco, no una copia (ver InteligenciaIA.css). */}
      <InteligenciaIA sobreFondo />
    </div>
  );
}

export default ComoLoHacemosPage;
