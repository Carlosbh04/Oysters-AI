# Auditoría técnica — Oysters AI

> Fase 1 del plan de refactorización: **solo diagnóstico, ningún archivo modificado.**
> Fecha: 13 ago 2026 · Base: 5 auditorías paralelas sobre todo `src/` + `public/` + config.
>
> Línea base: `npm run lint` → **5 errores** (el proyecto exige 0) · `npm run build` → pasa,
> 1.946 módulos, chunk principal 335 kB (107 kB gzip) · ~13.400 líneas JS/JSX · 19.582 líneas CSS en 59 archivos.
>
> Severidades: 🔴 crítico · 🟠 importante · 🟡 menor. Confianza CONFIRMADO salvo que se
> marque POTENCIAL.

---

## 1 · Problemas críticos

Lo que está roto o dañaría al negocio **hoy en producción**:

1. 🔴 **El formulario de contacto pierde todos los mensajes.** `services/contactService.js:1-2` cae a `http://localhost:5000/api/contact` porque no existe ningún `.env` con `VITE_CONTACT_URL` en el proyecto. En producción hace POST a la máquina del visitante (y es contenido mixto http/https: el navegador lo bloquea). Es la ruta de conversión principal del sitio. Además `Contact.jsx:281` tiene `mailto:correo@empresa.com` (placeholder).
2. 🔴 **`/resources` muestra "AÑADIR RECURSOS"** (`App.jsx:381`) — y no es una ruta huérfana: el menú móvil y el header la anuncian.
3. 🔴 **4 proyectos DEMO falsos visibles en `/works`.** `data/trabajos.js:246-263`, `MOSTRAR_DEMOS = true`, con el comentario "⚠️ BORRAR ANTES DE PUBLICAR".
4. 🔴 **Enlaces de navegación a rutas que no existen (404):** menú móvil → `/use-cases` (`MobileMenu.jsx:99`; el escritorio usa el ancla correcta `/#casos-de-uso`) y → `/training` (`data/dropdown.js:47`); pie → `/privacidad` y `/aviso-legal` (`Footer.jsx:266-268`) — esto último con implicación RGPD.
5. 🔴 **Las 24 imágenes del blog están rotas.** `data/blog.json` apunta a `/img/blog/...` y la carpeta `public/img/blog/` no existe. Afecta a las 11 entradas, listado y detalle (el listado lo disimula el degradado de respaldo de la card; el detalle pinta `<img>` rotos).
6. 🔴 **Contenido placeholder en el home:** `data/about.js` — biografías "Breve biografía pendiente" y LinkedIn genéricos, autodeclarado "sustituir antes de publicar".
7. 🔴 **PrismCloud multiplica bucles de render.** `PrismCloud.jsx:484`: el callback del ResizeObserver llama a `pintar()`, que se auto-reprograma → cada resize (en móvil, el mostrar/ocultar de la barra del navegador) suma una cadena rAF concurrente permanente del shader a pantalla completa. Tras un arrastre de resize puede estar pintando la nube 20-60 veces por frame.
8. 🔴 **Lint con 5 errores** (la regla del proyecto es 0): `BlogList.jsx:1-2` imports muertos; `EscenaOraculo.jsx:120`, `FondoTrama.jsx:145`, `BlogDetailPage.jsx:14` — `setState` síncrono en efecto.
9. 🔴 **Tokens CSS fantasma con fallback de tema claro sobre fondo oscuro.** `--color-violet`, `--color-fragance` y `--color-text-soft` no están definidos en ningún sitio; siempre pinta el fallback, y `#5c5673` (gris de tema claro) en `BlogList.css:143,217` es un fallo de contraste real. También sin definir: `--fb-linea`, `--ft-pulso`, `--rotulo-cuerpo`, `--rotulo-icono`.

## 2 · Problemas importantes

