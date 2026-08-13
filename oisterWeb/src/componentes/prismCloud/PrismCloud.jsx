import { useEffect, useRef } from "react";
import "./PrismCloud.css";

/* ============================================================
   PRISM CLOUD — nube cromática luminosa en GLSL

   Una nube de luz que flota y se refracta, pintada entera en el
   fragment shader: no hay imágenes ni geometría, solo ruido y
   color. Responde a dos cosas:

     · el PUNTERO — arrastra el foco de luz y aumenta la
       separación de los canales RGB alrededor del cursor, que es
       lo que produce el borde iridiscente (la "refracción")
     · el SCROLL — desplaza la nube y le cambia la densidad, así
       que al bajar la página la masa se abre y se aclara

   ---- DE DÓNDE SALEN LOS COLORES ----
   No están inventados: son los del fondo del home
   (styles/variables.css). Ver la constante PALETA más abajo —
   ahí está la correspondencia token por token.

   ---- WEBGL A PELO, SIN THREE.JS ----
   El proyecto ya no lleva three (se quitó al pasar la ostra a
   vídeo). Para un quad a pantalla completa con un shader no hace
   ninguna falta: son ~120 líneas de WebGL y cero dependencias.
   El patrón —compilar, un quad de dos triángulos, uniforms por
   frame— es el mismo que usaba el recorte del hero.
   ============================================================ */

/* ---- LA PALETA, TAL CUAL SALE DEL HOME ----
   Cada color va en 0..1 porque es lo que come GLSL. La
   correspondencia con los tokens de variables.css:

     base    #372550  --color-bg        (la base morada)
     deep    #442F65  --sec-deep        (el tono oscuro)
     lift    #56336B  --sec-lift        (el tono claro, ciruela)
     rosa    #E97CC7  el foco rosa del --gradient-bg (12% 18%)
     violeta #9664FA  el foco violeta del --gradient-bg (88% 22%)
     brillo  #F090D4  el rosa claro de --gradient-title

   Si cambia la paleta del sitio, se cambia AQUÍ y el shader
   entero la sigue: no hay ningún color escrito más abajo. */
const PALETA = {
  base: [0.216, 0.145, 0.314],
  deep: [0.267, 0.184, 0.396],
  lift: [0.337, 0.200, 0.420],
  rosa: [0.914, 0.486, 0.780],
  violeta: [0.588, 0.392, 0.980],
  brillo: [0.941, 0.565, 0.831],
};

/* Techo de densidad de píxeles. Por encima de 1.5 no se aprecia
   diferencia en una nube difusa y se pagan píxeles a lo tonto
   (el shader corre por píxel: en 4K son 8M de evaluaciones). */
const DPR_CAP = 1.5;

