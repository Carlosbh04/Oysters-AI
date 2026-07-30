import { useParams } from "react-router-dom";
import Work from "../../components/work/Work";
import trabajos from "../../data/trabajos";

function WorkDetailPage() {

    const { id } = useParams();

    const trabajo = trabajos.find(
        trabajo => trabajo.id === Number(id)
    );

    if (!trabajo) {
        return <h1>Proyecto no encontrado</h1>;
    }

    return <Work {...trabajo} />;
}

export default WorkDetailPage;