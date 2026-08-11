import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/* ============================================================
   HERO

   ---- EL FRAGMENTO EN DEGRADADO ----
   La spec pide el titular en texto primario "con la palabra
   clave en gradiente". Los titulares de este catálogo son
   nombres de marca de una sola palabra (ACCIONA, BESTINVER), o
   sea que no hay ninguna palabra clave que destacar dentro.

   Se resuelve con un campo OPCIONAL en trabajos.js,
   `tituloDestacado`: si trae un fragmento del título, ese
   fragmento va en degradado. Si no lo trae —el caso de hoy en
   los siete proyectos— el título va entero en texto primario y
   no pasa nada.

   La alternativa era inventar una regla del tipo "las últimas
   dos palabras van en color", que habría acertado por
   casualidad en unos títulos y quedado absurda en otros.

   ---- Y EL DEGRADADO NO BAJA AL SUBTÍTULO ----
   Primero lo puse ahí, que era donde tenía sitio para lucirse.
   Medido sobre los píxeles reales daba 4.24:1 y el AA pide 4.5,
   porque el subtítulo va a 18px normales y justo por detrás
   pasa la cinta magenta del fondo.

   El titular sí puede llevarlo: a 52px cuenta como texto grande
   y el umbral baja a 3:1. O sea que la regla no es "el degradado
   queda mal", es "el degradado solo en texto grande".
   ============================================================ */
function WorkHero({ titulo, tituloDestacado, subtitulo, categoria, etiquetas = [] }) {
  const partes = partirTitulo(titulo, tituloDestacado);

  return (
    <header className="wd-hero">
      <Link to="/works" className="wd-hero__volver">
        <ArrowLeft strokeWidth={1.8} aria-hidden="true" />
        Todos los trabajos
      </Link>

      {categoria && <p className="wd-hero__categoria">{categoria}</p>}

      <h1 className="wd-hero__titulo">
        {partes.antes}
        {partes.destacado && (
          <span className="wd-hero__destacado">{partes.destacado}</span>
        )}
        {partes.despues}
      </h1>

      {subtitulo && <p className="wd-hero__sub">{subtitulo}</p>}

      {etiquetas.length > 0 && (
        <ul className="wd-hero__etiquetas">
          {etiquetas.map((e) => (
            <li key={e}>#{e}</li>
          ))}
        </ul>
      )}
    </header>
  );
}

/* Parte el título en tres trozos alrededor del fragmento
   destacado. Si el fragmento no aparece tal cual en el título
   —una errata al escribir los datos— devuelve el título entero
   sin destacar, en vez de romper el render. */
function partirTitulo(titulo = "", destacado) {
  if (!destacado) return { antes: titulo, destacado: null, despues: "" };

  const i = titulo.indexOf(destacado);
  if (i === -1) return { antes: titulo, destacado: null, despues: "" };

  return {
    antes: titulo.slice(0, i),
    destacado,
    despues: titulo.slice(i + destacado.length),
  };
}

export default WorkHero;
