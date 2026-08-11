import FondoTrama from "../../componentes/fondoTrama/FondoTrama";
import "./FondoTramaPage.css";

/* ============================================================
   PÁGINA DEL FONDO TRAMA

   Solo el fondo, a sangre y sin nada encima. Llevaba un acordeón
   de muestra para comprobar la legibilidad del texto, pero
   estorbaba para lo único que hace falta aquí: mirar el fondo.
   ============================================================ */
function FondoTramaPage() {
  return (
    <div className="ftp">
      <FondoTrama />
    </div>
  );
}

export default FondoTramaPage;
