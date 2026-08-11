import WorkList from "../../componentes/work/WorkList";
import PageSection from "../../componentes/layout/PageSection";
import RedNeuronal from "../../componentes/redNeuronal/RedNeuronal";
import trabajos from "../../data/trabajos";

function WorksPage() {
    return (
        <>
            {/* Fondo vivo: red de nodos que reacciona al ratón.
                Va FUERA del PageSection porque es de página entera
                (el lienzo es fixed), no de la sección. */}
            <RedNeuronal />

            <PageSection center={false}>
                <WorkList trabajos={trabajos} />
            </PageSection>
        </>
    );
}

export default WorksPage;