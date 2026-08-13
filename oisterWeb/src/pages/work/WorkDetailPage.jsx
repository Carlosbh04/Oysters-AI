import { useParams } from "react-router-dom";
import WorkDetail from "../../componentes/work/detalle/WorkDetail";
import PageSection from "../../componentes/layout/PageSection";
import trabajos from "../../data/trabajos";
import PrismCloud from "../../componentes/prismCloud/PrismCloud";
import "./WorkDetailPage.css";

/* El skeleton del detalle lo muestra App.jsx mientras
   carga el chunk (WorkDetailSkeleton de skeleton/work),
   así que aquí ya no hay estado de carga propio. */

/* ---- CUÁNTA LUZ LLEVA LA NUBE AQUÍ ----
   Muy por debajo del 1 con que se ve en su banco de pruebas, y
   a propósito: aquí la nube NO es el protagonista. Detrás van
   fotos de campaña, vídeos y caras, y sobre un fondo a plena luz
   competían con él — el ojo no sabía dónde mirar.

   Pero tampoco muy por debajo: el fondo tiene que seguir siendo
   EL DEL HOME, y a plena luz el home mide un 47% de luminosidad
   en sus zonas despejadas. Se probó a 0.38 y era un error: el
   morado se iba a casi negro, las nubes apenas se intuían y la
   página dejaba de parecerse al resto del sitio.

   0.85 es el punto medio medido: mantiene el brillo y el color
   del home y solo baja lo justo para no competir con las fotos
   del proyecto. El shader oscurece con una curva que hunde las
   sombras más que las luces (ver uLuz en PrismCloud.jsx), así que
   la nube conserva su volumen en vez de aplanarse en un gris. */
const LUZ_DEL_FONDO = 0.85;

/* ---- EL FONDO VA EN UNA CAJA FIJA ----
   Anclado al viewport para que la nube se quede quieta mientras
   la página rueda por encima: si viajara con el contenido, su
   reacción al scroll y el desplazamiento de la página se
   cancelarían y no se notaría ninguna de las dos.

   El color de la caja NO es decorativo: el canvas está en blanco
   hasta que compila el shader y pinta su primer fotograma, y sin
   este fondo se colaría el morado del body a pantalla completa
   durante ese instante. Es el mismo color con el que arranca la
   nube, así que el relevo es invisible. */
function Fondo() {
  return (
    <div className="work-detail__fondo" aria-hidden="true">
      <PrismCloud luz={LUZ_DEL_FONDO} />
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