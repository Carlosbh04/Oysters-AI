import { Link } from "react-router-dom";
import HeroBackground from "../../componentes/heroBackground/HeroBackground.jsx";
import "./HeroBackgroundPage.css";

/* ============================================================
   BANCO DE PRUEBAS del fondo del hero

   Página aislada: sin cabecera, sin pie y sin nada encima. Solo
   la escena a pantalla completa, para poder juzgarla sin
   interfaz de por medio.

   HeroBackground sigue aceptando `capas` y `ajustes` con sus
   valores por defecto, así que si algún día hace falta volver a
   depurar capa por capa basta con pasarle esos props desde
   aquí; no hay que tocar el componente.
   ============================================================ */
function HeroBackgroundPage() {
  return (
    <div className="lab-hero">
      <HeroBackground />

      {/* La página va sin cabecera, así que sin esto la única
          salida sería el botón atrás del navegador. Discreto y
          en una esquina para no estorbar al juzgar la escena. */}
      <Link to="/" className="lab-salir">
        ← Volver al sitio
      </Link>
    </div>
  );
}

export default HeroBackgroundPage;