### Rendimiento (detalle en §6)
1. 🟠 `BucleVideo.jsx:154-155` — únicos listeners sin cleanup del proyecto (reintento de autoplay); se acumulan en `window` y sobreviven a la navegación.
2. 🟠 `LuzAnillo.jsx:190` — rAF eterno en la portada, sin gating de visibilidad (la única escena que no respeta la política "dormirse fuera de pantalla" del resto).
3. 🟠 `IntroAnimation.jsx:320-328` — cualquier `resize` (barra del navegador móvil incluida) **reinicia la intro desde el segundo 0** con `getImageData` a viewport completo; y `:202-221` calcula ~405.000 pares por frame al arrancar.
4. 🟠 `PrismCloud.jsx:420,430` — `getBoundingClientRect` por `pointermove` (el canvas es fixed: su rect no cambia) y `scrollHeight` por evento de scroll.
5. 🟠 `TextoArena.jsx:528` — `getBoundingClientRect` por `pointermove` (hasta 13 instancias en la portada).
6. 🟠 `useHeroScrollDock.js:493-499` — `remedir()` en resize sin debounce: escritura→lectura→escritura de layout ~60 veces/s.
7. 🟠 `InteligenciaIA.jsx:188-195` — `centro`/`rutas` con identidad nueva en cada medición reinician la máquina de estados de LuzAnillo (la luz salta visiblemente).
8. 🟠 `WorkCarousel.jsx:105-115` — al cambiar de diapositiva, el vídeo anterior **sigue sonando invisible** y sin controles.
9. 🟠 `EscenaSynthwave.css:61` — hasta 380 estrellas animando `opacity` en bucle sin gating + 8 filtros `feGaussianBlur` a pantalla completa (página de contacto).

### Arquitectura y skeletons (detalle en §7)
10. 🟠 La navegación está definida **4 veces** y ya divergió (DesktopMenu, MobileMenu, Footer, dropdown.js) — origen de los 404 del §1.4.
11. 🟠 `App.jsx` mantiene **6 tablas por ruta a mano** (skeleton, chunk, tono del pie, escena, Routes, rótulos) — un olvido no da error, degrada en silencio (es el mecanismo del bug histórico de `/blog/1`).
12. 🟠 `DefaultSkeleton` no se parece a ninguna ruta que le toca; el caso grave es el **color**: pinta lila claro sobre `/services` y `/escena-oraculo`, que el propio `App.jsx:224` cataloga como oscuras → flash claro→oscuro en el reveal. `/blog` (página terminada) tampoco tiene skeleton propio.
13. 🟠 `App.jsx:88` — `.work-detail-hueco` está definida en el CSS del chunk perezoso: el color de fondo del hueco llega exactamente cuando ya no hace falta (contradice su propio comentario).
14. 🟠 `NAV_PULSE = 1100` ms de shimmer en **cada navegación interna** con el contenido ya cargado — contradice la doctrina escrita en `Lazywithmin.js:19-23`; `/blog/:id` encadena además un segundo skeleton propio de 400 ms (`CARGA_MINIMA`).
15. 🟠 `BlogPage.jsx:6-25` reimplementa las reglas de paginación de `work/paginacion.js` (fórmula de total, clamping, slice) con tres expresiones distintas.
16. 🟠 `vite.config.js` es la plantilla intacta: sin `manualChunks` (react/router/lucide viajan con el código de la app y cualquier cambio invalida su caché), sin alias.
17. 🟠 SEO: SPA sin `document.title` por ruta, sin `og:image`, sin canonical — todas las rutas son indistinguibles al compartir.
18. 🟠 `contactService.js` no comprueba `response.ok`; `Contact.jsx` da feedback con `alert()`, sin estado "enviando" (doble envío posible).

