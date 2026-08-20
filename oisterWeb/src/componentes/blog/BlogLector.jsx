import { useState } from "react";
import { Link } from "react-router-dom";
import useViajeConPersiana from "../../hooks/useViajeConPersiana";

/* ============================================================
   EL LECTOR CONTINUO — el blog se lee sin cambiar de página

   En la mano, cada artículo es una fila con su tema, su fecha y
   su titular; al tocar "seguir leyendo" el texto se despliega ahí
   mismo. Sin navegar, sin volver atrás, sin perder el sitio en la
   lista: leer tres artículos deja de costar seis cargas.

   Encaja porque los artículos de este blog son CORTOS —el primero
   son 828 caracteres contando sus dos entradas—, así que abrir
   uno no convierte la página en un scroll interminable. Con
   textos largos esta idea se cae, y conviene saberlo antes de
   escribir el primero de 20.000 caracteres.

   ---- LO QUE SE ABRE ES UN ANZUELO, NO EL ARTÍCULO ----
   Aquí estuvo volcado el texto ENTERO, y así el enlace al
   artículo no tenía sentido: llevaba a leer lo mismo otra vez.

   Ahora se abre solo el primer apartado, CORTADO, y debajo van
   los títulos de los apartados que quedan. Se ve de qué va y
   cuánto falta, que es lo que hace querer entrar — y entrar da
   algo, que es lo que antes no pasaba.

   ⚠️ Ojo, porque esto tiene un techo que no es de diseño: hoy los
   artículos son 400-550 caracteres y sus imágenes NO EXISTEN (las
   24 rutas de blog.json apuntan a archivos que no están en
   public/, y en el navegador salen rotas). Por corto que se deje
   el anzuelo, detrás hay poco. Si el blog va en serio, lo que
   falta es contenido, no interfaz.

   ---- ABIERTOS INDEPENDIENTES, Y TODOS CERRADOS AL LLEGAR ----
   No es un acordeón excluyente: alguien puede querer dos
   artículos abiertos para compararlos, y cerrarle uno al abrir
   otro sería decidir por él.

   Se llega con todos cerrados. Lo que se ve es la lista entera de
   titulares, que es lo que se viene a hacer aquí — elegir cuál—,
   y el "Seguir leyendo ›" de cada fila ya dice que se despliegan.
   (El detalle de por qué se cambió, junto al estado.)
   ============================================================ */

/* Los temas se distinguen por color, que es lo que hace que la
   lista se lea como un índice y no como once filas iguales. El
   color sale del NOMBRE del tema y no de su posición: así un
   artículo nuevo no le cambia el color a los demás. */
const COLORES = ["#C9A8FF", "#FF9BE8", "#E879F9", "#A78BFA", "#F0ABFC"];

/* Hasta dónde se enseña del primer apartado. Suficiente para
   saber de qué va, corto para que falte lo bueno. Se corta en
   BLANCO, nunca a mitad de palabra. */
const LARGO_ANZUELO = 150;

function recortar(texto = "") {
  if (texto.length <= LARGO_ANZUELO) return { texto, cortado: false };

  const trozo = texto.slice(0, LARGO_ANZUELO);
  const corte = trozo.lastIndexOf(" ");

  return { texto: trozo.slice(0, corte > 0 ? corte : LARGO_ANZUELO), cortado: true };
}

function colorDe(tema = "") {
  let suma = 0;
  for (let i = 0; i < tema.length; i++) suma += tema.charCodeAt(i);
  return COLORES[suma % COLORES.length];
}

