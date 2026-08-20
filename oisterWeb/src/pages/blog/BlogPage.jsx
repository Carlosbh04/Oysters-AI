import { useParams, useSearchParams } from "react-router-dom";
import BlogList from "../../componentes/blog/BlogList";
import PageSection from "../../componentes/layout/PageSection";
import useMediaQuery from "../../hooks/useMediaQuery";
import blogEntries from "../../data/blog.json";
import { totalDePaginas, paginaEnRango } from "../../utils/paginacion";
import {
  PARAM_CATEGORIA,
  TODAS,
  getCategorias,
  categoriaActiva,
  filtraPorCategoria,
} from "../../componentes/work/categorias";

const MAX_ENTRADAS_POR_PAGINA = 8;

/* ============================================================
   EL FILTRO POR TEMA, SOLO EN LA MANO

   Once artículos repartidos en ocho categorías: quien llega
   buscando "Publicidad" tiene que recorrer once fechas para dar
   con los tres que le interesan. El filtro es lo único de esta
   página que resuelve ENCONTRAR, y por eso se eligió frente a
   nueve propuestas que solo cambiaban cómo se ven las tarjetas.

   ---- SE REUTILIZA LO DE /works, NO SE COPIA ----
   `getCategorias`, `categoriaActiva` y `filtraPorCategoria` leen
   el campo `categoria`, que las entradas del blog también tienen.
   Reescribirlas aquí habría duplicado el sluggado y —lo que más
   importa— la defensa de `categoriaActiva`: un `?categoria=`
   inventado a mano cae en "todas" en vez de dejar la lista vacía
   sin explicación.

   ---- Y EN ESCRITORIO SE FUERZA "TODAS" ----
   El control solo se pinta en la mano. Si el estado se leyera de
   la URL en los dos anchos, alguien que filtra en el móvil y
   ensancha la ventana se quedaría con una lista filtrada y sin
   ningún control a la vista para deshacerlo — una página que
   esconde artículos sin decir por qué. Forzando TODAS, escritorio
   enseña siempre las once.
   ============================================================ */

function BlogPage() {
  /* la página viaja en la RUTA (/blog/page/N); las reglas de
     total y acotado son las mismas de /works (utils/paginacion) */
  const { page } = useParams();
  const [busqueda, setBusqueda] = useSearchParams();
  const esMano = useMediaQuery("(max-width: 1079px)");

  const categorias = getCategorias(blogEntries);
  const activa = esMano
    ? categoriaActiva(busqueda.toString(), blogEntries)
    : TODAS;

  const entradas = filtraPorCategoria(blogEntries, activa);

  /* ---- LA PAGINACIÓN SE CALCULA SOBRE LO FILTRADO ----
     Y no sobre el total: con "Publicidad" puesta hay 3 artículos,
     así que sobra la segunda página. `paginaEnRango` además acota
     —si estabas en la 2 y filtras a 3 resultados, te devuelve a
     la 1 en vez de enseñar una página vacía. */
  const totalPaginas = totalDePaginas(entradas.length, MAX_ENTRADAS_POR_PAGINA);
  const paginaValida = paginaEnRango(
    Number(page ?? 1),
    entradas.length,
    MAX_ENTRADAS_POR_PAGINA
  );

  const inicio = (paginaValida - 1) * MAX_ENTRADAS_POR_PAGINA;
  const entradasPagina = entradas.slice(
    inicio,
    inicio + MAX_ENTRADAS_POR_PAGINA
  );

  /* Cambiar de filtro NO conserva la página: los resultados son
     otros, así que la 2 de antes no significa nada. `replace`
     para no llenar el historial de pasos intermedios — pulsar
     atrás debe sacarte del blog, no recorrer cinco filtros. */
  const cambiarCategoria = (slug) => {
    const params = new URLSearchParams(busqueda);

    if (slug === TODAS) params.delete(PARAM_CATEGORIA);
    else params.set(PARAM_CATEGORIA, slug);

    setBusqueda(params, { replace: true });
  };

  return (
    <PageSection center={false} className="blog-page">
      <BlogList
        entradas={entradasPagina}
        page={paginaValida}
        totalPages={totalPaginas}
        categorias={esMano ? categorias : null}
        categoriaActiva={activa}
        onCambiarCategoria={cambiarCategoria}
      />
    </PageSection>
  );
}

export default BlogPage;