### CSS (detalle en §5-6 del informe CSS)
19. 🟠 **~660 colores no neutros escritos a mano** frente a 109 usos de tokens; familias con 6-12 variantes del mismo color (violeta de marca ×6, negro-morado de fondos ×12 ≈ 69 apariciones, `#F7B8EB` ×21 sin token). Es la patología que `variables.css:74-78` documenta como resuelta — sigue viva. `Contact.css` es el peor archivo en todas las métricas.
20. 🟠 **17 de 60 tokens de `variables.css` (28%) no tienen ningún consumidor**, incluidas las 3 sombras principales (`--shadow-sm/lg/card`) — por eso hay 43 sombras a mano.
21. 🟠 El "botón de agua" está duplicado **~600 líneas** entre `Home.css:773-1047` y `LatestProjects.css:748-1080` (mismo componente, prefijos distintos, hasta los cubic-bezier coinciden).
22. 🟠 `CortinaPixeles.css` define `cortina-entra`/`cortina-sale` **dos veces en el mismo archivo** (`:58/:101`, `:74/:110`); la segunda vive en el media de reduced-motion y los `@keyframes` no respetan media queries para el nombre → posible bug funcional (verificar en navegador).
23. 🟠 3 archivos con animación y **cero** `prefers-reduced-motion`: `BlogList.css` (3 bucles infinitos de caída a pantalla completa — el peor caso), `MobileMenu.css` (6), `BlogDetailPage.css` (1, encima con shimmer no compositado que duplica el canónico de `SkeletonPiece`).
24. 🟠 Los 3 CSS globales se pisan: `index.css` queda casi anulado por `globales.css` y los colores antiflash **no coinciden** (`#372550` vs `#402B5F`); `#root{min-height}` definido en 3 archivos.
25. 🟠 Skeletons con breakpoints desincronizados de sus componentes reales (WorkList 1000/900/800 vs WorksSkeleton 1000/800/640; WorkDetail 1024/860/768 vs skeleton solo 768; Contact 900/640/600 vs 900/600).
26. 🟠 17 `!important` evitables — 10 en un solo archivo (`WorksSkeleton.css`, todos contra `.skeleton--*` que un descendente resolvería).

### Componentes
27. 🟠 `Reveal.jsx` y `Revelar.jsx` hacen lo mismo (un consumidor cada uno); el patrón IO "asimétrico" de `useEnPantalla` está reimplementado a mano 5 veces (HowWeWork ×1, LatestProjects ×3, Reveal ×1).
28. 🟠 3 CTA "Hablemos" con anatomía idéntica y 3 hojas CSS sin relación (`WorkList`, `ContactCTA`, el comentado de `BlogList`).
29. 🟠 `LatestProjects.jsx` (558 l.) mezcla 7 responsabilidades; `Contact.jsx` tiene 5 bloques `input-group` copiados (~150 líneas reducibles a ~30) y 5 booleanos de foco que caben en un string o en CSS.
30. 🟠 La card de proyecto existe dos veces: `WorkCard` y la card inline de `LatestProjects.jsx:508-551` (el propio código admite la duplicación de la flecha).

## 3 · Mejoras recomendadas (menores, con hueco claro)

- 🟡 `mobileMenu`: `body.style.overflow="auto"` pisa el CSS en vez de restaurar el valor previo (VideoMarco lo hace bien; pueden pisarse entre sí).
- 🟡 `Lazywithmin.js` — el nombre de archivo rompe la convención (`lazyWithMin.js`); macOS lo tolera, un build Linux no. Los 600 ms son un default que nadie sobrescribe y sin medición que lo respalde.
- 🟡 `App.jsx`: el fallback de Suspense construye el skeleton en cada render aunque nada suspenda; doble `scrollTo(0,0)` (App + ScrollToTop); 3 lecturas de `window.location` en vez de `useLocation`; `initialPathname` puede quedarse pegado.
- 🟡 `WorksSkeleton.jsx:154` — cuenta la paginación con `trabajos.length` en vez de `filtrados.length` (con filtro activo pinta botones de más).
- 🟡 Duplicados menores: componente `Arrow()` ×3, path de la onda SVG ×4, limpieza de URL (`replace` de protocolo) ×2, lectura de `--header-height` ×2, `useMediaQuery` reimplementado ×2, guard de `irA` ×2.
- 🟡 Props muertas: `SkeletonPiece.style`, `Revelar.className`, `Reveal.once` (nunca ejercidas); `BlogCard` recibe `foto` y `entrada` cuando `foto === entrada.foto`.
- 🟡 `Contact.jsx`: `focused` con 5 booleanos → 1 string o CSS puro.
- 🟡 43 selectores CSS duplicados intra-archivo en 21 archivos (4 con sobrescritura real donde el primer bloque muere: `Contact.css:492/517`, `:560/580`, `MobileMenu.css:149/256`, `LightDust.css:27/62`).
- 🟡 24 breakpoints de anchura distintos; huérfanos sin justificación: 1079 (deja 21px de zona muerta con el menú), 860, 980, 576, 700.
- 🟡 `eslint.config.js` sin `jsx-a11y` ni integración en CI; `mailto`/`alert` habrían saltado.
- 🟡 `getTotalLength()` por frame en `LuzAnillo.jsx:157` (el largo del path no cambia).
- 🟡 `EscenaOraculo.css:312` — los 6 poliedros son la única animación de la escena fuera del gating `.eo--dentro`; `HeroRipples.css` — 6 animaciones infinitas sin pausa (composited, coste bajo).
- 🟡 `index.html:43` línea muerta; meta `theme-color` ausente.

