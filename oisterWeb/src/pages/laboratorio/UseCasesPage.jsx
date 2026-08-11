import UseCasesBackground from "../../componentes/useCases/UseCasesBackground";
import UseCases from "../../componentes/useCases/UseCases";
import "./UseCasesPage.css";

/* ============================================================
   BANCO DE PRUEBAS — CASOS DE USO

   Aquí se montaba la escena del hero con algunas capas apagadas.
   No servía: aquella es una sala iluminada —niebla, haz, suelo
   pulido, losas de cristal con relleno— y esta sección pide un
   plano casi negro donde todo son contornos. Apagar capas para
   llegar a lo segundo significaba cargar con nueve para tapar
   siete.

   Ahora tiene fondo propio (UseCasesBackground), que sí toma
   prestadas las piezas que comparten: la figura y la familia de
   octaedros.
   ============================================================ */
function UseCasesPage() {
  return (
    <div className="uc-lab">
      <div className="uc-lab__fondo">
        <UseCasesBackground />
      </div>

      <UseCases />
    </div>
  );
}

export default UseCasesPage;
