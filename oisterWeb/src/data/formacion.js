/* ============================================================
   GEN AI TRAINING — el contenido del curso

   Aquí viven los textos y no en el componente, como el resto del
   sitio (ver trabajos.js o blog.json): cambiar el precio, añadir
   un módulo o retocar un objetivo no debería obligar a abrir un
   archivo de maquetación.

   Los iconos se nombran, no se importan: el nombre se resuelve
   en la página contra un mapa cerrado. Así este archivo se queda
   siendo datos —lo puede editar cualquiera— y no arrastra un
   import de lucide-react.
   ============================================================ */

export const CABECERA = {
  titulo: "Formación guiada en IA generativa aplicada al marketing y publicidad.",
  entradilla:
    "Sesiones de formación individualizadas guiadas por expertos en IAG que te transformarán de novato a maestro en poco tiempo.",
};

/* Los dos párrafos de presentación. Van con marcas <strong> en la
   página porque la negrita NO es decorativa: señala las
   herramientas y los conceptos que se venden. */
export const OBJETIVOS = [
  "Dotar a los equipos de habilidades prácticas para el uso de IA en la estrategia de comunicación.",
  "Capacitar a los usuarios en la generación y edición avanzada de imágenes, audio y videos usando IA.",
  "Fomentar la innovación y creatividad entre los equipos mediante el uso de nuevas plataformas.",
];

export const MODULOS = [
  {
    numero: "01",
    icono: "chat",
    titulo: "Uso práctico de ChatGPT en publicidad",
    horas: "3 hrs.",
    texto:
      "Aplicaciones en casos de uso reales para la definición de estrategias de publicidad e investigación.",
  },
  {
    numero: "02 y 03",
    icono: "imagen",
    titulo: "Generación de imágenes y textos con IA",
    horas: "6 hrs.",
    texto:
      "Aprende a generar creatividades usando herramientas como Midjourney, OpenAI, Magnific AI, Freepik Suite, Nano Banana Pro, Seedance, Ideogram y más.",
  },
  {
    numero: "04",
    icono: "audio",
    titulo: "Generación de locución y música con IA",
    horas: "1,5 hrs.",
    texto:
      "Crea locuciones y música para tus proyectos con herramientas como SUNO, Eleven Labs y Voice.ai.",
  },
  {
    numero: "05",
    icono: "video",
    titulo: "Creación de vídeos a partir de IA",
    horas: "2 hrs.",
    texto:
      "Convierte imágenes, textos y audios generados por IA en videos profesionales con Runway, Luma, Kling, Google Veo 3 y Adobe Suite.",
  },
];

export const PRECIO = {
  rotulo: "Formación grupal",
  importe: "1.750€",
  nota: "*+IVA",
  texto:
    "Dotar a tu equipo de habilidades prácticas para el uso de IA generativa en la estrategia de tu comunicación y generación de activos creativos, adecuado para grupos de hasta 10 personas.",
  cta: "Reserva tu sesión",
};