## 4 · Código potencialmente muerto

### CONFIRMADO MUERTO (borrado seguro, verificado contra imports estáticos, dinámicos, strings de URL y clases dinámicas)

| Qué | Dónde | Tamaño |
|---|---|---|
| Imports `Link` y `Sparkles` + 2 bloques JSX comentados (badge y CTA) | `BlogList.jsx:1-2,60-63,96-112` | ~25 l. |
| Estilos del JSX comentado: `.blog-list-badge`, `.blog-list-subtitle`, familia `.blog-list-cta*` | `BlogList.css` | ~55 l. |
| Maqueta anterior de HowWeWork (`__container/__content/__title/__description/__cards/__eyebrow/__reveal`) | `HowWeWork.css` | ~220 de 492 l. |
| Sistemas de layout retirados: familias `wd-rejilla*`, `wd-destacado*`, `.wd-herramientas*`, `.wd-divisor`, `.wd-fila--iguales`, `.wd-solo-lectores` | `WorkDetail.css` | ~385 de 1.217 l. (32%) |
| Bloque `methodology` completo (4 rutas inexistentes) + campo `description` de todos los items | `data/dropdown.js:2-38` | 37 de 58 l. |
| `@keyframes heroRise` | `Home.css:1404` | 6 l. |
| `.about__trama` (+ sus 3 tokens `--ft-*`) y `.latest-projects__luma` | `About.css:424`, `LatestProjects.css:504` | ~20 l. |
| Assets: `src/assets/hero/oysters-3d.webp` (235 KB) y `oysters-3d-texto.png` (7 KB) | cero referencias fuera de comentarios | 242 KB |
| 17 tokens sin consumidor en `variables.css` (incl. `--shadow-sm/lg/card`, `--header-*` ×4, `--surface` duplicado) + cadena `--pie-arranque*` de Footer | `variables.css`, `Footer.css` | ~30 l. |
| 5 × `.DS_Store` — **el de `public/` se publica en el build** (verificado en `dist/`) | raíz, src, assets, public, dist | — |
| 4 × `LEEME.md` de `public/` — **notas internas servidas en producción** (verificado en `dist/`) | `public/img/work/`, `public/videos/*` | — |

### POTENCIALMENTE OBSOLETO (requiere tu decisión)

