import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import trabajos from "../../../data/trabajos";

/* ============================================================
   SIGUIENTE PROYECTO

   Cierra la columna corta del cuerpo y, de paso, da salida al
   siguiente caso en vez de dejar el detalle sin continuación.

   ---- POR QUÉ ESTÁ AQUÍ Y NO ES DECORACIÓN ----
   Medido sobre los tres proyectos, la columna izquierda y la
   derecha acaban a distinta altura: 52px en BESTINVER, 54 en
   ALSEA y 372 en ACCIONA, cuya descripción es un párrafo frente a
   los tres de los demás.

   Rellenar ese hueco con adorno habría sido tapar el síntoma.
   Esto ocupa el sitio con algo que sirve —el lector que termina
   un caso quiere el siguiente— y que EXISTE SIEMPRE, así que la
   ficha no cambia de forma según el proyecto: es la misma pieza
   en todos, ocupe más o menos.

   ---- EL SIGUIENTE ES EL DE AL LADO EN LA LISTA ----
   Se toma del mismo orden que ve el usuario en /works (por id
   descendente) y da la vuelta al llegar al final. Así "siguiente"
   significa lo mismo aquí que allí, y nunca se queda sin destino
   por estar en el último.
   ============================================================ */
function NextWork({ id }) {
  const i = trabajos.findIndex((t) => t.id === id);
  if (i === -1 || trabajos.length < 2) return null;

  const siguiente = trabajos[(i + 1) % trabajos.length];
  const portada = siguiente.imagenes?.[0];

  return (
    <Link to={`/works/${siguiente.id}`} className="wd-tarjeta wd-siguiente">
      <span className="wd-rotulo">Siguiente proyecto</span>

      <span className="wd-siguiente__cuerpo">
        {/* La miniatura es opcional: hay proyectos sin imágenes
            —BESTINVER es solo vídeo— y en ellos la tarjeta se
            queda con el texto en vez de reservar un hueco gris. */}
        {portada && (
          <span className="wd-siguiente__miniatura">
            <img src={portada} alt="" loading="lazy" />
          </span>
        )}

        <span className="wd-siguiente__texto">
          <strong>{siguiente.titulo}</strong>
          <em>{siguiente.subtitulo}</em>
        </span>

        <ArrowRight strokeWidth={1.8} aria-hidden="true" />
      </span>
    </Link>
  );
}

export default NextWork;
