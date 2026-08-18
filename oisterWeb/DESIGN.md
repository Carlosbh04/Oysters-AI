---
name: OYSTERS
description: El interior de la ostra, de noche — ciruela profunda, luz de nácar y piezas de cristal.
colors:
  nacar-violeta: "#8B5CF6"
  nacar-violeta-claro: "#B794FF"
  nacar-violeta-hondo: "#6D3FD1"
  lila-nacar: "#C9A8FF"
  rosa-concha: "#E070BE"
  rosa-concha-claro: "#F090D4"
  magenta-filo: "#E879F9"
  rosa-perla: "#FF9BE8"
  ciruela-honda: "#442F65"
  ciruela-media: "#4E3069"
  ciruela-alzada: "#56336B"
  concha-fondo: "#402B5F"
  tinta-perla: "#F6F0FF"
  tinta-perla-alta: "#E8E0FB"
  tinta-perla-suave: "#CDC1E2"
  tinta-perla-tenue: "#AFA0CC"
  sombra-honda: "#261A38"
  perla-clara: "#FFC0EF"
  perla: "#F5A1EC"
  perla-honda: "#E78BF0"
  filo-claro: "rgb(255 255 255 / 0.14)"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 1.1rem + 5.1vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.25rem + 2.35vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 1.05rem + 2vw, 2.55rem)"
    fontWeight: 700
    lineHeight: 1.34
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.2em"
  body-compact:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12.2px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  data:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  sm: "12px"
  md: "18px"
  lg: "24px"
  full: "999px"
components:
  cta-hero:
    backgroundColor: "#F5A1EC"
    textColor: "{colors.sombra-honda}"
    rounded: "{rounded.full}"
    padding: "0.95rem 1.9rem"
    typography: "{typography.body}"
  cta-hero-hover:
    backgroundColor: "{colors.rosa-concha}"
    textColor: "{colors.sombra-honda}"
  tarjeta-cristal:
    backgroundColor: "rgba(255, 255, 255, 0.06)"
    textColor: "{colors.tinta-perla}"
    rounded: "{rounded.md}"
    padding: "1.3rem"
  rotulo-seccion:
    textColor: "{colors.rosa-perla}"
    typography: "{typography.label}"
  etiqueta-herramienta:
    backgroundColor: "rgba(201, 168, 255, 0.10)"
    textColor: "{colors.lila-nacar}"
    rounded: "{rounded.full}"
    padding: "0.3rem 0.68rem"
---

# Design System: OYSTERS

## Overview

**Creative North Star: "El Interior de la Ostra"**

El visitante no está mirando una web sobre una ostra: está dentro de una. Las
paredes son ciruela profunda, la luz entra de lado y rebota en nácar, y cada
pieza de contenido —una tarjeta, un proyecto, un titular— es una perla en
formación: algo que la casa ha ido depositando capa sobre capa. Esa metáfora no
es decoración retrospectiva, es la herramienta de decisión: cuando aparezca un
elemento nuevo y no esté claro qué color, qué material o cuánta luz merece, la
pregunta es dónde cae dentro de la concha.

El carácter es **nocturno y seguro, con pulso técnico**. Nocturno porque el
fondo nunca se aclara: la página entera vive entre el 29% y el 32% de
luminosidad y todo lo que se lee lo hace por contraste de luz, no por
oscurecerse sobre blanco. Seguro porque los titulares son grandes, tranquilos y
con el tracking cerrado —no gritan, ocupan—. Y con pulso técnico por una sola
decisión que atraviesa todo el sitio: los rótulos de sección van en
monoespaciada con 0.2em de tracking, y esa voz de instrumento es lo que impide
que la atmósfera se vuelva perfume. Hay un estudio detrás, no un ambiente.

El sistema es **vivo siempre**, y esto es doctrina, no descripción. El
movimiento no espera al ratón: el anillo del CTA del hero orbita en bucle, el
oleaje de su relleno se ladea sin parar, el fondo respira. Una pieza quieta a la
espera de que alguien pase por encima es una pieza muerta en un sitio que va de
generación en tiempo real. La única excepción es `prefers-reduced-motion`, que
se honra en todo el sistema y no se negocia.

