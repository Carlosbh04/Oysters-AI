import { useEffect, useMemo, useRef, useState } from "react";
import "./CortinaPixeles.css";

/* ============================================================
   CORTINA DE PÍXELES

   Una rejilla de cuadrados que tapa la pantalla y se retira. No es
   un adorno: es lo que hace posible el salto que va detrás.

   ---- PARA QUÉ SIRVE DE VERDAD ----
   El vídeo pasa de estar metido en su marco, a un lado de la
   página, a ocupar la pantalla entera. Ese cambio es brusco por
   naturaleza: cambia de sitio, de tamaño y de contexto a la vez.
   Animarlo "volando" hasta su nueva posición es caro y frágil —hay
   que sincronizar dos cajas que viven en sistemas distintos—.

   Con la cortina no hace falta: se cierra, el salto ocurre a
   oscuras, y al abrirse el vídeo ya está donde toca y sonando. El
   espectador no ve un salto, ve una transición.

   ---- LOS CUADRADOS NO ENTRAN EN ORDEN ----
   Cada uno lleva su propio retardo, sorteado al montarse. En orden
   —de izquierda a derecha, o en diagonal— se lee como un barrido,
   que es otro efecto y bastante más manido. Desordenados se leen
   como lo que se busca: una imagen que se descompone en píxeles.

   El sorteo se hace UNA vez y se guarda: si se recalculara en cada
   render, los cuadrados cambiarían de turno a mitad de la
   animación y el efecto se rompería.
   ============================================================ */

/* Lado del cuadrado. Es el dial del efecto: más pequeño se lee
   como grano fino y hay que dibujar muchos más; más grande, como
   bloques. 54px sale a unos 450 cuadrados en una pantalla normal,
   que va sobrado de fluidez. */
const LADO = 54;

/* Lo que tarda cada cuadrado en aparecer o irse. */
export const PASO_CORTINA = 300;

/* La ventana en la que se reparten los turnos. El total de una
   pasada de cortina es este más el paso: 760ms.

   Iba en 640 y se quedaba corto: la cortina cerraba y abría de un
   plumazo y el efecto casi no se leía. Con 760 hay tiempo de ver
   los cuadrados caer sueltos, que es de lo que va. */
const DESORDEN = 460;

export const DURACION_CORTINA = PASO_CORTINA + DESORDEN;

/* ---- LOS TONOS ----
   Tres oscuros de la casa. Se reparten con el MISMO revoltijo que
   los turnos, no con `nth-child`: un `nth-child(3n)` sobre una
   rejilla pinta diagonales —el período no divide al número de
   columnas— y eso es exactamente lo que se veía, una cortina a
   rayas en vez de a píxeles.

   Y los tres son OPACOS. Uno de ellos llegó a estar al 55% de
   alfa, y con eso la cortina no llegaba a tapar: se veía el vídeo
   por detrás justo cuando su función es esconderlo. */
const TONOS = ["#241634", "#180f28", "#2e1d49"];

/* `fase`: "cerrando" tapa la pantalla, "abriendo" la despeja.
   `alTerminar` avisa cuando la fase ha acabado — es lo que encadena
   el resto de la secuencia. */
function CortinaPixeles({ fase, alTerminar }) {
  const [rejilla, setRejilla] = useState({ columnas: 0, filas: 0 });
  /* ---- EL AVISO SE GUARDA EN UNA REF, Y SE ESCRIBE EN UN EFECTO ----
     En una ref para que el temporizador de abajo no dependa de
     ella: si `alTerminar` estuviera en sus dependencias, cada
     render del padre reiniciaría la cuenta y la cortina no
     terminaría nunca de cerrarse.

     Y se escribe dentro de un efecto, no en el cuerpo: tocar una
     ref durante el render es de las cosas que rompen con el
     renderizado concurrente —React puede descartar un render a
     medias, y el valor ya se habría escrito—. */
  const alTerminarRef = useRef(alTerminar);

  useEffect(() => {
    alTerminarRef.current = alTerminar;
  });

  useEffect(() => {
    const medir = () =>
      setRejilla({
        columnas: Math.ceil(window.innerWidth / LADO),
        filas: Math.ceil(window.innerHeight / LADO),
      });

    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);

  const total = rejilla.columnas * rejilla.filas;

  /* ---- EL DESORDEN ES CALCULADO, NO SORTEADO ----
     Aquí había un `Math.random()` por cuadrado. Se cambia por un
     revoltijo determinista y no es por gusto:

       · una función impura en el render está prohibida por el lint
         del proyecto, y con razón: React puede renderizar dos veces
         y los turnos cambiarían a mitad de la animación;
       · siendo determinista, el mismo cuadrado tiene siempre el
         mismo turno, así que al cerrar y volver a abrir la cortina
         se deshace por donde se formó.

     ---- Y POR QUÉ NO EL TRUCO DEL SENO ----
     El primer intento fue `sin(i * 12.9898) * 43758.5453`, que es
     el revoltijo de toda la vida en shaders. Sobre una rejilla NO
     sirve: aplicado a índices consecutivos, sus valores se repiten
     con un periodo que casi encaja con el ancho de la rejilla, y lo
     que sale son BANDAS DIAGONALES. Se vio a la primera captura —
     la cortina no se cerraba en desorden, se cerraba a rayas.

     Esto es un mezclador entero de verdad (el de Knuth encadenado
     con dos xorshift). No tiene periodo corto, así que dos vecinos
     no comparten nada y el resultado se lee como azar. */
  const retardos = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => {
        let x = Math.imul(i + 1, 2654435761);
        x = Math.imul(x ^ (x >>> 15), 2246822519);
        x = Math.imul(x ^ (x >>> 13), 3266489917);
        x = (x ^ (x >>> 16)) >>> 0;

        /* del mismo número salen las dos cosas: cuándo entra el
           cuadrado y de qué tono es */
        return { t: (x / 4294967296) * DESORDEN, tono: TONOS[x % TONOS.length] };
      }),
    [total]
  );

  useEffect(() => {
    if (!fase) return;
    const t = setTimeout(() => alTerminarRef.current?.(), DURACION_CORTINA);
    return () => clearTimeout(t);
  }, [fase]);

  if (!fase || !total) return null;

  return (
    <div
      className={`cortina cortina--${fase}`}
      style={{
        "--cortina-columnas": rejilla.columnas,
        "--cortina-lado": `${LADO}px`,
        "--cortina-paso": `${PASO_CORTINA}ms`,
      }}
      aria-hidden="true"
    >
      {retardos.map((c, i) => (
        <i
          key={i}
          style={{
            /* al ABRIR se invierte el turno: los que taparon
               primero son los últimos en irse, y la cortina se
               deshace por donde se formó en vez de repetir el
               mismo orden */
            "--t": `${fase === "abriendo" ? DESORDEN - c.t : c.t}ms`,
            background: c.tono,
          }}
        />
      ))}
    </div>
  );
}

export default CortinaPixeles;
