# Vídeo del hero — deja el archivo AQUÍ

Este es el hueco del vídeo que sustituye a la ostra 3D del home.
El componente que lo recorta y lo pinta es `src/pages/home/HeroVideo.jsx`.

## Archivo actual

```
public/videos/hero/david-oysters.mp4    1920x1080 · 10 s · 5,4 MB
```

El nombre está apuntado en `SOURCES`, arriba del todo de
`HeroVideo.jsx`. Si algún día lo cambias o subes otra versión, ajusta
esa línea (o llama al archivo nuevo igual y no toques nada).

Opcionalmente puedes dejar también un `.webm` (VP9): pesa menos y
Chrome/Firefox lo preferirán. Para activarlo hay que descomentar su
línea en `SOURCES` — si no lo haces, el navegador ni lo pide.

### Calibración

Los umbrales del recorte en `HeroVideo.jsx` están medidos sobre ESTE
vídeo: el 79,85% de los píxeles de un fotograma es negro absoluto y el
ruido de fondo en las esquinas llega como mucho a 3/255. Si sustituyes
el vídeo por otro, repasa `KEY_LOW` / `KEY_SLOPE` y `FIT_SCALE`.

### Audio

El archivo lleva una pista AAC a 319 kbps que no se usa (el vídeo va
muteado a la fuerza: es requisito del autoplay). Son unos 400 KB de los
5,4 MB. Quitarla es gratis y no cambia nada visual:

```sh
ffmpeg -i david-oysters.mp4 -an -c:v copy david-oysters-sinaudio.mp4
```

## Cómo tiene que venir el vídeo

Lo importante es esto, porque de ello depende que el recorte salga limpio:

1. **Fondo negro puro `#000000`.** Negro plano y uniforme, sin degradado,
   sin viñeta, sin gris de compresión. Todo lo que sea negro desaparece.
2. **Sin borde ni halo claro** alrededor del objeto. Si el recorte original
   dejó un contorno blanquecino, ese contorno SÍ se verá (es luz, y la luz
   es lo que el shader conserva). Que lo limpien en el recorte.
3. **Sin logos, marcas de agua ni barras negras** — las barras no molestan
   (son negro, desaparecen), pero descuadran el encuadre.
4. **Objeto centrado** en el fotograma, con algo de aire alrededor.
5. **Sin audio** (el vídeo va muteado; el audio solo suma peso).
6. **Loopeable**: el último fotograma debe enlazar con el primero. Si no,
   se verá un salto cada vuelta y ahí es donde se nota que es un vídeo.

## Formato recomendado

| | |
|---|---|
| Códec | H.264 (High), `yuv420p` |
| Resolución | ~1200–1400 px de alto (más no aporta: el área en pantalla ronda los 900 px) |
| FPS | 25–30 |
| Duración | 6–12 s en bucle |
| Peso objetivo | menos de 6 MB |
| Audio | ninguno |

Si tienes el archivo en bruto, esto lo deja listo:

```sh
ffmpeg -i entrada.mov \
  -an \
  -vf "scale=-2:1280" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 23 -preset slow \
  -movflags +faststart \
  hero.mp4
```

Y el WebM opcional:

```sh
ffmpeg -i entrada.mov -an -vf "scale=-2:1280" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 \
  hero.webm
```

## Nota sobre el peso

`public/` entero se copia al build. Esta carpeta ya arrastra 268 MB de
vídeos de proyectos, así que no hace falta ser heroico, pero el vídeo del
hero se descarga en TODAS las visitas de escritorio: cada MB de más se
paga en la primera impresión.

## ¿Y si consigo un vídeo con transparencia real?

Si algún día te dan un WebM VP9 con canal alfa, el recorte deja de hacer
falta... pero Safari no lo reproduce, así que seguirías necesitando el
mp4 sobre negro como plan B. Por eso el keying es la opción por defecto:
funciona igual en todos los navegadores.
