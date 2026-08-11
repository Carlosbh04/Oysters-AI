import { User, Building2, Calendar, Globe } from "lucide-react";

/* ============================================================
   BARRA DE FICHA

   Una sola tarjeta partida en celdas iguales con separadores
   finos. Se pintan solo las celdas que tienen dato: un proyecto
   sin industria no deja un hueco vacío, deja tres celdas en vez
   de cuatro, y la rejilla se reparte sola porque va con
   `grid-auto-flow: column` y `1fr`.

   La spec pide tres celdas (cliente, industria, año). La cuarta
   —web— existe en los datos y aparece cuando la hay: tirarla
   sería perder contenido para cuadrar con un dibujo.
   ============================================================ */
function WorkMetaBar({ cliente, industria, anio, url }) {
  const celdas = [
    cliente && { icono: User, rotulo: "Cliente", valor: cliente },
    industria && { icono: Building2, rotulo: "Industria", valor: industria },
    anio && { icono: Calendar, rotulo: "Año", valor: anio },
    url && {
      icono: Globe,
      rotulo: "Web",
      valor: (
        <a href={url} target="_blank" rel="noreferrer">
          {url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>
      ),
    },
  ].filter(Boolean);

  if (!celdas.length) return null;

  return (
    <div className="wd-tarjeta wd-meta">
      {celdas.map(({ icono: Icono, rotulo, valor }) => (
        <div className="wd-meta__celda" key={rotulo}>
          <span className="wd-meta__icono" aria-hidden="true">
            <Icono strokeWidth={1.6} />
          </span>

          <span className="wd-meta__texto">
            <span className="wd-meta__rotulo">{rotulo}</span>
            <span className="wd-meta__valor">{valor}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default WorkMetaBar;
