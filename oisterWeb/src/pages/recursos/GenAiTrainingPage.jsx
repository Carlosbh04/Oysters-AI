import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Image as ImageIcon,
  MessagesSquare,
  Music4,
  Play,
} from "lucide-react";
import PageSection from "../../componentes/layout/PageSection";
import { CABECERA, MODULOS, OBJETIVOS, PRECIO } from "../../data/formacion";
import "./GenAiTrainingPage.css";
import useMediaQuery from "../../hooks/useMediaQuery";
import { idDe } from "./idModulo";

/* ============================================================
   GEN AI TRAINING — la página del curso (/resources)

   Hasta ahora esta ruta era un marcador de posición literal
   (<div>AÑADIR RECURSOS</div>) al que sí apuntaba el menú.

   ---- ES UNA PÁGINA CLARA EN UN SITIO OSCURO ----
   Y es a propósito, no un descuido: la maqueta de referencia lo
   es. El contraste con el resto del sitio funciona a favor —una
   página de formación se lee como documentación, y ahí el fondo
   claro es lo que toca—, pero obliga a dos cuidados que el resto
   del sitio no necesita:

     · el header flota encima con su píldora rosa, así que la
       cabecera de la página es MORADA y no clara: la píldora
       necesita un fondo oscuro debajo para no desaparecer;
     · el pie NO se puede aclarar (su tarjeta es semitransparente
       y tomaría el claro de detrás, dejando el texto ilegible),
       así que es la PÁGINA la que cierra bajando hasta el color
       del pie. Ver la banda de cierre en el CSS.

   ---- EL ANCHO LO PONE PageSection, NO ESTA PÁGINA ----
   Se envuelve en <PageSection>, como el resto de páginas, y por
   eso el contenido cae EXACTAMENTE en el mismo carril que el
   header y el pie. Antes tenía un ancho propio (1240px al 92%) y
   se quedaba 21px por dentro a cada lado: poco para verlo de
   golpe, suficiente para que la página no pareciera del mismo
   sitio.

   La cabecera es la excepción y se sale a sangre con el mismo
   truco que ya usa la cinta de marcas (`margin-inline: calc(50%
   - 50vw)`), porque en la maqueta ocupa el ancho entero.

   ---- LOS TEXTOS NO ESTÁN AQUÍ ----
   Viven en data/formacion.js, como el resto del contenido del
   sitio. Aquí solo está la forma.
   ============================================================ */

/* El icono de cada módulo se resuelve por nombre contra este
   mapa: así data/formacion.js se queda siendo datos y no tiene
   que importar componentes (ver el comentario de allí). */
const ICONOS = {
  chat: MessagesSquare,
  imagen: ImageIcon,
  audio: Music4,
  video: Play,
};

/* ---- HUECO DE IMAGEN ----
   Mismo criterio que el detalle del blog: el marco es DEFINITIVO
   y la foto entra dentro, así que la composición no se mueve
   cuando se sustituyan las imágenes.

   Las dos que hay ahora son DE PRUEBA, generadas para poder
   juzgar el diseño con algo dentro: la sala de lectura de la
   cabecera y los monitores al atardecer de la presentación.
   Están en public/img/formacion/ y se cambian ahí mismo, sin
   tocar este archivo, mientras conserven el nombre.

   Si la foto falta o no carga, se retira y queda el hueco con su
   ✦: nunca el icono de imagen rota. */