- Rutas banco de pruebas `/fondo-trama` y `/escena-oraculo`: enrutadas y accesibles por URL, **cero enlaces** desde la interfaz. `FondoTramaPage` se autodeclara "en rediseño". Arrastran `oraculo.webp` (405 KB, el asset más pesado de `src/assets/`).
- `herramientas/mascara-logo.py` + los 2 assets `oysters-3d*` (su entrada y su salida): herramienta manual de diseño cuyo producto ya nadie consume.
- Campo `tituloDestacado`: lo renderizan `WorkDetail`/`WorkHero` pero ningún proyecto lo define — rama de render permanentemente muerta (¿capacidad futura?).
- Variantes `.reveal--left/right/blur`: API pública documentada de `Reveal`, sin ningún uso hoy.
- `export` de `PASO_CORTINA`/`DURACION_CORTINA` (solo uso interno).
- `node_modules` con paquetes huérfanos fuera del lockfile (`@react-three`, `@react-spring`, `@mediapipe`…): restos de la era three.js; un `npm ci` los elimina.
- `trabajos.js:3` referencia `plantilla-proyecto.js`, que no existe.
- **Verificado como NO muerto:** los 11 componentes "sospechosos" (escaneo, escenaSynthwave, redNeuronal, textoArena, etc.) están todos vivos; los 4 hooks tienen consumidor; ningún CSS huérfano a nivel de archivo; todos los assets de `public/` se referencian; ninguna dependencia de `package.json` sobra. El `package.json` huérfano del directorio padre puede borrarse con seguridad (la app resuelve `react-icons` de su propio lockfile).

## 5 · Duplicaciones

Las estructurales están en §2 (nav ×4, tablas de ruta ×6, Reveal/Revelar, IO ×5, CTA ×3, card de proyecto ×2, paginación blog/works, botón de agua ~600 l., shimmer ×2 incompatibles). Resto:

- `starFall`/`starFallPantalla` casi idénticos (`BlogList.css`) — unificables con una custom property.
- Familia "spin 360°" ×5 archivos (`btnRingSpin`, `lpRingSpin`, `fn-girar`, `lk-orbita`, `ft-pulso`).
- Tokens locales que duplican globales exactos: `--wd-radio`=`--radius-md`, `--iia-enlace`=`--color-primary-dark`, `--wd-texto`≈`--color-text`; `#d946ef` y `#a855f7` con dos nombres locales cada uno y sin token global.
- **Duplicación DELIBERADA (contrato, no defecto):** la normalización `video`/`videos`, `hayFicha`, `hayCuerpo` y `parrafos` entre `WorkDetail.jsx` y su skeleton — documentada e impuesta por el bundling. `work/paginacion.js` demuestra el camino para convertirla en módulo compartido si se quiere blindar.

## 6 · Problemas de rendimiento

Priorizados (todos CONFIRMADOS leyendo el ciclo de vida completo):

| # | Dónde | Problema → Impacto |
|---|---|---|
| 1 | `PrismCloud.jsx:484` | RO bifurca cadenas rAF → shader a pantalla completa pintado N veces/frame tras resize |
| 2 | `BucleVideo.jsx:154` | listeners de reintento acumulándose en `window`, sobreviven a la navegación |
| 3 | `LuzAnillo.jsx:190` | rAF permanente toda la visita a la home, sección fuera de pantalla |
| 4 | `IntroAnimation.jsx:320` | resize → reinicio de intro + `getImageData` viewport completo; `:202` ~405k pares/frame |
| 5 | `PrismCloud.jsx:420,430` | layout forzado por pointermove/scroll mientras el shader pinta |
| 6 | `TextoArena.jsx:528` | rect por pointermove ×13 instancias posibles |
| 7 | `useHeroScrollDock.js:493` | resize sin debounce → write/read/write de layout |
| 8 | `InteligenciaIA.jsx:188` | identidad de objeto reinicia LuzAnillo (visible) |
| 9 | `WorkCarousel.jsx:105` | vídeo oculto sigue decodificando y **sonando** |
| 10 | `EscenaSynthwave.css:61` | 380 opacidades en bucle + 8 blurs SVG, sin gating |
| 11 | `App.jsx` A4 | cada navegación desmonta y remonta el árbol completo (coste asumido del diseño skeleton-first — documentarlo, no necesariamente cambiarlo) |
| 12 | Retardos artificiales | intro ~5,1s siempre + `NAV_PULSE` 1100ms + `lazyWithMin` 600ms + `CARGA_MINIMA` 400ms del blog — se apilan |

