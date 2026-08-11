import "./FooterBackground.css";

/* ============================================================
   FONDO DEL PIE

   La sala en la que flota la tarjeta del pie. Es un plano
   NOCTURNO: casi negro, con una rejilla de suelo que se pierde
   en el horizonte, unos alambres flotando y polvo en el aire.

   ---- POR QUÉ NO ES LA ESCENA DE CASOS DE USO ----
   Comparten familia —contornos violeta sobre oscuro— pero no
   planteamiento, y reutilizar aquella habría salido peor:

     · la de casos de uso es una SALA VERTICAL: paneles de pie
       que convergen hacia el centro y una figura de cuerpo
       entero. Todo el peso está a media altura;
     · esta es un HORIZONTE: casi toda la información visual
       está en el suelo y en el aire, y el centro tiene que
       quedar despejado porque encima va la tarjeta con tres
       columnas de texto.

   Poner paneles verticales aquí sería competir con las columnas
   del contenido justo donde hay que leer.

   ---- LA REJILLA ES EL ELEMENTO PRINCIPAL ----
   Y por eso se dibuja con una trama en perspectiva de verdad y
   no con líneas colocadas a mano: la separación entre líneas
   tiene que comprimirse hacia el horizonte de forma continua.
   Cualquier aproximación por pasos se nota justo en el fondo,
   que es donde el ojo busca la profundidad.
   ============================================================ */

/* Colocadas a mano y no repartidas por fórmula: son cuatro y lo
   que tienen que hacer es esquivar el centro, donde va la
   tarjeta. Una distribución automática las metería justo ahí. */
const ESQUIRLAS = [
  { x: "17%", y: "44%", tam: "15px", giro: "-12deg", o: 0.5 },
  { x: "93%", y: "13%", tam: "11px", giro: "18deg", o: 0.38 },
  { x: "4%", y: "74%", tam: "13px", giro: "6deg", o: 0.34 },
  { x: "88%", y: "80%", tam: "9px", giro: "-22deg", o: 0.28 },
];

function FooterBackground() {
  return (
    <div className="fb" aria-hidden="true">
      {/* el aire violeta: sin él, el negro del fondo es negro
          plano y los alambres parecen pegados encima */}
      <span className="fb__resplandor" />

      {/* ---- LA REJILLA DEL SUELO ----
          Va en dos piezas: el contenedor recorta y da la
          perspectiva, el plano de dentro lleva la trama y se
          tumba. Separarlos es lo que permite que el plano
          desborde por los cuatro lados sin que se vea el borde:
          si la trama estuviera en el mismo elemento que recorta,
          el rectángulo girado enseñaría sus esquinas. */}
      <span className="fb__suelo">
        <span className="fb__suelo-plano" />
      </span>

      {/* ---- ALAMBRES ----
          Marcos sin cristal, como ventanas lejanas. Los de la
          derecha están enteros y los de los bordes entran
          cortados a propósito: un objeto que cabe entero en
          cuadro se lee como ilustración colocada; uno que se
          sale, como parte de un espacio que sigue. */}
      <span className="fb__marco fb__marco--alto" />
      <span className="fb__marco fb__marco--bajo" />
      <span className="fb__marco fb__marco--lejano" />

      {/* El tetraedro. Este sí es un SVG y no un montaje de
          bordes CSS: son cuatro vértices unidos por seis aristas
          que se cruzan, y eso con cajas no se hace. */}
      <svg className="fb__tetra" viewBox="0 0 200 170" fill="none">
        <g
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        >
          {/* la silueta */}
          <path d="M100 8 L188 150 L12 150 Z" />
          {/* las tres aristas que van al vértice de dentro: son
              las que lo convierten en volumen y no en triángulo */}
          <path d="M100 8 L128 112" opacity=".75" />
          <path d="M12 150 L128 112" opacity=".55" />
          <path d="M188 150 L128 112" opacity=".75" />
        </g>
        {/* los vértices, marcados: en la referencia el alambre
            tiene nudos y sin ellos se lee como un dibujo plano */}
        <g fill="currentColor">
          <circle cx="100" cy="8" r="2.4" />
          <circle cx="188" cy="150" r="2.4" />
          <circle cx="12" cy="150" r="2.4" />
          <circle cx="128" cy="112" r="1.8" opacity=".7" />
        </g>
      </svg>

      {/* ---- ESQUIRLAS ----
          Triangulitos sueltos, el detalle de instrumentación que
          tiene la referencia.

          Van en SVG sueltos y con tamaño en px, no en uno solo
          estirado a la escena: con un único viewBox de 0-100
          cubriendo los 1440px, un triángulo de 12 unidades sale
          a 170px de ancho. Se probó y quedaron tres triángulos
          enormes flotando en medio. */}
      {ESQUIRLAS.map(({ x, y, tam, giro, o }) => (
        <svg
          key={`${x}-${y}`}
          className="fb__esquirla"
          viewBox="0 0 20 17"
          fill="none"
          style={{ "--x": x, "--y": y, "--tam": tam, "--giro": giro, "--o": o }}
        >
          <path
            d="M10 1 L19 16 L1 16 Z"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </svg>
      ))}

      {/* ---- POLVO ----
          Cada mota es la sombra de un punto invisible, no un
          elemento: son veintitantas partículas y con nodos de
          verdad serían veintitantos nodos en el DOM del pie de
          todas las páginas. */}
      <span className="fb__polvo" />
    </div>
  );
}

export default FooterBackground;
