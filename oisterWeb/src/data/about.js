import {
  Sparkles,
  Handshake,
  Lightbulb,
  Rocket,
  Users,
} from "lucide-react";

/* Los retratos se IMPORTAN (no van por URL en public/): así Vite
   les pone hash — al sustituir una foto el navegador coge la
   nueva sin caché vieja — y si algún día se renombra el archivo,
   el build falla en vez de dejar un hueco roto en producción. */
import fotoFelipe from "../assets/images/about/team/felipe.webp";
import fotoMiguel from "../assets/images/about/team/miguel.jpg";

/* Datos de la sección "Sobre nosotros". Siguen la convención de
   howWeWork: los iconos de los valores son componentes lucide-react
   referenciados desde los datos — se cambian sin tocar componentes.
   photo queda vacío a propósito: añade la imagen final aquí cuando
   esté disponible y la tarjeta la mostrará automáticamente. */

/* ⚠️ PENDIENTE DE CONTENIDO REAL
   Nombres, cargos y fotos SÍ son los definitivos.
   Las `bio` y los `linkedin` NO: las biografías son texto
   genérico de relleno y los enlaces apuntan a la portada de
   LinkedIn. Sustituidlos antes de publicar — son las dos únicas
   cosas inventadas de esta sección. */
export const aboutTeam = [
  {
    id: 1,
    name: "Felipe San Juan",
    role: "Co-Founder & CEO",
    photo: fotoFelipe,
    bio: "Breve biografía pendiente: trayectoria, foco y qué aporta al estudio.",
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: 2,
    name: "Miguel Braña",
    role: "Founder & Head of Surprises",
    photo: fotoMiguel,
    bio: "Breve biografía pendiente: trayectoria, foco y qué aporta al estudio.",
    linkedin: "https://www.linkedin.com/",
  },
];

export const aboutValues = [
  {
    id: 1,
    icon: Sparkles,
    title: "Creatividad aplicada",
    description: "Combinamos inspiración y rigor para ideas que destacan y conectan.",
  },
  {
    id: 2,
    icon: Lightbulb,
    title: "Innovación constante",
    description: "Exploramos nuevas tecnologías para mantenerte siempre a la vanguardia.",
  },
  {
    id: 3,
    icon: Users,
    title: "Colaboración real",
    description: "Trabajamos de la mano contigo, como una extensión de tu equipo.",
  },
  {
    id: 4,
    icon: Handshake,
    title: "Compromiso y confianza",
    description: "Relaciones transparentes, resultados medibles y comunicación clara.",
  },
  {
    id: 5,
    icon: Rocket,
    title: "Resultados que escalan",
    description: "Soluciones pensadas para crecer contigo, hoy y mañana.",
  },
];
