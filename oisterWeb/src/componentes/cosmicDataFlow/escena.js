/* ============================================================
   COSMIC DATA FLOW — GENERACIÓN DE LA ESCENA

   Aquí NO se dibuja nada. Este archivo solo decide DÓNDE está
   cada cosa; el pintado vive en dibujo.js. La separación no es
   estética: la escena se regenera solo al cambiar el tamaño de
   la ventana, mientras que el dibujo corre 60 veces por segundo.
   Mezclarlos significaría recalcular 400 posiciones de estrella
   en cada fotograma para nada.

   ---- POR QUÉ UN PRNG PROPIO Y NO Math.random ----
   La composición está pensada, no es un azar cualquiera: el
   punto focal cae donde cae, el hueco oscuro de la izquierda
   tiene que seguir vacío y las constelaciones no pueden
   solaparse con el icosaedro. Con Math.random cada recarga
   —y cada resize— daría una composición distinta y esas reglas
   se cumplirían solo a veces.

   mulberry32 con semilla fija da siempre el mismo reparto: se
   puede ajustar mirando la pantalla y lo que se ve es lo que
   verá todo el mundo. Es el mismo PRNG que usa la escena
   synthwave de /contact, por consistencia.
   ============================================================ */

export function aleatorio(semilla) {
  let a = semilla >>> 0;

  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---- PALETA ----
   En triples RGB y no en hexadecimal porque casi todo se pinta
   con opacidad variable (parpadeo, degradados de brillo,
   desvanecidos). Con hex habría que reconstruir la cadena a
   mano en cada uso; así se compone con rgba() y ya está. */
export const PALETA = {
  blanco: [255, 255, 255],
  magenta: [255, 61, 240],
  rosa: [232, 121, 249],
  violeta: [168, 85, 247],
  azul: [59, 91, 255],
  azulProfundo: [43, 30, 140],
  violetaNebulosa: [91, 33, 182],
  puntoRejilla: [160, 120, 255],
};

export const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

/* interpolación entre dos colores: las cintas van degradando a
   lo largo de la pila de líneas, del azul al violeta */
export const mezcla = (c1, c2, t) => [
  Math.round(c1[0] + (c2[0] - c1[0]) * t),
  Math.round(c1[1] + (c2[1] - c1[1]) * t),
  Math.round(c1[2] + (c2[2] - c1[2]) * t),
];

/* smoothstep: 0 antes de `a`, 1 después de `b`, con la curva
   suave en medio. Lo usan todas las máscaras de opacidad —un
   corte lineal se nota como una arista y aquí no puede haber
   ninguna. */
export function suave(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
}

/* ============================================================
   TURNOS: SOLO UNA CINTA MAGENTA A LA VEZ

   Los dos tramos magenta no conviven. Se turnan: entra uno,
   se queda un rato, se va del todo, hay un momento de vacío y
   entra el otro. Así el fondo cambia de composición cada medio
   minuto en vez de ser siempre el mismo cuadro.

   La pausa entre turnos no es un detalle: sin ella el relevo se
   lee como si una cinta se transformara en la otra. Con un par
   de segundos de vacío se lee como que una se fue y luego llegó
   otra, que es lo que se busca.

   El fundido va con `suave` (smoothstep) y no lineal. Un fundido
   lineal tiene esquinas en el arranque y en el remate, y en algo
   que dura segundos esas esquinas se ven: la cinta "sale" de
   golpe y luego frena. El smoothstep entra y sale con velocidad
   cero.
   ============================================================ */
export const TURNO = {
  entrada: 4.5,
  estancia: 9,
  salida: 4.5,
  pausa: 1.8,
};

/* cuántos turnos tiene la rueda; con 2, cada cinta se ve la
   mitad del tiempo */
const TURNOS = 2;

/* Longitud del canto blando de la ventana, en unidades de t. Es
   lo que hace que el frente no sea un corte sino una transición.
   Demasiado corto se ve como una tijera; demasiado largo y la
   cinta parece que solo cambia de opacidad, que es justo lo que
   se quería evitar. */
export const BORDE_VENTANA = 0.16;

/* ============================================================
   LA VENTANA QUE RECORRE LA CINTA

   Antes el relevo era una opacidad global: la cinta ENTERA se
   atenuaba a la vez. Se leía como un interruptor con regulador,
   no como algo que llega y se va.

   Ahora hay dos marcas que avanzan por la curva:

     · el FRENTE, que va de 0 a 1 durante la entrada y va
       destapando la cinta por delante
     · la COLA, que hace lo mismo durante la salida y la va
       borrando por detrás

   La cinta se ve solo entre las dos. Como las dos arrancan en
   t=0 —el extremo por el que la curva entra en pantalla—, el
   efecto es el de algo que fluye: entra por un lado, recorre el
   lienzo y se vacía por el mismo camino.

   Devuelve null cuando a esta cinta no le toca; quien llama lo
   usa para saltársela entera y ahorrarse sus 80 trazos.
   ============================================================ */
export function ventanaDeTurno(tiempo, turno) {
  const { entrada, estancia, salida, pausa } = TURNO;
  const largo = entrada + estancia + salida + pausa;

  /* el desfase de `entrada` hace que al cargar la página la
     primera cinta ya esté puesta, en vez de arrancar con el
     fondo vacío durante los primeros segundos */
  let t = ((tiempo + entrada) % (largo * TURNOS)) - turno * largo;
  if (t < 0) t += largo * TURNOS;

  if (t >= largo) return null; /* le toca a otra */

  if (t < entrada) return { cola: 0, frente: suave(0, entrada, t) };
  if (t < entrada + estancia) return { cola: 0, frente: 1 };
  if (t < entrada + estancia + salida) {
    return {
      cola: suave(entrada + estancia, entrada + estancia + salida, t),
      frente: 1,
    };
  }
  return null;
}

/* Cuánto se ve un punto suelto de la cinta —un núcleo de luz, un
   micro-punto de datos— según por dónde vaya la ventana. Sin
   esto seguirían encendidos en la parte que aún no ha llegado o
   que ya se ha ido. */
export function dentroDeVentana(t, ventana) {
  if (!ventana) return 0;

  /* ventana completa = la cinta no se turna (el arco azul). No
     hay nada que recortar, y devolver 1 evita que sus puntos se
     atenúen en los extremos por un efecto que no es suyo. */
  if (ventana.cola === 0 && ventana.frente === 1) return 1;

  return (
    suave(ventana.cola, ventana.cola + BORDE_VENTANA, t) *
    (1 - suave(ventana.frente - BORDE_VENTANA, ventana.frente, t))
  );
}

/* ============================================================
   LA UNIDAD DE REFERENCIA

   La composición está diseñada en vertical 2:3, y el encargo
   dice cosas como "radio ~30% del ancho". Aplicar eso tal cual
   en un monitor apaisado revienta la escena: en 2560px de ancho
   el planeta mediría 768px de radio y se comería media pantalla.

   El truco es no medir contra el ancho real sino contra el
   ancho que TENDRÍA esta composición si fuese vertical. En un
   2:3 el ancho es 0.667 × alto, así que se toma el menor de los
   dos: en vertical gana el ancho real (la composición cae tal
   cual como fue diseñada) y en apaisado gana el alto, que es lo
   que de verdad limita.
   ============================================================ */
export const unidad = (w, h) => Math.min(w, h * 0.7);

/* ---- ESTRELLAS ----
   Tres tamaños con proporciones muy desiguales a propósito: el
   cielo lo forman las pequeñas y las grandes son acentos. Si se
   reparten a partes iguales deja de leerse como un cielo y pasa
   a leerse como un patrón. */
function generarEstrellas(w, h, cuantas, rnd) {
  const estrellas = [];

  for (let i = 0; i < cuantas; i++) {
    const r = rnd();
    const tipo = r < 0.78 ? 0 : r < 0.96 ? 1 : 2;

    const c = rnd();
    const color =
      c < 0.72 ? PALETA.blanco : c < 0.88 ? PALETA.rosa : PALETA.azul;

    estrellas.push({
      x: rnd() * w,
      y: rnd() * h,
      tipo,
      radio: tipo === 0 ? 0.5 : tipo === 1 ? 1.5 : 2.5,
      color,

      /* opacidad de reposo: las pequeñas nunca llegan a blanco
         puro, si no el cielo compite con el primer plano */
      base: tipo === 0 ? 0.3 + rnd() * 0.3 : 0.45 + rnd() * 0.35,

      /* cada una con su propio periodo y su propia fase: si
         comparten reloj parpadean todas a la vez y se ve el
         truco al instante */
      periodo: 2 + rnd() * 4,
      fase: rnd() * Math.PI * 2,

      /* deriva vertical mínima. No es "movimiento", es evitar
         que el cielo quede clavado como una textura */
      deriva: 1.5 + rnd() * 4,
    });
  }

  return estrellas;
}

/* ---- CONSTELACIONES ----
   Nodos agrupados en zonas concretas y unidos SOLO si están
   cerca. El umbral es lo que hace que se lea como constelación
   y no como grafo: uniendo todos con todos sale una maraña. */
function generarConstelaciones(w, h, rnd) {
  /* Las zonas evitan a propósito el icosaedro (0.78, 0.20) y el
     hueco oscuro de la izquierda, que tiene que quedar limpio
     para el contenido. */
  const zonas = [
    { cx: 0.93, cy: 0.09, r: 0.1, nodos: 7 },
    { cx: 0.12, cy: 0.08, r: 0.09, nodos: 6 },
    { cx: 0.86, cy: 0.79, r: 0.12, nodos: 9 },
  ];

  return zonas.map((z) => {
    const nodos = [];

    for (let i = 0; i < z.nodos; i++) {
      /* reparto en disco con sqrt: sin él los puntos se apelotonan
         en el centro, porque el área crece con el cuadrado del radio */
      const ang = rnd() * Math.PI * 2;
      const rad = Math.sqrt(rnd()) * z.r;

      nodos.push({
        x: (z.cx + Math.cos(ang) * rad) * w,
        y: (z.cy + Math.sin(ang) * rad * 1.15) * h,
        radio: 2 + rnd() * 2,
        periodo: 3 + rnd() * 3,
        fase: rnd() * Math.PI * 2,
      });
    }

    const umbral = z.r * 1.05 * Math.min(w, h);
    const aristas = [];

    for (let i = 0; i < nodos.length; i++) {
      for (let j = i + 1; j < nodos.length; j++) {
        const d = Math.hypot(nodos[i].x - nodos[j].x, nodos[i].y - nodos[j].y);
        if (d < umbral) aristas.push([i, j, 1 - d / umbral]);
      }
    }

    return { nodos, aristas };
  });
}

/* ============================================================
   LAS CINTAS — el elemento protagonista

   Cada cinta es una curva de Bézier cúbica que se dibuja MUCHAS
   veces en paralelo, desplazando cada copia a lo largo de la
   normal. Esa pila de líneas finas es lo que se lee como una
   superficie de seda: no hay relleno en ninguna parte, la
   sensación de volumen sale solo de la densidad de las líneas.

   Dos movimientos superpuestos, y hacen falta los dos:

   · Los PUNTOS DE CONTROL orbitan despacio (12-20s). Esto mueve
     la cinta entera por el lienzo.
   · El DESPLAZAMIENTO de cada línea se modula con un seno cuyo
     desfase depende del índice de la línea. Esto es lo que
     ondula la tela sobre sí misma. Sin esto la cinta se
     desplaza rígida, como un cable.
   ============================================================ */
function generarCintas(w, h, movil) {
  /* Coordenadas normalizadas: se multiplican por w y h al usarlas,
     así la composición se mantiene a cualquier tamaño. Los puntos
     de entrada y salida están FUERA del lienzo (valores negativos
     o >1) para que las cintas no empiecen ni acaben a la vista. */
  return [
    {
      nombre: "A",
      control: [
        { x: -0.06, y: 0.1 },
        { x: 0.5, y: 0.18 },
        { x: 0.3, y: 0.4 },
        { x: -0.06, y: 0.5 },
      ],
      /* amplitud y periodo de la órbita de cada punto de control */
      orbita: [
        { a: 0.01, p: 17 },
        { a: 0.045, p: 14 },
        { a: 0.04, p: 19 },
        { a: 0.012, p: 16 },
      ],
      /* La A se quedó como estaba: reparto uniforme, sin
         conicidad y trazo de 1px. El retoque de la seda es solo
         para la B. */
      lineas: movil ? 26 : 48,
      ancho: 0.052,
      reparto: "uniforme",
      anchoIni: 1,
      anchoFin: 1,
      trazo: 1,
      desde: PALETA.azul,
      hasta: PALETA.violeta,
      opacidad: 0.3,
      rizo: 0.38,
      frecuencia: 1.6,
      velOnda: 0.55,
      desfase: 2.6,
      /* dónde va el núcleo de luz, en t de la curva */
      nucleos: [{ t: 0.46, radio: 0.1, fuerza: 0.5 }],
      datos: movil ? 10 : 22,
    },
    /* ============================================================
       LA CINTA QUE DESAPARECE Y VUELVE — dos tramos, no uno

       Antes era UNA curva con un hueco de opacidad por el medio.
       El problema es que al reaparecer seguía exactamente la
       misma trayectoria, así que no se leía como que hubiera
       pasado por detrás de nada: se leía como una cinta continua
       a la que le faltaba un trozo.

       Con dos tramos independientes el ángulo de reaparición es
       un valor que se elige, no algo que se hereda de la curva
       anterior. El B baja casi en vertical y se apaga; el C
       vuelve a entrar por el borde DERECHO casi en horizontal.
       Esa diferencia de ángulo —unos 70° medidos en las
       tangentes— es justo lo que hace pensar que la cinta ha
       ido por detrás y ha salido por otro sitio.

       Comparten estilo (color, rizo, opacidad) para que se lean
       como la misma pieza; lo único que cambia es por dónde van.
       ============================================================ */
    {
      nombre: "B",

      /* se turna con la C: nunca están las dos a la vez */
      turno: 0,

      /* TRAMO DE ENTRADA: llega de arriba a la derecha, describe
         el arco y se endereza hasta caer casi en vertical.

         ---- LOS DOS EXTREMOS VAN FUERA DEL LIENZO ----
         Terminaba en (0.60, 0.68), o sea DENTRO de la pantalla, y
         se leía como cortada: el trazo se paraba en seco y
         dejaba un muñón. Ahora sigue hasta (0.42, 1.05), por
         debajo del borde, y para cuando llegaría ahí ya se ha
         desvanecido del todo. El ojo no ve dónde acaba, que es
         justo lo que hace que se lea completa. */
      control: [
        { x: 1.14, y: -0.1 },
        { x: 0.42, y: 0.16 },
        { x: 0.72, y: 0.4 },
        { x: 0.42, y: 1.05 },
      ],
      orbita: [
        { a: 0.02, p: 20 },
        { a: 0.05, p: 13 },
        { a: 0.04, p: 16.5 },
        { a: 0.02, p: 18 },
      ],
      lineas: movil ? 40 : 80,
      ancho: 0.1,
      reparto: "seno",
      trazo: 0.85,
      caida: 1.3,

      /* estrecho arriba (lejos), ancho abajo (cerca) */
      anchoIni: 0.5,
      anchoFin: 1,

      desde: PALETA.magenta,
      hasta: PALETA.rosa,

      /* Más opaca que la cinta A pese a llevar más líneas, que es
         al revés de lo que uno esperaría. El motivo es el fondo:
         la A es azul sobre nebulosa violeta y contrasta sola,
         mientras que esta es magenta sobre la mancha magenta de
         la nebulosa y a 0.36 desaparecía. */
      opacidad: 0.64,

      rizo: 0.46,
      frecuencia: 1.25,
      velOnda: -0.42,
      desfase: 3.4,

      /* El apagado ocupa un TERCIO del recorrido (de 0.55 a 0.9),
         no un tramo corto al final. Sobre la pantalla eso son
         cientos de píxeles de disolución: la cinta se va
         diluyendo mientras baja, como si se perdiera en la
         distancia. Comprimido en el último trozo se veía como un
         corte con degradado, que es otra cosa. */
      envolvente: [
        [0, 0],
        [0.12, 1],
        [0.55, 1],
        [0.9, 0.02],
        [1, 0],
      ],

      /* EL PUNTO FOCAL, justo antes del apagado: la cinta llega
         a su punto más brillante y acto seguido se va. */
      nucleos: [{ t: 0.45, radio: 0.11, fuerza: 0.8 }],
      datos: movil ? 12 : 24,
    },
    {
      nombre: "C",
      turno: 1,

      /* TRAMO DE REAPARICIÓN: entra por el borde DERECHO casi en
         horizontal —la tangente inicial es (−0.50, +0.04)— y
         desde ahí gira hacia abajo. Ese ángulo de entrada es lo
         que la distingue del tramo B, que en su último tramo iba
         cayendo casi a plomo. */
      control: [
        { x: 1.2, y: 0.58 },
        { x: 0.7, y: 0.62 },
        { x: 0.8, y: 0.95 },
        { x: 0.3, y: 1.16 },
      ],
      orbita: [
        { a: 0.025, p: 15 },
        { a: 0.045, p: 21 },
        { a: 0.04, p: 17 },
        { a: 0.02, p: 14 },
      ],
      lineas: movil ? 34 : 66,
      ancho: 0.115,
      reparto: "seno",
      trazo: 0.85,
      caida: 1.3,

      /* este tramo va entero en primer plano, así que apenas
         se estrecha */
      anchoIni: 0.95,
      anchoFin: 1.2,

      desde: PALETA.magenta,
      hasta: PALETA.rosa,
      opacidad: 0.64,

      rizo: 0.42,
      frecuencia: 1.1,
      velOnda: -0.36,
      desfase: 3.1,

      /* entra fundiéndose, no de golpe: un canto duro delataría
         que empieza justo ahí */
      envolvente: [
        [0, 0],
        [0.2, 1],
        [0.86, 1],
        [1, 0],
      ],

      nucleos: [{ t: 0.26, radio: 0.075, fuerza: 0.4 }],
      datos: movil ? 10 : 20,
    },
  ].map((c) => ({
    ...c,
    /* a píxeles ya, para no repetir la multiplicación 60 veces
       por segundo dentro del bucle de dibujo */
    anchoPx: c.ancho * Math.min(w, h) * 2,
    puntosDato: generarPuntosDato(c, w, h),
    ...carrilesDeCinta(c),
  }));
}

/* ============================================================
   DÓNDE VA CADA LÍNEA Y DE QUÉ COLOR

   Todo esto depende solo del índice de la línea, que no cambia
   nunca. Calcularlo en el bucle de dibujo sería montar ~150
   cadenas "rgba(...)" por fotograma —9.000 por segundo— para
   obtener siempre exactamente las mismas.

   ---- EL REPARTO NO ES UNIFORME, Y ESE ES EL TRUCO ----
   La primera versión repartía las líneas a distancia constante
   (s = k/n − 0.5) y el resultado se leía como una persiana: una
   banda de rayas paralelas, plana.

   El motivo es geométrico. Imagina hilos paralelos y
   equiespaciados enrollados sobre un cilindro: al proyectarlos
   en la pantalla NO caen equiespaciados. Los del centro, de
   cara, se ven separados; los del borde, donde la superficie se
   gira de canto, se apiñan hasta juntarse. Esa proyección es
   exactamente un seno.

       s = sin(ángulo) / 2      con ángulo de −90° a +90°

   Cambiar la recta por ese seno es lo que convierte la banda
   plana en una superficie con volumen, sin tocar nada más.

   ---- Y POR QUÉ EL BRILLO LLEVA UN COSENO ----
   Al apiñarse las líneas en los bordes hay muchísima más tinta
   por píxel y el canto se enciende como un tubo de neón. El
   coseno es justo la inversa de esa densidad, así que la
   compensa. Elevarlo (`caida`) compensa DE MÁS a propósito:
   deja el brillo máximo en el centro y lo apaga hacia los
   filos, que es lo que da el borde suave. Con exponente 1 la
   cinta tendría brillo plano y un corte recto en el canto.

   El valor está en 1.3 y no más alto porque el exponente y la
   anchura tiran en sentidos contrarios: a 1.8 se comía tanto
   canto que la cinta quedaba en un hilo, y hubo que ensancharla
   para recuperar presencia. Si tocas uno, revisa el otro.
   ============================================================ */
function carrilesDeCinta(c) {
  const carriles = new Float32Array(c.lineas);
  const colores = [];
  const tabla = [];
  const transparente = [];

  for (let k = 0; k < c.lineas; k++) {
    const u = k / (c.lineas - 1);
    let brillo;

    if (c.reparto === "seno") {
      const angulo = (u - 0.5) * Math.PI;
      carriles[k] = Math.sin(angulo) * 0.5;
      brillo = Math.pow(Math.abs(Math.cos(angulo)), c.caida);
    } else {
      /* Reparto uniforme, el de siempre: las líneas caen a
         distancia igual y el canto se apaga con un smoothstep.
         Se lee más gráfico y menos volumétrico —y para el arco
         azul es lo que se quería. */
      carriles[k] = u - 0.5;
      brillo = 1 - suave(0.55, 1, Math.abs(u - 0.5) * 2) * 0.9;
    }

    const color = mezcla(c.desde, c.hasta, u);
    const alfa = c.opacidad * brillo;

    colores.push(rgba(color, +alfa.toFixed(4)));

    /* ---- LAS PARADAS DEL DEGRADADO, YA MONTADAS ----
       Cuando la cinta lleva envolvente, cada línea no se pinta
       de un color plano sino de un degradado a lo largo del
       recorrido. Un stroke() admite un único estilo, así que es
       la única forma de que una MISMA línea esté visible en un
       tramo e invisible en otro sin partirla en trozos.

       Las cadenas se construyen aquí, una vez. Montarlas en el
       bucle de dibujo serían 88 líneas × 7 paradas = 616 cadenas
       por fotograma, 37.000 por segundo, siempre idénticas. */
    /* ---- TABLA DE COLOR, PARA PODER CORTAR POR CUALQUIER SITIO ----
       La ventana que recorre la cinta empieza y acaba en
       posiciones que cambian en cada fotograma, así que hace
       falta el color de la envolvente en CUALQUIER punto, no
       solo en sus vértices.

       Se tabula a RESOLUCION pasos. El error de cuantización es
       de 1/32 del recorrido y cae dentro del canto blando de la
       ventana, o sea que es invisible. La alternativa —montar
       las cadenas rgba() en el bucle de dibujo— serían decenas
       de miles de cadenas por segundo. */
    if (c.envolvente) {
      const fila = [];
      for (let j = 0; j <= RESOLUCION; j++) {
        const m = envolventeEn(c.envolvente, j / RESOLUCION);
        fila.push(rgba(color, +(alfa * m).toFixed(4)));
      }
      tabla.push(fila);
      transparente.push(rgba(color, 0));
    }
  }

  return c.envolvente
    ? { carriles, colores, tabla, transparente }
    : { carriles, colores };
}

/* pasos de la tabla de color de arriba */
export const RESOLUCION = 32;

/* La envolvente evaluada en un punto suelto, interpolando entre
   paradas. La necesitan los micro-puntos de datos: sin esto
   seguirían brillando en el tramo donde la cinta ha
   desaparecido, y se verían flotando en el vacío. */
export function envolventeEn(envolvente, t) {
  if (!envolvente) return 1;

  for (let i = 1; i < envolvente.length; i++) {
    const [p1, v1] = envolvente[i];
    if (t <= p1) {
      const [p0, v0] = envolvente[i - 1];
      const k = (t - p0) / (p1 - p0 || 1);
      return v0 + (v1 - v0) * k;
    }
  }

  return envolvente[envolvente.length - 1][1];
}

/* micro-puntos que recorren la cinta: la lectura de "datos
   fluyendo" viene de aquí, no de las líneas (que son estáticas
   en su recorrido). Cada uno viaja a su ritmo y en su carril. */
function generarPuntosDato(cinta, w, h) {
  const rnd = aleatorio(cinta.nombre === "A" ? 4021 : 9137);
  const puntos = [];

  for (let i = 0; i < cinta.datos; i++) {
    puntos.push({
      t0: rnd(),
      /* carril dentro de la pila, en el mismo -0.5..0.5 que las líneas */
      s: rnd() - 0.5,
      velocidad: (0.035 + rnd() * 0.07) * (rnd() < 0.5 ? 1 : -1),
      radio: (0.9 + rnd() * 1.1) * Math.min(1, Math.min(w, h) / 700),
      brillo: 0.5 + rnd() * 0.5,
    });
  }

  return puntos;
}

/* ============================================================
   ICOSAEDRO

   Los 12 vértices de un icosaedro son las permutaciones
   cíclicas de (0, ±1, ±φ) con φ = razón áurea. Las aristas no
   se escriben a mano: se buscan los pares de vértices que están
   a la distancia MÍNIMA entre sí, que en un sólido regular son
   exactamente las 30 aristas. Escribir 30 pares de índices a
   mano es una lista que nadie puede revisar de un vistazo; esto
   se comprueba solo.
   ============================================================ */
function generarIcosaedro() {
  const f = (1 + Math.sqrt(5)) / 2;

  const vertices = [];
  for (const s1 of [-1, 1]) {
    for (const s2 of [-1, 1]) {
      vertices.push({ x: 0, y: s1, z: s2 * f });
      vertices.push({ x: s1, y: s2 * f, z: 0 });
      vertices.push({ x: s1 * f, y: 0, z: s2 });
    }
  }

  /* normaliza a radio 1 para que el tamaño no dependa de φ */
  const norma = Math.hypot(1, f);
  for (const v of vertices) {
    v.x /= norma;
    v.y /= norma;
    v.z /= norma;
  }

  let minimo = Infinity;
  const distancias = [];

  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const d = Math.hypot(
        vertices[i].x - vertices[j].x,
        vertices[i].y - vertices[j].y,
        vertices[i].z - vertices[j].z
      );
      distancias.push([i, j, d]);
      if (d < minimo) minimo = d;
    }
  }

  /* margen del 1%: comparar flotantes con === no encuentra nada */
  const aristas = distancias
    .filter(([, , d]) => d < minimo * 1.01)
    .map(([i, j]) => [i, j]);

  return { vertices, aristas };
}