function Hueco({ className = "", alto = "16 / 10", foto, alt = "" }) {
  return (
    <div className={`gt-hueco ${className}`} style={{ aspectRatio: alto }}>
      {foto ? (
        <img
          src={foto}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      <span className="gt-hueco__marca" aria-hidden="true" />
    </div>
  );
}

function GenAiTrainingPage() {
  const esMano = useMediaQuery("(max-width: 1079px)");

  return (
    <PageSection center={false} className="gt">
      {/* ============ 1 · CABECERA ============
          Dos mitades a sangre: texto sobre morado a la izquierda,
          imagen a la derecha.

          NO lleva el botón de "volver a cursos" ni el de "reserva
          tu sesión" que traía la maqueta: el de volver porque no
          hay un listado de cursos del que venir —esta ruta ES el
          apartado—, y el de reservar porque se retiró a petición.
          La llamada a la acción vive una sola vez, abajo, junto al
          precio, que es donde se decide. */}
      <header className="gt-cabecera">
        <div className="gt-cabecera__texto">
          <h1 className="gt-titulo">{CABECERA.titulo}</h1>

          <span className="gt-filo" aria-hidden="true" />

          <p className="gt-entradilla">{CABECERA.entradilla}</p>
        </div>

        {/* En la mano NO se monta: la foto de cabecera pasó a ser
            el FONDO de este bloque, y dejarla además como imagen
            la enseñaba dos veces. Se oculta con JSX y no con
            `display: none` para que tampoco viaje por la red:
            escondida seguía estando en el documento. */}
        {!esMano && (
          <div className="gt-cabecera__medio">
            <Hueco
              alto="4 / 3"
              foto="/img/formacion/cabecera.jpg"
              alt="Sala de formación con biblioteca y grandes ventanales"
            />
          </div>
        )}
      </header>

      {/* ============ 2 · PRESENTACIÓN ============ */}
      <section className="gt-presenta">
        {/* ---- LAS DOS FOTOS SE REPARTEN, NO SE REPITEN ----
              En la mano la cabecera pasó a llevar `presentacion.jpg`
              de fondo —se eligió midiendo: sobre su zona de texto el
              blanco da 13,56:1, contra 2,55 de la otra— y esta
              sección seguía enseñando LA MISMA foto un palmo más
              abajo. Se veía dos veces seguidas.

              Así que en la mano esta plaza pasa a `cabecera.jpg`,
              que se había quedado sin usar al convertirse la
              cabecera en fondo. Cada imagen sale una vez.

              En escritorio no cambia nada: allí la cabecera sigue
              siendo un degradado con su foto al lado, y esta
              sección conserva la suya. */}
        <Hueco
          className="gt-presenta__medio"
          alto="4 / 3"
          foto={
            esMano
              ? "/img/formacion/cabecera.jpg"
              : "/img/formacion/presentacion.jpg"
          }
          alt={
            esMano
              ? "Sala de formación con biblioteca y grandes ventanales"
              : "Puesto de trabajo con monitores mostrando creatividades generadas con IA"
          }
        />

        <div className="gt-presenta__texto">
          <p>
            Con el objetivo de formar y mantener equipos de marketing y
            publicidad a la vanguardia de la IA, y <strong>optimizar</strong>{" "}
            sus estrategias y operaciones actuales, <strong>Oysters AI</strong>{" "}
            propone un <strong>curso intensivo en aplicativos de IA</strong>{" "}
            relacionados con la generación de <strong>‘briefings’</strong>, la
            estrategia creativa y la <strong>generación de contenidos</strong>.
          </p>

          <p>
            Este curso está diseñado para integrar de manera efectiva diversas
            herramientas de IA, tales como{" "}
            <strong>
              ChatGPT, Midjourney, Freepik, Nano Banana Pro, Seedance, Veo 3.1,
              Suno, Runway, Kling, Eleven Labs, y Adobe Suite
            </strong>{" "}
            en los procesos de trabajo diarios.
          </p>

          <p className="gt-presenta__rotulo">Objetivos de la formación:</p>

          <ul className="gt-objetivos">
            {OBJETIVOS.map((objetivo) => (
              <li key={objetivo}>
                <CheckCircle2 aria-hidden="true" />
                <span>{objetivo}</span>
              </li>
            ))}
          </ul>

          <p className="gt-presenta__cierre">
            El curso consiste en <strong>11 horas lectivas</strong> que se
            dividen en <strong>módulos de 2/3 horas cada uno</strong>,
            distribuidos en un periodo ajustado a la jornada laboral para
            minimizar el impacto del día a día. Cada módulo incluye una parte
            teórica seguida de ejercicios prácticos.
          </p>
        </div>
      </section>

      {/* ============ 3 · QUÉ INCLUYE ============ */}
      <section className="gt-incluye">
        <p className="gt-eyebrow">Acerca del curso</p>
        <h2 className="gt-incluye__titulo">
          ¿Qué <em>incluye</em>?
        </h2>

        <ul className="gt-modulos">
          {MODULOS.map((modulo) => {
            const Icono = ICONOS[modulo.icono];
            return (
              <li
                key={modulo.numero}
                id={`gt-modulo-${idDe(modulo.numero)}`}
                className="gt-modulo"
              >
                <span className="gt-modulo__icono" aria-hidden="true">
                  {Icono ? <Icono /> : null}
                </span>

                <p className="gt-modulo__numero">{modulo.numero}</p>
                <h3 className="gt-modulo__titulo">{modulo.titulo}</h3>
                <p className="gt-modulo__horas">{modulo.horas}</p>
                <p className="gt-modulo__texto">{modulo.texto}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ============ 4 · PRECIO ============
          La única llamada a la acción de la página. Lleva a
          contacto, que es donde se reserva de verdad. */}
      <section className="gt-precio-zona">
        <div className="gt-precio">
          <span className="gt-precio__icono" aria-hidden="true">
            <GraduationCap />
          </span>

          <div className="gt-precio__cifra">
            <p className="gt-precio__rotulo">{PRECIO.rotulo}</p>
            <p className="gt-precio__importe">{PRECIO.importe}</p>
            <p className="gt-precio__nota">{PRECIO.nota}</p>
          </div>

          <p className="gt-precio__texto">{PRECIO.texto}</p>

          <Link to="/contact" className="gt-precio__cta">
            {PRECIO.cta}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageSection>
  );
}

export default GenAiTrainingPage;
