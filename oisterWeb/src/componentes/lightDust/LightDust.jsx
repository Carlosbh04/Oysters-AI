import "./LightDust.css";

/* Motas de luz cayendo lentamente, en dos capas con distinta
   velocidad (parallax). Componente ATMOSFÉRICO reutilizable:
   móntalo dentro de cualquier sección con position:relative
   y llenará su área de polvo luminoso sin bloquear nada.

   Uso:  <LightDust />
   Cero elementos por partícula y cero JS de animación: cada
   capa es UN punto invisible cuyas box-shadows pintan todas
   las motas (la técnica de las partículas del hero móvil). */
function LightDust() {
  return <div className="light-dust" aria-hidden="true" />;
}

export default LightDust;