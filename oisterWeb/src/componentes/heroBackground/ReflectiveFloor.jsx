/* ============================================================
   SUELO REFLECTANTE

   Un plano inclinado 72° con perspectiva. Lo que lo hace leer
   como suelo pulido no es el brillo sino DOS cosas juntas:

   · las tablas convergen hacia el fondo (las pinta un
     repeating-linear-gradient sobre el plano ya rotado, así que
     la perspectiva se las aplica gratis)
   · debajo de cada objeto luminoso hay una franja de su color,
     desenfocada y estirada en vertical

   Sin los reflejos el plano se ve como una alfombra. Los
   reflejos son lo que dice "esto es duro y brillante".
   ============================================================ */
function ReflectiveFloor() {
  return (
    <div className="hb-suelo" aria-hidden="true">
      <div className="hb-suelo__plano">
        <div className="hb-suelo__tablas" />
      </div>

      {/* Los reflejos van FUERA del plano rotado, en 2D. Dentro
          la perspectiva los deformaría en diagonal, y el reflejo
          de una luz cenital cae recto. */}
      <div className="hb-suelo__reflejos">
        <span className="hb-suelo__reflejo hb-suelo__reflejo--centro" />
        <span className="hb-suelo__reflejo hb-suelo__reflejo--derecha" />
        <span className="hb-suelo__reflejo hb-suelo__reflejo--izquierda" />
      </div>

      {/* ---- VETAS DE LUZ EN PRIMER PLANO ----
          Barras horizontales brillantes tumbadas sobre el suelo,
          en el filo inferior del encuadre. Son la mitad de la
          sensación de suelo PULIDO: sin ellas el plano se lee
          como una alfombra por muy bien que converjan las
          tablas. En la referencia son los trazos más saturados
          de toda la imagen. */}
      <div className="hb-suelo__vetas">
        <span style={{ "--x": "2%", "--w": "26%", "--y": "6%" }} />
        <span style={{ "--x": "8%", "--w": "18%", "--y": "13%" }} />
        <span style={{ "--x": "56%", "--w": "30%", "--y": "4%" }} />
        <span style={{ "--x": "64%", "--w": "22%", "--y": "11%" }} />
        <span style={{ "--x": "40%", "--w": "16%", "--y": "18%" }} />
      </div>
    </div>
  );
}

export default ReflectiveFloor;