function BlogLector({ entradas }) {
  /* la misma cortina que el menú y el pie: cualquier salto a otra
     página del sitio se ve igual, venga de donde venga */
  const { aRuta } = useViajeConPersiana();

  /* ---- TODAS ARRANCAN CERRADAS ----
     Antes se abría la primera para enseñar que las filas se
     despliegan. El argumento no se sostiene: cada fila lleva su
     "Seguir leyendo ›" a la vista, que dice exactamente eso y lo
     dice once veces en vez de una.

     Lo que sí costaba era la comparación — con una abierta, la
     primera entrada ocupaba lo que las cuatro siguientes juntas y
     la lista dejaba de leerse como una lista. Cerradas, entra el
     triple de titulares en la primera pantalla, que es lo que se
     viene a hacer aquí: elegir cuál. */
  const [abiertos, setAbiertos] = useState([]);

  const alternar = (id) =>
    setAbiertos((previos) =>
      previos.includes(id)
        ? previos.filter((n) => n !== id)
        : [...previos, id]
    );

  return (
    <div className="lector">
      {entradas.map(({ id, titulo, categoria, fecha, entradas: partes }) => {
        const abierto = abiertos.includes(id);

        const primera = partes?.[0];
        const anzuelo = recortar(primera?.texto);
        /* los apartados que NO se enseñan: lo que se gana entrando */
        const restantes = (partes || []).slice(1).filter((x) => x.subtitulo);

        return (
          <article
            className="lector__art"
            key={id}
            data-abierto={abierto || undefined}
          >
            <p className="lector__meta">
              <span
                className="lector__tema"
                style={{ color: colorDe(categoria) }}
              >
                {categoria || "Blog"}
              </span>
              {fecha && <span className="lector__fecha">· {fecha}</span>}
            </p>

            <h2 className="lector__titulo">{titulo}</h2>

            {/* ---- EL DESPLIEGUE VA CON GRID, NO CON max-height ----
                `max-height` obliga a inventar un número mayor que
                el texto más largo, y el día que uno lo pase se
                queda cortado sin que nada avise. Con las filas del
                grid de 0fr a 1fr, la caja mide lo que mida su
                contenido y la animación sale igual. */}
            <div
              className="lector__cuerpo"
              id={`lector-${id}`}
              /* ---- CERRADO, TAMBIÉN PARA EL TABULADOR ----
                 `overflow: hidden` lo esconde a la vista pero no al
                 teclado: el enlace "Ver artículo completo" de un
                 artículo plegado seguía midiendo 29px y se podía
                 tabular hasta él a ciegas. `inert` lo saca del
                 orden de tabulación y de los lectores de pantalla
                 mientras está cerrado — mismo recurso que usa el
                 conmutador de Casos de uso. */
              inert={!abierto}
            >
              <div className="lector__dentro">
                {primera && (
                  <div className="lector__parte">
                    {primera.subtitulo && (
                      <h3 className="lector__subtitulo">{primera.subtitulo}</h3>
                    )}
                    <p className="lector__texto">
                      {anzuelo.texto}
                      {anzuelo.cortado && <span aria-hidden="true">…</span>}
                    </p>
                  </div>
                )}

                {/* ---- LO QUE QUEDA POR LEER ----
                    Los títulos de los apartados que no se enseñan.
                    No es adorno: es la única razón concreta para
                    entrar, y sale de los propios datos en vez de
                    ser una promesa escrita a mano. */}
                {restantes.length > 0 && (
                  <div className="lector__gancho">
                    <p className="lector__gancho-rotulo">
                      Sigue en el artículo
                    </p>
                    <ul className="lector__gancho-lista">
                      {restantes.map((parte, i) => (
                        <li key={i}>{parte.subtitulo}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  to={`/blog/${id}`}
                  className="lector__completo"
                  onClick={aRuta(`/blog/${id}`)}
                >
                  Leer el artículo
                  <i aria-hidden="true">→</i>
                </Link>
              </div>
            </div>

            {/* un <button> de verdad y no un <span> con onClick:
                así se llega con el teclado, se anuncia como control
                y `aria-expanded` dice si está abierto */}
            <button
              type="button"
              className="lector__mas"
              onClick={() => alternar(id)}
              aria-expanded={abierto}
              aria-controls={`lector-${id}`}
            >
              {abierto ? "Cerrar" : "Seguir leyendo"}
              <i aria-hidden="true">›</i>
            </button>
          </article>
        );
      })}
    </div>
  );
}

export default BlogLector;
