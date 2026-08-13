import {
  Layers,
  Megaphone,
  Clapperboard,
  Workflow,
  WandSparkles,
  Bot,
  Sparkles,
} from "lucide-react";

/* ============================================================
   CATEGORÍAS DE /works — las píldoras de filtro

   ⚠️ LA LISTA NO SE ESCRIBE A MANO. Sale de los `categoria` de
   data/trabajos.js, por el mismo motivo que la cinta de marcas
   sale de los `cliente`: una lista escrita aparte se queda vieja
   en cuanto entra un proyecto con categoría nueva, y entonces el
   filtro miente — enseña categorías vacías o esconde trabajos.

   Aquí ni siquiera puede pasar: si una categoría existe es que
   hay al menos un trabajo con ella, y si el último trabajo de
   una categoría se va, su píldora desaparece sola.

   El icono sí es manual (los datos no lo traen). Una categoría
   sin icono asignado sale igual, con el de por defecto.
   ============================================================ */

/* nombre del parámetro en la URL: /works?categoria=video-con-ia */
export const PARAM_CATEGORIA = "categoria";

/* el valor de "sin filtro". No viaja en la URL —/works a secas
   ya significa todos— pero hace falta un nombre para marcar qué
   píldora está activa. */
export const TODAS = "todos";

/* Convierte "Vídeo con IA" en "video-con-ia".
   Sin acentos y en minúsculas para que la URL se pueda escribir
   a mano y compartir sin que el navegador la llene de %C3%AD. */
function aSlug(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* icono por slug. Añadir una entrada aquí es opcional: lo que no
   esté cae en el de por defecto. */
const ICONOS = {
  "marketing-con-ia": Megaphone,
  "video-con-ia": Clapperboard,
  "contenidos-y-crm": Workflow,
  "contenido-generativo": WandSparkles,
  automatizacion: Bot,
};

const ICONO_POR_DEFECTO = Sparkles;

/* Las categorías distintas, en el orden en que aparecen en el
   portafolio (que va de más nuevo a más viejo, ver trabajos.js).
   Devuelve también CUÁNTOS trabajos tiene cada una: el número se
   pinta en la píldora y evita que alguien pulse un filtro para
   encontrarse un resultado. */
export function getCategorias(trabajos) {
  const porSlug = new Map();

  for (const t of trabajos) {
    const nombre = t.categoria?.trim();
    if (!nombre) continue;

    const slug = aSlug(nombre);
    const ficha = porSlug.get(slug);

    if (ficha) ficha.cuantos += 1;
    else
      porSlug.set(slug, {
        slug,
        nombre,
        cuantos: 1,
        Icono: ICONOS[slug] ?? ICONO_POR_DEFECTO,
      });
  }

  return [
    { slug: TODAS, nombre: "Todos", cuantos: trabajos.length, Icono: Layers },
    ...porSlug.values(),
  ];
}

/* Qué categoría está activa según la URL.
   Se valida contra las que EXISTEN: un ?categoria=loquesea
   escrito a mano —o el enlace viejo de una categoría que ya no
   tiene trabajos— cae en "todos" en vez de dejar la rejilla
   vacía sin explicación. Mismo criterio defensivo que la página
   en paginacion.js. */
export function categoriaActiva(busqueda, trabajos) {
  const pedida = new URLSearchParams(busqueda).get(PARAM_CATEGORIA);
  if (!pedida) return TODAS;

  const existe = getCategorias(trabajos).some((c) => c.slug === pedida);
  return existe ? pedida : TODAS;
}

export function filtraPorCategoria(trabajos, slug) {
  if (!slug || slug === TODAS) return trabajos;
  return trabajos.filter((t) => t.categoria && aSlug(t.categoria) === slug);
}
