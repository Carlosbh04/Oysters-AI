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

function ContactSection({ introDone = true }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    telefono: "",
    email: "",
    comentarios: "",
  });

  const [focused, setFocused] = useState({
    nombre: false,
    apellidos: false,
    telefono: false,
    email: false,
    comentarios: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
          <div
            className={`input-group ${
              focused.nombre || formData.nombre ? "active" : ""
            }`}
          >
            <span className="input-group__icon">
              <FaUser />
            </span>

            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onFocus={() => setFocused((prev) => ({ ...prev, nombre: true }))}
              onBlur={() => setFocused((prev) => ({ ...prev, nombre: false }))}
              autoComplete="given-name"
              required
            />

            <label htmlFor="nombre">
              Nombre <span>*</span>
            </label>
          </div>

          <div
            className={`input-group ${
              focused.apellidos || formData.apellidos ? "active" : ""
            }`}
          >
            <span className="input-group__icon">
              <FaUserFriends />
            </span>

            <input
              id="apellidos"
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              onFocus={() =>
                setFocused((prev) => ({
                  ...prev,
                  apellidos: true,
                }))
              }
              onBlur={() =>
                setFocused((prev) => ({
                  ...prev,
                  apellidos: false,
                }))
              }
              autoComplete="family-name"
              required
            />

            <label htmlFor="apellidos">
              Apellidos <span>*</span>
            </label>
          </div>

          <div
            className={`input-group ${
              focused.telefono || formData.telefono ? "active" : ""
            }`}
          >
            <span className="input-group__icon">
              <FaPhone />
            </span>

            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onFocus={() =>
                setFocused((prev) => ({
                  ...prev,
                  telefono: true,
                }))
              }
              onBlur={() =>
                setFocused((prev) => ({
                  ...prev,
                  telefono: false,
                }))
              }
              autoComplete="tel"
              required
            />

            <label htmlFor="telefono">
              Teléfono <span>*</span>
            </label>
          </div>

          <div
            className={`input-group ${
              focused.email || formData.email ? "active" : ""
            }`}
          >
            <span className="input-group__icon">
              <FaEnvelope />
            </span>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocused((prev) => ({ ...prev, email: true }))}
              onBlur={() => setFocused((prev) => ({ ...prev, email: false }))}
              autoComplete="email"
              required
            />

            <label htmlFor="email">
              Correo electrónico <span>*</span>
            </label>
          </div>

          <div
            className={`input-group ${
              focused.comentarios || formData.comentarios ? "active" : ""
            }`}
          >
            <span className="input-group__icon">
              <FaCommentDots />
            </span>

            <textarea
              id="comentarios"
              name="comentarios"
              value={formData.comentarios}
              onChange={handleChange}
              onFocus={() =>
                setFocused((prev) => ({
                  ...prev,
                  comentarios: true,
                }))
              }
              onBlur={() =>
                setFocused((prev) => ({
                  ...prev,
                  comentarios: false,
                }))
              }
              rows={6}
              maxLength={TOPE_MENSAJE}
              required
            />

            <label htmlFor="comentarios">
              Cuéntanos tu proyecto <span>*</span>
            </label>

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
          </div>

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
