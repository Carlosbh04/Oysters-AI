import { useEffect, useState } from "react";
import "./EntradaServicio.css";

/* ============================================================
   ENTRADA DE LOS APARTADOS DE "CÓMO LO HACEMOS"

   La animación de entrada de las cuatro páginas —aprendizaje,
   contenido, personalización y orquestación—, en un solo sitio.

   ---- CÓMO SE USA ----
   Este componente NO sabe qué lleva dentro. Lo único que hace es
   encender un interruptor al montarse; quién se mueve, en qué
   orden y cuánto tarda lo dice EntradaServicio.css, y cada pieza
   se apunta sola con un atributo:

     <h1 data-entrada="titulo">
     <li data-entrada="paso" style={{ "--i": i }}>

   Los papeles disponibles y su turno están en la tabla del CSS.
   El `--i` solo hace falta en lo que va en serie (fichas, pasos,
   cierre): es su puesto en la fila y escalona el arranque.

   Hay además un modificador, `data-entrada-quieta`, para lo que
   tenga que entrar sin desplazarse — piezas cuya posición mida
   alguien por JS, que con la caja transformada se mediría mal.
   Está explicado en el CSS, donde vive.

   ---- POR QUÉ UN ATRIBUTO Y NO LAS CLASES DE CADA PÁGINA ----
   Las cuatro se llaman distinto (.ap__titulo, .co__titulo,
   .pe__titulo, .or__titulo). Se podía haber escrito aquí un
   :is() con los cuatro nombres y no tocar ni un JSX, pero
   entonces renombrar una clase apagaría su animación en
   silencio, y desde el componente no habría ni rastro de que
   está animado. El atributo viaja con el marcado: si esa línea
   se mueve de sitio, se lleva su papel puesta.

   ---- POR QUÉ AL MONTAR Y NO POR SCROLL ----
   Es una entrada de PÁGINA: se llega a estas rutas desde el menú
   y lo que hay que recibir es la llegada. Para lo que aparece al
   bajar ya está <Reveal>, que es otra cosa y tiene su propio
   componente.
   ============================================================ */
function EntradaServicio({ children }) {
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    /* ---- DOS FRAMES, NO UNO ----
       El interruptor no puede encenderse en el mismo frame en el
       que el contenido nace oculto: el navegador no habría
       pintado todavía el estado de partida, vería un único
       estado y no habría desde dónde transicionar — el contenido
       aparecería de golpe, que es justo lo que veníamos a
       arreglar. El primer frame deja que se pinte el punto de
       partida; el segundo enciende.

       Y va dentro del callback, no en el cuerpo del efecto:
       llamar a setState ahí es error de lint en este repo
       (react-hooks/set-state-in-effect) y además provoca el
       render en cascada que la regla persigue. */
    let segundo;
    const primero = requestAnimationFrame(() => {
      segundo = requestAnimationFrame(() => setDentro(true));
    });

    return () => {
      cancelAnimationFrame(primero);
      if (segundo) cancelAnimationFrame(segundo);
    };
  }, []);

  return (
    <div className={`entrada-svc ${dentro ? "entrada-svc--dentro" : ""}`}>
      {children}
    </div>
  );
}

export default EntradaServicio;
