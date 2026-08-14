/* Único consumidor: el acordeón "Recursos" del menú móvil
   (MobileMenu.jsx), que lee id, title y path. El grupo
   "methodology" que vivía aquí se retiró con los cuatro
   apartados de /services (hoy son una sola página). */
export const dropdowns = {
  resources: {
    title: "Recursos",
    items: [
      {
        id: 1,
        title: "Entrenamiento IA Generativa",
        /* mismo destino que "Gen AI Training" en el menú de
           escritorio; /training nunca existió como ruta */
        path: "/resources",
      },
      {
        id: 2,
        title: "Blog",
        path: "/blog",
      },
    ],
  },
};
