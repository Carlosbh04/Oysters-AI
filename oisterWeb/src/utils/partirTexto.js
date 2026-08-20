/* ============================================================
   PARTIR UN TEXTO EN TROZOS ANIMABLES

   La onda de la salida del home necesita mover cada letra de un
   titular y cada palabra de un párrafo por separado. Para eso
   hace falta que cada trozo sea su propia caja, porque CSS no
   sabe transformar media palabra.

   Es lo mismo que hace SplitText de GSAP. Aquí se hace a mano
   porque son cuatro titulares y tres párrafos fijos: no hay nada
   que justifique traerse una librería.

   ---- LAS LETRAS SÍ ROMPEN EL LECTOR DE PANTALLA, LAS PALABRAS NO ----
   Esta es la diferencia que decide cómo se parte cada cosa.

   Partido por PALABRAS, el resultado es
       <span>Con</span> <span>soluciones</span>
   y un lector de pantalla lee «Con soluciones», exactamente
   igual que antes: los espacios siguen siendo espacios de verdad
   y una palabra dentro de un `span` sigue siendo una palabra.
   No hace falta ningún arreglo.

   Partido por LETRAS es otra historia: el lector encuentra once
   elementos sueltos y deletrea «C, R, A, F...». Por eso los
   titulares llevan `aria-label` con la frase entera y sus trozos
   van `aria-hidden`. Es el mismo patrón que ya usa el titular del
   hero (ver Home.jsx), no un invento nuevo.

   ---- Y SE PUEDE DESHACER ----
   Cada función devuelve cómo dejarlo como estaba. Hace falta:
   el hook que las llama se desmonta al cambiar de página, y sin
   deshacer, un texto partido se quedaría partido para siempre
   con sus variables a medio camino.
   ============================================================ */

/* Cuánto se reparte el retraso entre los trozos. No es el paso de
   cada uno: es el TOTAL que puede ocupar la cascada, y el paso
   sale de dividirlo entre los trozos que haya.

   Va así y no con un paso fijo porque un paso fijo no escala: a
   0,035 por letra, un titular de veintiséis letras necesitaría
   0,91 de recorrido solo para arrancar la última, y las primeras
   no terminarían de irse nunca. Repartiendo, la cascada de un
   titular corto va suelta y la de uno largo va apretada, pero
   las dos caben. */
const REPARTO_LETRAS = 0.45;
const REPARTO_PALABRAS = 0.4;

const paso = (n, reparto) => (reparto / Math.max(n - 1, 1)).toFixed(5);

/* ---- SE PARTE EL TEXTO, NO EL MARCADO ----
   Esta es la parte delicada. La primera versión hacía
   `el.innerHTML = ...` a partir de `el.textContent`, y eso APLANA
   lo que hubiera dentro. Y había cosas dentro: cuatro de los
   cinco titulares del home llevan un `<span>` con el acento de
   color —«pensamiento humano», «casos de uso», «Somos tu socio
   estratégico.», «N proyectos»— y al partirlos se perdieron los
   cuatro. El texto seguía ahí, pero plano.

   Ahora se recorren solo los NODOS DE TEXTO y cada uno se
   sustituye en su sitio. Los elementos que los contienen ni se
   tocan, así que el acento sigue siendo el acento y lo que se
   parte es únicamente lo que hay que animar.

   Los espacios se conservan como nodos de texto de verdad, no
   como trozos: así el navegador sigue pudiendo cortar la línea
   por donde le toca. */
const nodosDeTexto = (raiz) => {
  const fuera = [];
  const paseo = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  while (paseo.nextNode()) {
    if (paseo.currentNode.nodeValue.trim()) fuera.push(paseo.currentNode);
  }
  return fuera;
};

/* ---- LETRAS (titulares) ----
   `--j` es el número de letra y `--paso-salida` lo que tarda en
   arrancar la siguiente. Las letras se agrupan por PALABRA dentro
   de un contenedor que no parte, para que un titular largo siga
   cortando por donde debe y no deje una letra suelta al final de
   una línea. */
