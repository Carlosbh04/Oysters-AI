import { BrainCircuit, Megaphone, Code2, Route } from "lucide-react";

/* Iconos: componentes de lucide-react referenciados desde los
   datos — ServiceCard los renderiza. Cambia cualquiera por
   otro icono de lucide sin tocar los componentes. */
const howWeWork = [
  {
    id: 1,
    icon: BrainCircuit,
    title: "Automatización Inteligente",
    description:
      "Diseñamos automatizaciones que eliminan tareas repetitivas y optimizan los procesos de tu empresa.",
    link: "/services/automation",
  },
  {
    id: 2,
    icon: Megaphone,
    title: "Marketing con IA",
    description:
      "Creamos estrategias de marketing impulsadas por inteligencia artificial para acelerar el crecimiento.",
    link: "/services/marketing",
  },
  {
    id: 3,
    icon: Code2,
    title: "Desarrollo de Soluciones",
    description:
      "Construimos herramientas, asistentes y plataformas adaptadas a las necesidades de cada negocio.",
    link: "/services/development",
  },
  {
    id: 4,
    icon: Route,
    title: "Consultoría Tecnológica",
    description:
      "Analizamos tus procesos y definimos una hoja de ruta para implementar IA con éxito.",
    link: "/services/consulting",
  },
];

export default howWeWork;