/* ============================================================
   TRABAJOS — todos los proyectos siguen la estructura fija
   (ver plantilla-proyecto.js)

   Obligatorios: id, titulo, subtitulo, texto, imagenes
   Opcionales:   categoria, etiquetas, video, ias, servicios,
                 objetivo, resultado, proyectos, cliente,
                 industria, anio, url
   ============================================================ */

const trabajos = [
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

    imagenes: ["/img/acciona/halloween.png", "/img/acciona/ganzo.png"],

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

    anio: "2025",
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

    proyectos: [
      "Contenidos para TGI Fridays",
      "Evolución de la estrategia de CLUB BY",
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

    anio: "2025",
  },
];

export default trabajos;
