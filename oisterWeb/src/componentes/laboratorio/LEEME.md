# Laboratorio — banco de pruebas de componentes

Aquí se diseñan componentes nuevos antes de decidir si entran al
sitio. Es una zona de trabajo, no una sección pública.

## Cómo se usa

1. **Se crea aquí** el componente mientras se diseña
   (`MiComponente.jsx` + `MiComponente.css`, como el resto del
   proyecto: cada componente en su carpeta con su hoja al lado).
2. **Se prueba** montándolo donde toque, o en una ruta temporal.
3. **Cuando se aprueba, SE SACA de aquí** a
   `src/componentes/<nombre>/` y se actualizan sus imports. Lo que
   se queda en el laboratorio es lo que aún no está decidido.

## La regla que evita el problema de la vez pasada

El laboratorio anterior acumuló siete páginas y varios componentes
que ya no se usaban, más rutas, enlaces en los menús y comentarios
apuntando a sitios que ya no existían. Se borró entero.

Para que no vuelva a pasar:

- **Nada de producción vive aquí.** Si algo del sitio real lo
  importa, ese algo ya no es un experimento: sácalo a su carpeta
  definitiva ese mismo día.
- **Si se descarta, se borra.** No se deja "por si acaso" — el
  historial de git ya es el "por si acaso".
- **Los enlaces temporales en los menús se marcan** y se quitan
  cuando el experimento termina, gane o pierda.
