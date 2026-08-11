import { useLocation } from "react-router-dom";
import SkeletonPiece from "../SkeletonPiece";
import trabajos from "../../../data/trabajos";
import { cardsEnPagina, totalDePaginas } from "../../work/paginacion";
import {
  getCategorias,
  categoriaActiva,
  filtraPorCategoria,
} from "../../work/categorias";
import "./WorksSkeleton.css";

/* Eco pixel de WorkList.jsx + WorkCard.jsx (envuelto en el
   mismo PageSection que la página real, ver App.jsx): cada
   pieza ocupa el mismo espacio que su texto real (mismos
   altos de línea, paddings y márgenes) para que el reveal
   solo cambie shimmer → contenido en su sitio, sin salto.

   ---- POR QUÉ LEE LOS DATOS Y LA URL ----
   El número de cards estaba escrito a mano (`[0, 1, 2]`) con un
   comentario que pedía actualizarlo al añadir proyectos. Nadie
   lo hizo, y al entrar la paginación quedó mal de dos maneras
   distintas a la vez: en /works pintaba 3 huecos y llegaban 6
   —447px de salto—, y en /works?pagina=2 pintaba 3 huecos para
   una sola card, así que al cargar desaparecía una fila entera.

   Ahora cuenta: `trabajos` dice cuántos hay y la URL dice en qué
   página estás. Las reglas salen de work/paginacion.js, el mismo
   sitio del que las lee WorkList, así que no pueden discrepar.

   Importar `trabajos` aquí no engorda nada: ya está en el bundle
   principal porque LatestProjects (el home) lo importa. */
