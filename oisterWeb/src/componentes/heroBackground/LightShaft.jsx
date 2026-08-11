/* ============================================================
   HAZ DE LUZ CENITAL

   La columna que baja del techo y da la sensación de sala con
   humo y un foco. Es lo único que ocupa el tercio central, y a
   propósito: ahí va el titular del hero, así que solo puede
   haber niebla y luz.

   ---- POR QUÉ UN TRAPECIO Y NO UN RECTÁNGULO ----
   Un haz real se abre al bajar porque la fuente es puntual. El
   clip-path lo estrecha arriba y lo ensancha abajo. Con un
   rectángulo se lee como una barra pintada encima, no como luz
   atravesando humo.
   ============================================================ */
function LightShaft() {
  return (
    <div className="hb-haz" aria-hidden="true">
      <div className="hb-haz__cono" />
      {/* el charco de luz donde el haz toca el suelo: sin él el
          haz parece cortado a media altura */}
      <div className="hb-haz__charco" />
    </div>
  );
}

export default LightShaft;
