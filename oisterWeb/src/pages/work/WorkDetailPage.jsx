import { useParams } from "react-router-dom";
import WorkDetail from "../../componentes/work/detalle/WorkDetail";
import PageSection from "../../componentes/layout/PageSection";
import trabajos from "../../data/trabajos";
import HeroBackground from "../../componentes/heroBackground/HeroBackground";
import "./WorkDetailPage.css";

/* El skeleton del detalle lo muestra App.jsx mientras
   carga el chunk (WorkDetailSkeleton de skeleton/work),
   así que aquí ya no hay estado de carga propio. */

/* ---- EL FONDO VA EN UNA CAJA FIJA ----
   Antes aquí iba Cosmic Data Flow, que se posiciona solo con
   `position: fixed`. La escena del hero es `absolute` porque está
   pensada para llenar su sección, así que necesita esta caja que
   la ancle al viewport y la deje quieta mientras la página rueda.

   Cosmic Data Flow SIGUE en el proyecto y sigue viva en su ruta de
   laboratorio (/cosmic): aquí solo se ha dejado de usar. */
function Fondo() {
  return (
    <div className="work-detail__fondo" aria-hidden="true">
      <HeroBackground />
    </div>
  );
}

function WorkDetailPage() {

    const { id } = useParams();

    /* Aquí el stash traía un estado `cargando` con un temporizador
       de carga mínima. Se resolvió quitándolo, y no por preferencia:
       ese bloque usaba useState, useEffect y CARGA_MINIMA, y
       ninguno de los tres se importa ni se declara en este
       archivo — no compilaba. Además `cargando` se escribía y no
       se leía en ningún sitio. El skeleton de esta ruta lo maneja
       App.jsx. */
    const trabajo = trabajos.find(
        trabajo => trabajo.id === Number(id)
    );

    /* ======= No encontrado ======= */

    if (!trabajo) {
        return (
            <>
                <Fondo />
                <PageSection className="work-detail">
                    <h1>Proyecto no encontrado</h1>
                </PageSection>
            </>
        );
    }


    /* ======= Detalle ======= */

    return (
        /* El fondo va FUERA de PageSection: esa sección lleva
           `overflow-x: clip`, y aunque un `position: fixed` no
           debería verse afectado, basta con que algún día alguien
           le ponga un transform o un filter para que pase a ser su
           bloque contenedor y el fondo se recorte. */
        <>
            <Fondo />
            <PageSection center={false} className="work-detail">
                <WorkDetail {...trabajo} />
            </PageSection>
        </>
    );
}

export default WorkDetailPage;