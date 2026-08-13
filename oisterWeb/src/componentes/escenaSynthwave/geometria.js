/* ============================================================
   ESCENA SYNTHWAVE — geometría y generadores

   Todo lo que aquí se calcula es DETERMINISTA: mismas entradas,
   mismo dibujo. Ver `aleatorio()` unas líneas más abajo para el
   porqué, que no es un detalle menor.
   ============================================================ */

/* ---- LIENZO ----
   1600×900 y no porcentajes: con números grandes las cuentas de
   perspectiva salen en unidades cómodas y el SVG se escala solo
   al tamaño que haga falta. */
export const LIENZO = { ancho: 1600, alto: 900 };

/* El horizonte al 65%: deja un cielo de 585px (el ~70% que pide
   el documento, contando el halo que lo invade) y un suelo de
   315px (~35%). */
export const HORIZONTE = Math.round(LIENZO.alto * 0.65);
export const SUELO = LIENZO.alto - HORIZONTE;

/* El punto de fuga, en el centro exacto del lienzo. Todo
   converge aquí. */
export const FUGA = { x: LIENZO.ancho / 2, y: HORIZONTE };

/* ============================================================
   ALEATORIEDAD REPETIBLE

   `Math.random()` NO sirve aquí, y no por gusto:

   · en React, el componente se puede volver a renderizar en
     cualquier momento; con Math.random las estrellas saltarían
     de sitio en cada render;
   · si algún día el sitio se renderiza en servidor, el HTML del
     servidor y el del cliente no coincidirían y React avisaría
     de un desajuste de hidratación.

   Este generador (mulberry32) da una secuencia que PARECE
   aleatoria pero depende solo de la semilla: mismo número,
   mismas estrellas, siempre. Y cambiando la semilla se obtiene
   otro cielo entero.
   ============================================================ */
