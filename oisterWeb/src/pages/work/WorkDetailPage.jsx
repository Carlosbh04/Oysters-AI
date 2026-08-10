import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Work from "../../componentes/work/Work";
import PageSection from "../../componentes/layout/PageSection";
import trabajos from "../../data/trabajos";
import "./WorkDetailPage.css";

/* Tiempo MÍNIMO que se muestra el skeleton (ms).
   Evita el parpadeo feo cuando los datos llegan al
   instante. Si en el futuro los datos tardan más,
   el skeleton simplemente sigue hasta que lleguen. */
const CARGA_MINIMA = 600;

function WorkDetailPage() {

    const { id } = useParams();

    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        /* cada vez que cambia el id, se relanza la carga */
        // eslint-disable-next-line
        setCargando(true);

        const temporizador = setTimeout(() => {
            setCargando(false);
        }, CARGA_MINIMA);

        /* limpieza si el usuario navega antes de tiempo */
        return () => clearTimeout(temporizador);
    }, [id]);


    const trabajo = trabajos.find(
        trabajo => trabajo.id === Number(id)
    );


    /* ======= Cargando: skeleton del proyecto ======= */

    if (cargando) {
        return (
            <PageSection center={false} className="work-detail">
                <div
                    className="work-skeleton"
                    role="status"
                    aria-live="polite"
                    aria-label="Cargando proyecto"
                >

                    {/* volver */}
                    <span className="skeleton skeleton-back"></span>

                    {/* cabecera */}
                    <div className="work-skeleton-head">
                        <span className="skeleton skeleton-title"></span>
                        <span className="skeleton skeleton-subtitle"></span>
                    </div>

                    {/* párrafo */}
                    <div className="work-skeleton-text">
                        <span className="skeleton skeleton-line"></span>
                        <span className="skeleton skeleton-line"></span>
                        <span className="skeleton skeleton-line skeleton-line-short"></span>
                    </div>

                    {/* imagen del carrusel */}
                    <span className="skeleton skeleton-image"></span>

                    {/* dots del carrusel */}
                    <div className="work-skeleton-dots">
                        <span className="skeleton skeleton-dot skeleton-dot-active"></span>
                        <span className="skeleton skeleton-dot"></span>
                    </div>

                    {/* video */}
                    <span className="skeleton skeleton-video"></span>

                    {/* chips de IAs */}
                    <div className="work-skeleton-chips">
                        <span className="skeleton skeleton-chips-label"></span>
                        <div className="work-skeleton-chips-row">
                            <span className="skeleton skeleton-chip"></span>
                            <span className="skeleton skeleton-chip"></span>
                            <span className="skeleton skeleton-chip"></span>
                        </div>
                    </div>

                </div>
            </PageSection>
        );
    }


    /* ======= No encontrado ======= */

    if (!trabajo) {
        return (
            <PageSection className="work-detail">
                <h1>Proyecto no encontrado</h1>
            </PageSection>
        );
    }


    /* ======= Detalle ======= */

    return (
        <PageSection center={false} className="work-detail">
            <Work {...trabajo} />
        </PageSection>
    );
}

export default WorkDetailPage;