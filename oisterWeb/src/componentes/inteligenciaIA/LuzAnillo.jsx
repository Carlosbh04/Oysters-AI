import { useEffect, useRef } from "react";
import "./LuzAnillo.css";

/* ============================================================
   LA LUZ QUE RECORRE EL ANILLO

   Un punto de luz da vueltas al aro del núcleo y, cada cierto
   tiempo, se desvía por uno de los cuatro hilos, llega a su
   tarjeta, la enciende y vuelve al aro a seguir girando.

   ---- POR QUÉ ES UN COMPONENTE APARTE ----
   Necesita la geometría que mide InteligenciaIA —el centro y el
   radio del aro, y los trazados de los hilos— pero lo que hace con
   ella no tiene nada que ver con maquetar el bloque: es una
   máquina de estados con su propio reloj. Mezclarla allí habría
   metido un bucle de animación dentro de un componente que hoy
   solo mide cajas y pinta.

   Así, además, InteligenciaIA no se entera: le pasa cuatro datos y
   recibe un aviso cuando la luz llega a una tarjeta.

   ---- POR QUÉ NO SE DIBUJA EL RECORRIDO A MANO ----
   Los hilos ya existen como trazados SVG medidos contra las cajas
   reales. Recalcular aquí una curva "parecida" sería tener dos
   verdades que se despegan en cuanto una tarjeta cambie de alto.

   Se reutilizan los MISMOS trazados: se montan en un <defs> —que
   no pinta nada— y se le pregunta al navegador por el punto que
   corresponde a cada avance con `getPointAtLength`. La luz va
   exactamente por encima del hilo que se ve, pase lo que pase con
   la maquetación.
   ============================================================ */

/* Lo que tarda en dar una vuelta entera al aro. Baja de 26s a 11:
   a 26 el punto avanzaba unos 30px por segundo y costaba decir si
   se movía o estaba quieto — un detalle de ambiente tiene que
   notarse, si no es ruido en el DOM y nada más. */
const VUELTA = 11000;

/* Ida (y vuelta) por un hilo. Algo más rápido que antes (1150) y
   sobre todo COHERENTE con el giro nuevo: si el viaje no baja con
   la vuelta, el desvío se siente lento justo después de un giro
   ágil. */
const VIAJE = 850;

/* Lo que se queda en la tarjeta antes de volverse. No es un número
   suelto: tiene que cubrir lo que dura el número de la tarjeta
   —subir, mantenerse y bajar despacio, 1,6s en total (ver
   `iia-alza` en InteligenciaIA.css)—. Si la luz se fuera antes, se
   la vería volver al aro mientras la tarjeta sigue levantada. */
const PARADA = 1600;

/* Entre un viaje y el siguiente. Aleatorio dentro de esta
   horquilla: con un intervalo fijo se convierte en un metrónomo y
   se deja de mirar. */
const ESPERA_MIN = 2400;
const ESPERA_MAX = 5200;

/* suaviza los extremos del viaje: sale y llega frenando, que es
   como se mueve algo con masa */
