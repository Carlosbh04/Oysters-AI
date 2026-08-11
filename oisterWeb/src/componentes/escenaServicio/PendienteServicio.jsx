import "./PendienteServicio.css";

/* ============================================================
   MARCADOR DE APARTADO SIN CONTENIDO

   Lo que se ve en los apartados de "Cómo lo hacemos" a los que
   todavía no ha llegado su contenido. Existe por una razón
   práctica: a estas páginas se entra desde el menú, y una página
   en blanco no se distingue de una rota — ni para quien la abre
   ni para quien la revisa.

   Lleva el titular de verdad para que la escena se pueda juzgar
   con algo encima, y un aviso en versalitas que deja claro que
   falta lo demás.

   Se borra entero cuando llegue el contenido; no es andamiaje que
   haya que conservar.
   ============================================================ */
function PendienteServicio({ titulo }) {
  return (
    <div className="pendiente">
      <h1 className="pendiente__titulo">{titulo}</h1>
      <p className="pendiente__nota">Contenido pendiente · solo el fondo</p>
    </div>
  );
}

export default PendienteServicio;
