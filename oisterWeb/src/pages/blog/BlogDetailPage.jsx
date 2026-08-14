import { useParams, Link } from "react-router-dom";
import { ArrowDown, ArrowLeft, CalendarDays } from "lucide-react";
import PageSection from "../../componentes/layout/PageSection";
import FondoBlog from "../../componentes/blog/FondoBlog";
import blogEntries from "../../data/blog.json";
import "./BlogDetailPage.css";

/* ============================================================
   DETALLE DE ENTRADA DEL BLOG

   Aquí vivía un estado `cargando` con un temporizador de 400ms
   que solo existía para enseñar un skeleton propio DESPUÉS del
   que ya pone App.jsx mientras llega el chunk de la ruta: dos
   estados de carga encadenados, cada uno con su estética. Se
   retiró con el mismo criterio que documenta WorkDetailPage: el
   skeleton de esta ruta lo maneja App.jsx.

   ---- CÓMO SE REPARTE EL CONTENIDO ----
   blog.json trae la entrada como una lista de bloques, cada uno
   con subtítulo, texto y foto. La página los reparte en dos
   papeles distintos:

     · el PRIMER bloque hace de entradilla — su texto es el que
       presenta la entrada, junto al titular, y su foto es la
       imagen grande de apertura;
     · los DEMÁS son los apartados del cuerpo, cada uno con su
       imagen al lado, alternando de lado.

   Así una entrada de un solo bloque sigue funcionando: sale la
   apertura y nada más, sin huecos vacíos ni ramas especiales.

   ---- LAS IMÁGENES SON HUECOS, DE MOMENTO ----
   Ver Medio() más abajo. Las fotos aún no existen en
   public/img/blog/, así que se reserva el espacio con su
   proporción exacta. Cuando los archivos se suban, aparecen
   solas: no hay que tocar este archivo.
   ============================================================ */

/* ---- EL HUECO DE LA IMAGEN ----
   Reserva el sitio con la proporción final y, si la foto existe,
   la pinta. Es la misma idea del `onError` que ya usaba esta
   página, pero al revés: antes se ESCONDÍA la figura entera si
   el archivo faltaba —y el bloque se descolocaba—; aquí el hueco
   se queda, que es lo que mantiene la maqueta en pie mientras no
   haya fotos.

   El marco (borde, radio y brillo interior) es el mismo con foto
   y sin ella: así lo que se está juzgando ahora es la
   composición de verdad y no una versión provisional que luego
   cambia de tamaño. */
function Medio({ foto, alt, alto }) {
  return (
    <figure className={`bd-medio bd-medio--${alto}`}>
      {foto ? (
        <img
          src={foto}
          alt={alt}
          loading="lazy"
          /* si el archivo no está, se retira la imagen y queda el
             hueco de debajo: nunca el icono de imagen rota */
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      <span className="bd-medio__marca" aria-hidden="true" />
    </figure>
  );
}

function BlogDetailPage() {
  const { id } = useParams();

  const entradaBlog = blogEntries.find((blog) => blog.id === Number(id));

  if (!entradaBlog) {
    return (
      <PageSection className="blog-page blog-detalle">
        <FondoBlog />
        <h1 className="bd-vacio">Entrada de blog no encontrada</h1>
      </PageSection>
    );
  }

  const [apertura, ...apartados] = entradaBlog.entradas ?? [];

  /* la siguiente entrada del catálogo, para el enlace del final.
     Da la vuelta al llegar a la última: el pie de una entrada no
     es sitio para un callejón sin salida. */
  const indice = blogEntries.findIndex((b) => b.id === entradaBlog.id);
  const siguiente = blogEntries[(indice + 1) % blogEntries.length];

  return (
    <PageSection center={false} className="blog-page blog-detalle">
      {/* el mismo cielo del listado (ver FondoBlog.jsx) */}
      <FondoBlog />

      <article className="bd">
        {/* ---- APERTURA: texto a la izquierda, imagen a la
                derecha ---- */}
        <header className="bd-apertura">
          <div className="bd-apertura__texto">
            <Link to="/blog" className="bd-volver">
              <ArrowLeft aria-hidden="true" />
              Todas las entradas
            </Link>

            {entradaBlog.categoria && (
              <span className="bd-categoria">{entradaBlog.categoria}</span>
            )}

            <h1 className="bd-titulo">{entradaBlog.titulo}</h1>

            {entradaBlog.fecha && (
              <p className="bd-fecha">
                <CalendarDays aria-hidden="true" />
                {entradaBlog.fecha}
              </p>
            )}

            {apertura?.texto && (
              <p className="bd-entradilla">{apertura.texto}</p>
            )}
          </div>

          <Medio foto={apertura?.foto} alt={entradaBlog.titulo} alto="grande" />
        </header>

        {/* ---- APARTADOS ----
            Alternan el lado de la imagen. El lado lo decide el
            índice y lo aplica una clase; la ORDEN visual la pone
            el CSS con `order`, no el marcado, para que en móvil
            —donde todo se apila— la imagen quede siempre encima
            de su texto sin tener que reordenar nada. */}
        {apartados.map((bloque, i) => (
          <section
            key={`${bloque.subtitulo}-${i}`}
            className={`bd-apartado ${
              i % 2 === 0 ? "bd-apartado--medio-izq" : "bd-apartado--medio-der"
            }`}
          >
            <Medio foto={bloque.foto} alt={bloque.subtitulo} alto="normal" />

            <div className="bd-apartado__texto">
              <h2 className="bd-subtitulo">{bloque.subtitulo}</h2>
              <p className="bd-parrafo">{bloque.texto}</p>
            </div>
          </section>
        ))}

        {/* ---- SIGUIENTE ENTRADA ---- */}
        {siguiente && siguiente.id !== entradaBlog.id && (
          <Link to={`/blog/${siguiente.id}`} className="bd-siguiente">
            <span className="bd-siguiente__marca" aria-hidden="true">✦</span>
            Siguiente entrada
            <ArrowDown aria-hidden="true" />
          </Link>
        )}
      </article>
    </PageSection>
  );
}

export default BlogDetailPage;