export function aleatorio(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================================================
   CAPA 2 — ESTRELLAS

   Más arriba que abajo, sin patrones y sin alinearse.

   El reparto vertical no es uniforme: se eleva la aleatoria a
   una potencia, y eso empuja los valores hacia el 0 (arriba).
   Con un reparto plano el cielo se vería igual de poblado junto
   al horizonte, y ahí la luz debería apagarlas.
   ============================================================ */
export function generarEstrellas(cantidad = 380, semilla = 20260806) {
  const rnd = aleatorio(semilla);
  const estrellas = [];

  for (let i = 0; i < cantidad; i++) {
    /* ^2.1 concentra el reparto hacia arriba */
    const t = Math.pow(rnd(), 2.1);
    const y = t * HORIZONTE * 0.94;

    /* las de cerca del horizonte se apagan: es donde el halo las
       borraría de verdad */
    const cercania = 1 - y / (HORIZONTE * 0.94);

    /* ---- CUATRO TIPOS, NO UNO ----
       Antes todas eran el mismo círculo con el radio y la
       opacidad sorteados, y eso da un cielo monótono: se lee
       como un patrón de puntos, no como estrellas.

       El reparto está pensado para que domine lo pequeño, que es
       lo que hace que las pocas grandes destaquen:
           polvo    62%  ·  minúsculas, casi imperceptibles
           normal   26%  ·  el grueso del cielo
           difusa    7%  ·  con un halo suave, como fuera de foco
           brillante 5%  ·  con resplandor y punto blanco */
    const dado = rnd();
    let tipo, r, brillo;

    if (dado < 0.62) {
      tipo = "polvo";
      r = 0.35 + rnd() * 0.45;
      brillo = 0.1 + rnd() * 0.3;
    } else if (dado < 0.88) {
      tipo = "normal";
      r = 0.8 + rnd() * 0.7;
      brillo = 0.32 + rnd() * 0.4;
    } else if (dado < 0.95) {
      tipo = "difusa";
      r = 1.3 + rnd() * 1.1;
      brillo = 0.28 + rnd() * 0.3;
    } else {
      tipo = "brillante";
      r = 1.1 + rnd() * 1.3;
      brillo = 0.7 + rnd() * 0.3;
    }

    /* ---- EL DESTELLO ----
       Un chispazo breve cada ~30 segundos. Tres decisiones que
       importan:

       · NO destellan todas. Solo lo hacen las brillantes y las
         difusas, más una de cada seis normales: unas 80 de 380.
         Con las 380 animadas el cielo hierve, y además serían
         380 elementos repintándose cada fotograma.

       · El retraso se reparte por TODO el ciclo (0-30s). Sin
         eso, todas las que compartan duración destellan a la
         vez y el cielo parpadea entero de golpe.

       · La duración varía entre 24 y 36s. Si todas midieran 30
         exactos, las que arrancan con el mismo retraso quedarían
         acompasadas para siempre; variándola, cada una va por su
         cuenta aunque coincidan al principio. */
    const destella =
      tipo === "brillante" || tipo === "difusa" || rnd() < 0.167;

    estrellas.push({
      x: rnd() * LIENZO.ancho,
      y,
      r: +r.toFixed(2),
      o: +(brillo * (0.22 + cercania * 0.78)).toFixed(3),
      tipo,
      destella,
      retraso: destella ? +(rnd() * 30).toFixed(2) : 0,
      duracion: destella ? +(24 + rnd() * 12).toFixed(2) : 0,
    });
  }

  return estrellas;
}

/* ============================================================
   CAPA 12 — POLVO ATMOSFÉRICO

   Bokeh: círculos grandes, muy desenfocados y casi
   transparentes. No son estrellas —son mucho mayores y viven
   más abajo, cerca del horizonte— y su trabajo es meter un
   plano intermedio entre el cielo y el suelo.

   El documento pide entre un 5% y un 10% de opacidad: por
   encima dejan de leerse como aire y empiezan a parecer
   manchas.
   ============================================================ */
export function generarBokeh(cantidad = 34, semilla = 7788) {
  const rnd = aleatorio(semilla);
  const motas = [];

  for (let i = 0; i < cantidad; i++) {
    /* ---- DOS ALTURAS, NO UNA ----
       Antes todas se agolpaban junto al horizonte y el centro
       del cielo se quedaba vacío. Una cuarta parte sube ahora a
       la zona alta: son más pequeñas y más tenues, porque ahí
       arriba no llega la luz del horizonte y unas motas grandes
       se leerían como manchas. */
    const arriba = rnd() < 0.28;

    if (arriba) {
      motas.push({
        x: rnd() * LIENZO.ancho,
        y: HORIZONTE * (0.05 + rnd() * 0.42),
        r: 4 + Math.pow(rnd(), 2.2) * 20,
        o: +(0.03 + rnd() * 0.035).toFixed(3),
      });
    } else {
      const t = Math.pow(rnd(), 0.55);
      motas.push({
        x: rnd() * LIENZO.ancho,
        y: HORIZONTE * (0.32 + t * 0.72),
        r: 6 + Math.pow(rnd(), 2) * 42,
        o: +(0.05 + rnd() * 0.05).toFixed(3),
      });
    }
  }

  return motas;
}

/* ============================================================
   CAPA 4b — VETAS DEL CIELO

   Franjas luminosas sobre el horizonte. El documento señalaba
   que las del halo salían "demasiado uniformes": son elipses
   concéntricas, así que por fuerza se ven como anillos
   regulares.

   Estas van sueltas, cada una con su largo, grosor, altura,
   posición y opacidad. Sin simetría y sin repetición, que es lo
   que hace que se lean como un fenómeno atmosférico y no como
   una decoración dibujada.
   ============================================================ */
export function generarVetas(cantidad = 9, semilla = 4242) {
  const rnd = aleatorio(semilla);
  const vetas = [];

  for (let i = 0; i < cantidad; i++) {
    const alto = 2 + Math.pow(rnd(), 2) * 13;
    vetas.push({
      /* repartidas a lo ancho pero nunca centradas: el centro es
         donde el halo ya es más intenso y una veta ahí solo
         añadiría ruido */
      cx: LIENZO.ancho * (0.08 + rnd() * 0.84),
      /* justo encima del horizonte, en los 120px de cielo bajo */
      cy: HORIZONTE - 8 - Math.pow(rnd(), 1.6) * 118,
      rx: LIENZO.ancho * (0.06 + Math.pow(rnd(), 1.4) * 0.3),
      ry: +alto.toFixed(1),
      o: +(0.05 + rnd() * 0.22).toFixed(3),
    });
  }

  return vetas;
}

/* ============================================================
   CAPA 3 — NUBES

   Cada nube es un `path` con la base plana y el lomo lleno de
   bultos, construido con curvas de Bézier. Se superponen varias
   por nube (ver EscenaSynthwave.jsx) para dar volumen: el
   documento pide expresamente que no sea una sola forma.
   ============================================================ */
export function nubePath({ x, y, ancho, alto, bultos, rnd }) {
  const paso = ancho / bultos;
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;

  for (let i = 0; i < bultos; i++) {
    const bx = x + i * paso;
    /* cada bulto tiene su altura: sin variación se lee como una
       cenefa repetida, no como vapor */
    const h = alto * (0.42 + rnd() * 0.58);
    /* y su cima descentrada, para que no salgan simétricos */
    const sesgo = (rnd() - 0.5) * paso * 0.5;

    d +=
      ` C ${(bx + paso * 0.12 + sesgo).toFixed(1)} ${(y - h).toFixed(1)},` +
      ` ${(bx + paso * 0.88 + sesgo).toFixed(1)} ${(y - h).toFixed(1)},` +
      ` ${(bx + paso).toFixed(1)} ${y.toFixed(1)}`;
  }

  return `${d} Z`;
}

/* ============================================================
   CAPA 6 — REJILLA DEL SUELO

   Perspectiva de un punto, con la geometría CORRECTA — el
   documento lo pide expresamente ("no utilizar perspectiva
   falsa").

   ---- LAS TRAVIESAS ----
   Para una cámara que mira al horizonte, un punto del suelo a
   distancia d se proyecta a:

       y = horizonte + C / d

   Eligiendo C = alto del suelo, la fila d=1 cae justo en el
   borde inferior y las siguientes se comprimen solas hacia el
   horizonte: alto/2, alto/3, alto/4… Esa compresión no se
   inventa ni se ajusta a ojo, sale de la fórmula.

   ---- LAS VERTICALES ----
   Rectas paralelas en el mundo real, separadas por igual. Se
   proyectan como rectas que pasan TODAS por el punto de fuga y
   cortan el borde inferior a distancias iguales. Así que basta
   trazar de la fuga a puntos repartidos de forma pareja abajo.
   ============================================================ */
/* ============================================================
   UNA SOLA RETÍCULA

   ---- EL PROBLEMA QUE RESUELVE ----
   Antes las traviesas y las verticales se generaban por caminos
   independientes: las filas con la fórmula de la perspectiva y
   las columnas repartiendo un abanico "a ojo". El resultado,
   medido, era una celda de primer plano de 86,7 × 157,5px —
   proporción 1,82 : 1, casi el doble de alta que de ancha. La
   cuadrícula no era una cuadrícula.

   ---- LA CORRECCIÓN ----
   Todo sale ahora de UN número: CELDA, el lado del cuadro en
   unidades del mundo. De él se derivan las dos familias, así que
   no pueden discrepar.

   Las cuentas, para que se puedan comprobar:

     una fila a distancia d se proyecta en
         y = HORIZONTE + A / d           con A = SUELO
     (así la fila d=1 cae exactamente en el borde inferior)

     una vertical a distancia lateral X se proyecta en
         x = FUGA.x + B · X / d

   Para que el cuadro de primer plano salga CUADRADO, su ancho y
   su alto tienen que coincidir:
         ancho = B · CELDA
         alto  = A/1 − A/(1+CELDA) = A · CELDA / (1+CELDA)
   Igualando:
         B = A / (1 + CELDA)

   Esa línea es toda la corrección. Con ella la celda cercana es
   cuadrada por construcción, no por ajuste.

   ---- Y LO QUE **NO** HAY QUE "ARREGLAR" ----
   Hacia el fondo las celdas se aplastan: el alto encoge con 1/d²
   y el ancho solo con 1/d. Eso NO es un defecto — es lo que hace
   un suelo real, y es justo lo que da la sensación de
   profundidad. Forzarlas a seguir cuadradas sería perspectiva
   falsa y el suelo se vería como una pared inclinada.
   ============================================================ */

/* el lado del cuadro, en unidades del mundo. Más pequeño =
   cuadrícula más densa, y las dos familias se densifican a la
   vez, así que la celda sigue siendo cuadrada. */
const CELDA = 0.4;

/* factor de la escala horizontal, despejado de la igualdad de
   arriba. NO se toca a mano: depende de CELDA. */
const B = SUELO / (1 + CELDA);

/* Las traviesas. `filas` es cuántas se trazan hacia el fondo;
   por encima de ~22 el hueco entre ellas baja de 1,5px y solo
   añaden carga. */
export function generarTraviesas(filas = 22) {
  const ys = [];
  for (let k = 0; k < filas; k++) {
    const d = 1 + k * CELDA;
    ys.push(+(HORIZONTE + SUELO / d).toFixed(2));
  }
  /* de lejos a cerca, para que el orden del DOM siga al de la
     escena y las animaciones escalonadas salgan naturales */
  return ys.reverse();
}

/* Las filas intermedias van a MEDIA CELDA de distancia, no a
   medio camino en pantalla. Colocarlas en el punto medio visual
   sería perspectiva falsa: quedarían demasiado bajas cerca del
   horizonte. */
export function generarTraviesasSecundarias(filas = 22) {
  const ys = [];
  for (let k = 0; k < filas - 1; k++) {
    const d = 1 + (k + 0.5) * CELDA;
    ys.push(+(HORIZONTE + SUELO / d).toFixed(2));
  }
  return ys.reverse();
}

/* ============================================================
   LAS VERTICALES — dos tramos, una sola retícula

   ---- EL PROBLEMA ----
   Con la retícula parando en la columna 24, la línea más abierta
   moría en x = −1360 y cruzaba el borde izquierdo a y = 702.
   Como el suelo empieza en 585, eso deja 117px —el 37% de la
   altura del suelo— donde el lateral tiene traviesas pero NINGUNA
   vertical. La cuadrícula se deshacía justo en las esquinas.

   ---- POR QUÉ NO BASTA CON PONER MÁS COLUMNAS ----
   Para que una vertical cruce el lateral cerca del horizonte
   tiene que morir lejísimos: llegar a y=600 exige la columna
   178, o sea 356 líneas, y 340 de ellas jamás asoman por el
   borde inferior. Sería tirar geometría a la basura.

   ---- LA SOLUCIÓN ----
   Dos tramos de la MISMA retícula, muestreada a distinta
   frecuencia:

     · CERCA (|k| ≤ 24) — todas, una por celda. Es el tramo que
       se ve en el borde inferior, donde la uniformidad importa
       porque las celdas son grandes y cualquier salto cantaría.

     · LEJOS (|k| > 24) — una de cada cuatro, hasta la 120. Ahí
       las líneas convergen tan juntas que saltarse tres no se
       distingue: al cruzar el lateral quedan a 16px, luego 12,
       luego 9… y siguen bajando.

   No es una retícula distinta ni un parche: son columnas del
   mismo mundo, solo que muestreadas más espaciadas donde la
   perspectiva ya las ha comprimido. La celda de primer plano
   sigue siendo cuadrada y ninguna zona visible cambia de
   densidad. */
export function generarVerticales(columnas = 24, lejos = 120, salto = 4) {
  const paso = B * CELDA; /* el ancho de la celda en el borde inferior */
  const xs = [];

  for (let k = -columnas; k <= columnas; k++) {
    xs.push(+(FUGA.x + k * paso).toFixed(2));
  }

  for (let k = columnas + salto; k <= lejos; k += salto) {
    xs.push(+(FUGA.x + k * paso).toFixed(2));
    xs.push(+(FUGA.x - k * paso).toFixed(2));
  }

  return xs;
}

/* Las secundarias solo en el tramo cercano: su papel es dar
   detalle donde las celdas son grandes. Extenderlas al tramo
   lejano solo añadiría líneas donde ya no se distinguen. */
export function generarVerticalesSecundarias(columnas = 24) {
  const paso = B * CELDA;
  const xs = [];
  for (let k = -columnas; k < columnas; k++) {
    xs.push(+(FUGA.x + k * paso + paso / 2).toFixed(2));
  }
  return xs;
}
