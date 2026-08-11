import EscenaOraculo from "../escenaOraculo/EscenaOraculo";
import EntradaServicio from "../entradaServicio/EntradaServicio";
import "./EscenaServicio.css";

/* ============================================================
   ESCENA DE LOS APARTADOS DE "CÓMO LO HACEMOS"

   El fondo común de los cuatro: aprendizaje, contenido,
   personalización y orquestación. Es EscenaOraculo con tres
   cosas encima que la convierten en fondo de contenido en vez de
   portada — el suelo en la familia de color del sitio, sus tonos
   base recolocados y un velo que le baja el corredor de luz.

   ---- POR QUÉ ES UN COMPONENTE Y NO CUATRO PÁGINAS IGUALES ----
   Nació dentro de la página de aprendizaje. Al llegar los otros
   tres apartados habría habido cuatro copias del mismo montaje,
   y con ellas cuatro sitios donde tocar cada vez que se mueve la
   figura o se calibra el velo. Ese ajuste ya costó varias
   pasadas de medición: repetirlo por cuadruplicado es la forma
   segura de que los cuatro acaben distintos.

   Cada página se queda con lo suyo:

     <EscenaServicio>
       <LoQueSeLee />
     </EscenaServicio>

   ---- Y AQUÍ VIVE TAMBIÉN LA ENTRADA ----
   La animación de llegada va montada aquí dentro por el mismo
   motivo que el fondo: es de las cuatro, no de una. Colgándola
   de este punto, las páginas no tienen que acordarse de nada —
   ni las que existen ni la que se añada mañana— y la coreografía
   se toca en un único archivo (EntradaServicio.css).

   El envoltorio que añade es `display: contents`, o sea que no
   cambia la colocación de nada.
   ============================================================ */
function EscenaServicio({ children }) {
  return (
    <div className="escena-servicio">
      <EscenaOraculo className="escena-servicio__escena" />
      <EntradaServicio>{children}</EntradaServicio>
    </div>
  );
}

export default EscenaServicio;