**Anti-referencia confirmada: la agencia de plantilla.** Degradado de banco de
imágenes, tres tarjetas iguales con su icono redondo, retícula de doce columnas
sin acento. Si una pantalla nueva podría llevar el logotipo de otro estudio sin
que se note, está mal, aunque cada valor salga de estos tokens.

**Key Characteristics:**
- Fondo ciruela continuo, nunca blanco, encadenado sección a sección
- Dos niveles de profundidad y solo dos: atmósfera y cristal
- Titulares grandes con tracking negativo; rótulos monoespaciados en versalitas
- Rosa como acento que sube, morado como base que sostiene
- Movimiento permanente, con motion reducido como única excepción

## Colors

Una sola familia —violeta ciruela— recorrida de extremo a extremo, con el rosa
subiendo por encima. El morado tira a ciruela y no a violeta frío (R>G, con R
cerca de B), y de ahí sale el tono cálido del fondo sin necesidad de teñir
ninguna sección.

### Primary
- **Nácar Violeta** (`#8B5CF6`): el morado de marca. Base de halos, sombras de
  color y filos. Rara vez aparece como relleno plano: casi siempre viaja con
  alfa, a través de los canales sueltos.
- **Nácar Violeta Claro** (`#B794FF`): la primera parada de los degradados de
  titular y el violeta que se lee sobre el fondo oscuro.
- **Nácar Violeta Hondo** (`#6D3FD1`): el extremo profundo, para el peso de las
  sombras de color y el cierre de los degradados.

### Secondary
- **Lila Nácar** (`#C9A8FF`): la voz de apoyo. Texto secundario sobre oscuro,
  líneas, iconos y etiquetas de herramienta. Es el color que hace legible sin
  llamar.

### Tertiary
- **Rosa Concha** (`#E070BE`) y **Rosa Concha Claro** (`#F090D4`): el acento que
  sube. Deliberadamente **más claro** que el morado: en un sistema oscuro, el
  acento se distingue por luz, no por saturación.
- **Magenta Filo** (`#E879F9`): el más saturado de la paleta. Reservado para lo
  que tiene que llamar: filos encendidos, filetes, remates.
- **Rosa Perla** (`#FF9BE8`): exclusivo de los rótulos de sección. Existe
  separado del magenta por una razón medida: a 16px en versalitas, el magenta
  saturado se quedaba en 3,9:1 sobre los fondos del home. Este llega a 8,2:1 y
  sigue leyéndose rosa en vez de lavado.

### Neutral
- **Ciruela Honda** (`#442F65`) / **Ciruela Media** (`#4E3069`) / **Ciruela
  Alzada** (`#56336B`): la cadena del home. Dos tonos que se alternan a lo largo
  del scroll con el punto medio como parada del 50%.
- **Concha Fondo** (`#402B5F`): el punto medio del degradado global, puesto
  también como `background-color` sólido en `html` y `body`. No es un duplicado:
  es lo que evita el fogonazo blanco mientras Chrome rasteriza las cuatro capas
  del degradado. Medido, pasó de 4 fotogramas en blanco de cada 22 a 0 de 22.
- **Tinta Perla** (`#F6F0FF`): el texto principal. Blanco roto hacia el lila, no
  blanco puro.
- **Tinta Perla Alta** (`#E8E0FB`): el cuerpo cuando cae **directamente sobre el
  degradado**, sin cristal debajo. Existe separado por una medición: con el
  párrafo en un lila grisáceo (`#DDD3F2`) el contraste daba el número pero el
  texto se leía como pie de foto. Este sube lo justo para leerse como texto.
- **Tinta Perla Suave** (`#CDC1E2`) y **Tinta Perla Tenue** (`#AFA0CC`): cuerpos
  secundarios y apoyos, sobre cristal.
- **Filo Claro** (`rgb(255 255 255 / 0.14)`): el canto. Es el único borde del
  sistema — ver la regla de los filos en Shapes.
