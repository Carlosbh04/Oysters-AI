import { useNavigate } from "react-router-dom";
import BlogCard from "./BlogCard";
import BlogLector from "./BlogLector";
import useMediaQuery from "../../hooks/useMediaQuery";
import FondoBlog from "./FondoBlog";
import Paginacion from "../paginacion/Paginacion";
import FiltroCategorias from "../work/FiltroCategorias";
import { temaCorto } from "./temasCortos";
import "./BlogList.css";

function BlogList({
  entradas,
  page = 1,
  totalPages = 1,
  categorias = null,
  categoriaActiva,
  onCambiarCategoria,
}) {
  const navigate = useNavigate();

  /* ---- DOS LISTADOS, NO UNO ADAPTADO ----
     En la mano el blog se lee sin cambiar de página (ver
     BlogLector.jsx) y en escritorio sigue siendo la rejilla de
     tarjetas que enlaza al detalle. Son dos ÁRBOLES distintos, no
     el mismo con otro CSS: uno lleva enlaces y el otro botones que
     despliegan, y forzar que sean el mismo marcado dejaría a uno
     de los dos con el rol equivocado. */
  const esMano = useMediaQuery("(max-width: 1079px)");

  /* La página del blog vive en la RUTA (/blog/page/2), no en un
     query param como en /works, así que aquí cambiar de página es
     navegar. La 1 va a /blog a secas: es la dirección limpia de
     la sección y /blog/page/1 solo sería ruido duplicado. El
     scroll arriba lo pone ScrollToTop al cambiar de ruta. */
  const irA = (n) => {
    if (n < 1 || n > totalPages || n === page) return;

    navigate(n === 1 ? "/blog" : `/blog/page/${n}`);
  };

  return (
    <section className="blog-list">
      {/* el cielo con la nieve: mismo componente que usa el
          detalle de entrada (ver FondoBlog.jsx) */}
      <FondoBlog />

      <header className="blog-list-head">
        <h1 className="blog-list-title">
          Blog
          <span className="blog-list-title-glow" aria-hidden="true"></span>
        </h1>

      </header>

      {/* ---- EL FILTRO ----
          Solo llega con categorías cuando estamos en la mano (lo
          decide BlogPage). Sin iconos: las categorías del blog no
          tienen símbolo asignado y todas caerían en el de por
          defecto — ocho chispas iguales dicen menos que ninguna.
          El sustantivo cambia para que un lector de pantalla diga
          "Publicidad, 3 artículos" y no "3 trabajos". */}
      {categorias && (
        <FiltroCategorias
          categorias={categorias}
          activa={categoriaActiva}
          onCambiar={onCambiarCategoria}
          conIconos={false}
          /* los temas del blog son largos y la tira no cabía: nueve
             chips sumaban 1.170px y se veían dos. Ver temasCortos.js */
          compacto
          nombreCorto={temaCorto}
          sustantivo={{ uno: "artículo", varios: "artículos" }}
        />
      )}

      {esMano && <BlogLector entradas={entradas} />}

      <div className="blog-list-grid">
        {entradas.map((entrada) => (
          <BlogCard
            key={entrada.id}
            id={entrada.id}
            titulo={entrada.titulo}
            categoria={entrada.categoria}
            fecha={entrada.fecha}
            foto={entrada.entradas?.[0]?.foto}
            entrada={entrada.entradas?.[0]}
          />
        ))}
      </div>

      {/* Paginación compartida con /works (el componente vive en
          paginacion/Paginacion.jsx). Con una sola página se
          oculta sola. */}
      <Paginacion
        actual={page}
        total={totalPages}
        onIrA={irA}
        ariaLabel="Paginación del blog"
      />
    </section>
  );
}

export default BlogList;
