import "./FiltroCategorias.css";

/* ============================================================
   PÍLDORAS DE FILTRO

   ---- POR QUÉ SON <button> Y NO PESTAÑAS ----
   Se parecen a unas tabs, pero no lo son: no cambian un panel
   por otro, filtran una lista que ya está en pantalla. Marcarlas
   como `role="tablist"` obligaría a implementar la navegación
   con flechas del teclado y le prometería a un lector de
   pantalla un panel asociado que no existe.

   Son botones de dos estados, así que lo que corresponde es
   `aria-pressed`. Con eso, quien navega a ciegas oye "Todos,
   botón, pulsado" y sabe qué filtro está puesto — algo que el
   color de la píldora solo le cuenta a quien ve.

   El contador va dentro del `aria-label` en vez de suelto, para
   que se lea "Vídeo con IA, 2 trabajos" de una vez y no como dos
   cosas sin relación.
   ============================================================ */

/* ---- DOS PARÁMETROS PARA QUE SIRVA EN LOS DOS SITIOS ----
   El componente nació para /works y se usa ahora también en el
   blog. Lo que cambiaba entre uno y otro no era la mecánica
   —mismos botones, mismo `aria-pressed`, misma defensa contra un
   slug inventado— sino dos detalles:

     · los ICONOS. Las categorías de trabajo tienen su símbolo
       asignado; las del blog no, así que todas caerían en el
       de por defecto y saldrían ocho chispas idénticas. Peor que
       ninguno.

     · el SUSTANTIVO del aria-label. Decía "2 trabajos" a secas,
       y en el blog un lector de pantalla anunciaría "Publicidad,
       3 trabajos" sobre una lista de artículos.

   Se parametrizan los dos con los valores de /works por defecto,
   así que esa página no se entera del cambio.

   Y con el mismo criterio entra el tercero:

     · el NOMBRE CORTO. Los temas del blog son largos
       —"Inteligencia Artificial" ocupa él solo 182px— y los nueve
       sumaban 1.170px de arrastre en una pantalla de 391: se veían
       dos. Acortándolos caben. En /works los nombres ya son
       breves, así que por defecto no se acorta nada.

   Que el nombre corto sea una FUNCIÓN y no una tabla es a
   propósito: la tabla vive en quien la necesita (el blog) y este
   componente no tiene que enterarse de qué categorías existen. */
function FiltroCategorias({
  categorias,
  activa,
  onCambiar,
  conIconos = true,
  compacto = false,
  nombreCorto = (n) => n,
  sustantivo = { uno: "trabajo", varios: "trabajos" },
}) {
  /* con una sola categoría el filtro no filtra nada: sería un
     botón que siempre enseña lo mismo. Mismo criterio que la
     paginación, que tampoco se pinta con una única página. */
  if (categorias.length <= 2) return null;

  return (
    <div
      className={`work-filtro${compacto ? " work-filtro--compacto" : ""}`}
      role="group"
      aria-label="Filtrar por categoría"
    >
      {categorias.map(({ slug, nombre, cuantos, Icono }) => {
        const puesta = slug === activa;

        return (
          <button
            key={slug}
            type="button"
            className={`work-filtro__chip${
              puesta ? " work-filtro__chip--activa" : ""
            }`}
            aria-pressed={puesta}
            aria-label={`${nombre}, ${cuantos} ${
              cuantos === 1 ? sustantivo.uno : sustantivo.varios
            }`}
            onClick={() => onCambiar(slug)}
          >
            {conIconos && (
              <Icono size={16} strokeWidth={2.2} aria-hidden="true" />
            )}
            {/* el aria-label de arriba lleva el nombre COMPLETO, así
                que acortar aquí no le quita información a nadie que
                navegue a ciegas: solo a quien ve, que tiene el
                contexto de la página delante. */}
            <span className="work-filtro__nombre">{nombreCorto(nombre)}</span>
            {/* aria-hidden: el número ya va dicho en el aria-label
                de arriba, y repetirlo sonaría a ruido */}
            <span className="work-filtro__cuantos" aria-hidden="true">
              {cuantos}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default FiltroCategorias;
