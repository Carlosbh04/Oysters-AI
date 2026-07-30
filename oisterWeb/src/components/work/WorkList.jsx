import WorkCard from "./WorkCard";
import "./WorkList.css";

function WorkList({ trabajos }) {

    return (

        <section className="work-list">

            {
                trabajos.map((trabajo) => (

                    <WorkCard

                        key={trabajo.id}

                        id={trabajo.id}

                        titulo={trabajo.titulo}

                        subtitulo={trabajo.subtitulo}

                        imagen={trabajo.imagenes[0]}

                    />

                ))
            }

        </section>

    );

}

export default WorkList;