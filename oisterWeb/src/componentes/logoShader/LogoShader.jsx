import { useEffect, useRef, useState } from "react";
import { VERTICE, FRAGMENTO } from "./glsl.js";
import "./LogoShader.css";

/* ============================================================
   LOGO CON SHADER

   La imagen no se toca: entra como TEXTURA y el shader la
   deforma al vuelo. No hay SVG, ni vídeo, ni sprites, ni una
   segunda versión del archivo — el original conserva toda su
   calidad y lo único que cambia es dónde se muestrea cada
   píxel.

   ---- POR QUÉ WEBGL CRUDO Y NO THREE.JS ----
   La spec permite Three.js o React Three Fiber. Pero esto es un
   cuadrilátero con una textura y un shader: no hay escena, ni
   cámara, ni luces, ni geometría que gestionar. Three.js son
   ~150KB comprimidos para no usar el 98% de lo que trae, y
   además mete su propio bucle de render y su gestión de
   contexto.

   Aquí son unas cien líneas y cero dependencias. Si algún día
   hace falta una escena de verdad —varios objetos, cámara,
   sombras— entonces sí compensa traerlo.

   ---- Y SI WEBGL NO ESTÁ ----
   Se cae a un <img> normal. Un logo es identidad de marca: si
   el shader no puede correr, tiene que verse igual pero quieto,
   nunca desaparecer.
   ============================================================ */

/* Amplitud del desplazamiento en coordenadas de textura. El
   encargo pide 2-5%.

   Estaba en 0.035 y se veía emborronado: sobre un lienzo de
   440px eso son 15px de desplazamiento, y este render tiene los
   brillos del líquido muy finos — a esa amplitud se arrastran
   unos sobre otros y el material deja de leerse como plástico
   pulido.

   0.021 se queda en el extremo bajo del rango que pide la spec.
   La sensación de energía interna no la da la amplitud sino la
   LENTITUD y que las zonas vayan desfasadas. */
const INTENSIDAD = 0.042;

/* Cuánto tarda el hover en llegar a fondo. Medio segundo: por
   debajo se siente como un interruptor. */
const SUAVIZADO_HOVER = 0.06;

/* ============================================================
   UNA SOLA FUENTE, DOS DIALECTOS

   El shader está escrito en GLSL ES 1.00, que es lo que entiende
   WebGL1. Pero para tener mipmaps hace falta WebGL2, y WebGL2
   compila ES 1.00 SIN las derivadas: dFdx y dFdy solo son parte
   del lenguaje a partir de ES 3.00, y la extensión que las traía
   en WebGL1 ya no existe allí.

   En vez de mantener dos copias del shader —que acabarían
   divergiendo— se traduce la de ES 1.00 al vuelo. Son cuatro
   renombrados mecánicos.
   ============================================================ */