- **Sombra Honda** (`#261A38`): la tinta oscura. Solo aparece **sobre** la
  superficie clara, nunca sobre el fondo.
- **Perla Clara** (`#FFC0EF`) · **Perla** (`#F5A1EC`) · **Perla Honda**
  (`#E78BF0`): los tres tonos de **la única superficie clara del sistema**, el
  degradado de las acciones principales. Estaban escritos a mano en el CTA del
  hero y sin nombre; al necesitarlos una segunda acción quedó claro que eran un
  token, no un valor suelto. Van juntos o no van: son un degradado, no tres
  colores.

### Named Rules

**La Regla de la Cadena.** Cada sección del home arranca exactamente en el tono
donde terminó la anterior y viaja hacia el otro: ciruela honda → alzada →
honda → alzada. Así los empalmes son invisibles y la página respira en vez de
irse aclarando sin freno. Al insertar una sección nueva, la única pregunta es en
qué tono cierra su vecina de arriba.

**La Regla del 29-32.** Encadenar las bases no basta. Lo que decide el salto
visible no es con qué color arranca una sección, sino cuánta luz se le echa
encima. La luminosidad HSL medida en los márgenes vive entre 29% y 32%. Si una
capa nueva se sale de esa banda, se le baja la opacidad; no se le cambia el
tono. Test: mide el margen izquierdo de la sección en HSL. Fuera de 29-32,
corrige la capa, no el token.

**La Regla del Canal Suelto.** Ninguna transparencia se escribe a mano. Se usa
`rgb(var(--rgb-primary) / .4)` y sus hermanos. Antes de existir esos canales, la
portada tenía 423 colores escritos a mano y 252 distintos, con siete familias
que eran el mismo color desviado dos o tres puntos por canal. Un hex nuevo
dentro de un componente es, casi siempre, un token que ya existe mal copiado.

## Typography

**Display / Body Font:** Inter, con `system-ui` detrás.
**Label Font:** la monoespaciada del sistema (`ui-monospace`, `SFMono-Regular`,
`Menlo`).

⚠️ **Inter se declara pero no se sirve.** El único tipo que el sitio carga por
`@font-face` es **Outfit** (pesos 500/600/700/800, en `public/fonts/`), y se usa
solo en la animación de intro y el logotipo superpuesto. En una máquina sin
Inter instalada, todo el cuerpo del sitio cae a `system-ui` —SF Pro en macOS,
Segoe UI en Windows, Roboto en Android—. Es decir: el sitio se ve distinto según
el sistema operativo del visitante, y en el tuyo se ve bien porque tienes Inter
instalada localmente. Esto está registrado como el estado real, no como el
deseado; resolverlo es servir Inter o adoptar Outfit para el cuerpo.

**Carácter:** una grotesca geométrica de contraste bajo, empujada a pesos altos
y tracking cerrado para que los titulares pesen por volumen. Contra ella, la
monoespaciada de los rótulos aporta el único gesto de instrumento del sistema.

### Hierarchy
- **Display** (700, `clamp(2.9rem, 1.1rem + 5.1vw, 5.5rem)`, interlínea 1,
  tracking -0.05em, versalitas): solo el titular del hero. Un titular por
  página, nunca dos.
- **Headline** (700, `clamp(2rem, 1.25rem + 2.35vw, 3.25rem)`, interlínea 1.12,
  tracking -0.03em): los titulares que abren sección.
- **Title** (700, `clamp(1.8rem, 1.05rem + 2vw, 2.55rem)`, interlínea 1.34): los
  titulares de bloque dentro de una sección.
- **Body** (400, 15.5px, interlínea 1.75): el párrafo de lectura. La interlínea
  alta no es estética: estos párrafos van a ancho largo (~120 caracteres en la
  entradilla centrada) y es lo que evita que el ojo salte de renglón.
- **Label** (700, 16px, tracking 0.2em, versalitas, monoespaciada): rótulos de
  sección. El tracking ancho es lo que convierte dos palabras en rótulo; pasado
  0.2em deja de agrupar y empieza a dispersar.
