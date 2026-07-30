import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Users, Heart, Sparkles } from "lucide-react";
import WorkCard from "./WorkCard";
import "./WorkList.css";

/* Métricas de la barra: edita aquí valores e iconos.
   Los iconos son componentes de lucide-react:
   https://lucide.dev/icons — importa el que quieras arriba
   y cámbialo aquí. */
const metricas = [
    { Icono: Trophy, valor: "+120", etiqueta: "Proyectos exitosos" },
    { Icono: TrendingUp, valor: "35%", etiqueta: "Promedio de mejora" },
    { Icono: Users, valor: "+2M", etiqueta: "Personas alcanzadas" },
    { Icono: Heart, valor: "98%", etiqueta: "Clientes satisfechos" },
];

function WorkList({ trabajos }) {
    return (
        <section className="work-list">

            {/* Decoración ambiental: sparkles flotando.
                Los orbes difuminados van por CSS (::before/::after) */}
            <span className="work-deco work-deco-1" aria-hidden="true">✦</span>
            <span className="work-deco work-deco-2" aria-hidden="true">✦</span>
            <span className="work-deco work-deco-3" aria-hidden="true">✦</span>
            <span className="work-deco work-deco-4" aria-hidden="true">✦</span>


            {/* Cabecera */}
            <header className="work-list-head">

                <p className="work-list-badge">
                    <Sparkles size={13} strokeWidth={2.4} aria-hidden="true" />
                    Agencia IA
                </p>

                <h1 className="work-list-title">
                    Trabajos
                    <span className="work-list-title-glow" aria-hidden="true"></span>
                </h1>

                <p className="work-list-subtitle">
                    Una selección de proyectos donde la IA hace el trabajo pesado.
                </p>

            </header>


            {/* Barra de métricas */}
            <div className="work-list-stats">

                {
                    metricas.map(({ Icono, valor, etiqueta }, index) => (
                        <div key={index} className="work-list-stat">

                            <span className="work-list-stat-icon" aria-hidden="true">
                                <Icono size={20} strokeWidth={2.2} />
                            </span>

                            <div className="work-list-stat-info">

                                <span className="work-list-stat-value">
                                    {valor}
                                </span>

                                <span className="work-list-stat-label">
                                    {etiqueta}
                                </span>

                            </div>

                        </div>
                    ))
                }

            </div>


            {/* Grid de tarjetas */}
            <div className="work-list-grid">

                {
                    trabajos.map((trabajo) => (

                        <WorkCard

                            key={trabajo.id}

                            id={trabajo.id}

                            titulo={trabajo.titulo}

                            subtitulo={trabajo.subtitulo}

                            categoria={trabajo.categoria}

                            imagen={trabajo.imagenes[0]}

                        />

                    ))
                }

            </div>


            {/* Banda CTA */}
            <div className="work-list-cta">

                <span className="work-list-cta-icon" aria-hidden="true">
                    <Sparkles size={24} strokeWidth={2} />
                </span>

                <div className="work-list-cta-text">

                    <h2>¿Tienes un proyecto en mente?</h2>

                    <p>
                        Hablemos de cómo la IA puede llevar tu negocio
                        al siguiente nivel.
                    </p>

                </div>

                <Link to="/contact" className="work-list-cta-button">
                    Hablemos <span aria-hidden="true">→</span>
                </Link>

            </div>

        </section>
    );
}

export default WorkList;