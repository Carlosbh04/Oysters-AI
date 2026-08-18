import { useParams } from "react-router-dom";
import WorkDetail from "../../componentes/work/detalle/WorkDetail";
import PageSection from "../../componentes/layout/PageSection";
import trabajos from "../../data/trabajos";
import PrismCloud from "../../componentes/prismCloud/PrismCloud";
import useMediaQuery from "../../hooks/useMediaQuery";
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

/* ---- EN LA MANO LA NUBE VA A PLENA LUZ ----
   El 0.85 de arriba se eligió para que la nube no compitiera con
   las fotos y el texto del proyecto, porque estaba DETRÁS DE TODO.
   Aquí ya no: se queda en la cabecera y debajo de ella solo hay el
   nombre del cliente y la portada. Sin nada que estorbar no hay
   motivo para atenuarla — y atenuada se veía igual que el fondo de
   escritorio, que era justo lo que había que evitar.

   1 es el valor con el que la nube se ve en su banco de pruebas
   (ver PrismCloud.jsx). */
const LUZ_EN_LA_MANO = 1;

/* mismo corte que el resto de la mano en el proyecto */
const CORTE_MANO = "(max-width: 1079px)";

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
/* ---- DOS CAPAS, Y LA SEGUNDA NO SIEMPRE OCUPA LO MISMO ----
   La BASE es el color plano y va fija a la ventana: tapa el
   instante en que el canvas aún no ha pintado —que era el papel
   que hacía antes el color de la propia caja de la nube— y, en la
   mano, es además el fondo sobre el que se lee todo el cuerpo del
   proyecto.

   La NUBE va encima. En escritorio ocupa la ventana entera y se
   queda quieta mientras la página rueda, como hasta ahora. En la
   mano se queda SOLO en la cabecera y se marcha con el scroll
   (ver el bloque de la mano en el CSS).

   ---- POR QUÉ SE SEPARAN ----
   Antes eran una sola caja fija que hacía las dos cosas. Para que
   la nube pueda irse con la página tiene que dejar de ser fija, y
   en cuanto deja de serlo ya no puede cubrir el resto — hace falta
   alguien debajo que sí lo haga. */
function Fondo() {
  const esMano = useMediaQuery(CORTE_MANO);

  return (
    <>
      <div className="work-detail__base" aria-hidden="true" />

      <div className="work-detail__fondo" aria-hidden="true">
        <PrismCloud luz={esMano ? LUZ_EN_LA_MANO : LUZ_DEL_FONDO} />
      </div>
    </>
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