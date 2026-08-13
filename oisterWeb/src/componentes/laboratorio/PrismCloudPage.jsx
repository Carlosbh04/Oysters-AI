import PrismCloud from "../prismCloud/PrismCloud";
import "./PrismCloudPage.css";

/* ============================================================
   BANCO DE PRUEBAS DE PRISM CLOUD

   La nube a pantalla completa con un titular encima, que es la
   única forma honesta de juzgar un fondo: solo, se mira como
   ilustración y se acaba dejando demasiado brillante; con texto
   delante se ve enseguida si deja leer.

   El componente YA NO vive aquí: al aprobarse para el detalle de
   proyecto se sacó a componentes/prismCloud/, como manda el LEEME
   de al lado ("nada de producción vive en el laboratorio"). Esta
   página se queda para seguir afinando la nube sin tener que
   navegar hasta un proyecto.
   ============================================================ */
function PrismCloudPage() {
  return (
    <div className="pcp">
      <div className="pcp__fondo">
        <PrismCloud />
      </div>

      <div className="pcp__contenido">
        <p className="pcp__rotulo">Laboratorio · Prism Cloud</p>
        <h1 className="pcp__titulo">
          Luz que se <em>refracta</em>
        </h1>
        <p className="pcp__texto">
          Mueve el cursor para arrastrar el foco y separar los colores.
          Haz scroll para abrir la nube.
        </p>
      </div>
    </div>
  );
}

export default PrismCloudPage;
