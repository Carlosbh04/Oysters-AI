import PageSkeleton from "./PageSkeleton";
import {
  WorksSkeleton,
  WorkDetailSkeleton,
  ContactSkeleton,
} from "./pageSkeletons";

/* ===== Mapa ruta → skeleton =====
   El patrón de las grandes: cada vista tiene su skeleton que
   calca su layout, y este resolutor decide cuál mostrar según
   la ruta DESTINO. Las rutas sin registro caen al genérico
   (PageSkeleton) — la Home usa el genérico a propósito: su
   estructura hero + cards ya la calca.

   Para añadir uno nuevo: crea el componente en
   pageSkeletons.jsx con los primitivos y registra su ruta
   aquí. El matching es por prefijo más largo: "/works/23"
   encuentra "/works/:id" vía el registro de "/works" salvo
   que exista uno más específico. */

const SKELETON_MAP = {
  "/works": WorksSkeleton,
  "/contact": ContactSkeleton,
};

/* rutas con parámetro: registro explícito por patrón */
const DYNAMIC_MAP = [
  { test: /^\/works\/[^/]+$/, skeleton: WorkDetailSkeleton },
];

export function getSkeletonFor(pathname) {
  /* 1º: patrones dinámicos (más específicos) */
  const dynamic = DYNAMIC_MAP.find(({ test }) => test.test(pathname));
  if (dynamic) return dynamic.skeleton;

  /* 2º: prefijo estático más largo */
  const match = Object.keys(SKELETON_MAP)
    .filter((route) => pathname === route || pathname.startsWith(route + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return match ? SKELETON_MAP[match] : PageSkeleton;
}

export default getSkeletonFor;