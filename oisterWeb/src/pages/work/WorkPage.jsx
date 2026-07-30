import WorkList from "../../componentes/work/WorkList";
import PageSection from "../../componentes/layout/PageSection";
import trabajos from "../../data/trabajos";

function WorksPage() {
    return (
        <PageSection center={false}>
            <WorkList trabajos={trabajos} />
        </PageSection>
    );
}

export default WorksPage;