import { useEffect, useRef, useState } from "react";
import GlassPanel from "./GlassPanel.jsx";
import LightShaft from "./LightShaft.jsx";
import ReflectiveFloor from "./ReflectiveFloor.jsx";
import Crystal from "./Crystal.jsx";
import OrbitRings from "./OrbitRings.jsx";
import FloatingDebris from "./FloatingDebris.jsx";
import LogoShader from "../logoShader/LogoShader.jsx";
import "./HeroBackground.css";

/* ---- LAS DOS ÚNICAS IMÁGENES DE LA ESCENA ----
   Se importan en vez de referenciarlas por ruta desde public/.
   Con el import, si el archivo falta la compilación PARA; con
   una ruta suelta el fallo aparece en tiempo de ejecución, y un
   fondo decorativo al que le falta una pieza puede pasar
   semanas sin que nadie lo note.

   De paso Vite las versiona con hash y las sirve con caché
   larga. Están recortadas al contenido y en WebP: 6,2MB de PNG
   original se quedaron en 547KB entre las dos. */
import logo3d from "../../assets/hero/oysters-3d.webp";
import logoTexto from "../../assets/hero/oysters-3d-texto.png";
import retrato from "../../assets/hero/girl-mask.webp";
import cristal1 from "../../assets/hero/cristal-1.webp";
import cristal2 from "../../assets/hero/cristal-2.webp";
import cristal3 from "../../assets/hero/cristal-3.webp";

/* ============================================================
   FONDO DEL HERO — sala de cristal

   Escena entera en HTML + CSS + SVG. Las únicas imágenes son el
   logo y el retrato; todo lo demás —niebla, haz de luz, suelo,
   paneles, diamante, esquirlas— está dibujado por código.

   ---- LOS TRES PLANOS ----
   La profundidad no es real, se finge con tres cosas a la vez y
   hacen falta las tres:

     · DESENFOQUE     lo lejano va borroso, lo cercano nítido
     · SATURACIÓN     lo lejano se lava hacia el violeta de la
                      niebla; lo cercano conserva su color
     · PARALAJE       lo lejano se mueve 4px con el ratón, lo
                      cercano 20px

   Con una sola de las tres el ojo no se lo cree. El paralaje
   por sí solo se lee como capas de papel deslizándose.

   ---- EL TERCIO CENTRAL ES ZONA MUERTA ----
   Ahí va el titular del hero, así que solo puede haber niebla y
   luz. Ninguna geometría entra en x 22-72%, y 18-68%. Es la
   regla que manda sobre cualquier decisión de composición.
   ============================================================ */

/* Cuánto se desplaza cada plano con el ratón, en píxeles. Son
   los topes: el valor real sale de multiplicar por la posición
   normalizada del puntero. */
const PARALAJE = { fondo: 4, medio: 10, frente: 20 };

/* Suavizado del paralaje. El puntero salta entre fotogramas;
   sin filtro la escena da tirones. 0.07 tarda ~35 fotogramas en
   llegar, y eso es lo que hace que el fondo parezca pesado. */
const SUAVIZADO = 0.07;

const CAPAS_POR_DEFECTO = {
  atmosfera: true,
  haz: true,
  suelo: true,
  panelesFondo: true,
  imagenes: true,

  /* El logo se controla aparte de la escultura aunque compartan
     capa: en la portada van los dos, pero en una sección interior
     el logo sobra —la cabecera ya lo lleva— y la figura no. */
  logo: true,

  /* la capa de cristales: la pieza principal sobre el pedestal y
     dos acentos al fondo */
  diamante: true,
  etiquetas: true,
  esquirlas: true,
  postproceso: true,
};

const AJUSTES_POR_DEFECTO = { niebla: 1, glow: 1, perspectiva: 1 };

