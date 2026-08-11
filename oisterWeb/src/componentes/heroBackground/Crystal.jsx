import "./Crystal.css";

/* ============================================================
   CRISTAL

   Sustituye al octaedro que se dibujaba en SVG. Aquel se descartó
   por una razón que no tenía arreglo por código: cuatro caras
   grandes de relleno liso no leen como una piedra tallada, por
   mucho material y refracción que se les dé. Estos son renders
   con facetas, caústicas y dispersión de verdad.

   ---- POR QUÉ NO ES UN <img> SUELTO ----
   Vienen renderizados sobre fondo BLANCO. Donde el cristal es
   transparente, su RGB es claro y su alfa opaco, así que sobre
   una sala oscura salen como manchas pálidas. Medido:

                    lum p50   p95
     cristales       0.17    0.85
     escultura       0.13    0.48   <- lo que sí pertenece a la escena
     sala vacía      0.011   0.015

   El p50 ya cuadra; lo que sobra es el techo. Por eso cada pieza
   va envuelta con una capa de niebla recortada contra su propia
   silueta: mezclar hacia el color de la sala baja los brillos y
   sube los negros a la vez, que es lo que hace la distancia.

   La densidad se pasa desde fuera porque no es la misma para una
   pieza en primer plano que para una al fondo: la niebla es
   justamente lo que dice a qué distancia está cada una.

   ---- POR QUÉ NO SE ENCADENAN LOS CUATRO RENDERS ----
   Se probó: los cuatro archivos son el mismo octaedro en ángulos
   distintos —siluetas coincidentes entre el 69% y el 85%, mismo
   tamaño y centro—, así que parecían fotogramas de un giro.

   No funciona, y el motivo es de cuántos hay. Fundir entre dos
   ángulos distintos no muestra una piedra girando: muestra dos
   piedras superpuestas, un fantasma doble. El ojo solo interpreta
   movimiento cuando los fotogramas están lo bastante cerca entre
   sí, y para un giro completo hacen falta del orden de 24 a 36.
   Con cuatro, cada salto es de 90 grados.

   Así que el giro se hace con una rotación real de la pieza y una
   sola imagen. Ver hbCristalGira en el CSS.
   ============================================================ */
function Crystal({ src, fotogramas, className = "", niebla = 0.3, style }) {
  const caras = fotogramas ?? [src];

  return (
    <span
      className={`hb-cristal-pieza ${className}`}
      style={{ "--silueta": `url(${caras[0]})`, "--niebla": niebla, ...style }}
    >
      {caras.map((f, i) => (
        <img
          key={f}
          src={f}
          alt=""
          aria-hidden="true"
          className={caras.length > 1 ? "hb-cristal-pieza__cara" : ""}
          /* el retardo negativo reparte los cuatro por el ciclo:
             cada uno entra un cuarto de vuelta después del
             anterior */
          style={caras.length > 1 ? { animationDelay: `${-i * 5}s` } : undefined}
        />
      ))}
    </span>
  );
}

export default Crystal;
