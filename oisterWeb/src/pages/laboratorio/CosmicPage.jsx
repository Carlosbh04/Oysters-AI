import PageSection from "../../componentes/layout/PageSection.jsx";
import CosmicDataFlow from "../../componentes/cosmicDataFlow/CosmicDataFlow.jsx";
import "./CosmicPage.css";

/* ============================================================
   PÁGINA DE PRUEBA del fondo Cosmic Data Flow

   Solo existe para poder ver el componente a pantalla completa
   y comprobar dos cosas que no se pueden juzgar en aislado:
   que el contenido encima se lee, y que el hueco oscuro de la
   izquierda sigue siendo un hueco.

   El texto va a la IZQUIERDA a propósito. La composición
   reserva ahí la zona muerta (ni cintas, ni retícula, ni
   constelaciones) precisamente para esto; si el texto fuese
   centrado caería sobre el punto focal y no se leería.

   ---- POR QUÉ EL FONDO VA FUERA DE PageSection ----
   PageSection lleva `overflow-x: clip`. Un `position: fixed` se
   posiciona respecto a la ventana y no debería verse afectado,
   pero basta con que algún día alguien le ponga un transform o
   un filter a ese contenedor para que pase a ser el bloque
   contenedor del fixed y el fondo se recorte. Colgándolo fuera,
   esa clase de sorpresa no puede darse.
   ============================================================ */

const CAPAS = [
  ["01", "Nebulosa", "cuatro degradados radiales en CSS, compuestos una vez"],
  ["02", "Retícula", "puntos de 1px cada 16, rasterizados y cacheados"],
  ["03", "Estrellas", "tres tamaños, parpadeo independiente y deriva"],
  ["04", "Cintas", "tres tramos, 194 curvas Bézier; la magenta desaparece y vuelve"],
  ["05", "Constelaciones", "nodos unidos solo cuando están cerca"],
  ["06", "Icosaedro", "12 vértices y 30 aristas, proyectados a mano"],
  ["07", "Planeta", "el único cuerpo opaco, con anillos orbitales"],
  ["08", "Bloom y grano", "post-proceso a un cuarto de resolución"],
];

function CosmicPage() {
  return (
    <>
      <CosmicDataFlow />

      {/* center={false}: el contenido arranca bajo la cabecera en
          vez de centrarse en los 190svh de la página. Centrado
          caía en la franja inferior, que es donde vive el arco
          del planeta y por donde entra la cinta magenta; arriba
          cae justo en la banda muerta que la composición reserva
          (centrada en 30% x, 56% y — ver la máscara de la
          retícula en dibujo.js). */}
      <PageSection center={false} className="cosmic-page">
        <div className="cosmic-page__contenido">
          <p className="cosmic-page__antetitulo">Laboratorio</p>

          <h1 className="cosmic-page__titulo">
            Cosmic
            <span> Data Flow</span>
          </h1>

          <p className="cosmic-page__texto">
            Fondo animado generado por completo con código: ni una sola imagen,
            ni un solo archivo externo. Mueve el ratón y desplázate para ver el
            paralaje por capas.
          </p>

          <ul className="cosmic-page__capas">
            {CAPAS.map(([num, nombre, detalle]) => (
              <li key={num} className="cosmic-page__capa">
                <span className="cosmic-page__num">{num}</span>
                <span className="cosmic-page__nombre">{nombre}</span>
                <span className="cosmic-page__detalle">{detalle}</span>
              </li>
            ))}
          </ul>
        </div>
      </PageSection>
    </>
  );
}

export default CosmicPage;