- **Body compacto** (400, 13.5px, interlínea 1.55): el cuerpo cuando va
  DENTRO de una pieza —una tarjeta, un sello, un plegable—. No es el cuerpo de
  lectura encogido: es el paso en que la frase acompaña a su titular en vez de
  competir con él. Ya lo usaban las tarjetas de "Qué hacemos" y el texto de
  Misión y Visión; faltaba registrarlo aquí.
- **Caption** (400, 12.2px, interlínea 1.62): resúmenes dentro de tarjeta.

### Named Rules

**La Regla de las Dos Voces.** Solo dos familias en todo el sistema: la sans
para todo lo que se lee, la monoespaciada exclusivamente para rótulos de
sección. Una tercera familia no entra, y la monoespaciada no se usa para nada
que sea prosa.

**La Regla del 2,6.** Un rótulo no puede ser más de ~2,6 veces menor que el
titular al que acompaña. Medido: a 13,5px contra un titular de 3rem el salto
pasaba de 3× y el rótulo caía fuera de la jerarquía —no por contraste, que daba
5,7:1, sino por peso—. A 16px el salto baja a 2,6 y el rótulo entra.

**La Regla del Titular Ancho.** Ningún titular puede quedar más estrecho que el
párrafo que lleva debajo. Cuando pasa, la jerarquía se invierte: pesa más lo que
explica que lo que anuncia. Test: mide la línea más larga del titular contra el
ancho del párrafo. Si el titular llena menos del 90%, baja su cuerpo hasta que
ocupe menos líneas y las llene.

## Layout

**Contenedor:** 1280px (`--container`), con 1700px para la sección "Nosotros",
que respira más ancha a propósito. **Cabecera:** 96px.

**Ritmo vertical:** no hay escala de espaciado. El espaciado se resuelve por
componente con `clamp()`, y esto está registrado como **deuda del sistema**, no
como decisión: significa que dos secciones pueden abrir con aire distinto sin
que nada lo impida. El único hueco que sí está tokenizado es
`--hueco-rotulo: 2.6rem`, la separación entre un rótulo y su titular en móvil, y
el motivo por el que existe es instructivo: cada sección traía el suyo (16px en
una, 22px en tres) y en la mano se notaba.

⚠️ **Se aplica como `margin-bottom` del rótulo, con el titular a `margin-top: 0`.**
Al revés no funciona: donde el contenedor es flujo normal los dos márgenes
colapsan y manda el mayor (42px), pero donde es flex no colapsan y se suman
(64px). En un solo lado, el hueco vale lo mismo en los dos casos.

**Cortes responsivos.** Los que sostienen el sistema son dos:
- **1080px** — el cambio de maquetación. Por encima: recorrido con curvas,
  columnas, plegables abiertos. Por debajo: pila vertical y acordeones.
- **560px** — el ajuste tipográfico de la mano: titulares que parten en bloques,
  cuerpos recalculados.

El proyecto usa además 640, 768, 800, 820, 860, 900, 1000, 1100 y 1101px en
hojas concretas. Eso es **deriva**, no diseño: una pantalla nueva debe usar 1080
y 560 salvo que tenga un motivo medido para no hacerlo, y ese motivo debe
quedar escrito junto a la regla.

**Densidad:** amplia. Las secciones se leen de una en una, con el titular
ocupando su propio aire antes de que empiece el contenido.

## Elevation & Depth

**Dos niveles, y no hay tercero.** Al fondo, una atmósfera: el degradado global
con tres focos de luz —rosa arriba a la izquierda, violeta a la derecha y un
rebote rosa desde abajo que impide que la parte baja se apague— más las capas de
halo de cada sección. Encima, piezas de **cristal**: superficies con desenfoque
de fondo real (`backdrop-filter: blur(18px) saturate(1.15)`), filo claro de 1px,
brillo interior superior y sombra grande.

No existe un nivel intermedio. Una pieza o flota en cristal o es atmósfera; una
tarjeta semi-opaca sin desenfoque ni filo es exactamente el elemento que este
sistema no tiene.

