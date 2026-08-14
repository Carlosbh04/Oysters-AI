import { useParams } from "react-router-dom";
import BlogList from "../../componentes/blog/BlogList";
import PageSection from "../../componentes/layout/PageSection";
import blogEntries from "../../data/blog.json";
import { totalDePaginas, paginaEnRango } from "../../utils/paginacion";

const MAX_ENTRADAS_POR_PAGINA = 8;

function BlogPage() {
  /* la página viaja en la RUTA (/blog/page/N); las reglas de
     total y acotado son las mismas de /works (utils/paginacion) */
  const { page } = useParams();

  const totalPaginas = totalDePaginas(blogEntries.length, MAX_ENTRADAS_POR_PAGINA);
  const paginaValida = paginaEnRango(
    Number(page ?? 1),
    blogEntries.length,
    MAX_ENTRADAS_POR_PAGINA
  );

  const inicio = (paginaValida - 1) * MAX_ENTRADAS_POR_PAGINA;
  const entradasPagina = blogEntries.slice(
    inicio,
    inicio + MAX_ENTRADAS_POR_PAGINA
  );

  return (
    <PageSection center={false} className="blog-page">
      <BlogList
        entradas={entradasPagina}
        page={paginaValida}
        totalPages={totalPaginas}
      />
    </PageSection>
  );
}

export default BlogPage;
