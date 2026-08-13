import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Paginacion.css";

/* ============================================================
   PAGINACIÓN COMPARTIDA

   Nació dentro de WorkList y se extrajo aquí cuando el blog
   necesitó la misma. El componente solo pinta y avisa: recibe
   en qué página se está (`actual`), cuántas hay (`total`) y a
   quién llamar cuando se pulsa un número (`onIrA`). CÓMO se
   cambia de página es cosa de cada sección:

     · /works guarda la página en ?pagina=N (query param)
     · /blog la lleva en la ruta (/blog/page/N)

   y por eso aquí no hay ni useSearchParams ni useNavigate:
   meter cualquiera de los dos casaría el componente con una de
   las dos secciones y la otra no podría usarlo.

   El margen exterior tampoco vive aquí: cada sección separa la
   paginación de su rejilla como le toque (ver .work-list
   .paginacion y .blog-list .paginacion).
   ============================================================ */

/* A partir de cuántas páginas se empieza a truncar. Por debajo
   caben todas y listarlas es más cómodo que hacer pensar. */
const PAGINAS_SIN_TRUNCAR = 7;

/* Cuántas páginas se muestran a cada lado de la actual cuando sí
   se trunca. Con 1 la tira es: 1 … 4 5 6 … 12 */
const RADIO = 1;

/* Devuelve qué pintar en la tira: números y "…" donde hay salto.
   Sin esto, un portafolio de 200 trabajos generaría 34 botones
   que se desbordarían de la pantalla. Se muestran SIEMPRE la
   primera y la última —son los saltos que más se usan— más una
   ventana alrededor de donde estás. */
function tiraDePaginas(actual, total) {
    if (total <= PAGINAS_SIN_TRUNCAR) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    /* un Set porque los rangos se solapan cerca de los extremos:
       en la página 2, "actual - 1" ya es la primera */
    const numeros = new Set([1, total, actual]);
    for (let i = 1; i <= RADIO; i++) {
        if (actual - i > 1) numeros.add(actual - i);
        if (actual + i < total) numeros.add(actual + i);
    }

    const tira = [];
    let previa = 0;
    for (const n of [...numeros].sort((a, b) => a - b)) {
        /* hueco de UNA página: mejor el número que unos puntos
           suspensivos que ocupan lo mismo y además no llevan a
           ningún sitio */
        if (n - previa === 2) tira.push(previa + 1);
        else if (n - previa > 2) tira.push(`salto-${n}`);
        tira.push(n);
        previa = n;
    }
    return tira;
}

function Paginacion({ actual, total, onIrA, ariaLabel = "Paginación" }) {
    /* No se pinta con una sola página: un único botón "1" es
       ruido, no navegación. */
    if (total <= 1) return null;

    return (
        <nav className="paginacion" aria-label={ariaLabel}>
            <button
                type="button"
                className="paginacion__flecha"
                onClick={() => onIrA(actual - 1)}
                disabled={actual === 1}
                aria-label="Página anterior"
            >
                <ChevronLeft size={18} strokeWidth={2.2} />
            </button>

            <ul className="paginacion__lista">
                {tiraDePaginas(actual, total).map((n) =>
                    typeof n === "string" ? (
                        /* aria-hidden: los puntos son una pista
                           visual de "aquí faltan páginas", no
                           contenido que valga la pena escuchar */
                        <li
                            key={n}
                            className="paginacion__salto"
                            aria-hidden="true"
                        >
                            …
                        </li>
                    ) : (
                        <li key={n}>
                            <button
                                type="button"
                                className={`paginacion__num${
                                    n === actual ? " paginacion__num--activa" : ""
                                }`}
                                onClick={() => onIrA(n)}
                                /* aria-current es lo que le dice al
                                   lector de pantalla en qué página
                                   está; el color solo lo dice a quien
                                   ve */
                                aria-current={n === actual ? "page" : undefined}
                                aria-label={`Página ${n}`}
                            >
                                {n}
                            </button>
                        </li>
                    )
                )}
            </ul>

            <button
                type="button"
                className="paginacion__flecha"
                onClick={() => onIrA(actual + 1)}
                disabled={actual === total}
                aria-label="Página siguiente"
            >
                <ChevronRight size={18} strokeWidth={2.2} />
            </button>
        </nav>
    );
}

export default Paginacion;
