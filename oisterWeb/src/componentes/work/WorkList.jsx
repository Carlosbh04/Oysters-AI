import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import WorkCard from "./WorkCard";
import MarcasMarquee from "../marcas/MarcasMarquee";
import FiltroCategorias from "./FiltroCategorias";
import Paginacion from "../paginacion/Paginacion";
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


            {/* ---- AQUÍ IBA LA BARRA DE MÉTRICAS ----
                "+120 proyectos exitosos", "35% promedio de mejora",
                "+2M personas alcanzadas" y "98% clientes
                satisfechos". Se quita entera por decisión de
                contenido.

                ⚠️ Los cuatro números eran de MARCADOR, no medidos:
                si algún día vuelve una barra así, hay que traer las
                cifras reales antes de publicarla. */}

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


            {/* Paginación compartida con el blog (ver el porqué
                en paginacion/Paginacion.jsx). Con una sola página
                se oculta sola. */}
            <Paginacion
                actual={actual}
                total={totalPaginas}
                onIrA={irA}
                ariaLabel="Paginación de trabajos"
            />


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