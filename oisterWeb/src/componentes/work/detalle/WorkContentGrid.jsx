import { Check, ClipboardList, Sparkles, Target, ListChecks } from "lucide-react";

/* ============================================================
   LAS TARJETAS DEL DETALLE

   Piezas sueltas en vez de una rejilla cerrada. Antes esto era un
   único componente que montaba dos columnas fijas —prosa a la
   izquierda, listas a la derecha— y decidía él solo el reparto.

   El problema de aquello no era el reparto sino quién mandaba: al
   estar la maquetación dentro del componente, cambiar el orden de
   la página obligaba a reescribirlo. Ahora cada tarjeta se sabe
   dibujar y es WorkDetail quien decide en qué fila va cada una,
   que es donde se ve la página entera.
   ============================================================ */

/* ---- PROSA ---- */
export function Descripcion({ parrafos = [] }) {
  if (parrafos.length === 0) return null;
  return (
    <div className="wd-tarjeta wd-descripcion">
      <h2 className="wd-rotulo">
        <span className="wd-rotulo__punto" aria-hidden="true" />
        Descripción del proyecto
      </h2>
      {parrafos.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export function Objetivo({ texto }) {
  if (!texto) return null;
  return (
    <div className="wd-tarjeta wd-descripcion">
      <h2 className="wd-rotulo">
        <Target strokeWidth={1.8} aria-hidden="true" />
        Objetivo
      </h2>
      <p>{texto}</p>
    </div>
  );
}

export function Resultado({ texto }) {
  if (!texto) return null;
  return (
    <div className="wd-tarjeta wd-descripcion">
      <h2 className="wd-rotulo">
        <Sparkles strokeWidth={1.8} aria-hidden="true" />
        Resultado
      </h2>
      <p>{texto}</p>
    </div>
  );
}

/* ---- LISTAS ---- */
export function Proyectos({ items = [] }) {
  if (items.length === 0) return null;
  return (
    <div className="wd-tarjeta">
      <h2 className="wd-rotulo">
        <ListChecks strokeWidth={1.8} aria-hidden="true" />
        Proyectos
      </h2>
      <Marcas items={items} />
    </div>
  );
}

export function Entregables({ items = [] }) {
  if (items.length === 0) return null;
  return (
    <div className="wd-tarjeta">
      <h2 className="wd-rotulo">
        <ClipboardList strokeWidth={1.8} aria-hidden="true" />
        Entregables
      </h2>
      {/* ---- A DOS COLUMNAS ----
          Los entregables son etiquetas cortas —dos o tres
          palabras— y en una sola columna dejaban media tarjeta
          vacía a la derecha mientras la lista se estiraba hacia
          abajo. En dos, la caja termina a la altura de la de
          herramientas que tiene al lado. */}
      <Marcas items={items} clase="wd-lista--dos" />
    </div>
  );
}

export function Herramientas({ items = [] }) {
  if (items.length === 0) return null;
  return (
    <div className="wd-tarjeta">
      <h2 className="wd-rotulo wd-rotulo--magenta">Tecnologías / Herramientas</h2>
      <ul className="wd-chips">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function Marcas({ items, clase = "" }) {
  return (
    <ul className={`wd-lista ${clase}`}>
      {items.map((t) => (
        <li key={t}>
          <span className="wd-lista__check" aria-hidden="true">
            <Check strokeWidth={3} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}
