# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Principal — responsable de marketing o comunicación en una marca grande.**
Trabaja en una empresa que ya tiene equipo propio y agencias contratadas. No
llega buscando quién le haga un banner: llega a decidir si un estudio que
trabaja con IA es lo bastante serio como para ponerle delante una campaña de
marca. El trabajo que está haciendo cuando entra en la web es **evaluar**, no
descubrir. Confirmado por el usuario frente a la alternativa PYME.

**Tensión registrada, sin resolver.** El texto de la Visión que está publicado
dice literalmente lo contrario: "hacerlo accesible para un espectro más amplio
de empresas, **incluidas las PYMES**". El portafolio, en cambio, es ACCIONA,
BESTINVER y ALSEA. La prioridad confirmada es el corporativo; el texto no se ha
tocado porque es contenido publicado y cambiarlo es decisión del usuario. Quien
retome esto debe saber que la contradicción existe y es visible para el
visitante.

**Segundo público, con puerta propia — comprador de formación.**
Gen AI Training (`/resources`) es una línea de negocio propia, con su público y
su precio, no un servicio del catálogo de agencia. Su visitante puede ser
alguien que nunca contrataría a la agencia: viene a formar a su equipo, no a
delegar el trabajo. Confirmado por el usuario.

## Product Purpose

OYSTERS es un estudio de publicidad y marketing que ejecuta el proceso completo
de una campaña apoyándose en inteligencia artificial: investigación de
audiencias, creación de contenido audiovisual, personalización a escala y
distribución con medición.

Misión publicada: *"Para aquellas marcas que puedan sentirse abrumadas o
carezcan de experiencia, OYSTERS AI aprovecha el poder de la inteligencia
artificial para ayudarlas a alcanzar sus objetivos de marketing y
comunicación."*

Visión publicada: *"Simplificar el proceso publicitario, haciéndolo accesible
para un espectro más amplio de empresas, incluidas las PYMES, al disminuir los
costes en talento y facilitar la accesibilidad a aplicaciones y soluciones de
inteligencia artificial."*

**Qué es el éxito en esta web.** Que el visitante escriba por el formulario de
`/contact`. Ese es el objetivo principal confirmado. La reserva de una sesión
de formación es el segundo objetivo, con su propia entrada, pero si los dos
compiten por el mismo sitio, manda el contacto de agencia.

## Positioning

Lo que un estudio vecino no puede copiar diciendo "nosotros también usamos IA":

1. **El proceso está partido en cuatro etapas nombradas** —Aprendizaje,
   Contenido, Personalización y Orquestación impulsados por IA— y cada una
   declara públicamente **con qué herramientas concretas** trabaja: 26 en total,
   de Brand24 y Perplexity a Midjourney, Runway, Veo 3, Magnific o Metricool.
   Enseñar el taller abierto es una postura, no una lista de features.
2. **Ese proceso tiene campañas grandes detrás.** ACCIONA, BESTINVER y ALSEA no
   son logotipos de adorno: son proyectos con objetivo y resultado escritos.
3. **La formación cierra el círculo.** El mismo estudio que ejecuta con IA
   enseña a usarla. Es una posición difícil de sostener sin hacer las dos cosas
   de verdad.

## Operating Context

- Sitio íntegramente en **español**. Los clientes confirmados son corporaciones
  españolas. No hay versión en otro idioma ni se ha decidido que la haya.
- El visitante corporativo llega con contexto previo (referencia, reunión,
  búsqueda de marca) y la web tiene que aguantar el escrutinio de alguien que ya
  ha visto muchas agencias.
- Superficies publicadas: portada (`/`), trabajos (`/works`, `/works/:id`),
  cómo lo hacemos (`/services`), formación (`/resources`), blog (`/blog`,
  `/blog/:id`), contacto (`/contact`), y dos rutas de laboratorio visual
  (`/fondo-trama`, `/escena-oraculo`).

## Capabilities and Constraints

**Funcionalidad confirmada**
- Portafolio con ficha de detalle por proyecto, alimentado por `src/data/trabajos.js`.
- Cinta de marcas que **se deriva** de los clientes de `trabajos.js`: por
  construcción, no puede aparecer una marca sin proyecto real detrás.
- Blog con listado paginado y detalle (`src/data/blog.json`).
- Página de formación con módulos, horas y objetivos (`src/data/formacion.js`).
- Formulario de contacto que hace POST a `VITE_CONTACT_URL`, con
  `http://localhost:5000/api/contact` por defecto.

