import { useEffect, useRef, useState } from "react";
import "./Contact.css";
import {
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaUserFriends,
  FaCommentDots,
} from "react-icons/fa";

import { PiSparkleFill } from "react-icons/pi";

/* Tope del mensaje. El contador de debajo lo lee de aquí, así que
   cambiar este número cambia las dos cosas a la vez y no pueden
   discrepar. `maxLength` en el <textarea> es lo que de verdad
   impide pasarse; el contador solo lo cuenta. */
const TOPE_MENSAJE = 500;

/* ============================================================
   UNA PREGUNTA POR PANTALLA (SOLO EN LA MANO)

   El formulario mide 564px con sus cinco campos, así que en un
   móvil no cabe entero: se rellena a ciegas, desplazando, y el
   botón de enviar hay que ir a buscarlo. Partido en preguntas,
   cada pantalla pide UNA cosa, el teclado no tapa nada y siempre
   se ve qué falta.

   ---- UNA PREGUNTA, NO UN CAMPO ----
   Los pasos no son cinco (uno por campo) sino cuatro: «¿cómo te
   llamas?» se lleva nombre y apellidos juntos, porque son la
   misma pregunta y separarlos daría una pantalla entera para
   pedir un apellido. La regla es una pregunta por pantalla, no un
   control por pantalla.

   ---- Y EN ESCRITORIO NO SE MONTA ----
   Allí los cinco campos se ven de una vez en una columna ancha:
   partirlos sería añadir tres toques para resolver un problema
   que no existe. Es el mismo criterio que el índice del temario o
   el lector del blog — dos árboles, no uno con otro CSS.
   ============================================================ */
const PASOS = [
  { pregunta: "¿Cómo te llamas?", campos: ["nombre", "apellidos"] },
  { pregunta: "¿A qué correo te respondemos?", campos: ["email"] },
  { pregunta: "¿Y un teléfono?", campos: ["telefono"] },
  { pregunta: "¿De qué quieres hablar?", campos: ["comentarios"] },
];

import { sendContact } from "../../services/contactService.js";
import PageSection from "../../componentes/layout/PageSection.jsx";
import useMediaQuery from "../../hooks/useMediaQuery.js";
import EscenaSynthwave from "../../componentes/escenaSynthwave/EscenaSynthwave.jsx";
import Escaneo from "../../componentes/escaneo/Escaneo.jsx";

/* ---- UN CAMPO DEL FORMULARIO ----
   Los cinco campos eran el mismo bloque copiado (icono + control +
   label flotante + clase `active`); aquí vive una sola vez. Local
   al archivo a propósito: es el único formulario del sitio — si
   algún día aparece otro, será el momento de promocionarlo.

   A nivel de módulo y NO dentro de ContactSection: un componente
   definido dentro del render sería un tipo nuevo en cada tecleo y
   React remontaría el campo, perdiendo el foco. */
function Campo({
  name,
  etiqueta,
  icono,
  valor,
  activo,
  type = "text",
  autoComplete,
  multilinea = false,
  rows,
  maxLength,
  children,
  ...handlers
}) {
  const comunes = { id: name, name, value: valor, required: true, ...handlers };

  return (
    <div className={`input-group ${activo ? "active" : ""}`}>
      <span className="input-group__icon">{icono}</span>

      {multilinea ? (
        <textarea {...comunes} rows={rows} maxLength={maxLength} />
      ) : (
        <input {...comunes} type={type} autoComplete={autoComplete} />
      )}

      <label htmlFor={name}>
        {etiqueta} <span>*</span>
      </label>

      {children}
    </div>
  );
}

