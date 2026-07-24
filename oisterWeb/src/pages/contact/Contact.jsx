import { useState } from "react";
import "./Contact.css";
import {
    FaInstagram,
    FaLinkedin,
    FaYoutube,
    FaEnvelope,
    FaPhone,
} from "react-icons/fa";

import { sendContact } from "../../services/contactService.js";

function ContactSection() {

    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        telefono: "",
        email: "",
        comentarios: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
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
                    comentarios: ""
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
        <section className="contact">

            <div className="contact-info">

                <h2>Contacto</h2>

                <p className="contact-text">
                    ¡Acompáñanos y descubramos juntos el potencial de la inteligencia artificial!
                </p>

                <p className="contact-text">
                    Por favor, proporciónanos información sobre cómo podemos ayudarte y
                    nos pondremos en contacto contigo en breve.
                </p>

                <div className="contact-item">
                    <FaEnvelope />
                    <span>correo@empresa.com</span>
                </div>

                <div className="contact-item">
                    <FaPhone />
                    <span>+34 600 000 000</span>
                </div>

                <div className="social-buttons">

                    <a href="https://instagram.com" target="_blank" rel="noreferrer">
                        <FaInstagram />
                    </a>

                    <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                        <FaLinkedin />
                    </a>

                    <a href="https://youtube.com" target="_blank" rel="noreferrer">
                        <FaYoutube />
                    </a>

                </div>

            </div>

            <form className="contact-form" onSubmit={handleSubmit}>

                <div className="input-group">
                    <label>Nombre *</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Apellidos *</label>
                    <input
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Teléfono *</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group">
                    <label>Comentarios *</label>
                    <textarea
                        rows="6"
                        name="comentarios"
                        value={formData.comentarios}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit">
                    Enviar
                </button>

            </form>

        </section>
    );
}

export default ContactSection;