#!/usr/bin/env python3
"""
Genera la máscara del texto del logo para el shader del hero.

  python3 herramientas/mascara-logo.py

Lee  src/assets/hero/oysters-3d.webp
Deja src/assets/hero/oysters-3d-texto.png    (450x378, gris)

QUÉ ES Y POR QUÉ EXISTE
-----------------------
El shader deforma el logo como si fuera líquido, pero el texto NO
puede deformarse. Necesita saber dónde están las letras.

Eso se intentó deducir dentro del propio shader umbralizando la
saturación —las letras son blancas, el líquido es violeta— y es
falso: un reflejo especular puro también se quema a blanco. Medido
sobre la textura real, un 27% del líquido se congelaba por error, y
esos brillos quietos rodeados de líquido en movimiento eran justo
lo que se desgarraba en tiras.

No es un problema de color sino de FORMA: las letras son trazos
gruesos, los brillos son bandas de pocos píxeles. Eso se separa con
morfología, y la morfología no se hace por píxel en tiempo real: se
hace una vez, aquí, y se guarda.

Además del frente blanco hay que coger el CANTO EXTRUIDO de las
letras —el lateral violeta de la O—, que también es geometría de la
letra. Se localiza por dos vías a la vez:

  · geometría: un extruido es la cara arrastrada en una dirección,
    así que barrer la máscara de la cara según ese vector da la
    región candidata;
  · superficie: dentro de esa región, el canto es LISO y el líquido
    tiene anillos y brillos. Medido, rugosidad 14 frente a 50.

Si mañana cambia el render del logo, hay que volver a ejecutar
esto. Y si cambia el ángulo del texto, hay que remedir EXTRUIDO.
"""

import subprocess
import sys
from collections import deque
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "src/assets/hero/oysters-3d.webp"
DESTINO = RAIZ / "src/assets/hero/oysters-3d-texto.png"

W, H = 900, 756          # tamaño de la textura original
w, h = W // 2, H // 2    # la máscara va a media resolución: es suave, no necesita más

# vector del extruido medido sobre la textura, ya a media resolución
EXTRUIDO = (-43, 20)

BLANCO = 0.68            # brillo mínimo para considerar "cara de letra"
SATURACION = 0.05        # las letras dan 0.016 en el p90; el líquido, 0.094 en el p50
RUGOSIDAD = 32           # frontera entre el canto (p50 14) y el líquido (p50 50)


def lee_pixeles():
    crudo = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", str(ORIGEN),
         "-pix_fmt", "rgba", "-f", "rawvideo", "-"],
        capture_output=True, check=True).stdout
    if len(crudo) != W * H * 4:
        sys.exit(f"la textura no mide {W}x{H}: revisa las constantes")
    return crudo


