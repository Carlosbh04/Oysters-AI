import EscenaOraculo from "../../componentes/escenaOraculo/EscenaOraculo";
import "./EscenaOraculoPage.css";

/* ============================================================
   PÁGINA DE LA ESCENA ORÁCULO

   Con texto de muestra encima, y no el fondo a secas: es un
   FONDO, así que la única pregunta que importa es si lo que va
   delante se lee. Mirándolo solo, se juzga como ilustración y se
   acaba dejando demasiado brillante.

   Va fuera de /lab/, así que conserva el header del sitio y se
   llega desde el menú.
   ============================================================ */
function EscenaOraculoPage() {
  return (
    <div className="eop">
      <div className="eop__fondo">
        <EscenaOraculo />
      </div>

      <div className="eop__contenido">
        <p className="eop__rotulo">Casos de uso</p>

        <h1 className="eop__titulo">
          Inteligencia que <em>ve más allá</em>
        </h1>

        <p className="eop__texto">
          Texto de muestra para comprobar la legibilidad sobre el fondo.
          Si estas líneas se leen sin esfuerzo en la zona más brillante
          del corredor, el velo está bien calibrado.
        </p>

        <span className="eop__cta">Descubre cómo</span>
      </div>
    </div>
  );
}

export default EscenaOraculoPage;
