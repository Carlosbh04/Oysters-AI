import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import useViajeConPersiana from "../../hooks/useViajeConPersiana";
import useMediaQuery from "../../hooks/useMediaQuery";
import { ArrowLeft, CalendarDays } from "lucide-react";
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
/* ---- LAS IMÁGENES SE EXPLICAN ----
   Cada foto puede llevar su PIE: qué es lo que se está viendo. No
   es adorno — en un blog de agencia las imágenes suelen ser
   trabajos reales, y no decir de quién es la pieza desaprovecha la
   mejor prueba que hay en la página.

   El pie es opcional y sale del campo `pie` de cada entrada en
   blog.json (se añadió para esto). Si está vacío no se pinta nada:
   una foto sin pie se queda como estaba, sin dejar hueco ni filete
   colgando.

   `figcaption` y no un <p> suelto: así el pie queda ATADO a su
   imagen para quien navega con lector de pantalla, en vez de ser
   un párrafo más que aparece después. */
function Medio({ foto, alt, alto, pie }) {
  if (!foto) return null;

  return (
    <figure className={`bd-medio bd-medio--${alto}`}>
      {/* ---- EL MARCO, EN UNA CAJA APARTE ----
          El pie tiene que quedar FUERA del recuadro: dentro caía
          encima de la foto, porque la figura lleva su proporción y
          la imagen va a pantalla completa dentro.

          La clase de maquetación se queda en el <figure> para no
          tocar los `order` con los que la rejilla decide si la
          imagen va a un lado o al otro. */}
      <div className="bd-medio__caja">
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

        <span className="bd-medio__marca" aria-hidden="true" />
      </div>

      {pie ? <figcaption className="bd-pie">{pie}</figcaption> : null}
    </figure>
  );
}

/* mismo corte que el resto de la mano en el proyecto */
const CORTE_MANO = "(max-width: 1079px)";

function capitularDe(titulo = "") {
  const letra = [...titulo].find((c) => /\p{L}|\p{N}/u.test(c));
  return (letra || "").toLocaleUpperCase("es");
}

