# Vídeo del cristal

Es el cristal que acompaña a "Nuestros últimos proyectos". Lo pinta
`src/componentes/latestProjects/LatestProjects.jsx`.

## Archivo actual

```
cristal.mp4    1000x1000 · 7 s · 1,4 MB · H.264 · sin audio
```

### Cómo se preparó (el original venía a 1440px y 6 MB)

```sh
ffmpeg -i original.mp4 -an \
  -vf "colorchannelmixer=rr=1:rg=0.20:gg=0.80:bg=0.20:bb=1,\
scale=1000:1000:flags=lanczos" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 28 -preset slow -movflags +faststart cristal.mp4
```

**El `colorchannelmixer` corrige el color, y hace falta.** El render
original tiene los brillos —el núcleo, los cantos de las facetas, los
aros— en **verde lima**, no en blanco y rosa como la imagen de
referencia. No es un problema de decodificación: lo confirman por
separado ffmpeg y AVFoundation (el decodificador de macOS, de la misma
familia que usa el navegador). El filtro pasa un 20 % del verde a rojo y
azul, que es el eje que le falta: el fondo y el cuerpo apenas se mueven
y los brillos vuelven a rosa.

⚠️ **Lo que NO hay que hacer: restar el color del fondo.** Fue el primer
intento y salió mal. Restar `(60,22,67)` a todos los píxeles le quita al
verde solo 22, pero al rojo 60 y al azul 67 — eso destruye el tono: un
morado `(145,102,154)` queda en `(85,80,87)`, o sea gris, y al compensar
la ganancia el cristal salía verde lima. El fondo no se resta: se recorta
por umbral de brillo en el filtro SVG, que no toca el color.

---

**Para sustituirlo basta con dejar el archivo con el mismo nombre.** Si no
está, se ve la imagen fija (`public/img/work/cristal.png`), que además
hace de `poster` — y que se generó extrayendo un fotograma de ESTE vídeo
ya recortado, para que las dos versiones compartan tratamiento.

⚠️ En `LatestProjects.jsx` solo se listan archivos que EXISTEN. Un
`<source>` que falta no da 404: el dev server de Vite devuelve el
index.html con un HTTP 200, el navegador intenta decodificar HTML como
vídeo y da por muerto el elemento entero sin probar las demás fuentes.

## Nombres (elige UNA de las dos vías)

### Vía A — sobre negro puro · **la recomendada**

```
cristal.mp4
```

Un solo archivo, H.264, ligero, sin sustos con Safari. El fondo negro se
recorta con un **luma key**: un filtro SVG (`lp-cristal-luma`, definido en
`LatestProjects.jsx`) pone el alfa de cada píxel igual a su brillo, así
que el negro pasa a transparente DE VERDAD. Misma idea que el WebGL de
`HeroVideo.jsx`, pero declarativa.

Ojo: NO sirve `mix-blend-mode: screen`. El blending solo mezcla con lo
pintado dentro del mismo contexto de apilado, y `.latest-projects__container`
crea uno con su `z-index: 2` — el vídeo nunca llega a mezclarse con el
fondo de la sección y el negro acaba pintando negro.

### Vía B — con transparencia real

```
cristal.mov     HEVC con alfa  → Safari e iOS
cristal.webm    VP9 con alfa   → Chrome, Firefox, Edge
```

Hacen falta **los dos**: ningún formato con alfa lo entienden todos los
navegadores. Es la misma pareja que ya usa el hero. Pesa bastante más que
la vía A.

⚠️ Lo que aprendimos con el hero (está apuntado en `HeroVideo.jsx`): el
`.mov` tiene que salir **tal cual del codificador de Apple**. Si lo
remultiplexas a `.mp4` con ffmpeg, Safari lo acepta pero no sabe
decodificarlo y el hueco se queda en blanco.

## Cómo tiene que venir

1. **Fondo negro puro `#000000`** (vía A): plano y uniforme, sin
   degradado, sin viñeta, sin gris de compresión. Todo lo negro
   desaparece — y lo que no sea negro del todo, se verá.
2. **Sin halo claro** alrededor del cristal. Un contorno blanquecino del
   recorte original SÍ se ve: es luz, y la luz es justo lo que se
   conserva.
3. **Bucle limpio**: el último fotograma tiene que enlazar con el
   primero. Si no, se nota el salto en cada vuelta y ahí se delata que
   es un vídeo.
4. **Cuadrado (1:1)** y con el cristal centrado, dejando aire alrededor
   — el hueco reserva esa proporción.
5. **Sin audio**: va muteado a la fuerza (lo exige el autoplay), así que
   la pista solo suma peso.

## Formato recomendado (vía A)

| | |
|---|---|
| Códec | H.264 (High), `yuv420p` |
| Resolución | 1000×1000 (el área en pantalla ronda los 620 px) |
| FPS | 25–30 |
| Duración | 4–6 s en bucle |
| Peso objetivo | **menos de 1,5 MB** |
| Audio | ninguno |

Es un adorno a mitad de página, no el hero: no puede pesar como él.

Si tienes el archivo en bruto:

```sh
ffmpeg -i entrada.mov \
  -an \
  -vf "scale=1000:1000" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 26 -preset slow \
  -movflags +faststart \
  cristal.mp4
```

## Lo que ya hace el componente

- **Silenciado, en bucle, `playsInline`** y con autoplay (requisitos de
  las políticas de reproducción de los navegadores).
- **Se pausa al salir de pantalla**, con su propio IntersectionObserver
  (umbral casi cero) — un bucle corriendo fuera de vista solo gasta
  batería.
- **`prefers-reduced-motion`**: a quien pide no ver movimiento se le
  sirve la imagen fija, no el vídeo.
- **Si el archivo falta**, se queda la imagen. Nada se rompe.

## Diales

En `LatestProjects.css`, arriba del bloque `.latest-projects__crystal`:
`--lp-crystal-size`, `--lp-crystal-zoom`, `--lp-crystal-fade` y
`--lp-crystal-glow`.

La dureza del recorte se ajusta aparte, en la última fila de la matriz del
`<filter id="lp-cristal-luma">` del JSX: es `alfa = R*a + G*b + B*c`.
Súbela para un cristal más sólido, bájala para más etéreo.

Si algún día se pasa a la vía B (alfa real), quita el `filter` de
`LatestProjects.css` — sobra.
