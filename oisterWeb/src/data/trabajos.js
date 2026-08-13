/* ============================================================
   TRABAJOS — todos los proyectos siguen la estructura fija
   (ver plantilla-proyecto.js)

   Obligatorios: id, titulo, subtitulo, texto, imagenes
   Opcionales:   categoria, etiquetas, video, ias, servicios,
                 objetivo, resultado, proyectos, cliente,
                 industria, anio, mes, url

   FECHA DE LA TARJETA — dos campos, cada uno con su cometido:
     anio: "2026"           → el chip dice "2026"
     anio: "2026", mes: 1   → el chip dice "Ene 2026"

   `mes` es un NÚMERO del 1 al 12 y solo añade el mes: el año lo
   manda siempre `anio`, haya mes o no. Antes esto era un único
   campo "2026-01" que se comía al `anio`, y cambiar el año no
   surtía efecto — parecía que el campo estaba roto.
   ============================================================ */

const catalogo = [
  /* ======= 1. ACCIONA ======= */
  {
    id: 1,

    titulo: "ACCIONA",

    categoria: "Marketing con IA",

    subtitulo: "Campañas creativas impulsadas por Inteligencia Artificial",

    texto: [
      "Colaboramos estrechamente con Acciona, referente global en soluciones sostenibles, apoyando a distintas unidades de negocio: Acciona Energía, Acciona Culture & Living y Acciona Corporativo. Desarrollamos proyectos publicitarios adaptados a diferentes mercados y objetivos, creando contenidos innovadores y visualmente impactantes para redes sociales, medios digitales y canales corporativos.",
    ],

    objetivo:
      "Diseñar campañas creativas utilizando Inteligencia Artificial para reforzar el posicionamiento de la marca y comunicar sus valores de sostenibilidad e innovación.",

    resultado:
      "Entre los proyectos destacan la campaña de Halloween, basada en el concepto de que 'el verdadero terror es no cuidar del planeta', y la colaboración con El Ganso para el lanzamiento de unas zapatillas sostenibles.",

    proyectos: [
      "Campaña Halloween",
      "Lanzamiento El Ganso x Acciona",
      "Contenido para Social Media",
      "Campañas Paid Social",
      "Creatividades para canales corporativos",
    ],

    /* .webp y no .png: mismos renders, recodificados (1,6MB+1,4MB
       → 56K+62K). Los .png originales siguen en public/img/acciona
       por si hay que reexportar. */
    imagenes: ["/img/acciona/halloween.webp", "/img/acciona/ganzo.webp"],

    videos: [
      "/videos/acciona/Acciona-fantasma_c-1_2.mp4",
      "/videos/acciona/Acciona-x-El-Ganso-def-horizontal_es.mp4",
    ],

    ias: [
      "ChatGPT 4.0",
      "Flux LoRA",
      "Magnific AI",
      "Runway Gen-3",
      "Suno",
      "Adobe Premiere",
    ],

    servicios: [
      "Dirección Creativa",
      "Marketing con IA",
      "Generación de imágenes",
      "Edición de vídeo",
      "Social Media",
      "Paid Social",
    ],

    etiquetas: ["Social Media", "Paid Social", "Intelligence", "Creatividad"],

    cliente: "ACCIONA",

    industria: "Infraestructura y Energía Sostenible",

    /* ⚠️ mes inventado — dime el real y lo cambio (1-12) */
    mes: 12,

    anio: "2025",

    url: "https://www.acciona.com",
  },

  /* ======= 2. BESTINVER ======= */
  {
    id: 2,

    titulo: "BESTINVER",

    categoria: "Vídeo con IA",

    subtitulo: "Principios de inversión responsable",

    texto: [
      "La pieza audiovisual creada para BESTINVER comunica los principios responsables de inversión de la compañía, reforzando su compromiso con la sostenibilidad y las infraestructuras que impulsan un futuro más equilibrado. A través de una narrativa visual generada con IA, el vídeo propone un recorrido simbólico por los distintos ámbitos donde la inversión responsable deja huella: energía, recursos naturales y desarrollo social.",

      "El proceso de generación combinó imágenes producidas con IA generativa, cuidadosamente guiadas mediante prompts conceptuales, con una edición que busca un tono didáctico y pausado. La locución de la actriz de voz Elsa Pinillos aporta calidez y credibilidad al mensaje, mientras que la música de librería refuerza el tono reflexivo y armónico de la pieza.",

      "Este proceso a su vez dio nacimiento a un banco de imágenes capaz de dar respuesta a las distintas necesidades de comunicación y marketing — TV, RRSS, web, newsletter, CRM — asegurando una línea visual coherente y consistente en todos los puntos de contacto.",
    ],

    /* ⚠️ TEXTO REDACTADO A PARTIR DE LA DESCRIPCIÓN
       `objetivo`, `resultado` y `entregables` no venían en el
       briefing: están deducidos de los tres párrafos de `texto`
       para que la ficha tenga la misma estructura que ACCIONA.
       No hay ningún dato ni cifra que no esté ya ahí arriba, pero
       conviene que lo revise alguien de cuenta antes de publicar. */
    objetivo:
      "Comunicar los principios de inversión responsable de la compañía y reforzar su compromiso con la sostenibilidad, mediante una narrativa visual generada con IA que recorra los ámbitos donde esa inversión deja huella: energía, recursos naturales y desarrollo social.",

    resultado:
      "Además de la pieza audiovisual, el proceso dio lugar a un banco de imágenes propio capaz de cubrir las necesidades de TV, redes sociales, web, newsletter y CRM, asegurando una línea visual coherente en todos los puntos de contacto.",

    proyectos: [
      "Pieza audiovisual de inversión responsable",
      "Adaptación para redes en formato vertical",
      "Banco de imágenes para comunicación y marketing",
    ],

    servicios: [
      "Dirección Creativa",
      "Generación de imágenes",
      "Edición de vídeo",
      "Locución",
      "Música",
      "Banco de imágenes",
    ],

    imagenes: [
     
    ],

    videos:["/videos/bestinver/bestinver_asia_16_9_locu-2.mp4", "/videos/bestinver/Bestinver-storie_infra.mp4"], 

    ias: [
      "ChatGPT 4.0",
      "Flux",
      "Magnific AI",
      "Runway Gen-3",
      "Adobe Premiere",
    ],

    etiquetas: [
      "TV",
      "Social Media",
      "Paid Social",
      "Intelligence",
      "Creatividad",
    ],

    cliente: "BESTINVER",

    industria: "Gestión de Activos",

    /* ⚠️ mes inventado — dime el real y lo cambio (1-12) */
    mes: 4,

    anio: "2026",
  },

  /* ======= 3. ALSEA ======= */
  {
    id: 3,

    titulo: "ALSEA",

    categoria: "Contenidos y CRM",

    subtitulo: "Estrategia de contenidos y fidelización para grandes marcas",

    texto: [
      "Hemos colaborado con ALSEA en la optimización de la estrategia de contenidos y CRM de algunas de sus principales marcas, contribuyendo a reforzar la relevancia, consistencia y capacidad de conversión de sus comunicaciones digitales.",

      "Para TGI Fridays, desarrollamos piezas creativas para redes sociales inspiradas en el espíritu de la marca —'Thank God it's Friday!'—, generando contenidos orientados a impulsar la conversación y el engagement en torno a sus principales territorios: gastronomía, coctelería, deporte, música y entretenimiento.",

      "Paralelamente, trabajamos en la evolución de la estrategia de CLUB BY, el programa de fidelización de ALSEA, optimizando contenidos y comunicaciones de CRM para mejorar la personalización de la relación con los usuarios, incrementar la participación y fortalecer la conexión entre las distintas marcas del club y sus usuarios.",
    ],

    /* ⚠️ TEXTO REDACTADO A PARTIR DE LA DESCRIPCIÓN
       Igual que en BESTINVER: `objetivo`, `resultado` y
       `entregables` están deducidos de los párrafos de `texto`
       para igualar la ficha con la de ACCIONA. Pendiente de
       revisión por cuenta. */
    objetivo:
      "Reforzar la relevancia, la consistencia y la capacidad de conversión de las comunicaciones digitales de las marcas del grupo, optimizando su estrategia de contenidos y de CRM.",

    resultado:
      "Comunicaciones de CRM más personalizadas y una relación más estrecha entre las marcas del club y sus usuarios, con contenidos sociales alineados con el territorio de cada marca: gastronomía, coctelería, deporte, música y entretenimiento.",

    proyectos: [
      "Contenidos para TGI Fridays",
      "Evolución de la estrategia de CLUB BY",
    ],

    servicios: [
      "Dirección Creativa",
      "Contenidos para Social Media",
      "Estrategia de CRM",
      "Producción visual",
      "Generación de banco de imágenes",
    ],

    imagenes: ["/img/alsea/05_BDAY_EMAIL-BDAY-DAY_PROMO-UNREDEEMED.webp", "/img/alsea/04_BDAY_EMAIL-BDAY-DAY_PROMO-REDEEMED.gif"],

    video: "/videos/alsea/FRIDAYS-Orgullo-Friki-Clip-1-DEFINITIVO.mp4",

    ias: ["Magnific AI", "Runway Gen-3", "Adobe Firefly"],

    etiquetas: [
      "Generación Banco Imagen",
      "Producción Visual",
      "CRM",
      "Social",
    ],

    cliente: "ALSEA",

    industria: "Restauración",

    /* ⚠️ mes inventado — dime el real y lo cambio (1-12) */
    mes: 7,

    anio: "2025",
  },
];