**Lo que está bien** (no tocar): la higiene de cleanup general es muy buena — de ~35 recursos registrados en efectos, solo BucleVideo carece de cleanup real. `redNeuronal` es la escena mejor instrumentada; `lightDust`/`fondoNuevo`/`fondoTrama` aplican el patrón correcto de pausa por visibilidad; `useHeroScrollDock` no lee el DOM en su bucle; `BucleVideo` es el mejor código de vídeo del proyecto (dos observers, descarga en dos tiempos); App.jsx cuesta 3 commits por navegación, que es lo correcto; la migración de fuentes autoalojadas está bien hecha.

## 7 · Problemas de arquitectura

1. **Sin fuente única de rutas** — 6 tablas en App.jsx + rutasNombres.js (§2.11). Un mapa `RUTAS = [{patron, componente, skeleton, tonoPie, escenaPie, nombre}]` colapsa las seis.
2. **Sin fuente única de navegación** — 4 listas divergentes con 2 enlaces rotos (§2.10).
3. **Skeletons de segunda generación pendientes** — el contrato de `/works` es el modelo (módulo compartido `paginacion.js`); `/blog` y `/services` se quedaron con un DefaultSkeleton que ya no representa nada, y `/blog/:id` montó un tercer sistema propio.
4. **App.jsx como orquestador monolítico** — 6 estados/refs + 3 efectos entrelazados; candidato natural a `useTransicionDePagina()`.
5. **`index.css`/`globales.css`/`App.css`** sin reparto claro de responsabilidades (§2.24).
6. **`VideoMarco`** es un reproductor genérico completo viviendo en `componentes/inteligenciaIA/` con fuente hardcodeada.
7. **Datos:** 3 esquemas de id, 2 formatos de fecha incompatibles (`anio`+`mes` vs `"10 Ene 2025"`), 3 convenciones de export en 5 archivos; `video`/`videos` con normalización repartida.
8. **Sin `.env` de ningún tipo** — el único parámetro de entorno del proyecto no tiene dónde vivir.
9. **Estructura de carpetas y separación contenido/lógica/presentación: correctas.** `work/detalle/` es la carpeta mejor estructurada; `about/`, `footer/`, `header/`, `layout/` limpias; el estado en URL de works/blog es el diseño correcto y está bien repartido tras la unificación de `Paginacion`.

## 8 · Documentación y comentarios

**Veredicto honesto:** el temido "exceso de comentarios" **no es el problema de este repo**. La auditoría no encontró ni un solo comentario del tipo prohibido ("// actualiza el estado"). El volumen es alto, pero casi todo documenta *por qué* — decisiones, mediciones en píxeles y milisegundos, incompatibilidades de Safari — exactamente lo que la regla §17 del encargo permite conservar. Borrarlos en masa violaría el propio encargo.

Lo que sí hay son **comentarios desactualizados que mienten**:
- `App.jsx:290-296` justifica un patrón por StrictMode… y `main.jsx` no monta StrictMode.
- `App.jsx:88` describe una intención (color del hueco en el bundle principal) que la resolución de módulos no cumple (§2.13).
- `App.jsx:74-80` justifica DefaultSkeleton porque "sus páginas reales son placeholders" — `/blog` y `/services` ya no lo son.
- `trabajos.js:3` referencia un archivo que no existe.
- `Contact.css:1041` dice "ni sirve `!important`" y el archivo usa dos.
- `Footer.css:19` conserva 4 definiciones muertas "por el fondo antiguo archivado".
- `ESTRUCTURA.md` lista como vivos los 2 assets muertos del hero.

## 9 · Plan de refactorización por fases

Validación tras **cada** bloque: `npm run lint` (0 errores) + `npm run build`. Sin big bang; cada fase es un commit revisable.