function BlogDetailPage() {
  /* ---- ARRIBA DEL TODO, ANTES DE CUALQUIER SALIDA ----
     Este componente devuelve antes de tiempo cuando el artículo no
     existe, y un hook detrás de un `return` rompe la regla de
     orden de React (lo cazó el linter). Va aquí y se acabó.

     Es la misma cortina que el menú, el pie y el listado: cualquier
     salto a otra página del sitio se ve igual. */
  const { aRuta } = useViajeConPersiana();

  /* ---- LA MANO PINTA OTRO ÁRBOL ----
     En escritorio la primera entrada es la APERTURA: su texto hace
     de entradilla junto al titular y su imagen va al lado, en
     rejilla. Ahí funciona.

     En la mano no: al apilarse, esa imagen cae pegada a la del
     apartado siguiente —dos fotos seguidas sin nada en medio— y
     además se PIERDE el subtítulo de la primera entrada, porque
     con su texto de entradilla nadie lo pinta.

     El diseño aprobado trata todas las entradas igual: imagen,
     pie, subtítulo y texto, una detrás de otra. Así que aquí se
     pintan todas por el mismo camino. */
  const esMano = useMediaQuery(CORTE_MANO);


  const { id } = useParams();

  /* ============================================================
     EL TITULAR SE ACOPLA A LA PÍLDORA

     Al bajar, el titular grande se encoge y se apaga; cuando deja
     de leerse, su texto ya está arriba en la píldora de la
     cabecera (eso lo hace SeccionEnCurso, que ahora también lee
     `.bd-titulo`). No se pierde el titular: cambia de sitio.

     Así la cabecera no ocupa sitio permanente y aun así nunca se
     pierde de vista en qué artículo estás.

     ---- POR QUÉ UNA VARIABLE Y NO CLASES ----
     El encogido es CONTINUO: sigue al dedo en vez de saltar en un
     umbral. Con clases habría que inventar escalones; con una
     propiedad de 0 a 1 el CSS interpola solo y aquí no se decide
     ninguna estética.

     ---- Y POR QUÉ NO SE LEE LA CAJA EN CADA FOTOGRAMA ----
     Se compara `scrollY` contra un número fijo. Medir el titular
     en cada scroll obligaría al navegador a recalcular
     maquetación 60 veces por segundo para saber algo que no
     cambia — el mismo motivo por el que SeccionEnCurso mide sus
     topes una sola vez.

     Fuera del tramo no se toca nada: en cuanto la variable llega a
     1 se deja de escribir, así que el resto del artículo se
     desplaza sin que esto haga nada. */
  const tituloRef = useRef(null);

  /* va DESPUÉS de `id` a propósito: lo tenía en las dependencias
     estando declarado más abajo, y eso reventaba la página entera
     con "Cannot access 'id' before initialization". Y antes de la
     salida por artículo no encontrado, que un hook detrás de un
     `return` rompe la regla de orden de React. */
  useEffect(() => {
    const titulo = tituloRef.current;
    if (!esMano || !titulo) return undefined;

    /* el tramo en el que ocurre el relevo, en píxeles de scroll */
    const RECORRIDO = 110;

    let pedido = null;
    let ultimo = -1;

    const pintar = () => {
      pedido = null;
      const t = Math.min(1, Math.max(0, window.scrollY / RECORRIDO));
      /* redondeo a centésimas: sin esto se reescribe la propiedad
         en cada fotograma aunque el valor no haya cambiado a la
         vista, y cada escritura cuesta un recálculo de estilo */
      const v = Math.round(t * 100) / 100;
      if (v === ultimo) return;
      ultimo = v;
      titulo.style.setProperty("--acopla", String(v));
    };

    const alMover = () => {
      if (pedido === null) pedido = requestAnimationFrame(pintar);
    };

    pintar();
    window.addEventListener("scroll", alMover, { passive: true });

    return () => {
      window.removeEventListener("scroll", alMover);
      if (pedido !== null) cancelAnimationFrame(pedido);
      titulo.style.removeProperty("--acopla");
    };
  }, [esMano, id]);

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
            {/* también con cortina: volver al listado es una
                navegación como cualquier otra, y sin esto era el
                único enlace del artículo que cambiaba de página en
                seco — justo el que más se usa. */}
            <Link to="/blog" className="bd-volver" onClick={aRuta("/blog")}>
              <ArrowLeft aria-hidden="true" />
              Todas las entradas
            </Link>

            <h1 className="bd-titulo" ref={tituloRef}>
              {entradaBlog.titulo}
            </h1>

            {/* ---- EL TEMA VA CON LA FECHA, NO EN UNA PÍLDORA ----
                La categoría era un badge encima del titular: caja,
                borde, fondo y versalitas para dos palabras. Eso es
                mucho envoltorio para un dato que solo sitúa, y le
                robaba el primer golpe de vista al titular, que es
                lo que de verdad tiene que leerse primero.

                Ahora es lo que es —un dato— y va donde van los
                datos: en la misma línea que la fecha y con su
                mismo tono, separados por un punto. */}
            {(entradaBlog.categoria || entradaBlog.fecha) && (
              <p className="bd-fecha">
                <CalendarDays aria-hidden="true" />

                {entradaBlog.categoria && <span>{entradaBlog.categoria}</span>}

                {entradaBlog.categoria && entradaBlog.fecha && (
                  <span className="bd-punto" aria-hidden="true">
                    ·
                  </span>
                )}

                {entradaBlog.fecha && <span>{entradaBlog.fecha}</span>}
              </p>
            )}

            {/* la entradilla y la imagen de apertura solo existen
                en escritorio: en la mano esa entrada se pinta como
                una más, abajo (ver el bloque de esMano) */}
            {!esMano && apertura?.texto && (
              <p className="bd-entradilla">{apertura.texto}</p>
            )}
          </div>

          {!esMano && (
            <Medio
              foto={apertura?.foto}
              alt={entradaBlog.titulo}
              alto="grande"
              pie={apertura?.pie}
            />
          )}
        </header>

        {/* ---- APARTADOS ----
            Alternan el lado de la imagen. El lado lo decide el
            índice y lo aplica una clase; la ORDEN visual la pone
            el CSS con `order`, no el marcado, para que en móvil
            —donde todo se apila— la imagen quede siempre encima
            de su texto sin tener que reordenar nada. */}
        {(esMano ? entradaBlog.entradas ?? [] : apartados).map((bloque, i) => (
          <section
            key={`${bloque.subtitulo}-${i}`}
            className={`bd-apartado ${
              i % 2 === 0 ? "bd-apartado--medio-izq" : "bd-apartado--medio-der"
            }`}
          >
            <Medio
              foto={bloque.foto}
              alt={bloque.subtitulo}
              alto="normal"
              pie={bloque.pie}
            />

            <div className="bd-apartado__texto">
              <h2 className="bd-subtitulo">{bloque.subtitulo}</h2>
              <p className="bd-parrafo">{bloque.texto}</p>
            </div>
          </section>
        ))}

        {/* ---- SIGUIENTE ENTRADA ----
             Era una píldora que decía "Siguiente entrada" y nada
             más: ni cuál, ni de qué tema, ni de cuándo. Se le pedía
             a alguien que pulsara a ciegas justo en el momento en
             que acaba de terminar de leer y está decidiendo si se
             queda o se va.

             Ahora es una capitular: la inicial del titular a cuatro
             veces su tamaño, colgando en el margen como en un
             libro. El peso lo pone la TIPOGRAFÍA, no una caja — que
             es lo que hace que no se lea como un componente de
             plantilla. */}
        {siguiente && siguiente.id !== entradaBlog.id && (
          <Link
            to={`/blog/${siguiente.id}`}
            className="bd-siguiente"
            onClick={aRuta(`/blog/${siguiente.id}`)}
          >
            <p className="bd-siguiente__rotulo">A continuación</p>

            <span className="bd-siguiente__caja">
              {/* aria-hidden porque REPITE la primera letra del
                  titular: sin esto un lector de pantalla dice
                  "I. Inteligencia artificial generativa…" */}
              <span className="bd-siguiente__capital" aria-hidden="true">
                {capitularDe(siguiente.titulo)}
              </span>

              <span className="bd-siguiente__titulo">{siguiente.titulo}</span>

              <span className="bd-siguiente__meta">
                {siguiente.categoria}
                {siguiente.categoria && siguiente.fecha && " · "}
                {siguiente.fecha}
              </span>
            </span>
          </Link>
        )}
      </article>
    </PageSection>
  );
}

export default BlogDetailPage;
