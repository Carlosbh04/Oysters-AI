import { Building2, LineChart, UtensilsCrossed } from "lucide-react";
import trabajos from "./trabajos";

/* ============================================================
   MARCAS DE LA CINTA

   ⚠️ ESTA LISTA ES UNA AFIRMACIÓN PÚBLICA. Cada nombre que se
   añada aquí le está diciendo al visitante "hemos trabajado para
   ellos". No metas una marca sin proyecto real detrás.

   Por eso la base NO está escrita a mano: sale de los `cliente`
   de data/trabajos.js. Si mañana entra un trabajo nuevo, su
   marca aparece sola en la cinta; y no puede aparecer ninguna
   que no tenga trabajo.

   El icono sí es manual (los datos de trabajos no lo tienen).
   Una marca sin icono asignado sale igual, solo que sin él.
   ============================================================ */

/* icono por cliente. La clave se compara en mayúsculas y sin
   acentos, así que da igual cómo esté escrito en trabajos.js */
const ICONOS = {
  ACCIONA: { Icono: Building2, color: "#f090d4" },
  BESTINVER: { Icono: LineChart, color: "#c9a8ff" },
  ALSEA: { Icono: UtensilsCrossed, color: "#ff8ad0" },
};

/* para las marcas sin entrada propia: se reparten en ciclo, así
   una marca nueva nunca sale sin color */
const COLORES_POR_DEFECTO = ["#c9a8ff", "#f090d4", "#a78bfa", "#ff8ad0"];

const normaliza = (s) =>
  s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/* Clientes DISTINTOS, en el orden en que aparecen en el
   portafolio. El Set evita que un cliente con dos trabajos salga
   dos veces en la misma vuelta. */
export function getMarcas() {
  const vistos = new Set();
  const marcas = [];

  for (const t of trabajos) {
    const nombre = t.cliente?.trim();
    if (!nombre) continue;

    const clave = normaliza(nombre);
    if (vistos.has(clave)) continue;

    vistos.add(clave);
    const ficha = ICONOS[clave];
    marcas.push({
      nombre,
      Icono: ficha?.Icono ?? null,
      color:
        ficha?.color ??
        COLORES_POR_DEFECTO[marcas.length % COLORES_POR_DEFECTO.length],
    });
  }

  return marcas;
}