def satura(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    return 0 if mx == 0 else (mx - mn) / mx


def cara_y_lisura(d):
    """A resolución completa: dónde está el blanco de las letras y
    qué zonas son superficies lisas."""
    def px(x, y):
        i = (y * W + x) * 4
        return d[i], d[i + 1], d[i + 2], d[i + 3]

    cara, liso = bytearray(W * H), bytearray(W * H)
    vecinos = ((5, 0), (-5, 0), (0, 5), (0, -5),
               (4, 4), (-4, -4), (4, -4), (-4, 4))
    for y in range(H):
        for x in range(W):
            r, g, b, a = px(x, y)
            if a < 200:
                continue
            if max(r, g, b) / 255 > BLANCO and satura(r, g, b) < SATURACION:
                cara[y * W + x] = 255
            s = 0
            for dx, dy in vecinos:
                o = px(min(W - 1, max(0, x + dx)), min(H - 1, max(0, y + dy)))
                s += max(abs(r - o[0]), abs(g - o[1]), abs(b - o[2]))
            if s / 8 < RUGOSIDAD:
                liso[y * W + x] = 255
    return cara, liso


def a_media(src, voto):
    """Reduce a la mitad. `voto` decide cuántos de los cuatro píxeles
    hacen falta para marcar el resultado."""
    out = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            c = (src[(2 * y) * W + 2 * x], src[(2 * y) * W + 2 * x + 1],
                 src[(2 * y + 1) * W + 2 * x], src[(2 * y + 1) * W + 2 * x + 1])
            if sum(1 for k in c if k) >= voto:
                out[y * w + x] = 255
    return out


def barre(cara):
    """El canto es la cara arrastrada a lo largo del vector del
    extruido: la unión de todas sus traslaciones intermedias."""
    vx, vy = EXTRUIDO
    out = bytearray(cara)
    pasos = max(abs(vx), abs(vy))
    for k in range(1, pasos + 1):
        ox, oy = round(vx * k / pasos), round(vy * k / pasos)
        for y in range(h):
            sy = y - oy
            if not 0 <= sy < h:
                continue
            fila = cara[sy * w:(sy + 1) * w]
            if ox < 0:
                fila = fila[-ox:] + bytes(-ox)
            elif ox > 0:
                fila = bytes(ox) + fila[:w - ox]
            out[y * w:(y + 1) * w] = bytes(map(max, out[y * w:(y + 1) * w], fila))
    return out


def morfologia(src, r, dilatar):
    """Mínimo o máximo deslizante, separable, en O(n)."""
    out = bytearray(w * h)
    for eje in (0, 1):
        n, otro = (w, h) if eje == 0 else (h, w)
        for j in range(otro):
            lin = [src[j * w + i] if eje == 0 else src[i * w + j] for i in range(n)]
            q, res = deque(), [0] * n
            for i in range(n + r):
                if i < n:
                    while q and ((lin[q[-1]] <= lin[i]) if dilatar else (lin[q[-1]] >= lin[i])):
                        q.pop()
                    q.append(i)
                if i >= r:
                    k = i - r
                    while q[0] < k - r:
                        q.popleft()
                    res[k] = lin[q[0]]
            for i in range(n):
                if eje == 0:
                    out[j * w + i] = res[i]
                else:
                    out[i * w + j] = res[i]
        src, out = bytes(out), bytearray(w * h)
    return src


def desenfoca(src, r):
    """La rampa del filo tiene que ser LARGA. Si la máscara cortara en
    seco, el desplazamiento pasaría de cero a máximo en dos píxeles y
    cizallaría la imagen justo ahí — el mismo defecto que se venía a
    corregir, solo que mudado al contorno de las letras."""
    out = bytearray(w * h)
    for eje in (0, 1):
        n, otro = (w, h) if eje == 0 else (h, w)
        for j in range(otro):
            lin = [src[j * w + i] if eje == 0 else src[i * w + j] for i in range(n)]
            pre = [0]
            for v in lin:
                pre.append(pre[-1] + v)
            for i in range(n):
                a, b = max(0, i - r), min(n, i + r + 1)
                v = (pre[b] - pre[a]) // (b - a)
                if eje == 0:
                    out[j * w + i] = v
                else:
                    out[i * w + j] = v
        src, out = bytes(out), bytearray(w * h)
    return src


def main():
    d = lee_pixeles()
    cara_alta, liso_alto = cara_y_lisura(d)
    cara = a_media(cara_alta, 1)     # basta un píxel: la cara no debe encogerse
    liso = a_media(liso_alto, 3)     # mayoría: evita motas sueltas

    canto = bytes(min(b, l) for b, l in zip(barre(cara), liso))
    cuerpo = bytes(map(max, canto, cara))

    m = morfologia(cuerpo, 3, False)     # abrir: fuera las motas del test de lisura
    m = morfologia(m, 3, True)
    m = morfologia(m, 5, True)           # cerrar: tapa huecos dentro del cuerpo
    m = morfologia(m, 5, False)
    m = morfologia(m, 7, True)           # margen alrededor de la letra
    m = desenfoca(m, 8)                  # rampa suave

    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "gray",
         "-s", f"{w}x{h}", "-i", "-", "-y", str(DESTINO)],
        input=bytes(m), check=True)
    print(f"{DESTINO.name}: {DESTINO.stat().st_size // 1024} KB · "
          f"cubre el {sum(1 for v in m if v > 128) * 100 // (w * h)}% del lienzo")


if __name__ == "__main__":
    main()