### Shadow Vocabulary
- **Sombra de cristal** (`0 20px 50px rgba(10,4,24,.45)`, con
  `inset 0 1px 0 rgba(255,255,255,.14)`): las tarjetas y superficies flotantes.
  La sombra proyectada da el despegue; el brillo interior superior dibuja el
  canto iluminado, que es lo que hace que se lea como vidrio y no como caja.
- **Sombra de acción** (`0 1px 2px rgba(0,0,0,.4)`, `0 8px 16px -4px` del morado
  hondo al 40%, `0 24px 48px -12px` del morado al 45%): botones y elementos
  pulsables.
- **Sombra suave de página** (`0 30px 80px rgba(0,0,0,.45)` + `0 0 60px` del
  morado al 10%): bloques grandes.

### Named Rules

**La Regla del Halo.** En un sistema oscuro la sombra negra no esculpe: se
pierde contra el fondo. Todo relieve lleva **dos** capas — una negra densa para
la separación y un halo de color de la paleta para el volumen. Una sombra sin su
halo de color se lee como suciedad, no como profundidad.

**La Regla de los Dos Niveles.** Atmósfera abajo, cristal arriba. Si una pieza
nueva no encaja limpiamente en uno de los dos, el problema es la pieza.

## Shapes

Rectángulos blandos para lo que contiene, píldora completa para lo que se pulsa.

- **12px** (`sm`): piezas pequeñas — el azulejo del icono dentro de una tarjeta.
- **18px** (`md`): tarjetas de contenido. Es el radio dominante del sistema.
- **24px** (`lg`): contenedores grandes y bloques de sección.
- **999px** (`full`): botones, etiquetas de herramienta, medallones (que además
  son círculo completo, `50%`).

Los filos son **claros y finos**, nunca oscuros: 1px de blanco entre el 12% y el
18% de alfa. En oscuro, un borde oscuro desaparece y uno claro dibuja el canto
por donde entra la luz. Es el mismo gesto que el brillo interior de la sombra de
cristal, visto desde el otro lado.

La geometría orgánica —las ondas que separan secciones, la cresta líquida del
CTA— se recorta con máscaras y radios asimétricos, nunca con imágenes. Es la
única forma curva del sistema que no es un radio.

### Named Rules

**La Regla de la Píldora.** Lo que se pulsa es píldora completa. Lo que contiene
es rectángulo blando. No hay estado intermedio: un botón con 18px de radio está
mal en este sistema aunque 18px sea un token válido.

## Components

### Buttons
- **Shape:** píldora completa (999px), `padding: 0.95rem 1.9rem`, peso 600,
  tracking -0.01em.
- **CTA principal (hero):** degradado rosa pálido
  (`160deg, #FFC0EF → #F5A1EC → #E78BF0`) con tinta **Sombra Honda** (`#261A38`).
  Es la única superficie clara del sitio, y por eso es la única que lleva tinta
  oscura.
- **Vivo en reposo:** un anillo de 1.5px recorre el perímetro en bucle
  (`conic-gradient` rotando sobre una propiedad registrada, con máscara `xor`
  para que solo se vea el filo). No espera al ratón.
- **Hover:** el anillo se detiene y el botón **se llena de rosa desde abajo**,
  como líquido subiendo, con la cresta ladeándose en oleaje permanente. La tinta
  oscurece para mantener contraste sobre el rosa.
- **Focus:** `outline: 2px solid` del violeta, con 3px de separación. Nunca se
  suprime.
- **Active:** `translateY(0) scale(0.98)` en 120ms.

### Chips (etiquetas de herramienta)
- **Style:** píldora de lila al 10% con tinta **Lila Nácar**, sin borde.
- **Uso:** exclusivamente para nombrar herramientas de IA. Son la expresión
  visual del posicionamiento —el taller abierto—, no un adorno reutilizable para
  cualquier lista.

