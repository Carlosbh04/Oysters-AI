/* ============================================================
   NOMBRES CORTOS DE LOS TEMAS DEL BLOG

   Los temas se escriben largos porque así se leen bien dentro de
   un artículo ("Inteligencia Artificial · 10 Ene 2025"). Pero en
   la tira de filtros de la portada del blog no caben: medido a
   390px, los nueve chips sumaban 1.170px de arrastre y solo se
   veían dos. "Inteligencia Artificial" ocupaba él solo 182px.

   Aquí está la versión corta de cada uno, y SOLO se usa ahí — en
   la ficha del artículo y en el listado sigue saliendo el nombre
   completo, que es donde hay sitio y donde importa la precisión.

   ---- LO QUE NO SE ACORTA, NO SE ROMPE ----
   Un tema que no esté en esta tabla sale con su nombre entero.
   Así, añadir una categoría nueva a blog.json no obliga a venir
   aquí: funcionará igual, solo ocupará más. Esta tabla es una
   mejora opcional, no un requisito.

   ---- Y EL NOMBRE LARGO NO SE PIERDE ----
   El `aria-label` del chip lleva el completo (ver
   FiltroCategorias.jsx), así que quien navega con lector de
   pantalla oye "Inteligencia Artificial, 1 artículo" — el
   recorte es solo para el ojo, que tiene la página delante.
   ============================================================ */
const CORTOS = {
  "Inteligencia Artificial": "IA",
  "IA Generativa": "Generativa",
  "IA y Creatividad": "Creatividad",
  "Casos de éxito": "Casos",
};

export function temaCorto(nombre = "") {
  return CORTOS[nombre] || nombre;
}