/* ============================================================
   ⚠️  TRABAJOS DE DEMO — BORRAR ANTES DE PUBLICAR
   ============================================================
   Solo sirven para ver cómo se comporta la lista al crecer:
   3 reales + 4 demos = 7 trabajos, que es justo el umbral donde
   nace la segunda página en /works.

   NO son proyectos reales:
     · se llaman "DEMO 01…04", imposibles de confundir;
     · NO tienen `cliente`, así que no ensucian la cinta de
       marcas —que se alimenta de ese campo—;
     · NO tienen imágenes, así que salen con el degradado de
       relleno y se distinguen de un vistazo.

   Llevan los ids más altos a propósito: con el orden por id
   descendente, así aparecen los primeros y se ve el rodaje.

   PARA APAGARLOS: MOSTRAR_DEMOS = false   (una línea)
   PARA BORRARLOS: quita este bloque entero
   ============================================================ */
const MOSTRAR_DEMOS = true;

const CUANTOS_DEMOS = 4;

const trabajosDemo = Array.from({ length: CUANTOS_DEMOS }, (_, i) => ({
  id: 901 + i,
  titulo: `DEMO 0${i + 1}`,
  categoria: ["Contenido generativo", "Vídeo con IA", "Automatización", "Marketing con IA"][i % 4],
  subtitulo: "Trabajo de ejemplo para ver el orden y la paginación",
  texto: ["Contenido de ejemplo."],
  imagenes: [],
  ias: [["Midjourney", "ChatGPT 4.0", "Runway"], ["Runway Gen-3", "ElevenLabs"], ["ChatGPT 4.0", "Zapier"], ["Flux", "Magnific AI"]][i % 4],
  /* el mes sube con el id para que la fecha del chip concuerde
     con el orden: DEMO 04 es el más nuevo y es el que dice Dic */
  mes: 9 + i,
  anio: "2026",
}));

const catalogoFinal = MOSTRAR_DEMOS ? [...catalogo, ...trabajosDemo] : catalogo;

const trabajos = [...catalogoFinal].sort((a, b) => b.id - a.id);

export default trabajos;
