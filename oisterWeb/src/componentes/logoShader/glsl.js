/* ============================================================
   SHADERS DEL LOGO

   En un archivo aparte porque son texto GLSL, no JavaScript:
   mezclados con la lógica de WebGL no hay forma de leer ninguna
   de las dos cosas.

   ---- OJO AL ESCRIBIR AQUÍ ----
   Todo esto vive dentro de plantillas de JavaScript, así que ni
   backticks ni ${...} ni siquiera dentro de los comentarios: un
   backtick en un comentario CIERRA la plantilla y el archivo
   deja de parsear, con un error que apunta a una línea que no
   tiene nada que ver. Ya pasó una vez.
   ============================================================ */

export const VERTICE = `
attribute vec2 posicion;
varying vec2 uv;

void main() {
  /* el cuadrilátero va de -1 a 1 en coordenadas de recorte; la
     UV es lo mismo remapeado a 0-1 y con la Y invertida, porque
     las imágenes vienen del revés respecto a WebGL */
  uv = vec2(posicion.x * 0.5 + 0.5, 0.5 - posicion.y * 0.5);
  gl_Position = vec4(posicion, 0.0, 1.0);
}
`;

export const FRAGMENTO = `
precision highp float;

varying vec2 uv;

uniform sampler2D textura;
uniform sampler2D mascara;  /* dónde están las letras: 1 texto, 0 líquido */
uniform float tiempo;
uniform float hover;        /* 0 en reposo, 1 con el cursor encima */
uniform float intensidad;   /* amplitud base de la distorsión */
uniform vec2 relacion;      /* corrige el aspecto del ruido */

/* Margen transparente que se reserva alrededor de la textura
   para que el resplandor tenga sitio donde derramarse. Sin él,
   el glow se corta contra el borde del canvas. */
const float MARGEN = 0.06;

/* ============================================================
   RUIDO SIMPLEX 2D  (Ashima Arts, dominio público)

   Simplex y no Perlin clásico: tiene menos artefactos
   direccionales. Un Perlin en rejilla deja alineaciones
   horizontales y verticales visibles, y en una deformación tan
   lenta como esta se notarían como si el logo latiera en
   cuadrícula.
   ============================================================ */
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                        + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

/* ---- SIN RAMAS ----
   Esto llevaba un "if" con "return". En GLSL eso es flujo de
   control NO UNIFORME, y calcular derivadas (dFdx/dFdy) sobre un
   valor que ha pasado por ahí es comportamiento indefinido: el
   driver puede devolver basura, y devolvía.

   Con clamp y step el resultado es el mismo —transparente fuera
   del área útil— sin ninguna bifurcación. */
/* ---- EL NIVEL DE MIPMAP SE ELIGE CON LA UV SIN DEFORMAR ----
   La GPU decide qué nivel usar mirando cuánto varía la UV entre
   píxeles vecinos. Pero aquí la UV va desplazada por ruido, así
   que esa variación es errática: dos píxeles contiguos escogen
   niveles distintos y el brillo del líquido se rompe en
   fragmentos. Es exactamente el aspecto de "reflejo
   fragmentado".

   Pasando los gradientes de la UV BASE —que varían suave y
   predeciblemente— el nivel se elige bien aunque se muestree en
   otro sitio. TOMA lo define el JS según el dialecto: textureGrad
   en WebGL2, texture2D a secas en WebGL1, que no tiene mipmaps
   y por tanto tampoco el problema. */
vec4 muestrea(vec2 p, vec2 gx, vec2 gy) {
  vec2 c = clamp(p, 0.0, 1.0);
  float dentro = step(0.0, p.x) * step(p.x, 1.0)
               * step(0.0, p.y) * step(p.y, 1.0);
  return TOMA(c, gx, gy) * dentro;
}


void main() {
  /* la UV del canvas se remapea al área donde vive la textura,
     dejando MARGEN libre alrededor para el resplandor */
  vec2 p = (uv - MARGEN) / (1.0 - 2.0 * MARGEN);

  /* los gradientes de la UV base: se calculan UNA vez y se pasan
     a todas las lecturas de textura */
  vec2 gx = dFdx(p);
  vec2 gy = dFdy(p);

  vec4 base = muestrea(p, gx, gy);

  /* ============================================================
     LA MÁSCARA DEL TEXTO

     El encargo es tajante: el texto NO se deforma.

     Aquí se deducía en el propio shader, umbralizando saturación:
     el texto es blanco, el líquido es violeta saturado. Parecía
     elegante y era falso. Medido sobre la textura real:

       letras           saturación p50 0.008  p90 0.016
       brillos líquido  saturación p50 0.094  p90 0.306

     El problema es que un reflejo especular PURO también se
     quema a blanco, así que caía dentro del umbral pasara donde
     pasara: con el umbral que había, un 27% del líquido se
     congelaba por error, y apretarlo hasta 0.06 solo lo bajaba al
     20%. Esos brillos congelados eran justo lo que se desgarraba
     mientras el líquido de alrededor se movía. De ahí el "reflejo
     fragmentado".

     La saturación sola no puede separarlos porque no es un
     problema de color, es de FORMA: las letras son trazos gruesos
     y contiguos, los brillos son bandas de pocos píxeles. Eso se
     resuelve con morfología —abrir para borrar lo fino, dilatar
     para recuperar las letras enteras— y eso no se hace por
     píxel: se hace una vez y se guarda.

     Así que la máscara viene ya calculada en oysters-3d-texto.webp
     (450x378, 3 KB, gris). Sale más barata en ejecución que lo
     anterior —una lectura en vez de cinco, sin despremultiplicar
     ni calcular saturación— y es exacta. Va desenfocada a
     propósito: si su filo fuera duro, el desplazamiento pasaría
     de cero a máximo en dos píxeles y cizallaría igual.
     ============================================================ */
  float esTexto = texture2D(mascara, clamp(p, 0.0, 1.0)).r;

  float brillo = max(max(base.r, base.g), base.b) / max(base.a, 0.001);

  /* ---- LAS MÁSCARAS TIENEN QUE SER SUAVES ----
     Aquí había una máscara que apagaba la distorsión donde el
     alfa caía, para no morder la silueta. Pero el alfa pasa de 1
     a 0 en dos o tres píxeles, así que el desplazamiento pasaba
     de 19 texels a cero en esa misma distancia: una cizalla
     enorme justo en el borde, que es de donde salían las rayas
     que quedaban.

     Se ha quitado. Desplazar el borde de la silueta no es un
     defecto: es exactamente el movimiento de líquido que pide el
     encargo, y con el muestreo premultiplicado el filo se
     desplaza limpio en vez de romperse.

     Lo único que queda es un apagado contra los bordes del
     LIENZO, y ahora se reparte en un 25% en vez de un 6%: sobre
     una rampa larga el gradiente es despreciable y no cizalla
     nada. */
  vec2 alFilo = min(p, 1.0 - p);
  float sinFilo = smoothstep(0.0, 0.25, min(alFilo.x, alFilo.y));

  /* ============================================================
     LA DEFORMACIÓN

     Dos campos de ruido con distinta escala, distinta velocidad
     y distinto desfase. La mezcla entre ellos la decide la
     ALTURA: arriba manda uno, abajo el otro.

     Es lo que pide el encargo —que el líquido de arriba y el de
     abajo no vayan sincronizados— y es también lo que evita el
     efecto gelatina: un único campo de ruido mueve toda la
     figura a la vez, y eso se lee como una lámina blanda, no
     como energía interna.
     ============================================================ */
  vec2 q = p * relacion;

  float t1 = tiempo * 0.072;               /* ciclo lento: ~9s */
  float t2 = tiempo * 0.054;               /* el otro, más lento aún */

  /* ---- EL RUIDO VA MUY BAJO DE FRECUENCIA ----
     Estaba en 2.1 ciclos a lo ancho del logo y salían rayas: los
     brillos del líquido son bandas de pocos píxeles, y a esa
     frecuencia el desplazamiento CAMBIA dentro de una misma
     banda y la cizalla en tiras. El "reflejo fragmentado".

     A 0.85 hay menos de un ciclo en toda la imagen, así que cada
     brillo se desplaza ENTERO en vez de deformarse por dentro.
     El material se conserva y lo que se mueve es la masa.

     Y encaja mejor con el encargo: energía interna es una masa
     que respira despacio, no una superficie que ondula. */
  vec2 arriba = vec2(
    snoise(q * 0.85 + vec2(t1, t1 * 0.6)),
    snoise(q * 0.85 + vec2(11.3 - t1 * 0.7, 4.7 + t1))
  );

  vec2 abajo = vec2(
    snoise(q * 0.65 + vec2(31.7 - t2, 19.2 + t2 * 0.5)),
    snoise(q * 0.65 + vec2(7.1 + t2 * 0.8, 27.4 - t2))
  );

  float haciaAbajo = smoothstep(0.35, 0.75, p.y);
  vec2 campo = mix(arriba, abajo, haciaAbajo);

  /* con el cursor encima sube un 60%, no el doble: pasado ese
     punto deja de leerse como energía y empieza a leerse como
     que algo va mal */
  float amplitud = intensidad * (1.0 + hover * 0.6);

  vec2 desplazamiento = campo * amplitud
    * (1.0 - esTexto)      /* el texto, quieto */
    * sinFilo;             /* el borde del lienzo, quieto */

  vec4 color = muestrea(p + desplazamiento, gx, gy);

  /* ============================================================
     LUZ

     El encargo dice "brillo dinÃ¡mico muy suave" y "destellos
     puntuales en algunos bordes". La primera versiÃ³n se pasaba
     de largo: moteaba toda la superficie y dejaba un filo blanco
     duro alrededor de la silueta.
     ============================================================ */

  /* ---- EL FILO SE MIDE SOBRE EL ALFA SIN DEFORMAR ----
     Estaba calculado con dFdx(color.a), o sea sobre la muestra
     YA desplazada. Y el desplazamiento cambia de un pÃ­xel al de
     al lado, asÃ­ que la derivada no medÃ­a el borde de la
     silueta: medÃ­a la variaciÃ³n del propio campo de ruido. De
     ahÃ­ salÃ­a el moteado por toda la figura.

     Con base.a —el alfa en la posiciÃ³n real, sin desplazar— la
     derivada vuelve a significar lo que dice: cuÃ¡nto cambia la
     silueta aquÃ­. */
  float da = length(vec2(dFdx(base.a), dFdy(base.a)));
  float filo = smoothstep(0.04, 0.5, da);

  /* respiraciÃ³n global, ~9s por ciclo */
  float respira = 0.5 + 0.5 * sin(tiempo * 0.7);

  /* reflejo magenta viajando en diagonal, ~14s por pasada */
  float banda = sin((p.x + p.y) * 2.4 - tiempo * 0.45);
  float reflejo = smoothstep(0.86, 1.0, banda) * brillo;

  /* ---- LA LUZ DE LA SALA VIENE DEL TECHO ----
     El logo estaba iluminado por igual de arriba abajo, y eso es
     justo lo que hace que una pieza recortada se lea como pegada
     encima: en la escena TODO lo demás —paneles, suelo, retrato—
     recibe la luz desde arriba, y solo el logo no.

     Aquí p.y = 0 es el borde superior de la textura (la subida no
     invierte el eje). Así que el factor baja con la altura: la
     mitad de abajo se apaga un 16%, y a cambio recoge el rebote
     violeta que sube del suelo pulido.

     Es deliberadamente flojo. El encargo dice que la iluminación
     del escenario afecte LIGERAMENTE; pasado de aquí el logo deja
     de ser el objeto más luminoso de la escena y la composición
     pierde su punto de fuga. */
  float altura = smoothstep(0.0, 1.0, p.y);
  float cenital = mix(1.09, 0.84, altura);
  vec3 rebote = vec3(0.42, 0.20, 0.72) * altura * 0.045;

  /* ---- REFLEJOS DEL ENTORNO ----
     Los paneles de la sala son cristal frío, no magenta. Su
     reflejo cruza el logo en OTRO ángulo y a OTRA velocidad que
     la banda de arriba: si compartieran ambos, se leerían como
     una sola pasada de luz y no como dos fuentes distintas.

     Y solo prende sobre lo que ya está brillante. Un reflejo
     especular aparece donde la superficie mira hacia la luz; si
     se repartiera por igual saldría una tira pintada encima. */
  float cristal = sin(p.x * 1.7 - p.y * 2.9 + tiempo * 0.26);
  float vidrio = smoothstep(0.93, 1.0, cristal)
               * smoothstep(0.45, 0.95, brillo);

  /* ---- DESTELLOS PUNTUALES ----
     Umbral muy alto (0.93) para que sean unos pocos y no una
     costra, y ademÃ¡s SOLO donde el alfa es pleno: en el borde de
     la silueta un destello se lee como ruido de recorte, no como
     brillo. */
  float chispa = snoise(q * 9.0 + vec2(tiempo * 0.5, -tiempo * 0.35));
  chispa = smoothstep(0.93, 1.0, chispa)
         * filo
         * smoothstep(0.75, 0.98, base.a);

  vec3 violeta = vec3(0.66, 0.33, 0.97);
  vec3 magenta = vec3(0.85, 0.28, 0.94);

  /* Todo mucho mÃ¡s bajo que antes. El resplandor ya no se
     multiplica por el filo —eso era lo que dibujaba el contorno
     blanco— sino que baÃ±a la figura por igual y muy poco. */
  vec3 luz = vec3(0.0);
  luz += violeta * (0.030 + 0.022 * respira);
  luz += magenta * reflejo * 0.10;
  luz += vec3(1.0) * chispa * 0.35;
  luz += rebote;                              /* el suelo devuelve violeta */
  luz += vec3(0.80, 0.86, 1.0) * vidrio * 0.15;   /* los paneles, blanco frío */

  /* con el cursor todo sube un tercio */
  luz *= 1.0 + hover * 0.35;

  /* la luz se aplica dentro de la figura, no en su canto: el
     smoothstep sobre el alfa la apaga justo donde el recorte
     tiene pÃ­xeles a medias */
  /* la luz se SUMA al color ya premultiplicado y se pondera por
     el alfa, que es como se añade emisión a un origen
     premultiplicado */
  /* el cenital multiplica el color propio; la luz añadida se suma
     después, para que los destellos no se apaguen por estar en la
     mitad baja de la figura */
  vec3 salida = color.rgb * cenital
              + luz * color.a * smoothstep(0.35, 0.85, color.a);

  /* ============================================================
     LA SALA SE INTERPONE

     Medido, esta era la razón real de que el logo se leyera como
     una imagen pegada encima y no como un objeto dentro de la
     escena. No era el tono —logo y escultura dan los dos 0.73 de
     rojo/azul—, era el RANGO:

                       luminancia p50   p95
       logo                 0.039       0.960
       escultura            0.156       0.483
       sala vacía           0.011       0.015

     El logo iba de casi negro a blanco puro. Eso es el contraste
     de un render de estudio, con el objeto aislado sobre fondo
     neutro. Un objeto que está DENTRO de una sala con niebla no
     puede hacer eso: el aire que hay entre él y el ojo le levanta
     los negros y le corta los blancos. Por eso la escultura, que
     tiene la mitad de rango, sí se integra.

     Así que aquí se mezcla hacia el color medio de la sala,
     medido sobre una franja vacía del propio fondo. Es la mezcla
     lo que hace las dos cosas a la vez —subir el suelo y bajar el
     techo— sin tocar el tono ni el dibujo.

     La densidad crece hacia abajo por la misma razón que la
     escultura se difumina por los pies: la niebla se acumula
     donde el suelo la devuelve.

     Empezó en 0.20-0.36, que igualaba el logo con la ESCULTURA
     (percentil 95 de luminancia 0.52 contra 0.48). Pero igualar
     no era el objetivo: la escultura es el ancla humana de la
     composición y el logo es un elemento gráfico, así que
     compartir plano hacía que compitieran. Subiendo a 0.36-0.54
     el logo se sitúa DETRÁS de ella en la profundidad
     atmosférica, que es donde le toca.
     ============================================================ */
  /* ============================================================
     LA MISMA PIEL DE COLOR QUE LA ESCULTURA

     Con la niebla puesta, el logo ya compartía plano de
     profundidad con ella, pero seguía cantando por el COLOR.
     Medido sobre las dos piezas en pantalla:

                        saturación p50   rojo/azul
       logo                  0.63          0.73
       escultura             0.48          0.68

     Un 30% más saturado y más rosa. En una escena de un solo tono
     eso basta para que una pieza se lea como traída de otro sitio.

     La saturación se baja mezclando hacia la LUMINANCIA del propio
     píxel y no hacia un gris fijo: así cada zona conserva su
     dibujo y solo pierde intensidad de color. Y el tono se empuja
     al azul lo justo para caer en el 0.68 de ella.

     Los factores son más fuertes de lo que sugiere la aritmética
     (0.55, no 0.75) porque la niebla que viene DESPUÉS mezcla
     hacia un violeta que también está saturado, y devuelve parte
     de lo que aquí se quita. Ajustados midiendo el resultado
     final, no la operación aislada. */
  float luzPropia = dot(salida, vec3(0.2126, 0.7152, 0.0722));
  salida = mix(vec3(luzPropia), salida, 0.55);
  salida.r *= 0.93;
  salida.b *= 1.08;

  vec3 NIEBLA = vec3(0.138, 0.069, 0.236);
  float densidad = mix(0.36, 0.54, altura);

  /* con el cursor encima la niebla se retira: es la manera de
     intensificar en hover sin recurrir a subir el brillo, que
     volvería a sacar el logo de la escena */
  densidad *= 1.0 - hover * 0.45;

  /* NIEBLA va multiplicada por el alfa porque la salida está
     premultiplicada: mezclar contra un color sin premultiplicar
     pintaría niebla sobre el vacío transparente de alrededor y
     el logo saldría dentro de una caja rectangular */
  salida = mix(salida, NIEBLA * color.a, densidad);

  /* un punto de brillo extra en hover, sobre la figura entera */
  salida *= 1.0 + hover * 0.06;

  gl_FragColor = vec4(salida, color.a);
}
`;
