# Imagen del cristal — sección "Nuestro trabajo"

Guarda aquí el render del cristal con el nombre exacto:

    cristal.png

La usa `src/componentes/latestProjects/LatestProjects.jsx`. **No hay que
tocar código**: en cuanto el archivo exista, aparece. Si falta, el hueco
simplemente no se pinta y la sección sigue funcionando (el `onError` del
componente lo oculta, así que tampoco sale el icono de imagen rota).

## Cómo debe estar exportada

- **Fondo TRANSPARENTE.** Es lo importante. El render original viene sobre
  un lila sólido, y ese rectángulo se nota contra el morado oscuro de la
  sección por mucho que lo difuminemos. Con transparencia, el aura que
  pinta el CSS por detrás hace todo el trabajo y el cristal flota de verdad.
- **Cuadrada** (1:1). El contenedor reserva esa proporción; otra relación
  se recorta con `object-fit: contain` y queda descentrada.
- **~1400 px de lado** basta. A 2× cubre el tamaño máximo que ocupa en
  pantalla (unos 620 px) y no infla el peso sin motivo.
- **PNG** si tiene transparencia con bordes suaves. Si la exportas a WebP
  (pesa bastante menos), cambia la extensión también en `LatestProjects.jsx`.

## Si solo tienes la versión con fondo lila

Funciona igual, pero hay que encender el modo mezcla. En
`LatestProjects.css`, en el bloque `.latest-projects__crystal`:

    --lp-crystal-blend: screen;

Eso hace que los tonos oscuros del fondo del render desaparezcan contra la
sección y solo suba la luz del cristal. No queda tan limpio como con un PNG
transparente —el lila aclara un poco la zona— pero se integra.

## Diales

Todos están arriba del bloque `.latest-projects__crystal` en el CSS:

| Dial | Qué hace |
|---|---|
| `--lp-crystal-size` | Cuánto ocupa respecto a su columna |
| `--lp-crystal-fade` | Dónde empieza a disolverse el borde |
| `--lp-crystal-glow` | Intensidad del aura de detrás |
| `--lp-crystal-blend` | `normal` (PNG transparente) o `screen` (PNG con fondo) |