/* ============================================================
   LA ESCENA COMPLETA
   ============================================================ */
export function crearEscena(w, h, movil) {
  const rnd = aleatorio(20260806);
  const U = unidad(w, h);

  /* Densidad por ÁREA, no un número fijo. Con un número fijo el
     mismo cielo se ve ralo en un monitor grande y saturado en un
     móvil. La referencia es 1440×900. En móvil, la mitad. */
  const factor = (w * h) / (1440 * 900);
  const cuantas = Math.round((movil ? 190 : 380) * Math.min(2, Math.max(0.45, factor)));

  return {
    w,
    h,
    U,
    movil,
    estrellas: generarEstrellas(w, h, cuantas, rnd),
    constelaciones: generarConstelaciones(w, h, rnd),
    cintas: generarCintas(w, h, movil),
    /* ---- POR QUÉ AQUÍ Y NO EN (0.78, 0.20) ----
       Ahí se montaba encima de la cinta B: al entrar por arriba
       a la derecha, a esa altura la cinta va por x≈0.67 con sus
       ±0.07 de anchura, o sea que le pasaba justo por debajo y
       las aristas se perdían contra las líneas.

       (0.90, 0.38) es el hueco que queda entre las dos cintas
       magenta. Comprobado contra las cuatro cosas que hay cerca:

       · cinta B  — a esa altura va por x 0.56–0.70; quedan 216px
       · cinta C  — arranca en y≈0.55; el destello llega a 0.51
       · constelación de arriba a la derecha (0.93, 0.09) — sus
         nodos bajan hasta y≈0.205, el destello sube a 0.25
       · constelación de abajo (0.86, 0.79) — muy lejos

       El destello en cruz llega a 1.85 radios, así que el margen
       hay que medirlo contra ESO y no contra el sólido. */
    icosaedro: {
      ...generarIcosaedro(),
      cx: 0.9 * w,
      cy: 0.38 * h,
      radio: 0.1 * U,

      /* ---- QUIÉN DESTELLA Y CUÁNDO ----
         Antes había dos vértices fijos con destello permanente.
         Como además solo se enciende el que está de cara, en la
         práctica casi siempre se veía el mismo, y el sólido
         parecía tener una bombilla soldada en un pico.

         Ahora los DOCE pueden destellar, cada uno con su propio
         periodo y su propia fase. Los periodos salen de un rango
         con decimales (5.5 a 13.5 s) a propósito: si fuesen
         enteros acabarían coincidiendo cada pocos segundos y se
         vería el patrón. Así no vuelven a alinearse nunca en la
         práctica.

         `fuerza` desiguala además el brillo, para que no parezca
         que es siempre el mismo destello cambiando de sitio. */
      chispas: Array.from({ length: 12 }, () => ({
        periodo: 5.5 + rnd() * 8,
        fase: rnd(),
        fuerza: 0.55 + rnd() * 0.45,
      })),
    },
    /* El centro cae FUERA del lienzo por abajo: lo que se ve es
       solo el casquete superior, que es lo que lo hace leer como
       un planeta enorme cortado por el encuadre y no como un
       círculo pequeño en una esquina.

       Con radio 0.3·U asomaban 135px y no se distinguía del
       fondo; con 0.42 asoman ~250px y ya se lee el limbo. */
    planeta: {
      cx: 0.02 * w,
      cy: h + 0.02 * h,
      radio: 0.42 * U,
    },
  };
}