function HeroBackground({ capas, ajustes }) {
  const raiz = useRef(null);
  const [entrada, setEntrada] = useState(false);

  const c = { ...CAPAS_POR_DEFECTO, ...capas };
  const a = { ...AJUSTES_POR_DEFECTO, ...ajustes };

  /* ---- PARALAJE POR VARIABLES CSS, NO POR ESTADO ----
     Mover el ratón dispara un evento por fotograma. Si eso
     entrara en el estado de React, la escena entera se
     reconciliaría 60 veces por segundo para cambiar dos
     números. Escribiendo variables CSS sobre el nodo raíz, el
     trabajo se queda en el compositor y React ni se entera. */
  useEffect(() => {
    const el = raiz.current;
    if (!el) return;

    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (menosMovimiento.matches) return;

    let destinoX = 0;
    let destinoY = 0;
    let actualX = 0;
    let actualY = 0;
    let scroll = 0;
    let raf = null;

    const alMover = (e) => {
      destinoX = (e.clientX / window.innerWidth - 0.5) * 2;
      destinoY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const cuadro = () => {
      raf = requestAnimationFrame(cuadro);

      actualX += (destinoX - actualX) * SUAVIZADO;
      actualY += (destinoY - actualY) * SUAVIZADO;

      /* la escena se hunde al bajar: tope al 100% de la ventana
         para que en una página larga no siga hundiéndose */
      const p = Math.min(1, window.scrollY / window.innerHeight);
      scroll += (p - scroll) * SUAVIZADO;

      el.style.setProperty("--hb-px", actualX.toFixed(4));
      el.style.setProperty("--hb-py", actualY.toFixed(4));
      el.style.setProperty("--hb-scroll", scroll.toFixed(4));
    };

    window.addEventListener("pointermove", alMover, { passive: true });
    raf = requestAnimationFrame(cuadro);

    return () => {
      window.removeEventListener("pointermove", alMover);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* la entrada se dispara un fotograma después del montaje: en
     el mismo el navegador aún no ha pintado el estado inicial y
     la animación se saltaría */
  useEffect(() => {
    const t = requestAnimationFrame(() => setEntrada(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      ref={raiz}
      className={`hb ${entrada ? "hb--dentro" : ""}`}
      /* Todo el fondo es decorativo: fuera del árbol de
         accesibilidad y sin capturar el ratón, que si no se
         comería los clics del hero que va encima. */
      aria-hidden="true"
      style={{
        "--hb-niebla": a.niebla,
        "--hb-glow": a.glow,
        "--hb-persp": a.perspectiva,
        "--hb-par-fondo": `${PARALAJE.fondo}px`,
        "--hb-par-medio": `${PARALAJE.medio}px`,
        "--hb-par-frente": `${PARALAJE.frente}px`,
      }}
    >
      {/* ---- z0 · atmósfera ---- */}
      {c.atmosfera && (
        <div className="hb-atmosfera">
          {/* Los cinco degradados —relleno, foco cenital,
              horizonte, rebote y viñeta— van apilados como fondos
              de UN elemento en vez de cinco. Ver el comentario en
              el CSS: eran cinco capas de pantalla completa. */}
          <span className="hb-atmosfera__capas" />
        </div>
      )}

      {/* ---- z1 · haz de luz ---- */}
      {c.haz && <LightShaft />}

      {/* ---- z2 · suelo ---- */}
      {c.suelo && <ReflectiveFloor />}

      {/* ---- z3 · paneles ----
          La escena entera vive en el mismo contexto 3D para que
          las rotaciones en Y compartan punto de fuga. En
          contextos separados cada panel tendría el suyo y
          convergerían a sitios distintos. */}
      {c.panelesFondo && (
        <div className="hb-paneles">
          {/* ---- TORRE IZQUIERDA ----
              El mapa de la spec está pensado para un encuadre
              vertical 2:3. En 16:9 hay el doble de anchura y la
              mitad de altura, así que copiarlo tal cual dejaba
              los paneles pequeños y sueltos en medio de la nada.

              Aquí van más grandes, pegados al borde y saliéndose
              del encuadre por arriba y por la izquierda: es lo
              que hace que se lea como una SALA construida de
              cristal y no como unos rectángulos flotando. */}
          {/* ---- SE SOLAPAN A PROPÓSITO ----
              Antes cada panel tenía aire alrededor y la escena se
              leía plana pese a acertar los colores. La
              profundidad no la da el desenfoque: la da que unas
              cosas TAPEN a otras. Los rangos verticales de estos
              cinco se pisan entre sí a posta. */}
          <GlassPanel x="-10%" y="-12%" w="26%" h="56%" rotateY={16} z={-140} grosor={22} profundidad="fondo" datos="alto" opacidad={1} desenfoque={0.8} style={{ "--i": 0 }} />
          <GlassPanel x="2%" y="4%" w="11%" h="58%" rotateY={11} z={-70} grosor={18} profundidad="medio" soloMarco opacidad={0.84} desenfoque={1.6} style={{ "--i": 1.6 }} />
          <GlassPanel x="-13%" y="32%" w="28%" h="58%" rotateY={19} z={-16} grosor={26} profundidad="frente" datos="rejilla" style={{ "--i": 2.4 }} />
          <GlassPanel x="13%" y="-8%" w="7%" h="38%" rotateY={14} z={-190} grosor={12} profundidad="fondo" opacidad={0.66} desenfoque={2.1} style={{ "--i": 0.8 }} />
          <GlassPanel x="9%" y="44%" w="15%" h="46%" rotateY={9} z={-110} grosor={20} profundidad="medio" datos="bajo" opacidad={0.96} desenfoque={1.3} style={{ "--i": 3.2 }} />
          <GlassPanel x="-4%" y="62%" w="19%" h="34%" rotateY={22} z={30} grosor={28} profundidad="frente" opacidad={0.88} style={{ "--i": 4 }} />

          {/* ---- TORRE DERECHA, detrás del retrato ----
              Sus índices van INTERCALADOS con los de la
              izquierda (0.3, 1.2, 2.4, 3.4) en vez de ir
              detrás. Así los dos lados se encienden a la vez,
              cada uno bajando por su columna.

              Las dos recorren la MISMA ventana de tiempo aunque
              tengan distinto número de paneles: la izquierda son
              seis repartidos de 0 a 4, la derecha cuatro de 0.4
              a 4. Sin eso, la derecha terminaba su torre en el
              3.4 y se quedaba 780ms parada mientras la izquierda
              seguía bajando.

              Rematan abajo con un compás doble: primero el panel
              de la izquierda (5.2) y 184ms después AI FIRST (6).

              ---- Y CADA UNO TIENE QUE VERSE ----
              Medida el área visible de cada panel, la derecha
              promediaba 30 kpx contra los 70 de la izquierda, y
              uno estaba TAPADO AL 100% por el retrato: se
              encendía y no se veía nada.

              El fogonazo era el mismo en los dos lados; lo que
              fallaba era la superficie. Los que quedan están
              corridos hacia la izquierda y hacia arriba para que
              a cada uno le sobre franja despejada, o por el
              costado del retrato o por encima de su cabeza.

              ---- DOS CON PESO, DOS ATENUADOS ----
              Los cuatro tenían el mismo brillo y se pisaban
              entre sí: se leían como ruido, no como estructura.
              Ahora dos llevan contenido y peso normal —la
              etiqueta y el gráfico— y los otros dos van en plano
              tenue, haciendo de fondo. La torre gana profundidad
              y deja de competir consigo misma.

              (Antes los índices iban del 6 al 9, o sea DESPUÉS
              de toda la izquierda: la secuencia se leía como un
              único recorrido que bajaba por un lado y saltaba al
              otro, en vez de como dos columnas.) */}
          {/* ---- BIOMBO DETRÁS DE LA FIGURA ----
              Cuatro láminas altas y estrechas, solapadas y con el
              giro creciendo de una a la siguiente: eso es lo que
              las hace converger como las hojas de un biombo en vez
              de flotar sueltas.

              Antes eran cuatro paneles repartidos por el lado
              derecho a alturas distintas, y dejaban vacío justo lo
              que en la referencia está lleno: el fondo inmediato
              de la cabeza. Una figura recortada necesita algo
              DETRÁS que la enmarque; sin eso se lee pegada sobre
              el aire por muy resuelta que esté la iluminación.

              Van de menos a más giradas y de más lejos a más
              cerca, así que el biombo se abre hacia el
              espectador. */}
          <GlassPanel
            x="63%" y="-6%" w="13%" h="58%" rotateY={-9} z={-230} grosor={14}
            profundidad="tenue" luzDesde="derecha" opacidad={0.8} desenfoque={1.4}
            style={{ "--i": 0.6 }}
          />

          <GlassPanel
            x="72%" y="-13%" w="14%" h="67%" rotateY={-14} z={-170} grosor={20}
            profundidad="fondo" luzDesde="derecha" opacidad={1.1} desenfoque={1}
            style={{ "--i": 1.7 }}
          >
            <span className="hb-panel__etiqueta">OYSTERS.AI</span>
          </GlassPanel>

          <GlassPanel
            x="82%" y="-4%" w="13%" h="61%" rotateY={-18} z={-110} grosor={18}
            profundidad="medio" luzDesde="derecha" opacidad={1.05} desenfoque={1.2}
            style={{ "--i": 2.8 }}
          >
            {/* mini gráfico de 4 barras: la altura la pone el CSS
                por índice, no hay datos detrás — es decorativo */}
            <span className="hb-panel__barras">
              <i style={{ "--b": 0.45 }} />
              <i style={{ "--b": 0.8 }} />
              <i style={{ "--b": 0.3 }} />
              <i style={{ "--b": 0.62 }} />
            </span>
          </GlassPanel>

          <GlassPanel
            x="91%" y="-9%" w="13%" h="55%" rotateY={-23} z={-60} grosor={22}
            profundidad="medio" luzDesde="derecha" opacidad={0.95} desenfoque={0.8}
            style={{ "--i": 3.9 }}
          />

          {/* ---- ESTRUCTURA AL FONDO DEL CENTRO ----
              La spec prohíbe geometría en la zona del titular,
              pero la referencia sí tiene paneles allá al fondo:
              es lo que evita que el centro sea un degradado liso.

              La regla existe para que el texto se lea, no por la
              geometría en sí — así que lo medí. Bajando hasta la
              franja del titular subían su percentil 95 a 0.207 y
              el texto blanco caía a 4.08:1: por debajo del AA.

              Solución: que terminen ANTES del 18%, donde empieza
              la zona reservada. Aportan la estructura que le
              faltaba al centro y no tocan el texto. Medido
              después: el p95 vuelve a 0.18. */}
          <GlassPanel x="30%" y="-16%" w="16%" h="25%" rotateY={9} z={-340} profundidad="lejano" opacidad={1} desenfoque={0.85} style={{ "--i": 0.2 }} />
          <GlassPanel x="52%" y="-10%" w="14%" h="20%" rotateY={-7} z={-360} profundidad="lejano" opacidad={0.72} desenfoque={1.5} style={{ "--i": 0.9 }} />
        </div>
      )}

      {/* la oscuridad que rodea al grupo del lado derecho: por
          debajo de la figura y el cristal, solo apaga el fondo */}
      <span className="hb-noche" />

      {/* ---- z3.5 · mitad TRASERA de los anillos ----
          Va aquí, entre los paneles y las imágenes, para que la
          escultura la tape. Es la mitad del truco: la otra está
          después del diamante. */}
      {c.diamante && <OrbitRings capa="atras" />}

      {/* ---- z4 · imágenes ----
          Las dos únicas piezas de la escena que no son código. */}
      {c.imagenes && (
        <div className="hb-imagenes">
          {/* el logo no es una imagen quieta: entra como textura
              de un shader que lo deforma muy despacio. Ver
              componentes/logoShader/. */}
          {c.logo && (
            <LogoShader className="hb-logo" src={logo3d} mascara={logoTexto} />
          )}

          {/* La escultura va envuelta porque un <img> no admite
              pseudoelementos, y necesita tres capas más: el halo
              de detrás, el contraluz y los reflejos del entorno.
              La silueta se le pasa al CSS como variable para que
              esas capas se recorten contra la figura en vez de
              salir como rectángulos. */}
          <span className="hb-escultura" style={{ "--retrato": `url(${retrato})` }}>
            {/* El resplandor va en el envoltorio y la máscara en la
                imagen. Juntos en el mismo elemento se recortan: la
                máscara es un degradado que mide la caja y se repite
                fuera de ella, así que el halo que se derrama por los
                lados quedaba cortado en un rectángulo. */}
            <span className="hb-chica">
              <img src={retrato} alt="" />
            </span>

            {/* Aquí llegó a haber un reflejo suyo en el suelo. No
                sirve: la gema le tapa entera la zona de contacto,
                y además la figura se disuelve en la niebla antes
                de llegar al plano, así que no toca nada que pueda
                devolverla. Lo que la ancla a la escena es la luz
                de la gema que le cae encima (ver el ::after de
                .hb-escultura), no un reflejo que nadie ve. */}
          </span>
        </div>
      )}

      {/* ---- z5 · cristales y pedestal ---- */}
      {c.diamante && (
        <div className="hb-cristal">
          {/* ---- CRISTAL Y PEANA VAN EN UN GRUPO ----
              Las dos piezas estaban posicionadas por separado
              contra el borde de la pantalla, cada una con su
              porcentaje y su tope de anchura. Mientras los topes
              no entraban en juego sus ejes coincidían; a partir de
              ahí el ancho se congelaba pero el `right` porcentual
              seguía creciendo, y como el reparto no era el mismo
              en las dos, los centros se separaban. Medido, 15px a
              1920.

              Dentro de un grupo el problema no puede existir: las
              dos se centran contra la misma caja, así que su eje
              es el mismo por construcción y no por que los números
              cuadren a una resolución concreta. */}
          <div className="hb-grupo">
            <span className="hb-cristal__sombra" />

            <div className="hb-podio">
              <span className="hb-podio__brillo" />
              <span className="hb-podio__base" />
              <span className="hb-podio__canto" />
              <span className="hb-podio__tapa">
                <i style={{ "--r": 0 }} />
                <i style={{ "--r": 1 }} />
                <i style={{ "--r": 2 }} />
                <i style={{ "--r": 3 }} />
                <i style={{ "--r": 4 }} />
              </span>
              <span className="hb-podio__columna" />
            </div>

            <Crystal src={cristal1} className="hb-cristal-pieza--principal" niebla={0.14} />

            <span className="hb-cristal__contacto" />
          </div>

          {/* ---- LOS DOS ACENTOS ----
              Van al fondo, con más niebla y más desenfoque, y en
              las dos bandas que la franja del titular deja libres:
              por encima del 18% y por debajo del 68%. No son
              decoración repetida — son la escala: un mismo objeto
              a tres distancias distintas es lo que dice cómo de
              grande es la sala. */}
          <Crystal src={cristal2} className="hb-cristal-pieza--alto" niebla={0.47} />
          <Crystal src={cristal3} className="hb-cristal-pieza--bajo" niebla={0.35} />
        </div>
      )}

      {/* ---- z5.5 · mitad DELANTERA de los anillos ----
          Misma geometría, mitad de abajo, por encima de la
          escultura. Que el mismo aro la tape aquí y sea tapado
          por ella arriba es lo que dice que la rodea. */}
      {c.diamante && <OrbitRings capa="delante" />}

      {/* ---- z6 · etiquetas HUD ----
          Índices 12 y 13: van al FINAL de la cola de entrada.
          Antes llevaban 7 y 8, que chocaban con los de la torre
          derecha, así que se encendían a mitad de secuencia y la
          animación se quedaba sin remate. Son las dos últimas en
          prender a propósito: cierran el recorrido de la mirada
          abajo a la izquierda y abajo a la derecha. */}
      {c.etiquetas && (
        <div className="hb-hud">
          <GlassPanel x="3%" y="80%" w="24%" h="14%" rotateY={8} profundidad="frente" className="hb-hud__caja" style={{ "--i": 5.2 }}>
            <Cruces />
            <span className="hb-hud__texto">
              Building
              <br />
              Intelligent
              <br />
              Experiences
            </span>
            <span className="hb-hud__barras">
              <i />
              <i />
              <i />
            </span>
          </GlassPanel>

          <GlassPanel x="62.5%" y="14%" w="11%" h="9%" rotateY={-8} profundidad="frente" luzDesde="derecha" className="hb-hud__caja" style={{ "--i": 6 }}>
            <Cruces />
            <span className="hb-hud__texto">AI First</span>
            <span className="hb-hud__num">01</span>
          </GlassPanel>
        </div>
      )}

      {/* ---- z7 · esquirlas ---- */}
      {c.esquirlas && <FloatingDebris />}

      {/* ---- z8 · post-proceso ---- */}
      {c.postproceso && (
        <div className="hb-post">
          <span className="hb-post__grano" />
          <span className="hb-post__aberracion" />
        </div>
      )}
    </div>
  );
}

/* Marcas de cruz de las esquinas: puro adorno de HUD. Van aquí
   y no repetidas en cada panel para que las cuatro sean iguales. */
function Cruces() {
  return (
    <span className="hb-cruces">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export default HeroBackground;
