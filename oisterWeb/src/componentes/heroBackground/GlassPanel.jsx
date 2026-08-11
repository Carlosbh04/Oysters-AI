/* ============================================================
   LOSA DE CRISTAL

   ---- POR QUÉ TIENE GROSOR DE VERDAD ----
   La versión anterior era un rectángulo con una banda clara
   pegada a un lado, simulando el canto. Funcionaba de frente y
   se caía en cuanto el panel giraba: la banda seguía siendo
   plana y el panel se leía como una lámina de papel.

   Ahora el canto es OTRA cara, girada 90° en Y y colgada del
   filo. Con `preserve-3d` el navegador la proyecta sola, así
   que se ensancha o se estrecha según cuánto gire la losa —
   exactamente como haría un bloque real. Es la diferencia entre
   una lámina y un objeto.

   ---- POSICIÓN EN PORCENTAJES ----
   x, y, w, h van en % del viewport, igual que el mapa de la
   spec. Los paneles que salen fuera de pantalla (valores
   negativos o >100) siguen saliendo fuera.
   ============================================================ */
function GlassPanel({
  x,
  y,
  w,
  h,
  rotateY = 0,
  rotateZ = 0,
  z = 0,
  grosor = 16,
  profundidad = "medio",
  soloMarco = false,
  luzDesde = "izquierda",
  datos,
  /* Multiplican lo que marca el plano de profundidad, no lo
     sustituyen. Sirven para que dos losas del mismo plano no
     salgan idénticas: con todas al mismo valor la torre se lee
     como una plantilla repetida. */
  opacidad = 1,
  desenfoque = 1,
  className = "",
  style,
  children,
}) {
  return (
    <div
      className={`hb-panel hb-panel--${profundidad} hb-panel--luz-${luzDesde} ${
        soloMarco ? "hb-panel--marco" : ""
      } ${className}`}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        "--grosor": `${grosor}px`,
        "--op": opacidad,
        "--des": desenfoque,
        /* ---- EL PARALAJE VA AQUÍ DENTRO ----
           Estaba en una regla de la hoja de estilos, y una regla
           de hoja NO puede ganarle a un `transform` en línea por
           mucha especificidad que tenga. Resultado: los paneles
           eran la única capa de la escena que no se movía con el
           ratón, justo la que más lo necesita.

           `--hb-par` la pone la clase de profundidad, así que el
           fondo se desplaza 4px y el primer plano 20: es esa
           diferencia —y no el desplazamiento en sí— la que se lee
           como profundidad.

           El translateZ va DESPUÉS del paralaje y ANTES de las
           rotaciones: así la rotación ocurre en el plano ya
           desplazado y la profundidad no se acorta con el coseno
           del ángulo. */
        transform:
          `translate3d(calc(var(--hb-px, 0) * var(--hb-par, 0px) * -1),` +
          ` calc(var(--hb-py, 0) * var(--hb-par, 0px) * -1), 0)` +
          ` translateZ(${z}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
        ...style,
      }}
    >
      {/* la cara frontal: el vidrio que se mira de frente */}
      <span className="hb-panel__cara" />

      {/* el canto: la cara lateral. Se proyecta sola según el
          giro, y es lo que convierte la lámina en bloque */}
      <span className="hb-panel__canto" />

      {/* ---- DETALLE INTERNO ----
          Retícula de puntos, rayas y barras. Es lo que hace que
          la losa parezca un panel de instrumentación y no un
          cristal liso. Todo decorativo: la spec prohíbe texto
          real en el fondo. */}
      {datos && (
        <span className={`hb-panel__datos hb-panel__datos--${datos}`}>
          <i />
          <i />
          <i />
          <i />
        </span>
      )}

      {children}
    </div>
  );
}

export default GlassPanel;