export function enLetras(el) {
  if (!el || el.dataset.partido) return null;

  const nodos = nodosDeTexto(el);
  if (!nodos.length) return null;

  const original = el.innerHTML;
  const etiqueta = el.getAttribute("aria-label");
  const texto = el.textContent.replace(/\s+/g, " ").trim();

  const letras = nodos.reduce(
    (n, t) => n + t.nodeValue.replace(/\s/g, "").length,
    0,
  );
  const p = paso(letras, REPARTO_LETRAS);

  let j = 0;
  for (const nodo of nodos) {
    const trozos = document.createDocumentFragment();

    /* el separador va en el grupo capturado, así que los espacios
       sobreviven tal cual estaban */
    for (const parte of nodo.nodeValue.split(/(\s+)/)) {
      if (!parte) continue;

      if (!parte.trim()) {
        trozos.appendChild(document.createTextNode(parte));
        continue;
      }

      const palabra = document.createElement("span");
      palabra.className = "salida-pal";

      for (const caracter of parte) {
        const letra = document.createElement("span");
        letra.className = "salida-tz";
        letra.setAttribute("aria-hidden", "true");
        letra.style.setProperty("--j", j++);
        letra.style.setProperty("--paso-salida", p);
        letra.textContent = caracter;
        palabra.appendChild(letra);
      }

      trozos.appendChild(palabra);
    }

    nodo.parentNode.replaceChild(trozos, nodo);
  }

  el.setAttribute("aria-label", texto);
  el.dataset.partido = "letras";

  return () => {
    el.innerHTML = original;
    if (etiqueta === null) el.removeAttribute("aria-label");
    else el.setAttribute("aria-label", etiqueta);
    delete el.dataset.partido;
  };
}

/* ---- PALABRAS (párrafos) ----
   Sin `aria-hidden` ni `aria-label`: como se explica arriba, un
   texto partido por palabras se lee igual que sin partir. */
export function enPalabras(el) {
  if (!el || el.dataset.partido) return null;

  const nodos = nodosDeTexto(el);
  if (!nodos.length) return null;

  const original = el.innerHTML;
  const cuantas = nodos.reduce(
    (n, t) => n + t.nodeValue.trim().split(/\s+/).length,
    0,
  );
  const p = paso(cuantas, REPARTO_PALABRAS);

  let j = 0;
  for (const nodo of nodos) {
    const trozos = document.createDocumentFragment();

    for (const parte of nodo.nodeValue.split(/(\s+)/)) {
      if (!parte) continue;

      if (!parte.trim()) {
        trozos.appendChild(document.createTextNode(parte));
        continue;
      }

      const palabra = document.createElement("span");
      palabra.className = "salida-pz";
      palabra.style.setProperty("--j", j++);
      palabra.style.setProperty("--paso-salida", p);
      palabra.textContent = parte;
      trozos.appendChild(palabra);
    }

    nodo.parentNode.replaceChild(trozos, nodo);
  }

  el.dataset.partido = "palabras";

  return () => {
    el.innerHTML = original;
    delete el.dataset.partido;
  };
}

/* ---- OJO CON EL NOMBRE DE LA VARIABLE ----
   Se llama `--paso-salida` y no `--paso` porque `--paso` YA
   existe: es el retardo entre letras de la entrada del hero, y
   allí vale un TIEMPO (`calc(0.15s + var(--i) * var(--paso))`,
   ver Home.css). Escribiéndole encima un número suelto, ese
   `calc` deja de ser válido y la entrada del hero se rompe —que
   es exactamente lo que pasó la primera vez.

   Una variable CSS no avisa de estas colisiones: hereda, y quien
   la lea se encuentra lo último que alguien escribió.

   ---- TROZOS QUE YA EXISTÍAN ----
   El titular del hero ya viene partido letra a letra desde el
   JSX, con su propia cascada de entrada. Volver a partirlo sería
   destruir esa entrada, así que en ese caso solo se le pone a
   cada letra lo que le falta para la onda.

   `--i` NO se toca: es de la entrada del hero y ya está ocupada.
   La onda usa `--j`, que es suya. */
export function marcarTrozos(el, selector) {
  if (!el || el.dataset.partido) return null;

  const trozos = [...el.querySelectorAll(selector)];
  if (!trozos.length) return null;

  const p = paso(trozos.length, REPARTO_LETRAS);
  trozos.forEach((t, i) => {
    t.classList.add("salida-tz");
    t.style.setProperty("--j", i);
    t.style.setProperty("--paso-salida", p);
  });

  el.dataset.partido = "marcados";

  return () => {
    trozos.forEach((t) => {
      t.classList.remove("salida-tz");
      t.style.removeProperty("--j");
      t.style.removeProperty("--paso-salida");
    });
    delete el.dataset.partido;
  };
}
