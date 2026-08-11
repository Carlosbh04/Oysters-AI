import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Trophy,
    TrendingUp,
    Users,
    Heart,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import WorkCard from "./WorkCard";
import MarcasMarquee from "../marcas/MarcasMarquee";
import FiltroCategorias from "./FiltroCategorias";
import {
    PARAM_CATEGORIA,
    TODAS,
    getCategorias,
    categoriaActiva,
    filtraPorCategoria,
} from "./categorias";
/* las reglas de paginación viven fuera porque WorksSkeleton
   necesita las mismas y no puede importar este archivo (ver el
   porqué completo en paginacion.js) */
import {
    POR_PAGINA,
    PARAM_PAGINA,
    totalDePaginas,
    paginaActual,
} from "./paginacion";
import "./WorkList.css";

/* Métricas de la barra: edita aquí valores e iconos.
   Los iconos son componentes de lucide-react:
   https://lucide.dev/icons — importa el que quieras arriba
   y cámbialo aquí. */
const metricas = [
    { Icono: Trophy, valor: "+120", etiqueta: "Proyectos exitosos" },
    { Icono: TrendingUp, valor: "35%", etiqueta: "Promedio de mejora" },
    { Icono: Users, valor: "+2M", etiqueta: "Personas alcanzadas" },
    { Icono: Heart, valor: "98%", etiqueta: "Clientes satisfechos" },
];

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