const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function LuzAnillo({ ancho, alto, centro, radio, rutas, alLlegar }) {
  const luzRef = useRef(null);
  const haloRef = useRef(null);
  const rutasRef = useRef([]);

  useEffect(() => {
    const luz = luzRef.current;
    const halo = haloRef.current;
    if (!luz || !halo || !rutas.length) return;

    /* movimiento continuo: si se pide no verlo, no se monta */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* ---- ÁNGULO DE SALIDA DE CADA HILO ----
       Cada hilo aterriza en el aro en un punto concreto. Guardar su
       ÁNGULO es lo que permite que la luz no salte: en vez de
       teletransportarse al hilo elegido, sigue girando hasta pasar
       por su boca y sale desde ahí. */
    const angulos = rutasRef.current.map((ruta) => {
      if (!ruta) return 0;
      const fin = ruta.getPointAtLength(ruta.getTotalLength());
      return Math.atan2(fin.y - centro.y, fin.x - centro.x);
    });

    /* ---- LARGO DE CADA HILO, MEDIDO UNA VEZ ----
       Iba dentro del bucle y se preguntaba por frame durante los
       viajes, pero el trazado no cambia mientras este efecto
       viva: cuando la maquetación se rehace, InteligenciaIA pasa
       `rutas` nuevas, el efecto se relanza y esta caché se mide
       de nuevo — la misma invalidación de la que ya dependían
       los ángulos de arriba. */
    const largos = rutasRef.current.map((ruta) =>
      ruta ? ruta.getTotalLength() : 0
    );

    let raf = null;
    let anterior = performance.now();

    /* fases: "orbita" → "yendo" → "parada" → "volviendo" → ... */
    let fase = "orbita";
    let angulo = Math.random() * Math.PI * 2;
    let elegido = -1; /* hilo al que va a salir en cuanto lo cruce */
    let destino = -1; /* hilo por el que está viajando */
    let t0 = 0;
    let proximaSalida = performance.now() + ESPERA_MIN;

    const colocar = (x, y) => {
      luz.setAttribute("cx", x);
      luz.setAttribute("cy", y);
      halo.setAttribute("cx", x);
      halo.setAttribute("cy", y);
    };

    /* ¿el giro ha cruzado el ángulo de salida entre este fotograma
       y el anterior? Se compara en el espacio "distancia angular
       recorrida" para que el salto de -π a π no cuente como cruce */
    const cruza = (previo, actual, objetivo) => {
      const norm = (a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const d1 = norm(objetivo - previo);
      const d2 = norm(actual - previo);
      return d2 >= d1;
    };

    const paso = (ahora) => {
      const dt = Math.min(ahora - anterior, 50); /* pestaña de fondo */
      anterior = ahora;

      if (fase === "orbita") {
        const previo = angulo;
        angulo += (dt / VUELTA) * Math.PI * 2;

        colocar(
          centro.x + Math.cos(angulo) * radio,
          centro.y + Math.sin(angulo) * radio
        );

        if (elegido === -1 && ahora >= proximaSalida) {
          /* ---- SE ELIGE ENTRE LOS DOS QUE VIENEN ANTES ----
             Sorteando entre los cuatro por igual, el elegido podía
             ser justo el que acababa de quedar atrás: entonces la
             luz tenía que dar una vuelta ENTERA antes de poder
             salir, y entre viaje y viaje pasaba medio minuto.

             Ordenando por lo que falta para alcanzarlos y sorteando
             entre los dos primeros, la espera nunca pasa de media
             vuelta y sigue sin poder adivinarse cuál será. */
          const norm = (a) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const proximos = angulos
            .map((a, i) => ({ i, falta: norm(a - angulo) }))
            .sort((x, y) => x.falta - y.falta);

          elegido = proximos[Math.floor(Math.random() * Math.min(2, proximos.length))].i;
        }

        if (elegido !== -1 && cruza(previo, angulo, angulos[elegido])) {
          destino = elegido;
          elegido = -1;
          fase = "yendo";
          t0 = ahora;
        }
      } else if (fase === "yendo" || fase === "volviendo") {
        const ruta = rutasRef.current[destino];
        if (!ruta) {
          fase = "orbita";
        } else {
          const largo = largos[destino];
          const t = Math.min((ahora - t0) / VIAJE, 1);
          const k = suave(t);

          /* El trazado va de la TARJETA al aro (así lo construye
             `medir`), así que ir hacia la tarjeta es recorrerlo al
             revés. */
          const s = fase === "yendo" ? largo * (1 - k) : largo * k;
          const p = ruta.getPointAtLength(s);
          colocar(p.x, p.y);

          if (t === 1) {
            if (fase === "yendo") {
              alLlegar?.(destino);
              fase = "parada";
              t0 = ahora;
            } else {
              fase = "orbita";
              /* retoma el giro EXACTAMENTE donde ha vuelto a
                 entrar, no donde lo dejó */
              angulo = angulos[destino];
              proximaSalida =
                ahora + ESPERA_MIN + Math.random() * (ESPERA_MAX - ESPERA_MIN);
            }
          }
        }
      } else if (fase === "parada") {
        if (ahora - t0 >= PARADA) {
          fase = "volviendo";
          t0 = ahora;
        }
      }

      raf = requestAnimationFrame(paso);
    };

    /* ---- EL BUCLE SOLO CORRE CON LA ESCENA A LA VISTA ----
       Era el único rAF del proyecto sin pausa fuera de pantalla:
       giraba durante toda la visita a la home aunque la sección
       quedara a tres pantallas. Mismo patrón simétrico que
       LightDust/FondoNuevo (isIntersecting a ambos lados) — el
       useEnPantalla de reveals no vale aquí a propósito: su reset
       asimétrico dejaría el bucle vivo con la sección ya
       scrolleada por arriba.

       Al pausar no debe pasar el tiempo: t0 y proximaSalida son
       marcas ABSOLUTAS, y sin desplazarlas la luz completaría el
       viaje de golpe al volver. `pausadaEn` mide cuánto duró la
       pausa y `arrancar` corre las marcas ese mismo tramo — la
       luz retoma exactamente donde quedó, en la fase que
       estuviera. Arranca en pausa: la primera observación del IO
       decide (y una escena que nace bajo el pliegue no gasta ni
       un frame). */
    let pausadaEn = performance.now();

    const arrancar = () => {
      if (raf !== null) return;
      const ahora = performance.now();
      const parado = ahora - pausadaEn;
      t0 += parado;
      proximaSalida += parado;
      anterior = ahora;
      raf = requestAnimationFrame(paso);
    };

    const parar = () => {
      if (raf === null) return;
      cancelAnimationFrame(raf);
      raf = null;
      pausadaEn = performance.now();
    };

    /* mismo colchón del 35% que LightDust: la reanudación ocurre
       antes de asomar y nunca se ve a la luz "despertar" */
    const observador = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? arrancar() : parar()),
      { rootMargin: "35%" }
    );
    observador.observe(luz.ownerSVGElement ?? luz);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      observador.disconnect();
    };
  }, [ancho, alto, centro, radio, rutas, alLlegar]);

  return (
    <svg
      className="luz-anillo"
      width={ancho}
      height={alto}
      viewBox={`0 0 ${ancho} ${alto}`}
      aria-hidden="true"
    >
      {/* Los trazados van en <defs>: no pintan nada, solo sirven
          para preguntarles por sus puntos. Los hilos visibles los
          dibuja InteligenciaIA. */}
      <defs>
        {rutas.map((d, i) => (
          <path
            key={i}
            d={d}
            ref={(el) => {
              rutasRef.current[i] = el;
            }}
          />
        ))}
      </defs>

      <circle ref={haloRef} className="luz-anillo__halo" r="9" />
      <circle ref={luzRef} className="luz-anillo__nucleo" r="3.2" />
    </svg>
  );
}

export default LuzAnillo;
