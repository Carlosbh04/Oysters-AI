import "./Rotulo.css";

/* ============================================================
   RÓTULO DE SECCIÓN

   La línea pequeña en versalitas que abre cada sección del home:
   "Qué hacemos", "Nuestros trabajos", "Sobre nosotros", "Casos
   de uso".

   Era el mismo elemento escrito cuatro veces, y de tanto
   copiarlo había divergido: tres cuerpos distintos (12px,
   0.75rem, 0.82rem), tres espaciados (0.17em, 0.22em, 0.26em) y
   tres colores. Ninguna de esas diferencias significaba nada —
   nadie las decidió, se acumularon.

   Aquí vive la forma. Cada sección conserva su propia clase
   encima para lo suyo: el margen fino y, sobre todo, su
   animación de entrada, que en cada una llega en un momento
   distinto de su cascada.

   ---- EL FILETE VA EN EL MARCADO, NO EN UN ::before ----
   Es un <i> vacío y no un pseudoelemento porque el rótulo es un
   flex de dos piezas: con `gap` el hueco entre la raya y el
   texto lo reparte el contenedor, y no hay que ajustar márgenes
   a mano cada vez que cambie el cuerpo de la letra.

   ---- `icono` CAMBIA LA PIEZA DE LA IZQUIERDA ----
   Las cabeceras de columna del pie llevan un icono en lugar del
   filete. Es la misma figura —algo pequeño a la izquierda, luego
   el hueco, luego las versalitas— así que comparten componente
   en vez de duplicar la tipografía por cuarta vez.

   El color NO se pasa por prop: se toma de --rotulo-color, que
   pone quien lo usa en un ancestro. Con una prop habría que
   escribir una regla por sitio, y esas reglas competirían con
   .rotulo a igualdad de especificidad — que es exactamente el
   lío de márgenes que hubo al unificar los cuatro del home.
   ============================================================ */
function Rotulo({ children, className = "", icono: Icono }) {
  return (
    <p className={`rotulo ${className}`}>
      {Icono ? (
        <span className="rotulo__icono" aria-hidden="true">
          <Icono strokeWidth={2.2} />
        </span>
      ) : (
        <i aria-hidden="true" />
      )}
      {children}
    </p>
  );
}

export default Rotulo;