function WorkList({ trabajos }) {
    /* ---- LA PÁGINA VIVE EN LA URL, NO EN useState ----
       Con estado de React la página se perdía en cuanto el
       componente se montaba de nuevo: recargar, volver con el
       botón atrás o abrir el enlace que te han pasado te dejaba
       siempre en la 1, aunque estuvieras leyendo la 4.

       En la URL se arregla solo, y de paso salen gratis tres
       cosas que el estado no daba:
         · recargar (F5) te deja donde estabas
         · atrás/adelante del navegador recorren las páginas
         · /works?pagina=3 es un enlace que se puede compartir

       No hace falta localStorage. Guardar ahí la página sería
       peor: alguien que entra semanas después por primera vez
       aterrizaría en la 4 sin haber pedido nada, y el enlace
       seguiría sin poder compartirse. */
    const [params, setParams] = useSearchParams();
    const rejillaRef = useRef(null);

    /* ---- EL ORDEN IMPORTA: PRIMERO FILTRAR, LUEGO PAGINAR ----
       Si se paginara sobre la lista completa y se filtrara
       después, la página 2 podría quedarse sin nada que enseñar
       aunque la categoría tuviera trabajos de sobra. Paginando
       sobre lo ya filtrado, el total de páginas se recalcula solo
       y `paginaActual` acota contra ESE total. */
    const categorias = getCategorias(trabajos);
    const categoria = categoriaActiva(params, trabajos);
    const filtrados = filtraPorCategoria(trabajos, categoria);

    /* las dos salen de paginacion.js, que es de donde las lee
       también el skeleton: si difirieran, el hueco que se pinta
       durante la carga no cuadraría con las cards que llegan */
    const totalPaginas = totalDePaginas(filtrados.length);
    const actual = paginaActual(params, filtrados.length);

    const visibles = filtrados.slice(
        (actual - 1) * POR_PAGINA,
        actual * POR_PAGINA
    );

    const cambiarCategoria = (slug) => {
        if (slug === categoria) return;

        const siguientes = new URLSearchParams(params);

        if (slug === TODAS) siguientes.delete(PARAM_CATEGORIA);
        else siguientes.set(PARAM_CATEGORIA, slug);

        /* VUELVE A LA 1 al cambiar de filtro. Sin esto, alguien
           en la página 3 que pulsa una categoría con dos trabajos
           se encontraría la rejilla vacía —o, con el acotado de
           paginacion.js, un salto a la última página sin haberlo
           pedido. Empezar por el principio es lo que espera
           cualquiera al cambiar de filtro. */
        siguientes.delete(PARAM_PAGINA);

        setParams(siguientes);
    };

    const irA = (n) => {
        if (n < 1 || n > totalPaginas || n === actual) return;

        /* se copian los parámetros que ya hubiera en vez de
           reemplazarlos: si mañana entra un filtro por categoría,
           paginar no debe borrarlo */
        const siguientes = new URLSearchParams(params);

        /* la 1 va SIN parámetro: /works es la dirección limpia de
           la sección, y ?pagina=1 solo sería ruido en la barra */
        if (n === 1) siguientes.delete(PARAM_PAGINA);
        else siguientes.set(PARAM_PAGINA, String(n));

        setParams(siguientes);

        /* Al cambiar de página el usuario está abajo, junto a los
           controles, y sin esto se quedaría mirando el final de
           una rejilla nueva. Se sube al principio de la rejilla,
           descontando el header fijo para que la primera fila no
           quede debajo de él. */
        const caja = rejillaRef.current?.getBoundingClientRect();
        if (!caja) return;

        const header =
            parseInt(
                getComputedStyle(document.documentElement).getPropertyValue(
                    "--header-height"
                )
            ) || 96;

        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        window.scrollTo({
            top: caja.top + window.scrollY - header - 24,
            behavior: reduce ? "auto" : "smooth",
        });
    };

    return (
        <section className="work-list">

            {/* Decoración ambiental: sparkles flotando.
                Los orbes difuminados van por CSS (::before/::after) */}
            <span className="work-deco work-deco-1" aria-hidden="true">✦</span>
            <span className="work-deco work-deco-2" aria-hidden="true">✦</span>
            <span className="work-deco work-deco-3" aria-hidden="true">✦</span>
            <span className="work-deco work-deco-4" aria-hidden="true">✦</span>


            {/* Cabecera */}
            <header className="work-list-head">

                {/* ---- EL TITULAR VA PRIMERO ----
                    Antes esta línea de apoyo iba ENCIMA del h1, y
                    medido a 1440px ocupaba 460px frente a los
                    230px de "Trabajos": el apoyo pesaba el doble
                    que el titular y era lo primero que se leía.
                    Debajo ya no compite — el h1 abre el bloque. */}
                <h1 className="work-list-title">
                    Trabajos
                    <span className="work-list-title-glow" aria-hidden="true"></span>
                </h1>

                <p className="work-list-claim">
                    Proyectos desarrollados por{" "}
                    {/* el resaltado va SOLO en las dos últimas
                        palabras: subrayar la frase entera no
                        resalta nada, porque no deja contraste
                        contra el que destacar */}
                    <span className="work-list-claim__marca">
                        nuestra compañía
                    </span>
                </p>

            </header>


            {/* Barra de métricas */}
            <div className="work-list-stats">

                {
                    metricas.map(({ Icono, valor, etiqueta }, index) => (
                        <div key={index} className="work-list-stat">

                            <span className="work-list-stat-icon" aria-hidden="true">
                                <Icono size={20} strokeWidth={2.2} />
                            </span>

                            <div className="work-list-stat-info">

                                <span className="work-list-stat-value">
                                    {valor}
                                </span>

                                <span className="work-list-stat-label">
                                    {etiqueta}
                                </span>

                            </div>

                        </div>
                    ))
                }

            </div>


            <FiltroCategorias
                categorias={categorias}
                activa={categoria}
                onCambiar={cambiarCategoria}
            />


            {/* Grid de tarjetas.
                La key lleva CATEGORÍA Y PÁGINA: fuerza a React a
                remontar la rejilla cuando cambia cualquiera de
                las dos, y con ello se relanza la cascada de
                entrada. Sin la categoría en la key, filtrar
                cambiaba las tarjetas de golpe y sin animación. */}
            <div
                className="work-list-grid"
                ref={rejillaRef}
                key={`${categoria}-${actual}`}
            >

                {
                    visibles.map((trabajo, i) => (
                        /* el wrapper lleva la animación de aparición (y el
                           apartarse de las vecinas): así no pisa el transform
                           del hover de la card — mismo truco que el home.
                           --w-i alimenta el stagger de la cascada en CSS. */
                        <div
                            className="work-reveal"
                            key={trabajo.id}
                            style={{ "--w-i": i }}
                        >

                            {/* el objeto entero: la card usa media
                                docena de campos y así añadir uno
                                nuevo no obliga a tocar esto */}
                            <WorkCard trabajo={trabajo} />

                        </div>
                    ))
                }

            </div>


            {/* Paginación. No se pinta con una sola página: un
                único botón "1" es ruido, no navegación. */}
            {totalPaginas > 1 && (
                <nav className="work-pag" aria-label="Paginación de trabajos">
                    <button
                        type="button"
                        className="work-pag__flecha"
                        onClick={() => irA(actual - 1)}
                        disabled={actual === 1}
                        aria-label="Página anterior"
                    >
                        <ChevronLeft size={18} strokeWidth={2.2} />
                    </button>

                    <ul className="work-pag__lista">
                        {tiraDePaginas(actual, totalPaginas).map((n) =>
                            typeof n === "string" ? (
                                /* aria-hidden: los puntos son una pista
                                   visual de "aquí faltan páginas", no
                                   contenido que valga la pena escuchar */
                                <li
                                    key={n}
                                    className="work-pag__salto"
                                    aria-hidden="true"
                                >
                                    …
                                </li>
                            ) : (
                                <li key={n}>
                                    <button
                                        type="button"
                                        className={`work-pag__num${
                                            n === actual ? " work-pag__num--activa" : ""
                                        }`}
                                        onClick={() => irA(n)}
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
                        className="work-pag__flecha"
                        onClick={() => irA(actual + 1)}
                        disabled={actual === totalPaginas}
                        aria-label="Página siguiente"
                    >
                        <ChevronRight size={18} strokeWidth={2.2} />
                    </button>
                </nav>
            )}


            {/* Cinta de marcas: va DEBAJO de la rejilla y encima
                del CTA — cierra la prueba (esto hemos hecho, para
                estos) justo antes de pedir el contacto */}
            <MarcasMarquee />

            {/* Banda CTA */}
            <div className="work-list-cta">

                <span className="work-list-cta-icon" aria-hidden="true">
                    <Sparkles size={24} strokeWidth={2} />
                </span>

                <div className="work-list-cta-text">

                    <h2>¿Tienes un proyecto en mente?</h2>

                    <p>
                        Hablemos de cómo la IA puede llevar tu negocio
                        al siguiente nivel.
                    </p>

                </div>

                <Link to="/contact" className="work-list-cta-button">
                    Hablemos <span aria-hidden="true">→</span>
                </Link>

            </div>

        </section>
    );
}

export default WorkList;