const VERT = `
  attribute vec2 aPos;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision highp float;

  uniform vec2  uResolucion;
  uniform float uTiempo;
  uniform vec2  uPuntero;    /* 0..1, ya suavizado desde JS */
  uniform float uScroll;     /* 0..1 a lo largo de la página */
  uniform float uPresencia;  /* 0..1: cuánto "hay" puntero */
  uniform float uLuz;        /* 1 = a plena luz · <1 = más oscuro */

  uniform vec3 uBase;
  uniform vec3 uDeep;
  uniform vec3 uLift;
  uniform vec3 uRosa;
  uniform vec3 uVioleta;
  uniform vec3 uBrillo;

  /* ---- RUIDO ----
     Value noise con interpolación suave + fbm de 5 octavas. Es
     el mínimo que da una nube creíble: con 3 se ve el patrón y
     con 7 no cambia nada que se note pero cuesta un 40% más. */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float ruido(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    /* suavizado de Hermite: sin esto se ven las casillas */
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float valor = 0.0;
    float amplitud = 0.5;
    /* rotación entre octavas: rompe el enrejado que sale al
       apilar ruido siempre en los mismos ejes */
    mat2 giro = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      valor += amplitud * ruido(p);
      p = giro * p * 2.02;
      amplitud *= 0.5;
    }
    return valor;
  }

  /* ---- LA NUBE ----
     El desplazamiento de dominio (meter un fbm dentro de otro)
     es lo que le da las volutas: sin él queda una mancha
     uniforme, con él se enrosca sobre sí misma como humo.

     Un solo nivel de warp y no dos: el segundo nivel casi no se
     nota y aquí cada evaluación se paga CUATRO veces por píxel
     (tres canales del prisma + la muestra del autosombreado). */
  float nube(vec2 p, float t) {
    vec2 q = vec2(fbm(p + vec2(0.0, t * 0.10)),
                  fbm(p + vec2(5.2, 1.3) - vec2(t * 0.07, 0.0)));
    return fbm(p + 3.4 * q);
  }

  /* ---- DE RUIDO A NUBE CON CUERPO ----
     El fbm devuelve una niebla plana repartida por igual. Una
     nube de verdad tiene MASAS: zonas densas con borde suave y
     huecos de aire entre medias. Eso es lo que hace este remapeo:

       · smoothstep recorta por debajo del umbral → aparecen los
         huecos, y el aire deja ver el fondo
       · el pow(·, 1.6) hunde los medios tonos → el borde se
         afina y la masa se compacta, que es la diferencia entre
         "humo uniforme" y "nube"

     Sin este paso, subir el contraste desde el color daba
     manchas duras; hecho sobre la densidad, el canto se queda
     algodonoso. */
  float masaNube(float d) {
    float m = smoothstep(0.26, 0.72, d);
    return pow(m, 1.35);
  }

  void main() {
    /* coordenadas centradas y con el aspecto corregido: la nube
       no se estira al cambiar la forma de la ventana */
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolucion) / min(uResolucion.x, uResolucion.y);
    vec2 puntero = (uPuntero - 0.5) * vec2(uResolucion.x / min(uResolucion.x, uResolucion.y), 1.0) * 2.0;

    float t = uTiempo * 0.35;

    /* SCROLL: la nube sube y se afloja al bajar la página */
    vec2 p = uv * 1.6;
    p.y += uScroll * 0.9;
    float densidad = mix(1.0, 0.62, uScroll);

    /* ---- REFRACCIÓN CROMÁTICA ----
       Los tres canales se muestrean con la nube DESPLAZADA una
       pizca cada uno, en la dirección que va del cursor al
       píxel. Es lo mismo que hace un prisma: separar las
       longitudes de onda según por dónde entran.

       La separación crece cerca del cursor y se apaga con la
       distancia (por eso el exp): así el iris aparece donde
       está la mano y el resto de la nube se queda limpio. */
    vec2 haciaPuntero = uv - puntero;
    float dist = length(haciaPuntero);
    float cerca = exp(-dist * 2.2) * uPresencia;
    vec2 dir = dist > 0.0001 ? haciaPuntero / dist : vec2(0.0);

    /* Separación BASE muy corta (0.008) y el grueso reservado al
       entorno del cursor. La primera versión usaba 0.035 fijos y
       el iris salía en TODA la nube: se leía como un arcoíris,
       no como el fondo del home. Con esto, lejos del cursor los
       tres canales casi coinciden —color limpio— y el prisma
       aparece solo donde está la mano, que es lo que se buscaba. */
    float sep = 0.008 + 0.055 * cerca;

    float dr = nube((p - dir * sep) * densidad, t);
    float dg = nube(p * densidad, t + 0.15);
    float db = nube((p + dir * sep) * densidad, t + 0.30);

    /* ---- ILUMINACIÓN VOLUMÉTRICA ----
       Esto es lo que convierte la mancha en NUBES. Una nube se
       lee como volumen porque su propia masa hace sombra: la
       cara que mira a la luz se enciende y el interior se queda
       oscuro. Aquí se aproxima con una sola muestra extra:

         se mira la densidad UN PASO HACIA LA LUZ
         · si allí hay MENOS nube → nada tapa, este punto está
           expuesto → se ilumina
         · si hay MÁS nube → la masa de delante hace sombra →
           se queda oscuro

       Es la derivada direccional de la densidad hacia la luz, y
       es lo que en gráficos se usa como sustituto barato del
       "marchado" de rayos: cuesta UNA evaluación en vez de las
       ocho o dieciséis de un march de verdad, y a esta escala se
       ve igual de bien.

       El foco de luz es el PUNTERO: por eso las nubes se
       alumbran al pasar el ratón por encima, en vez de limitarse
       a recibir un halo pegado por delante. */
    vec2 haciaLuz = -dir;                 /* del píxel hacia el cursor */
    float dLuz = nube((p + haciaLuz * 0.30) * densidad, t + 0.15);

    /* >0 el punto mira a la luz · <0 está a la sombra de su
       propia masa. El 2.6 es el contraste del relieve: subirlo
       marca más los bultos, bajarlo aplana la nube. */
    float relieve = clamp((dg - dLuz) * 2.6 + 0.5, 0.0, 1.0);

    /* la luz del cursor pierde fuerza con la distancia, como
       cualquier foco puesto DENTRO de la niebla */
    float alcance = exp(-dist * 1.5) * uPresencia;

    /* ---- COLOR ----
       La regla que manda aquí: ESTE FONDO ES EL DEL HOME, con
       nubes dentro. No al revés. En el home la base morada ocupa
       el ~85% y los focos de luz entran al 14-23% de opacidad
       (ver --gradient-bg en variables.css); si las nubes pintan
       más fuerte que eso, dejan de pertenecer a la misma página
       — que es lo que pasaba con la primera versión, un arcoíris
       saturado que no se parecía a nada del sitio.

       Así que primero se construye el MISMO degradado diagonal
       del home (135°, base → deep → lift) y las nubes solo
       modulan encima. */
    float diagonal = clamp((uv.x + uv.y) * 0.7 + 0.5, 0.0, 1.0);
    vec3 fondo = mix(uBase, uDeep, smoothstep(0.0, 0.55, diagonal));
    fondo = mix(fondo, uLift, smoothstep(0.45, 1.0, diagonal));

    /* cada canal lee su propia masa: ahí está el iris del prisma */
    vec3 masa = vec3(masaNube(dr), masaNube(dg), masaNube(db));
    float m = masa.g;

    /* ---- EL COLOR DE LA NUBE, SEGÚN LE DÉ LA LUZ ----
       Tres tonos y no uno: es el RECORRIDO de sombra a cresta lo
       que se lee como volumen. Con los tres tonos juntos —que es
       como salió la primera vez— la nube se veía plana aunque el
       relieve estuviera bien calculado; hay que separarlos.

         · sombra — MUY por debajo del fondo (0.42). Es el hueco
                    donde la masa se traga la luz, y sin esa
                    caída no hay profundidad posible.
         · cuerpo — el violeta del --gradient-bg.
         · cresta — el rosa claro del home, en la cara que mira
                    a la luz. */
    vec3 sombra = uBase * 0.42;
    vec3 cuerpo = mix(uDeep, uVioleta, 0.72);
    vec3 cresta = mix(uRosa, uBrillo, 0.45);

    /* la luz ambiente basta para ver el volumen sin cursor; el
       resto lo pone el foco cuando la mano se acerca */
    float luz = clamp(relieve * (0.55 + 1.15 * alcance), 0.0, 1.0);

    vec3 tono = mix(sombra, cuerpo, smoothstep(0.0, 0.62, luz));
    /* la cresta entra tarde (0.68) y no llega a mezclarse del
       todo: con el rango abierto, alrededor del cursor se
       formaba una mancha rosa quemada en vez de nubes
       iluminadas — el detalle se perdía justo donde más se mira */
    tono = mix(tono, cresta, smoothstep(0.68, 1.05, luz) * 0.85);

    /* la masa se compone SOBRE el fondo (no se suma): así los
       huecos entre nubes dejan ver el degradado del home limpio
       y las nubes tapan de verdad, que es lo que las hace leerse
       como cuerpos y no como un velo encima. */
    vec3 color = mix(fondo, tono, m * 0.92);

    /* el iris del prisma: la diferencia entre canales, solo
       donde hay masa. Va sumado y flojo — es un destello, no un
       color de la nube. */
    color += (masa - m) * 0.55;

    /* el resplandor del foco atravesando la niebla: se ve MÁS
       donde hay nube (la luz rebota en las gotas) y casi nada en
       el aire, que es como se comporta la luz de verdad dentro
       de una nube. */
    color += mix(uRosa, uBrillo, 0.4) * alcance * (0.06 + 0.20 * m);

    /* viñeta: cierra los bordes contra el fondo de la página en
       vez de cortar el rectángulo en seco */
    float vineta = 1.0 - smoothstep(0.55, 1.25, length(uv));
    color = mix(uBase, color, 0.35 + 0.65 * vineta);

    /* ---- NIVEL DE LUZ ----
       Baja la nube entera cuando va DETRÁS de contenido (el
       detalle de proyecto la usa a media luz). No es un simple
       multiplicar: eso apaga por igual y deja un gris morado
       sucio. Aquí las sombras caen MÁS que las luces —el pow con
       exponente>1 hunde los medios—, así que el fondo se va a
       negro mientras las crestas iluminadas sobreviven. Resultado:
       más contraste con lo que va encima, que es justo lo que se
       busca al oscurecerlo. */
    float caida = 1.0 + (1.0 - uLuz) * 1.6;
    color = pow(max(color, 0.0), vec3(caida)) * uLuz;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compilar(gl, tipo, fuente) {
  const sh = gl.createShader(tipo);
  gl.shaderSource(sh, fuente);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(log || "shader sin compilar");
  }
  return sh;
}

/* ---- PROPS ----
   · luz — 1 (por defecto) es la nube a plena luz, para cuando
     ella es el protagonista, como en el banco de pruebas.
     Por debajo de 1 se oscurece para ir DETRÁS de contenido: el
     detalle de proyecto la monta a 0.42 para que las fotos y los
     textos del trabajo ganen el primer plano. */
function PrismCloud({ luz = 1 }) {
  const canvasRef = useRef(null);

  /* El valor vive TAMBIÉN en un ref: el bucle de pintado lo lee
     en cada frame, así que un cambio de prop llega solo, sin
     recompilar el shader ni reiniciar el efecto.
     La copia va en un efecto y no en el cuerpo del componente
     porque escribir un ref durante el render es justo lo que
     React desaconseja (y el lint corta). */
  const luzRef = useRef(luz);
  useEffect(() => {
    luzRef.current = luz;
  }, [luz]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      /* sin WebGL queda el degradado CSS de respaldo que pinta
         .prism-cloud (ver PrismCloud.css): no es la nube, pero
         es la misma paleta y no deja un agujero negro */
      canvas.classList.add("is-sin-webgl");
      return;
    }

    let programa = null;
    try {
      const vs = compilar(gl, gl.VERTEX_SHADER, VERT);
      const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAG);
      programa = gl.createProgram();
      gl.attachShader(programa, vs);
      gl.attachShader(programa, fs);
      gl.linkProgram(programa);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(programa) || "programa sin enlazar");
      }
    } catch (error) {
      /* Se grita a propósito: un error de sintaxis en el shader
         se ve desde fuera igual que "no hay WebGL" —pantalla
         plana— y se pierde un rato buscando donde no es. */
      console.error("[PrismCloud] el shader no compiló:", error);
      canvas.classList.add("is-sin-webgl");
      return;
    }

    gl.useProgram(programa);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(programa, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (nombre) => gl.getUniformLocation(programa, nombre);
    const uResolucion = u("uResolucion");
    const uTiempo = u("uTiempo");
    const uPuntero = u("uPuntero");
    const uScroll = u("uScroll");
    const uPresencia = u("uPresencia");
    const uLuz = u("uLuz");

    /* la paleta no cambia por frame: se sube una vez */
    gl.uniform3fv(u("uBase"), PALETA.base);
    gl.uniform3fv(u("uDeep"), PALETA.deep);
    gl.uniform3fv(u("uLift"), PALETA.lift);
    gl.uniform3fv(u("uRosa"), PALETA.rosa);
    gl.uniform3fv(u("uVioleta"), PALETA.violeta);
    gl.uniform3fv(u("uBrillo"), PALETA.brillo);

    /* ---- ESTADO QUE VIENE DE FUERA ----
       Se guarda el destino y se persigue con interpolación: el
       puntero a pelo da tirones (el ratón manda eventos a
       saltos) y aquí lo que se busca es que la luz vaya
       detrás de la mano con algo de inercia, como si pesara. */
    const puntero = { x: 0.5, y: 0.5 };
    const destino = { x: 0.5, y: 0.5 };
    let presencia = 0;
    let presenciaDestino = 0;
    let scroll = 0;

    const alMover = (e) => {
      const r = canvas.getBoundingClientRect();
      destino.x = (e.clientX - r.left) / r.width;
      /* el eje Y de WebGL va al revés que el de la pantalla */
      destino.y = 1 - (e.clientY - r.top) / r.height;
      presenciaDestino = 1;
    };
    const alSalir = () => {
      presenciaDestino = 0;
    };
    const alScroll = () => {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      scroll = alto > 0 ? Math.min(1, window.scrollY / alto) : 0;
    };

    window.addEventListener("pointermove", alMover, { passive: true });
    window.addEventListener("pointerleave", alSalir);
    window.addEventListener("scroll", alScroll, { passive: true });
    alScroll();

    const ajustarTamano = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    /* Con motion reducido el bucle NO corre: se pinta un solo
       fotograma y ahí se queda. La nube sigue estando, pero
       quieta — misma decisión que toma el vídeo del hero. */
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId = null;
    let vivo = true;
    const inicio = performance.now();

    const pintar = (ahora) => {
      if (!vivo) return;
      ajustarTamano();

      /* seguimiento con inercia (ver el comentario de arriba) */
      puntero.x += (destino.x - puntero.x) * 0.06;
      puntero.y += (destino.y - puntero.y) * 0.06;
      presencia += (presenciaDestino - presencia) * 0.05;

      gl.uniform2f(uResolucion, canvas.width, canvas.height);
      gl.uniform1f(uTiempo, quieto ? 0 : (ahora - inicio) / 1000);
      gl.uniform2f(uPuntero, puntero.x, puntero.y);
      gl.uniform1f(uScroll, scroll);
      gl.uniform1f(uPresencia, presencia);
      gl.uniform1f(uLuz, luzRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!quieto) rafId = requestAnimationFrame(pintar);
    };

    rafId = requestAnimationFrame(pintar);

    /* con el bucle parado (motion reducido) un cambio de tamaño
       dejaría el canvas estirado: este es el repintado */
    const observador = new ResizeObserver(() => pintar(performance.now()));
    observador.observe(canvas);

    /* en una pestaña de fondo no hay nada que mirar: rAF ya se
       duerme solo, pero al volver conviene retomar el hilo sin
       acumular un salto de tiempo */
    const alCambiarVisibilidad = () => {
      if (!document.hidden && !quieto && vivo && rafId === null) {
        rafId = requestAnimationFrame(pintar);
      }
    };
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      vivo = false;
      if (rafId) cancelAnimationFrame(rafId);
      observador.disconnect();
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerleave", alSalir);
      window.removeEventListener("scroll", alScroll);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(programa);
      /* NO se llama a loseContext(): el canvas es el mismo nodo
         entre desmontaje y montaje, y getContext() sobre un
         canvas con contexto perdido devuelve ESE contexto
         muerto — en dev, con el doble montaje de StrictMode, la
         segunda pasada se quedaría en negro. */
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="prism-cloud"
      aria-hidden="true"
    />
  );
}

export default PrismCloud;
