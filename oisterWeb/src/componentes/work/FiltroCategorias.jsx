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

function FiltroCategorias({ categorias, activa, onCambiar }) {
  /* con una sola categoría el filtro no filtra nada: sería un
     botón que siempre enseña lo mismo. Mismo criterio que la
     paginación, que tampoco se pinta con una única página. */
  if (categorias.length <= 2) return null;

  return (
    <div className="work-filtro" role="group" aria-label="Filtrar por categoría">
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
              cuantos === 1 ? "trabajo" : "trabajos"
            }`}
            onClick={() => onCambiar(slug)}
          >
            <Icono size={16} strokeWidth={2.2} aria-hidden="true" />
            <span className="work-filtro__nombre">{nombre}</span>
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