function ContactSection({ introDone = true }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    telefono: "",
    email: "",
    comentarios: "",
  });

  /* solo un campo puede tener el foco a la vez: basta con saber
     cuál (antes eran cinco booleanos, uno por campo) */
  const [campoActivo, setCampoActivo] = useState(null);

  /* ---- LOS CANALES DIRECTOS, EN UN DESPLEGABLE ----
     Correo y teléfono estaban como dos lengüetas fijas a media
     altura del borde derecho. Pasan a UN solo botón abajo a la
     izquierda que los despliega hacia arriba.

     ---- POR QUÉ A LA IZQUIERDA ----
     Porque la esquina de abajo a la derecha ya está ocupada: allí
     vive la perla de volver arriba (medido en /contact con la
     página bajada: 18px del borde derecho, 22 del inferior, 44 de
     lado). Dos botones flotantes redondos en la misma esquina se
     tocarían el uno al otro. Repartidos, cada esquina tiene un
     trabajo: izquierda para hablar, derecha para volver.

     El estado vive aquí y no en el CSS porque hay que poder
     cerrarlo con Escape y sacar los canales del orden de
     tabulación mientras están guardados. */
  const [canalesAbiertos, setCanalesAbiertos] = useState(false);

  useEffect(() => {
    if (!canalesAbiertos) return undefined;

    const alPulsarTecla = (e) => {
      if (e.key === "Escape") setCanalesAbiertos(false);
    };

    window.addEventListener("keydown", alPulsarTecla);
    return () => window.removeEventListener("keydown", alPulsarTecla);
  }, [canalesAbiertos]);

  /* ---- EL RECORRIDO POR PREGUNTAS ---- */
  const esMano = useMediaQuery("(max-width: 1079px)");
  const [paso, setPaso] = useState(0);
  const formRef = useRef(null);

  /* Al cambiar de pregunta, el foco va al primer campo de la
     nueva. No es un adorno: sin esto hay que tocar el campo a
     mano en cada paso —cuatro toques de más— y quien navega con
     teclado o lector de pantalla se queda en el botón que acaba
     de pulsar, sin enterarse de que la pregunta ha cambiado. */
  useEffect(() => {
    if (!esMano) return;

    const form = formRef.current;
    if (!form) return;

    const primero = PASOS[paso].campos[0];
    const control = form.elements[primero];

    /* en el primer render no se roba el foco: la página acaba de
       abrirse y abrir el teclado sin que nadie lo haya pedido es
       de las cosas que más molestan en un móvil */
    if (paso > 0) control?.focus();
  }, [paso, esMano]);

  /* ---- NO SE AVANZA CON LA PREGUNTA A MEDIAS ----
     Se validan SOLO los campos de la pregunta visible, y con la
     validación del navegador: así el aviso sale en el idioma del
     sistema y con el formato que esa persona ya conoce, en vez de
     uno inventado aquí.

     Tiene que ser campo a campo y no `form.reportValidity()`,
     porque eso validaría también los de las preguntas ocultas —y
     un control invisible NO se puede enfocar, así que el
     navegador se planta y no avisa de nada. Ese es exactamente el
     fallo silencioso que se explica abajo, en el envío. */
  const siguiente = () => {
    const form = formRef.current;

    for (const nombre of PASOS[paso].campos) {
      const control = form.elements[nombre];
      if (control && !control.reportValidity()) return;
    }

    setPaso((n) => Math.min(n + 1, PASOS.length - 1));
  };

  const atras = () => setPaso((n) => Math.max(n - 1, 0));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* el cableado común de cada campo: su valor, si está "activo"
     (con foco o con contenido — es lo que sube el label) y los
     handlers de foco */
  const propsCampo = (name) => ({
    name,
    valor: formData[name],
    activo: campoActivo === name || formData[name] !== "",
    onChange: handleChange,
    onFocus: () => setCampoActivo(name),
    onBlur: () => setCampoActivo(null),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* ---- SI ALGO QUEDÓ INVÁLIDO, VOLVER A SU PREGUNTA ----
       No debería pasar —cada paso se valida antes de dejar
       avanzar— pero si pasara, el fallo sería MUDO y de los
       peores: el navegador se niega a enviar por un campo que no
       puede enfocar (está en una pregunta oculta), no enseña
       ningún aviso, y desde fuera parece que el botón no hace
       nada. Aquí se busca el primer campo inválido, se salta a su
       pregunta y se avisa allí, donde sí se ve. */
    if (esMano) {
      const form = formRef.current;

      for (let i = 0; i < PASOS.length; i++) {
        for (const nombre of PASOS[i].campos) {
          const control = form.elements[nombre];

          if (control && !control.checkValidity()) {
            setPaso(i);
            /* tras pintar la pregunta: un control oculto no puede
               recibir el aviso */
            requestAnimationFrame(() => control.reportValidity());
            return;
          }
        }
      }
    }

    try {
      const data = await sendContact(formData);

      if (data.success) {
        alert("Mensaje enviado correctamente.");
        setFormData({
          nombre: "",
          apellidos: "",
          telefono: "",
          email: "",
          comentarios: "",
        });
      } else {
        alert("Ha ocurrido un error.");
      }
    } catch (error) {
      console.error(error);
      alert("No se ha podido conectar con el servidor.");
    }
  };

  return (
    <PageSection className="contact-page">
      {/* paisaje synthwave de fondo */}
      <EscenaSynthwave />

      {/* líneas holográficas que lo cruzan */}
      <Escaneo />

      <div className={`contact ${introDone ? "contact--enter" : ""}`}>
        {/* CABECERA: eyebrow + titular + intro */}
        <div className="contact-header">
          <h2>Hablemos</h2>

          <p className="contact-text">
            ¡Acompáñanos y descubramos juntos el potencial de la inteligencia
            artificial!
          </p>

          <p className="contact-text">
            Por favor, proporciónanos información sobre cómo podemos ayudarte y
            nos pondremos en contacto contigo en breve.
          </p>
        </div>

        {/* FORMULARIO
            En la mano se recorre por preguntas (ver PASOS arriba).
            Los cinco campos siguen MONTADOS siempre —solo se
            oculta con CSS la pregunta que no toca— por dos
            razones: el estado de React no se pierde al ir y
            venir, y el envío nativo del navegador sigue viendo el
            formulario entero. Desmontarlos habría obligado a
            reconstruir las dos cosas a mano. */}
        <form
          ref={formRef}
          className={`contact-form${esMano ? " contact-form--preguntas" : ""}`}
          data-paso={esMano ? paso : undefined}
          onSubmit={handleSubmit}
        >
          {esMano && (
            <div className="cf-guia">
              <div className="cf-puntos" aria-hidden="true">
                {PASOS.map((p, i) => (
                  <i key={p.pregunta} data-hecho={i <= paso || undefined} />
                ))}
              </div>

              {/* el rótulo lo lee un lector de pantalla al cambiar
                  de paso; los puntos de arriba solo lo dicen a
                  quien ve */}
              <p className="cf-cuenta" aria-live="polite">
                Pregunta {paso + 1} de {PASOS.length}
              </p>
            </div>
          )}

          <div className="cf-paso" data-paso="0">
            {esMano && <p className="cf-pregunta">{PASOS[0].pregunta}</p>}

            <Campo
            etiqueta="Nombre"
            icono={<FaUser />}
            autoComplete="given-name"
            {...propsCampo("nombre")}
          />

            <Campo
              etiqueta="Apellidos"
              icono={<FaUserFriends />}
              autoComplete="family-name"
              {...propsCampo("apellidos")}
            />
          </div>

          <div className="cf-paso" data-paso="1">
            {esMano && <p className="cf-pregunta">{PASOS[1].pregunta}</p>}

            <Campo
              etiqueta="Correo electrónico"
              icono={<FaEnvelope />}
              type="email"
              autoComplete="email"
              {...propsCampo("email")}
            />
          </div>

          <div className="cf-paso" data-paso="2">
            {esMano && <p className="cf-pregunta">{PASOS[2].pregunta}</p>}

            <Campo
              etiqueta="Teléfono"
              icono={<FaPhone />}
              type="tel"
              autoComplete="tel"
              {...propsCampo("telefono")}
            />
          </div>

          <div className="cf-paso" data-paso="3">
            {esMano && <p className="cf-pregunta">{PASOS[3].pregunta}</p>}

            <Campo
              etiqueta="Cuéntanos tu proyecto"
              icono={<FaCommentDots />}
              multilinea
              rows={6}
              maxLength={TOPE_MENSAJE}
              {...propsCampo("comentarios")}
            >
            {/* Contador. `aria-live="polite"` para que un lector de
                pantalla avise al acercarse al tope en vez de dejar
                que el campo deje de aceptar letras sin explicación,
                pero SIN interrumpir en cada tecla. */}
              <span
                className={`input-group__contador ${
                  formData.comentarios.length >= TOPE_MENSAJE * 0.9
                    ? "input-group__contador--cerca"
                    : ""
                }`}
                aria-live="polite"
              >
                {formData.comentarios.length} / {TOPE_MENSAJE}
              </span>
            </Campo>
          </div>

          {/* ---- LOS BOTONES ----
              «Siguiente» es `type="button"`: si fuera submit, el
              navegador intentaría enviar el formulario en cada
              pregunta. Y «Enviar» solo se monta en la última, para
              que no se pueda mandar a medias. */}
          <div className="cf-mando">
            {esMano && paso > 0 && (
              <button type="button" className="cf-atras" onClick={atras}>
                Atrás
              </button>
            )}

            {esMano && paso < PASOS.length - 1 ? (
              <button type="button" onClick={siguiente}>
                Siguiente
              </button>
            ) : (
              <button type="submit">Enviar</button>
            )}
          </div>
        </form>

        {/* PIE: datos de contacto + síguenos */}
        <div className="contact-info" data-abierto={canalesAbiertos || undefined}>
          {/* ---- EL DISPARADOR, SOLO EN LA MANO ----
              En escritorio no se monta: allí correo y teléfono son
              dos filas legibles dentro del flujo y no hay nada que
              desplegar. */}
          {esMano && (
            <button
              type="button"
              className="contact-fab"
              aria-expanded={canalesAbiertos}
              aria-controls="contact-canales"
              aria-label={
                canalesAbiertos
                  ? "Cerrar formas de contacto"
                  : "Abrir formas de contacto"
              }
              onClick={() => setCanalesAbiertos((abierto) => !abierto)}
            >
              {/* la cruz gira 45° al abrir y se convierte en aspa:
                  una sola forma para los dos estados */}
              <span className="contact-fab__cruz" aria-hidden="true" />
            </button>
          )}

          {/* ---- Y LOS CANALES ----
              `inert` mientras están guardados: `opacity: 0` los
              esconde a la vista pero NO al tabulador, y se podía
              llegar a ciegas a un enlace que no está en pantalla.
              Es el mismo recurso que usa el lector del blog. */}
          <div
            className="contact-canales"
            id="contact-canales"
            /* booleano y no cadena vacía: con `inert=""` React no
               pone el atributo y los enlaces guardados seguían
               siendo alcanzables con el tabulador — comprobado
               sobre la página, el atributo no llegaba al DOM */
            inert={esMano && !canalesAbiertos}
          >
            <a href="mailto:correo@empresa.com" className="contact-item">
              <FaEnvelope />
              <span>correo@empresa.com</span>
            </a>

            <a href="tel:+34600000000" className="contact-item">
              <FaPhone />
              <span>+34 600 000 000</span>
            </a>
          </div>

          <div className="contact-divider">
            <span className="divider-line"></span>

            <div className="divider-icon">
              <PiSparkleFill />
            </div>

            <span className="divider-line"></span>
          </div>

          <div className="social-section">
            <p className="social-title">Síguenos</p>

            <div className="social-buttons">
              <a
                href="https://www.instagram.com/oysters_studio/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.linkedin.com/company/oysters-studio/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://www.youtube.com/@Oysters2024"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  );
}

export default ContactSection;