### Fase 0 — Decisiones de contenido (requieren tu autorización explícita, cambian lo visible)
- `VITE_CONTACT_URL`: crear `.env.production` con la URL real del backend (¿cuál es?).
- `/resources`: ¿ocultar del menú hasta que exista, o crear la página?
- `MOSTRAR_DEMOS`: ¿pasar a `false` o siguen siendo intencionales?
- `mailto:` real, bios/LinkedIn reales de `about.js`, imágenes del blog (subir a `public/img/blog/`), `/privacidad` y `/aviso-legal`.
- Menú móvil: `/use-cases` → `/#casos-de-uso` y decidir `/training`.
- ¿Se quedan `/fondo-trama` y `/escena-oraculo` enrutadas?

### Fase 2 — Limpieza segura (sin cambio visual ni de comportamiento)
Los 2 imports muertos de BlogList (lint) · los 2 bloques JSX comentados + su CSS · CSS muerto confirmado de HowWeWork/WorkDetail/About/LatestProjects/Home (~700 l.) · bloque `methodology` de dropdown.js · tokens muertos de variables.css y Footer.css · `.DS_Store` y `LEEME.md` fuera de `public/` (+ `.gitignore`) · assets `oysters-3d*` (con tu ok por el script Python) · renombrar `Lazywithmin.js` → `lazyWithMin.js` · comentarios desactualizados del §8 · actualizar ESTRUCTURA.md · commit del borrado del package.json huérfano del padre (verificado seguro).

### Fase 3 — Componentes
Fuente única de navegación (mata los 404) · fusionar Reveal/Revelar · `<CtaContacto>` compartido · `<CampoContacto>` en Contact (~120 l. menos) · card de proyecto unificada (WorkCard variante compacta) · `BlogPage` sobre `paginacion.js` generalizado · quitar `CARGA_MINIMA`/`cargando` de BlogDetailPage (arregla 1 error de lint) y darle skeleton real a `/blog` (+ fondo oscuro para `/services`) · descomponer LatestProjects (BotonVerTodos, ProjectCard, CristalDecorativo).

### Fase 4 — Hooks y lógica
Los 3 `set-state-in-effect` de lint · adoptar `useEnPantalla` en las 5 copias · fix PrismCloud (guard del RO + cachear rect + scroll por frame) · cleanup de reintentos de BucleVideo · gating de LuzAnillo + identidad de `trazado` · debounce de resize (IntroAnimation, useHeroScrollDock) · `pause()` al cambiar de diapositiva en WorkCarousel · `body.overflow` restaurando el valor previo.

### Fase 5 — CSS
Definir los tokens fantasma (o sustituir por tokens reales — decisión de color en blog) · consolidar las 3 familias de color hardcodeadas hacia tokens **solo donde el valor coincide exactamente** · fusionar los 4 selectores con sobrescritura real · deduplicar `cortina-entra`/`sale` (verificar el bug en navegador) · `prefers-reduced-motion` para BlogList/MobileMenu/BlogDetail · quitar los 17 `!important` evitables · alinear breakpoints skeleton↔componente · repartir responsabilidades de index/globales/App.css · unificar el shimmer del blog con SkeletonPiece.

### Fase 6 — Rendimiento y build
Revisar `NAV_PULSE` (medir; candidato a ~300-500 ms) · `manualChunks` en vite.config (vendor react/router/lucide) + medir antes/después · `document.title` por ruta + `og:image` · gating de EscenaSynthwave (CSS `animation-play-state` con el IO existente de Contact) · optimización del O(n²) de la intro si se quiere (es 1,6 s al arrancar).

### Fase 7 — Revisión final
Lint 0 + build + pasada visual ruta a ruta (/, /works, /works/:id ×3, /blog ×2 páginas, /blog/:id, /services, /contact, 404) en desktop y móvil, con y sin `prefers-reduced-motion` · diff de tamaños de bundle contra la línea base · actualizar AUDITORIA.md con lo aplicado.

---

*Generado por 5 auditorías paralelas (código muerto, componentes/páginas, hooks/rendimiento/WebGL, CSS, arquitectura/carga/dependencias). Ningún archivo del proyecto fue modificado durante la auditoría.*
