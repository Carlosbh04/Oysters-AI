import { useState } from "react";
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

import { sendContact } from "../../services/contactService.js";
import PageSection from "../../componentes/layout/PageSection.jsx";
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

        {/* FORMULARIO */}
        <form className="contact-form" onSubmit={handleSubmit}>
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

          <Campo
            etiqueta="Teléfono"
            icono={<FaPhone />}
            type="tel"
            autoComplete="tel"
            {...propsCampo("telefono")}
          />

          <Campo
            etiqueta="Correo electrónico"
            icono={<FaEnvelope />}
            type="email"
            autoComplete="email"
            {...propsCampo("email")}
          />

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

          <button type="submit">Enviar</button>
        </form>

        {/* PIE: datos de contacto + síguenos */}
        <div className="contact-info">
          <a href="mailto:correo@empresa.com" className="contact-item">
            <FaEnvelope />
            <span>correo@empresa.com</span>
          </a>

          <a href="tel:+34600000000" className="contact-item">
            <FaPhone />
            <span>+34 600 000 000</span>
          </a>

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