function aES3(fuente, esVertice) {
  let f = fuente
    .replace(/\bvarying\b/g, esVertice ? "out" : "in")
    .replace(/\battribute\b/g, "in")
    .replace(/\btexture2D\(/g, "texture(");

  if (!esVertice) {
    f = f
      .replace(/\bgl_FragColor\b/g, "colorSalida")
      .replace(
        "precision highp float;",
        "precision highp float;\nout vec4 colorSalida;"
      );
  }

  /* #version tiene que ser la PRIMERA línea: ni un comentario ni
     un salto de línea pueden ir antes */
  const cabecera = esVertice
    ? "#version 300 es\n"
    : "#version 300 es\n#define TOMA(c, gx, gy) textureGrad(textura, c, gx, gy)\n";

  return cabecera + f.trimStart();
}

function compila(gl, tipo, fuente) {
  const s = gl.createShader(tipo);
  gl.shaderSource(s, fuente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    /* el log del compilador es la única pista útil cuando un
       shader falla; sin esto se queda todo en negro sin motivo */
    console.error("shader:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function LogoShader({ src, mascara, alt = "", className = "" }) {
  const lienzo = useRef(null);
  const [falla, setFalla] = useState(false);

  useEffect(() => {
    const c = lienzo.current;
    if (!c) return;

    /* ---- ALFA PREMULTIPLICADO ----
       Sin premultiplicar, el filtrado bilineal mezcla el RGB de
       los píxeles TRANSPARENTES con el de los opacos al muestrear
       el borde, y aparece una orla — el clásico alpha bleeding.
       Medido en este archivo: los píxeles transparentes tienen
       RGB con brillo medio 8, y alguno hasta 56.

       Premultiplicando en la subida, la GPU interpola valores ya
       ponderados por su alfa, que es lo matemáticamente correcto:
       un píxel transparente aporta cero por definición. */
    /* ---- WEBGL2 SI SE PUEDE, POR LOS MIPMAPS ----
       La textura mide 900px y se pinta a unos 410: una
       reducción de 2,2x. Sin mipmaps, la GPU toma una muestra
       por píxel de una imagen que tiene el doble de detalle, y
       los brillos finos del líquido se rompen — se ve
       emborronado y con aliasing a la vez.

       WebGL1 solo admite mipmaps en texturas de lado potencia de
       dos, y 900x756 no lo es. WebGL2 los admite en cualquier
       tamaño, y hoy lo soporta cualquier navegador actual. Si no
       está, se sigue sin mipmaps: se ve algo más duro pero
       funciona. */
    const opciones = { alpha: true, premultipliedAlpha: true, antialias: false };
    const gl2 = c.getContext("webgl2", opciones);
    const gl = gl2 || c.getContext("webgl", opciones);
    const hayMipmaps = Boolean(gl2);

    if (!gl) {
      setFalla(true);
      return;
    }

    /* ---- dFdx/dFdy los usa el shader para detectar el filo ----
       En WebGL2 son parte del lenguaje; en WebGL1 vienen en una
       extensión. Sin ninguna de las dos, el shader no compila y
       se cae al <img>. */
    if (!gl2 && !gl.getExtension("OES_standard_derivatives")) {
      setFalla(true);
      return;
    }

    const programa = gl.createProgram();
    const vs = compila(gl, gl.VERTEX_SHADER, gl2 ? aES3(VERTICE, true) : VERTICE);
    const fs = compila(
      gl,
      gl.FRAGMENT_SHADER,
      gl2
        ? aES3(FRAGMENTO, false)
        : "#extension GL_OES_standard_derivatives : enable\n" +
          /* WebGL1 no tiene mipmaps aquí (la textura no es
             potencia de dos), así que tampoco tiene el problema
             de selección de nivel: una lectura normal basta. */
          "#define TOMA(c, gx, gy) texture2D(textura, c)\n" +
          FRAGMENTO
    );

    if (!vs || !fs) {
      setFalla(true);
      return;
    }

    gl.attachShader(programa, vs);
    gl.attachShader(programa, fs);
    gl.linkProgram(programa);

    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
      console.error("programa:", gl.getProgramInfoLog(programa));
      setFalla(true);
      return;
    }

    gl.useProgram(programa);

    /* dos triángulos que cubren la pantalla entera */
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(programa, "posicion");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTextura = gl.getUniformLocation(programa, "textura");
    const uTiempo = gl.getUniformLocation(programa, "tiempo");
    const uHover = gl.getUniformLocation(programa, "hover");
    const uIntensidad = gl.getUniformLocation(programa, "intensidad");
    const uRelacion = gl.getUniformLocation(programa, "relacion");
    const uMascara = gl.getUniformLocation(programa, "mascara");

    gl.uniform1f(uIntensidad, INTENSIDAD);

    /* ---- las texturas ----
       Dos: el logo en la unidad 0 y la máscara del texto en la 1.
       La máscara dice dónde están las letras para no deformarlas;
       se calcula fuera, con morfología, porque dentro del shader
       no se puede distinguir una letra blanca de un reflejo
       especular blanco (ver el comentario en glsl.js). */
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    /* CLAMP y no REPEAT: al desplazar la UV, un REPEAT traería
       el lado opuesto de la imagen y aparecerían trozos del logo
       pegados en el borde contrario */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      hayMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const texMascara = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texMascara);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    /* sin mipmaps: la máscara ya va desenfocada y se lee siempre
       a la misma escala, así que LINEAR basta y evita depender de
       que 450x378 sea potencia de dos */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.activeTexture(gl.TEXTURE0);

    gl.enable(gl.BLEND);
    /* la mezcla que corresponde a un origen premultiplicado */
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    /* ---- carga ----
       No se dibuja hasta tener LAS DOS. Con una sola, el primer
       fotograma saldría deformando el texto o sin logo. */
    let listo = false;
    let pendientes = 2;

    const yaEsta = () => {
      if (--pendientes) return;
      listo = true;
      medir();
      arrancar();
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      if (hayMipmaps) gl.generateMipmap(gl.TEXTURE_2D);
      gl.uniform1i(uTextura, 0);
      yaEsta();
    };
    img.onerror = () => setFalla(true);
    img.src = src;

    const imgMascara = new Image();
    imgMascara.crossOrigin = "anonymous";
    imgMascara.onload = () => {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texMascara);
      /* la máscara es opaca: premultiplicar no le afecta, pero se
         apaga igual para no arrastrar el estado del logo */
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgMascara
      );
      gl.uniform1i(uMascara, 1);
      gl.activeTexture(gl.TEXTURE0);
      yaEsta();
    };
    imgMascara.onerror = () => setFalla(true);
    imgMascara.src = mascara;

    /* ---- estado del bucle ---- */
    const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = null;
    let ultimo = 0;
    let tiempo = 0;
    let hoverDestino = 0;
    let hoverActual = 0;
    let enPantalla = true;
    let w = 0;
    let h = 0;

    const medir = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      if (!w || !h) return;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.ceil(w * dpr);
      c.height = Math.ceil(h * dpr);
      gl.viewport(0, 0, c.width, c.height);

      /* el ruido se calcula en UV, que va de 0 a 1 en los dos
         ejes: sin corregir por la proporción, las ondas salen
         estiradas en el eje largo */
      gl.uniform2f(uRelacion, 1.0, h / Math.max(1, w));
    };

    const pinta = () => {
      gl.uniform1f(uTiempo, tiempo);
      gl.uniform1f(uHover, hoverActual);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const cuadro = (ahora) => {
      raf = requestAnimationFrame(cuadro);
      const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 0;
      ultimo = ahora;
      tiempo += dt;
      hoverActual += (hoverDestino - hoverActual) * SUAVIZADO_HOVER;
      pinta();
    };

    const arrancar = () => {
      if (raf !== null || !listo || !enPantalla) return;
      if (menosMovimiento.matches) {
        /* movimiento reducido: se pinta UN fotograma con el
           tiempo a cero. La imagen se ve entera y con su luz;
           simplemente no respira. */
        tiempo = 0;
        hoverActual = 0;
        pinta();
        return;
      }
      ultimo = 0;
      raf = requestAnimationFrame(cuadro);
    };

    const parar = () => {
      if (raf === null) return;
      cancelAnimationFrame(raf);
      raf = null;
    };

    const alEntrar = () => {
      hoverDestino = 1;
    };
    const alSalir = () => {
      hoverDestino = 0;
    };

    const ro = new ResizeObserver(() => {
      medir();
      if (listo && menosMovimiento.matches) pinta();
    });
    ro.observe(c);

    const io = new IntersectionObserver(
      ([e]) => {
        enPantalla = e.isIntersecting;
        if (enPantalla) arrancar();
        else parar();
      },
      { threshold: 0 }
    );
    io.observe(c);

    const aplicarPreferencia = () => {
      parar();
      arrancar();
    };

    /* El hover se escucha en el elemento padre y no en el canvas:
       el fondo lleva pointer-events: none, así que el canvas no
       recibe eventos. El padre sí puede activarlos para su caja. */
    const zona = c.parentElement;
    zona?.addEventListener("pointerenter", alEntrar);
    zona?.addEventListener("pointerleave", alSalir);
    menosMovimiento.addEventListener("change", aplicarPreferencia);

    return () => {
      parar();
      ro.disconnect();
      io.disconnect();
      zona?.removeEventListener("pointerenter", alEntrar);
      zona?.removeEventListener("pointerleave", alSalir);
      menosMovimiento.removeEventListener("change", aplicarPreferencia);
      gl.deleteTexture(tex);
      gl.deleteTexture(texMascara);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(programa);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [src, mascara]);

  if (falla) {
    /* Va envuelto en el mismo span que el canvas para que la
       sombra de contacto y el resplandor —que son pseudoelementos
       de esa caja— sigan existiendo aunque WebGL no arranque. Un
       <img> suelto no admite ::before, y el logo se quedaría
       flotando sin apoyo justo en el navegador más flojo. */
    return (
      <span className={`logo-shader ${className}`}>
        <img className="logo-shader__lienzo" src={src} alt={alt} />
      </span>
    );
  }

  return (
    <span className={`logo-shader ${className}`}>
      <canvas ref={lienzo} className="logo-shader__lienzo" aria-hidden="true" />
    </span>
  );
}

export default LogoShader;