function WorksSkeleton() {
  const { search } = useLocation();

  /* mismo orden que WorkList: primero filtrar, luego contar. Si
     la URL trae ?categoria=algo, el hueco tiene que ser el de ESA
     categoría, no el del portafolio entero. */
  const categorias = getCategorias(trabajos);
  const filtrados = filtraPorCategoria(
    trabajos,
    categoriaActiva(search, trabajos)
  );

  const cuantas = cardsEnPagina(search, filtrados.length);
  const hayPaginacion = totalDePaginas(filtrados.length) > 1;

  /* el filtro no se pinta con una sola categoría — la condición
     está en FiltroCategorias.jsx y aquí se repite porque el
     hueco tiene que aparecer y desaparecer con él */
  const hayFiltro = categorias.length > 2;

  return (
    <section className="ws-skeleton">
      {/* ---- cabecera ---- */}
      <header className="ws-skeleton__head">
        {/* El TITULAR va primero: la píldora de "Agencia IA" y el
            antetítulo que iba encima ya no existen en la página
            real, así que aquí tampoco. */}
        <div className="ws-skeleton__title">
          {/* sin height: lo pone el CSS con el MISMO clamp que el
              h1 real, que encoge según el ancho. Lleva clase
              propia porque su hermano —el filete de luz de aquí
              abajo— también es un .skeleton, y un selector de
              hijo directo se los comía a los dos. */}
          <SkeletonPiece
            variant="title"
            width="260px"
            className="ws-skeleton__title-pieza"
          />
          <SkeletonPiece
            variant="line"
            width="42%"
            height="2px"
            className="ws-skeleton__title-glow"
          />
        </div>

        {/* La línea de apoyo. Lleva DENTRO su texto real,
            invisible pero ocupando sitio, por lo mismo que las
            píldoras de filtro: una anchura estimada a ojo fallaba
            por lo justo y el bloque saltaba al cargar. Así la
            mide el navegador con la misma tipografía. */}
        <span className="skeleton ws-skeleton__claim">
          Proyectos desarrollados por nuestra compañía
        </span>
      </header>

      {/* ---- barra de métricas ---- */}
      <div className="ws-skeleton__stats">
        {[0, 1, 2, 3].map((i) => (
          <div className="ws-skeleton__stat" key={i}>
            <SkeletonPiece variant="block" className="ws-skeleton__stat-icon" />
            <div className="ws-skeleton__stat-info">
              <SkeletonPiece variant="line" width="46px" height="27px" />
              <SkeletonPiece
                variant="line"
                width="80px"
                className="ws-skeleton__stat-label"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ---- píldoras de filtro ----
         ---- EL ANCHO NO SE ESTIMA: SE MIDE SOLO ----
         Primero puse una fórmula (≈8px por letra). Fallaba por
         poco —17px de más en total— y ese poco bastaba: la fila
         envolvía a dos líneas en el hueco y a una en la página
         real, o sea 57px de salto. Y habría vuelto a fallar con
         cualquier categoría nueva o con otra fuente.

         Ahora cada píldora lleva DENTRO su nombre de verdad,
         invisible pero ocupando sitio (el CSS le da el mismo
         tipo, relleno y hueco que la píldora real). Así el ancho
         lo calcula el navegador con el mismo texto y la misma
         tipografía: no puede desviarse. */}
      {hayFiltro && (
        <div className="ws-skeleton__filtro">
          {categorias.map((c) => (
            <span key={c.slug} className="skeleton ws-skeleton__chip">
              <span className="ws-skeleton__chip-icono" />
              <span className="ws-skeleton__chip-texto">{c.nombre}</span>
              <span className="ws-skeleton__chip-num">{c.cuantos}</span>
            </span>
          ))}
        </div>
      )}

      {/* ---- grid de cards ----
         Tantos huecos como cards va a haber: ni uno más (dejaría
         una fila fantasma que se evapora) ni uno menos (el resto
         de la página daría un salto hacia abajo). */}
      <div className="ws-skeleton__grid">
        {Array.from({ length: cuantas }, (_, i) => (
          <div className="ws-skeleton__card" key={i}>
            <div className="ws-skeleton__card-media">
              <SkeletonPiece variant="block" className="ws-skeleton__card-image" />
            </div>
            <div className="ws-skeleton__card-body">
              <SkeletonPiece variant="line" width="100px" height="12px" />
              <SkeletonPiece variant="line" width="85%" height="20px" />
              <div className="ws-skeleton__card-text">
                <SkeletonPiece variant="line" width="92%" height="20.5px" />
                <SkeletonPiece variant="line" width="58%" height="20.5px" />
              </div>
              <div className="ws-skeleton__card-link">
                <SkeletonPiece variant="line" width="112px" height="16px" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---- paginación ----
         Mismo criterio que la real: no se pinta con una sola
         página. El alto de la barra es fijo (44px), así que da
         igual cuántos botones lleve; se enseñan unos pocos. */}
      {hayPaginacion && (
        <div className="ws-skeleton__pag">
          <SkeletonPiece variant="block" className="ws-skeleton__pag-btn" />
          {Array.from(
            { length: Math.min(totalDePaginas(trabajos.length), 5) },
            (_, i) => (
              <SkeletonPiece
                variant="block"
                className="ws-skeleton__pag-btn"
                key={i}
              />
            )
          )}
          <SkeletonPiece variant="block" className="ws-skeleton__pag-btn" />
        </div>
      )}

      {/* ---- cinta de marcas ----
         Faltaba entera, y es la pieza más alta de las que había
         debajo de la rejilla: 327px con sus márgenes en
         escritorio. Sin ella el CTA aparecía muy arriba y bajaba
         de golpe al cargar. Los clamps son los mismos que los de
         MarcasMarquee.css, para que el hueco siga a la cinta a
         cualquier ancho en vez de cuadrar solo en uno. */}
      <div className="ws-skeleton__marcas">
        <SkeletonPiece
          variant="line"
          width="min(360px, 80%)"
          height="16px"
          className="ws-skeleton__marcas-titulo"
        />
        <div className="ws-skeleton__marcas-pista">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonPiece variant="line" width="104px" height="17px" key={i} />
          ))}
        </div>
      </div>

      {/* ---- banda CTA ---- */}
      <div className="ws-skeleton__cta">
        <SkeletonPiece variant="block" className="ws-skeleton__cta-icon" />
        <div className="ws-skeleton__cta-text">
          <SkeletonPiece variant="line" width="62%" height="24px" />
          <SkeletonPiece variant="line" width="80%" height="18px" />
        </div>
        <SkeletonPiece
          variant="line"
          width="130px"
          height="44px"
          className="ws-skeleton__cta-btn"
        />
      </div>
    </section>
  );
}

export default WorksSkeleton;
