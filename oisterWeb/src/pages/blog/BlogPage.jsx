import { useParams } from "react-router-dom";
import BlogList from "../../componentes/blog/BlogList";
import PageSection from "../../componentes/layout/PageSection";
import blogEntries from "../../data/blog.json";

const MAX_ENTRADAS_POR_PAGINA = 8;

function BlogPage() {
  const { page } = useParams();
  const paginaActual = Number(page) || 1;
  const paginaSegura = Number.isInteger(paginaActual) && paginaActual > 0
    ? paginaActual
    : 1;

  const totalPaginas = Math.max(
    1,
    Math.ceil(blogEntries.length / MAX_ENTRADAS_POR_PAGINA)
  );

  const paginaValida = Math.min(paginaSegura, totalPaginas);
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
