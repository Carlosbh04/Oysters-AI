import Crystal from "../heroBackground/Crystal";
import retrato from "../../assets/hero/girl-mask.webp";
import cristal2 from "../../assets/hero/cristal-2.webp";
import cristal3 from "../../assets/hero/cristal-3.webp";
import cristal4 from "../../assets/hero/cristal-4.webp";
import "./UseCasesBackground.css";

/* ============================================================
   FONDO DE CASOS DE USO

   Escena propia, no la del hero. Comparten piezas —la figura y la
   familia de octaedros— pero no el planteamiento, y por eso no
   valía reutilizar aquel componente:

     · la sala del hero es un espacio ILUMINADO: niebla violeta,
       haz cenital, suelo pulido y losas de cristal con relleno y
       filo de neón;
     · esto es un plano casi NEGRO donde solo hay contornos. Los
       paneles son marcos sin cristal, los octaedros son alambre y
       la única masa sólida es la figura.

   Montar lo segundo apagando lo primero habría sido cargar con
   nueve capas para acabar tapándolas casi todas.

   ---- TODO EN CONTORNO, Y NO ES UN CAPRICHO ----
   Encima va una rejilla de tarjetas con seis líneas de texto cada
   una. Un fondo de superficies rellenas competiría con ellas por
   la misma zona; uno de líneas finas da profundidad sin disputar
   el sitio, porque ocupa perímetro y no área.
   ============================================================ */

/* Las piedras son los renders del cliente, no geometría dibujada
   aquí. Hubo una versión con octaedros de alambre en SVG y no
   valía: al lado de una figura fotorrealista, un contorno vectorial
   se lee como un icono, no como un objeto de la misma escena.

   Se reutiliza el componente Crystal, que además resuelve el
   problema que traen estos archivos —vienen renderizados sobre
   blanco, así que sobre negro salen como manchas pálidas— metiendo
   cada pieza en la atmósfera con su propia densidad de niebla. Más
   lejos, más niebla. */

/* `dentro` lo decide el contenedor de la sección, no este
   componente: la entrada va escalonada con el texto y las
   tarjetas, y ese orden exige que las tres fases cuenten desde
   el mismo instante. Ver Home.jsx. */
function UseCasesBackground({ dentro = false }) {
  return (
    <div className={`ucb ${dentro ? "ucb--dentro" : ""}`} aria-hidden="true">
      {/* ---- PANELES ----
          Marcos sin cristal, girados en Y para que converjan hacia
          el centro. Los de la izquierda quedan detrás del texto y
          por eso son los más apagados de todos. */}
      <div className="ucb__paneles">
        <span className="ucb__panel" style={{ "--x": "-6%", "--y": "-14%", "--w": "16%", "--h": "46%", "--r": "9deg", "--o": 0.5 }} />
        <span className="ucb__panel" style={{ "--x": "3%", "--y": "30%", "--w": "12%", "--h": "58%", "--r": "7deg", "--o": 0.32 }} />
        <span className="ucb__panel" style={{ "--x": "-3%", "--y": "62%", "--w": "18%", "--h": "44%", "--r": "12deg", "--o": 0.4 }} />
        {/* ---- POR ENCIMA DE SU CABEZA, NO A SU ALREDEDOR ----
            Este panel estaba en y -18% con 34% de alto, así que su
            borde inferior caía sobre el pelo de la figura y la
            enmarcaba: era el cuadrado que se le veía alrededor.
            Terminando por encima de ella, se lee como estructura
            del fondo y no como un marco puesto a la figura. */}
        <span className="ucb__panel" style={{ "--x": "72%", "--y": "-24%", "--w": "26%", "--h": "33%", "--r": "-11deg", "--o": 0.5 }} />

        {/* Había otro en x 86% que quedaba ENTERO detrás de ella:
            invisible salvo por los filos que asomaban por los
            costados, o sea puro ruido. Fuera. */}
        <span className="ucb__panel" style={{ "--x": "58%", "--y": "56%", "--w": "16%", "--h": "44%", "--r": "-8deg", "--o": 0.26 }} />
      </div>

      {/* ---- LA FIGURA ----
          Recortada por el borde derecho a propósito: en la
          referencia entra en cuadro sin caber entera, y eso es lo
          que la hace leer como parte del decorado y no como una
          ilustración colocada. */}
      {/* ---- EL RESPLANDOR Y LA MÁSCARA, EN ELEMENTOS DISTINTOS ----
          Estaban los dos en el <img> y ahí se pelean: la máscara
          es un degradado que mide la caja de la imagen y por
          defecto SE REPITE fuera de ella, así que el resplandor
          que se derrama por los lados quedaba recortado contra
          esas repeticiones. Eso era el rectángulo que se veía
          alrededor de la figura — no el número de sombras, que ya
          había bajado dos veces sin que desapareciera.

          Separados, el filtro trabaja sobre una imagen ya
          enmascarada y su halo no vuelve a pasar por la máscara. */}
      <span className="ucb__figura">
        <img src={retrato} alt="" loading="lazy" decoding="async" />
      </span>

      {/* Dos piedras sueltas flotando en el plano medio. Iban tres
          y una estaba justo encima de la figura, compitiendo con su
          cabeza: fuera. */}
      <Crystal className="ucb__gema ucb__gema--media" src={cristal3} niebla={0.55} />
      <Crystal className="ucb__gema ucb__gema--baja" src={cristal4} niebla={0.45} />

      {/* ---- EL CRISTAL SOBRE LOS ANILLOS ----
          Los anillos estaban solos y se leían como una diana
          suelta en la esquina. Con la pieza encima recuperan su
          sentido: son la huella de algo que flota ahí. */}
      <Crystal className="ucb__gema ucb__gema--posada" src={cristal2} niebla={0.2} />

      {/* ---- ANILLOS DEL SUELO ----
          El charco de luz de la peana, sin peana: aquí no hay
          suelo que sostenga nada, solo la huella. */}
      <span className="ucb__anillos">
        <i style={{ "--r": 0 }} />
        <i style={{ "--r": 1 }} />
        <i style={{ "--r": 2 }} />
        <i style={{ "--r": 3 }} />
      </span>

      {/* retícula de puntos abajo a la izquierda y marcas sueltas:
          el detalle de instrumentación que tiene la referencia */}
      <span className="ucb__puntos" />
      <span className="ucb__marcas" />

      {/* el aire violeta detrás de la figura, lo único que no es
          contorno: sin él, ese lado se queda en negro plano */}
      <span className="ucb__halo" />
    </div>
  );
}

export default UseCasesBackground;
