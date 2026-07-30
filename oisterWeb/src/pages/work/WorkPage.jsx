import WorkList from "../../components/work/WorkList";
import trabajos from "../../data/trabajos";

function WorksPage() {
    return (
        <WorkList trabajos={trabajos} />
    );
}

export default WorksPage;