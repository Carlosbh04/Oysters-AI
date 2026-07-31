import { Float, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { useEffect } from "react";

/* rotación de reposo: la pose "de catálogo" de la ostra */
const HOME = { x: 0, y: 3.9 };

/* cuánto gira la ostra al completar el recorrido de scroll
   (radianes). ~2.2 ≈ un poco más de un tercio de vuelta */
const SCROLL_TURN = 2.2;

/* ligera inclinación hacia delante al final del recorrido */
const SCROLL_TILT = 0.18;

function Oyster({ introDone = true }) {
  /* modelo OPTIMIZADO: Draco (decodifica en WebWorker, fuera
     del hilo principal) + malla simplificada — 28.85MB → 2.1MB.
     El `true` activa el decodificador Draco de drei. */
  const { scene } = useGLTF("/models/oysters_draco.glb", true);
  const { gl } = useThree();

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- nacimiento CONTROLADO: espera al fin del intro ----
     Nace a 0.55 y se queda quieta esperando; cuando introDone
     pasa a true, el pop 0.55 → 1 se dispara sincronizado con
     el destello (.hero--enter + .is-ready). */
  const [birth, birthApi] = useSpring(() => ({
    s: reduceMotion ? 1 : 0.55,
  }));

  useEffect(() => {
    if (!introDone) return;

    birthApi.start({
      s: 1,
      delay: 250, // deja que el destello abra primero
      config: { mass: 1, tension: 190, friction: 15 }, // overshoot sutil
    });
  }, [introDone, birthApi]);

  useEffect(() => {
    const right = gl.domElement.closest(".hero__right");
    right?.classList.add("is-ready");
    return () => right?.classList.remove("is-ready");
  }, [gl]);

  /* spring de rotación: el scroll fija el objetivo y el spring
     lo persigue planeando — por eso el giro se siente líquido
     aunque la rueda del ratón salte a trompicones */
  const [spring, api] = useSpring(() => ({
    rotation: [HOME.x, HOME.y, 0],
    config: { mass: 1.2, tension: 120, friction: 26 },
  }));

  /* ---- coreografía de SCROLL (sustituye al drag) ----
     La ostra ya NO se puede manipular. En su lugar:
     · progreso p = scroll de 0 a 1 durante el primer viewport
     · rotación: gira SCROLL_TURN radianes + inclina un poco
     · desplazamiento derecha → izquierda: el mismo p se
       publica como variable CSS --h-scroll-p en .hero__right,
       y Home.css lo convierte en translateX (el canvas entero
       viaja; en 3D solo giramos)
     rAF-throttled: un cálculo por frame como mucho. */
  useEffect(() => {
    if (reduceMotion) return;

    const right = gl.domElement.closest(".hero__right");
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const y = window.scrollY;

        /* el viaje dura EXACTAMENTE un viewport: cuando la
           sección HowWeWork llega arriba (scroll = 1vh), la
           ostra ya está a la izquierda, sobre su pista */
        const p = Math.min(1, Math.max(0, y / vh));

        /* acople: pasado el viaje, compensa el scroll restante
           para que la ostra suba PEGADA a la sección */
        const dock = Math.max(0, y - vh);

        api.start({
          rotation: [
            HOME.x + SCROLL_TILT * p,
            HOME.y + SCROLL_TURN * p,
            0,
          ],
        });

        right?.style.setProperty("--h-scroll-p", p);
        right?.style.setProperty("--h-dock-y", `${-dock}px`);

      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    /* re-sincroniza también en resize: vh cambia y con él todo
       el cálculo del viaje/acople */
    window.addEventListener("resize", onScroll);

    /* ---- FIX bug de recarga ----
       Al recargar con la página scrolleada, el navegador
       restaura el scroll en un momento IMPREVISIBLE respecto
       al montaje de la escena (a veces antes, a veces después,
       y sin disparar evento de scroll). Si solo sincronizamos
       al montar, la ostra se queda clavada en una posición
       calculada con un scrollY viejo. Solución: sincronizar
       en varios momentos que cubren todos los timings —
       montaje, frame siguiente, load y dos colas de seguridad. */
    onScroll(); // 1. al montar
    const raf2 = requestAnimationFrame(onScroll); // 2. frame siguiente
    window.addEventListener("load", onScroll); // 3. página cargada
    const t1 = setTimeout(onScroll, 250); // 4. restauración tardía
    const t2 = setTimeout(onScroll, 800); // 5. última red

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(raf2);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [api, gl, reduceMotion]);

  /* ---- material (sin cambios) ---- */
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.geometry.computeVertexNormals();

        child.material.flatShading = false;

        child.material.normalMap = null;
        child.material.bumpMap = null;
        child.material.roughnessMap = null;

        /* ---- acabado rosado: domar los REFLEJOS ----
           El problema de la palidez no era el color base sino
           el espejo: envMapIntensity alto + metalness hacían
           que la concha reflejara el HDRI (blanco neutro) por
           encima de cualquier rosa. Receta:
           · metalness 0 → el color viene del pigmento, no
             del reflejo del entorno
           · envMapIntensity 1.6 → el entorno ilumina, ya no
             lava
           · iridescence 0.55 → tornasol presente sin velar
           · emissive rosa muy tenue → rosa GARANTIZADO desde
             dentro, pase lo que pase con las luces
           Diales: más rosa → color/emissiveIntensity ·
           más brillo-espejo → envMapIntensity */
        child.material.color.set("#ffc3dd");

        child.material.roughness = 0.22;
        child.material.metalness = 0;

        child.material.envMapIntensity = 1.6;

        child.material.clearcoat = 0.8;
        child.material.clearcoatRoughness = 0.15;

        child.material.emissive?.set("#ff6eb8");
        child.material.emissiveIntensity = 0.07;

        if ("sheen" in child.material) {
          child.material.sheen = 1;
          child.material.sheenColor?.set("#ff8fd0");
          child.material.sheenRoughness = 0.3;
        }

        if ("iridescence" in child.material) {
          child.material.iridescence = 0.55;
          child.material.iridescenceIOR = 1.5;
          child.material.iridescenceThicknessRange = [140, 520];
        }

        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  return (
    <a.group scale={birth.s}>
      <a.group rotation={spring.rotation}>
        <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.45}>
          <group position={[-0.1, 0.1, 0]}>
            <primitive object={scene} scale={1.5} />
          </group>
        </Float>
      </a.group>
    </a.group>
  );
}

/* SIN preload a nivel de módulo: arrancaba en el segundo
   CERO (al importarse el archivo) y su parseo del GLB corre
   en el hilo principal — le robaba frames al intro aunque el
   montaje estuviera diferido. Ahora descarga y parseo ocurren
   dentro de la ventana de calma de useDeferredMount. */

export default Oyster;