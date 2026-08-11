import { Link } from "react-router-dom";
import BucleVideo from "../bucleVideo/BucleVideo";
import { Building2 } from "lucide-react";
import "./WorkCard.css";

/* flecha compartida con el resto de la página: la misma que
   usa LatestProjects en el home */
function Arrow() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M2 7h9M7.5 3.5 11 7l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* cuántas herramientas de IA se listan al pie antes de resumir
   el resto en un "+N": con más de dos, el pie deja de leerse de
   un vistazo y compite con el título */
const IAS_VISIBLES = 2;

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

/* Texto del chip de fecha: `anio` obligatorio, `mes` opcional.

     anio: "2026"            → "2026"
     anio: "2026", mes: 1    → "Ene 2026"

   ---- POR QUÉ DOS CAMPOS Y NO UNO ----
   Aquí había un único campo `fecha: "2026-01"` que, cuando
   existía, IGNORABA a `anio`. Y eso se convirtió en una trampa
   real: al cambiar `anio` de 2025 a 2026 la tarjeta seguía
   diciendo 2025, porque mandaba el año metido dentro de `fecha`.
   Desde fuera parecía que uno de los dos campos no funcionaba.

   Ahora cada campo gobierna UNA cosa y ninguno pisa al otro:
   el año sale siempre de `anio`, pase lo que pase; `mes` solo
   añade el nombre del mes delante. Cambiar el año funciona
   siempre, haya mes o no.

   `mes` es un número (1-12) y no "Enero": así no hay que
   acordarse de mayúsculas ni acentos, y el nombre lo pone
   MESES de arriba — un único sitio donde se escribe. */
function etiquetaFecha({ mes, anio }) {
    if (!anio) return null;

    const nombre = MESES[Number(mes) - 1];
    return nombre ? `${nombre} ${anio}` : String(anio);
}

/* Card de trabajo.

   Recibe el objeto COMPLETO en vez de cinco props sueltas: la
   anatomía usa media docena de campos, y pasarlos uno a uno
   obligaba a tocar también WorkList cada vez que la card enseña
   algo nuevo.

   Anatomía:
     portada  → imagen, o VÍDEO si el trabajo no tiene imágenes
     etiqueta → el cliente, superpuesta sobre la portada
     cuerpo   → categoría · título · descripción
     pie      → herramientas de IA + enlace
*/
function WorkCard({ trabajo }) {
    const {
        id,
        titulo,
        subtitulo,
        categoria,
        cliente,
        anio,
        mes,
        imagenes,
        videos,
        video,
        ias,
    } = trabajo;

    const portada = imagenes?.[0];
    /* BESTINVER no tiene ni una imagen y sí dos vídeos: sin este
       respaldo su card mostraba el texto alternativo sobre el
       degradado de relleno. Mismo criterio que las cards del home. */
    const clip = videos?.[0] || video;

    const cuando = etiquetaFecha({ mes, anio });

    const listadas = ias?.slice(0, IAS_VISIBLES) ?? [];
    const restantes = (ias?.length ?? 0) - listadas.length;

    return (
        <Link to={`/works/${id}`} className="work-card">
            <div className="work-card__media">
                {portada ? (
                    /* alt vacío a propósito: el enlace ya se anuncia
                       con el título, y repetirlo duplicaría la
                       lectura en un lector de pantalla */
                    <img src={portada} alt="" loading="lazy" decoding="async" />
                ) : clip ? (
                    <BucleVideo src={clip} />
                ) : (
                    <div className="work-card__placeholder" aria-hidden="true" />
                )}

                {cliente && (
                    <span className="work-card__cliente">
                        <Building2 size={13} strokeWidth={2} aria-hidden="true" />
                        Cliente: {cliente}
                    </span>
                )}
            </div>

            <div className="work-card__body">
                {/* categoría y fecha comparten fila: son las dos
                    señas de "qué es esto y de cuándo", y juntas
                    ocupan una línea en vez de dos */}
                {(categoria || cuando) && (
                    <div className="work-card__meta">
                        {categoria && (
                            <span className="work-card__category">{categoria}</span>
                        )}
                        {cuando && (
                            <span className="work-card__fecha">{cuando}</span>
                        )}
                    </div>
                )}

                <h2 className="work-card__title">{titulo}</h2>

                <p className="work-card__text">{subtitulo}</p>

                <div className="work-card__foot">
                    {listadas.length > 0 && (
                        <ul className="work-card__ias">
                            {listadas.map((ia) => (
                                <li key={ia} className="work-card__ia">
                                    {ia}
                                </li>
                            ))}
                            {restantes > 0 && (
                                <li className="work-card__ia work-card__ia--mas">
                                    +{restantes}
                                </li>
                            )}
                        </ul>
                    )}

                    <span className="work-card__link">
                        Ver trabajo
                        <Arrow />
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default WorkCard;
