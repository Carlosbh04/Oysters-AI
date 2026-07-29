import { Float, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { useGesture } from "@use-gesture/react";
import { useRef, useEffect, useCallback } from "react";

/* rotación de reposo: la pose "de catálogo" de la ostra */
const HOME = { x: 0, y: 3.9 };

/* ms sin interactuar antes de volver a casa */
const IDLE_MS = 5000;

function Oyster({ introDone = true }) {
  const { scene } = useGLTF("/models/oysters_v01.glb");
  const { gl, size } = useThree();

  const rot = useRef({ ...HOME });
  const idleTimer = useRef(null);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- nacimiento CONTROLADO: espera al fin del intro ----
     Antes el spring arrancaba solo al montar (= al cargar el
     GLB), que ahora ocurre DEBAJO del intro → la ostra llegaba
     ya grande. Ahora nace a 0.55 y se queda quieta esperando;
     cuando introDone pasa a true, el pop 0.55 → 1 se dispara
     sincronizado con el destello (.hero--enter + .is-ready). */
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

  /* dos configs de spring: una para el dedo, otra para el retorno.
     El retorno usa tension baja → vuelve planeando, no de latigazo */
  const [spring, api] = useSpring(() => ({
    rotation: [HOME.x, HOME.y, 0],
    config: { mass: 1, tension: 260, friction: 22 },
  }));

  /* ---- retorno a casa tras inactividad ---- */
  const goHome = useCallback(() => {
    /* camino más corto: si el usuario dio 10 vueltas, volvemos a la
       vuelta equivalente más cercana en vez de desenrollar las 10 */
    const TAU = Math.PI * 2;
    const nearestY = HOME.y + Math.round((rot.current.y - HOME.y) / TAU) * TAU;

    rot.current = { x: HOME.x, y: nearestY };

    api.start({
      rotation: [HOME.x, nearestY, 0],
      config: { mass: 1.4, tension: 60, friction: 24 }, // planeo suave
    });
  }, [api]);

  const armIdleTimer = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(goHome, IDLE_MS);
  }, [goHome]);

  useEffect(() => {
    armIdleTimer(); // el reloj corre también si nadie toca nunca
    return () => clearTimeout(idleTimer.current);
  }, [armIdleTimer]);

  /* ---- drag global sobre el canvas ---- */
  useGesture(
    {
      onDragStart: () => {
        gl.domElement.style.cursor = "grabbing";
        armIdleTimer();
      },
      onDrag: ({ delta: [dx, dy] }) => {
        const factor = (Math.PI * 1.4) / size.width;

        rot.current.y += dx * factor;
        rot.current.x = Math.max(
          -0.6,
          Math.min(0.6, rot.current.x + dy * factor)
        );

        api.start({
          rotation: [rot.current.x, rot.current.y, 0],
          config: { mass: 1, tension: 260, friction: 22 },
        });

        armIdleTimer();
      },
      onDragEnd: () => {
        gl.domElement.style.cursor = "grab";
        armIdleTimer();
      },
    },
    {
      target: gl.domElement,
      drag: { filterTaps: true },
    }
  );

  /* cursor + touch-action del canvas */
  useEffect(() => {
    const canvas = gl.domElement;
    const prevTouch = canvas.style.touchAction;
    const prevCursor = canvas.style.cursor;
    canvas.style.touchAction = "none";
    canvas.style.cursor = "grab";
    return () => {
      canvas.style.touchAction = prevTouch;
      canvas.style.cursor = prevCursor;
    };
  }, [gl]);

  /* ---- material (sin cambios) ---- */
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.geometry.computeVertexNormals();

        child.material.flatShading = false;

        child.material.normalMap = null;
        child.material.bumpMap = null;
        child.material.roughnessMap = null;

        child.material.color.set("#fdf8ff");

        child.material.roughness = 0.08;
        child.material.metalness = 0.15;

        child.material.envMapIntensity = 3.8;

        child.material.clearcoat = 1;
        child.material.clearcoatRoughness = 0.02;

        if ("sheen" in child.material) {
          child.material.sheen = 1;
          child.material.sheenColor?.set("#ffd8ef");
          child.material.sheenRoughness = 0.15;
        }

        if ("iridescence" in child.material) {
          child.material.iridescence = 1;
          child.material.iridescenceIOR = 1.4;
          child.material.iridescenceThicknessRange = [120, 450];
        }

        child.material.needsUpdate = true;
      }
    });
  }, [scene]);

  return (
    <a.group scale={birth.s}>
      <a.group rotation={spring.rotation}>
        <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.45}>
          <group position={[-0.1, -0.2, 0]}>
            <primitive object={scene} scale={1.8} />
          </group>
        </Float>
      </a.group>
    </a.group>
  );
}

useGLTF.preload("/models/oysters_v01.glb");

export default Oyster;