**Restricciones técnicas**
- React 19 + Vite 8 + React Router 7. **JSX puro: no hay TypeScript.**
- Sin tests y sin CI. La verificación de un cambio es `npm run lint` (cero
  errores) más `npm run build`.
- `src/styles/variables.css` es la fuente única de tokens. No se escriben
  valores de color, sombra, radio o layout fuera de ahí.
- Código, comentarios y textos de interfaz en español.
- El repositorio git vive en el directorio padre; la aplicación está en
  `oisterWeb/`. Rama de trabajo: `develop`.
- El servidor de desarrollo lo levanta el usuario (puerto 5173). No arrancarlo
  sin pedirlo.

**Sin decidir**
- Si el sitio tendrá versión en inglés.
- Si la Visión publicada se reescribe para cuadrar con el público confirmado.
- Si las páginas legales (`/privacidad`, `/aviso-legal`) se construyen: el pie
  ya enlaza a las dos y ninguna existe.

## Brand Commitments

- Nombre: **OYSTERS**, que aparece como *OYSTERS AI* en los textos de la sección
  de método. El dominio de correo del estudio es `oysters-studio.com`. Cuál es
  la forma canónica de cara al público no está decidido y aquí no se inventa.
- El logotipo de la ostra es el identificador de marca y se usa en cabecera y
  pie.
- Equipo real y publicable: **Felipe San Juan** (Co-Founder & CEO) y **Miguel
  Braña** (Founder & Head of Surprises). Nombres, cargos y fotografías son
  definitivos.

## Evidence on Hand

**Real y usable**
- Tres proyectos con cliente, industria, año, objetivo y resultado escritos:
  ACCIONA (Infraestructura y Energía Sostenible, 2025), BESTINVER (Gestión de
  Activos, 2026), ALSEA (Restauración, 2025). En `src/data/trabajos.js`, con
  imágenes en `public/img/<cliente>/`.
- Retratos del equipo en `src/assets/images/about/team/`.
- Temario de formación con módulos y horas en `src/data/formacion.js`.
- El ecosistema de 26 herramientas de IA, por etapa, en
  `src/componentes/inteligenciaIA/InteligenciaIA.jsx`.

**Relleno declarado — no tratar como verdad ni construir encima**
- Biografías del equipo y enlaces de LinkedIn: texto genérico y enlaces a la
  portada de LinkedIn. Marcado en el propio `src/data/about.js`.
- Datos de contacto visibles en `/contact`: `correo@empresa.com` y
  `+34 600 000 000`.
- Imágenes de la página de formación: son de prueba.

**Lo que no existe y no debe inventarse**
- No hay testimonios, ni métricas de resultado, ni premios, ni número de
  clientes, ni precios públicos. Nada de eso puede aparecer en una superficie
  nueva sin que el usuario lo aporte.

## Product Principles

1. **El contacto manda.** Cuando una superficie tenga que elegir a dónde empuja,
   empuja al formulario de agencia. La formación tiene su propia puerta, no un
   desvío de la principal.
2. **Hablarle al corporativo sin negar a la PYME.** El orden y el tono se
   deciden para quien ya tiene equipo y agencias. La PYME sigue en el texto
   publicado y no se borra de tapadillo.
3. **Nada se afirma sin proyecto detrás.** La cinta de marcas ya lo impone por
   código. Esa regla se extiende a cualquier cifra, logotipo o resultado nuevo.
4. **El mecanismo es el argumento.** Las cuatro etapas y las herramientas
   nombradas son la ventaja. Diluirlas en "usamos IA" tira lo único que un
   competidor no puede copiar diciéndolo.
5. **Lo pendiente se marca, no se rellena.** El código ya señala su propio
   relleno. Un hueco declarado es información; un hueco tapado con texto
   plausible es una mentira que alguien acabará publicando.

## Accessibility & Inclusion

No hay un estándar contractual establecido. Sí hay decisiones ya tomadas en el
código que cuentan como compromiso y que el trabajo futuro debe respetar:

- `prefers-reduced-motion` se honra en todos los efectos (arena, acordeones,
  fondos animados): con movimiento reducido, o no se montan o abren en seco.
- Los acordeones son `<details>/<summary>` nativos, con teclado y lector de
  pantalla de serie.
- Los lienzos decorativos van con `aria-hidden`, y bajo el efecto de arena el
  texto real sigue en el DOM ocupando su sitio: lo que lee un lector de pantalla
  es el texto, no el lienzo.
- El efecto de arena no existe en móvil ni en táctil.
