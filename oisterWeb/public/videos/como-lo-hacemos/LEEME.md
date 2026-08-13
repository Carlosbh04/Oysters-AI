# Vídeo de "Cómo lo hacemos"

`oysters.mp4` es la pieza que se reproduce en el marco del primer
bloque de la sección (el que en la home ocupa "Qué hacemos").

El póster —el fotograma que se ve antes de darle al play— está
aparte, en `public/img/como-lo-hacemos/oysters-poster.jpg`.

---

## Qué se hizo con el original

El archivo que llegó pesaba **194 MB**: 1920×1088 a 21 Mbps. Eso no
es un vídeo para web, es un máster. Puesto tal cual, cualquiera con
una conexión normal habría visto la rueda de carga en vez del
anuncio.

Lo que hay aquí ahora:

| | Original | Aquí |
|---|---|---|
| Tamaño | 194 MB | **16 MB** |
| Resolución | 1920×1088 | 1280×720 |
| Bitrate | 21 Mbps | 1,7 Mbps |
| Duración | 1:13 | 1:13 |

Doce veces menos, y la diferencia de imagen no se aprecia: medida
sobre un fotograma, la desviación media por píxel es de 6 sobre 765.

### El recorte de 8 píxeles

El original venía en 1920×**1088**, que no es 16:9 sino 30:17. El
marco de la maquetación sí es 16:9, así que sin recortar el vídeo
saldría estirado o con franjas. Se recortan 8px repartidos arriba y
abajo —contenido a sangre, no hay nada que perder ahí— y queda en
16:9 exacto.

### El comando

```bash
ffmpeg -i original.mp4 \
  -vf "crop=1920:1080,scale=1280:720:flags=lanczos" \
  -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 112k -ac 2 \
  -movflags +faststart \
  oysters.mp4
```

Tres cosas de ese comando que no son adorno:

- **`-crf 26`** y no un bitrate fijo: la calidad se mantiene constante
  y el archivo ocupa lo que necesite cada escena. A 23 el archivo
  sube a 23 MB y la diferencia medida es de 0,6 sobre 765 — no
  compensa.
- **`-pix_fmt yuv420p`**: sin esto, un origen en 4:2:2 o 4:4:4 sale
  en un formato que Safari no reproduce. Se ve negro y sin errores
  en consola, que es de lo más difícil de diagnosticar.
- **`-movflags +faststart`**: mueve el índice del archivo al
  principio. Sin él, el navegador tiene que descargar el vídeo
  ENTERO antes de empezar a reproducir; con él, arranca con los
  primeros segundos.

---

## Si hay que sustituirlo

Mismo comando y mismo nombre, y no hay que tocar código. Si cambia
la duración, ojo: el marco ya no la lleva escrita —la lee del propio
vídeo—, así que se actualiza sola.

Y regenerar el póster, que sí es un archivo aparte:

```bash
ffmpeg -ss 0.3 -i oysters.mp4 -frames:v 1 -q:v 4 \
  ../../img/como-lo-hacemos/oysters-poster.jpg
```