### Cards / Containers
- **Corner Style:** 18px.
- **Background:** blanco al 6% sobre la atmósfera, con desenfoque de fondo
  (`blur(18px) saturate(1.15)`). La saturación por encima de 1 es lo que
  impide que el cristal apague el color que tiene detrás.
- **Border:** 1px de blanco al 14%.
- **Shadow:** la sombra de cristal (ver Elevation).
- **Internal Padding:** 1.3rem.

### Navigation
- Cabecera de 96px, transparente sobre la atmósfera, con el logotipo de la ostra
  a la izquierda. Por debajo de 1100px, menú hamburguesa a pantalla completa.

### Rótulo de sección (componente firma)
Versalitas monoespaciadas en **Rosa Perla**, con tracking de 0.2em, un filete en
degradado a cada lado que nace del lila y muere en transparente, y un halo
oscuro detrás que le da presencia sin subirle el color. Abre **todas** las
secciones del sitio. Es el elemento que más identifica al sistema: si una
sección nueva no lo lleva, no pertenece a esta web.

### Texto de arena (componente firma)
Cualquier bloque de texto puede deshacerse en granos al pasarle el cursor y
recomponerse al salir. En reposo no existe: no hay lienzo, ni granos en memoria,
ni bucle de animación — todo se fabrica en el primer `pointerenter` y se destruye
al terminar. Lee el texto del DOM carácter a carácter y lo pinta donde el
navegador ya lo colocó, así que hereda tipografía, color y ajuste de línea sin
replicar ninguna regla. **Solo existe en escritorio** (≥1080px, con cursor fino
y sin motion reducido); en móvil el componente no deja rastro en el DOM.

## Do's and Don'ts

### Do:
- **Do** encadenar el color de una sección nueva con el tono en que cierra su
  vecina de arriba, y comprobar después que los márgenes miden entre 29% y 32%
  de luminosidad HSL.
- **Do** escribir toda transparencia como `rgb(var(--rgb-*) / α)`. Si necesitas
  un color con alfa y no hay canal suelto para él, añade el canal al token; no
  escribas el hex.
- **Do** abrir cada sección con el rótulo monoespaciado, y separarlo de su
  titular con `--hueco-rotulo` aplicado como `margin-bottom` del rótulo.
- **Do** dar a cada sombra su halo de color además de la capa negra.
- **Do** mover las cosas en reposo. El sistema es vivo siempre.
- **Do** honrar `prefers-reduced-motion` en cada pieza que se mueva. Es la única
  excepción a lo anterior y no se negocia.
- **Do** usar 1080px y 560px como cortes. Si hace falta otro, escribe al lado por
  qué, con la medida que lo justifica.
- **Do** comprobar que cada titular nuevo llena al menos el 90% del ancho de su
  párrafo.

### Don't:
- **Don't** montar una pantalla que podría llevar el logotipo de otro estudio.
  Tres tarjetas iguales con icono redondo, degradado de banco de imágenes y
  retícula sin acento es la anti-referencia confirmada, y sale igual de mal
  usando estos tokens que sin ellos.
- **Don't** introducir un tercer nivel de profundidad. Atmósfera o cristal.
- **Don't** usar filos oscuros. En este fondo desaparecen; el canto se dibuja con
  blanco al 12-18%.
- **Don't** poner tinta oscura sobre el fondo. **Sombra Honda** solo existe
  encima de la píldora clara del CTA.
- **Don't** dar radio de tarjeta a un botón, ni forma de píldora a un contenedor.
- **Don't** meter una tercera familia tipográfica, ni usar la monoespaciada para
  prosa.
- **Don't** usar el rosa de los rótulos (`#FF9BE8`) para nada que no sea un
  rótulo de sección. Existe separado del magenta por una medición de contraste,
  y reutilizarlo borra esa distinción.
- **Don't** dejar un fondo transparente en `html` o `body`. El color sólido
  `#402B5F` es lo que evita el fogonazo blanco durante el rasterizado.
- **Don't** aplicar el hueco rótulo-titular como `margin-top` del titular:
  colapsa en flujo normal y suma en flex, y el resultado sale distinto según la
  sección.
