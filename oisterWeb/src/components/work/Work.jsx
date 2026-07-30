import { useState } from "react";
import "./work.css";

function Work({
    titulo,
    subtitulo,
    texto,
    imagenes,
    video,
    ias
}) {

    const [imagenActual, setImagenActual] = useState(0);


    const siguienteImagen = () => {
        setImagenActual(
            (imagenActual + 1) % imagenes.length
        );
    };


    const anteriorImagen = () => {
        setImagenActual(
            (imagenActual - 1 + imagenes.length) % imagenes.length
        );
    };


    return (

        <article className="project">

            <header className="project-header">

                <h1>{titulo}</h1>

                <h3>{subtitulo}</h3>

            </header>


            <section className="project-content">

                <p>
                    {texto}
                </p>


                {/* CARRUSEL DE IMAGENES */}
                <div className="carousel">

                    <button
                        onClick={anteriorImagen}
                    >
                        ❮
                    </button>


                    <img
                        src={imagenes[imagenActual]}
                        alt={titulo}
                    />


                    <button
                        onClick={siguienteImagen}
                    >
                        ❯
                    </button>


                </div>


                {/* VIDEO */}

                {
                    video &&
                    <div className="project-video">

                        <video controls>

                            <source
                                src={video}
                                type="video/mp4"
                            />

                            Tu navegador no soporta vídeos.

                        </video>

                    </div>
                }



                {/* IA UTILIZADAS */}

                <div className="ia-section">

                    <h3>
                        Inteligencias artificiales utilizadas
                    </h3>


                    <ul>

                        {
                            ias.map((ia, index) => (
                                <li key={index}>
                                    {ia}
                                </li>
                            ))
                        }

                    </ul>

                </div>


            </section>


        </article>

    );

}


export default Work;