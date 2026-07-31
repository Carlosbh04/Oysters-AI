import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";

import Oyster from "./Oyster";

/* ===== Optimizaciones SIN tocar el look =====
   La iluminación es EXACTAMENTE la original (5 luces, mismas
   posiciones/colores/intensidades). Lo optimizado es solo lo
   invisible:
   · dpr capado a 1.5 (2x retina = 4x píxeles, imperceptible)
   · sin shadow-maps del renderer: no había suelo 3D que
     recibiera sombras — era un pase por frame desperdiciado
   · ContactShadows frames={1}: el blob se hornea una vez
   · powerPreference high-performance: GPU dedicada en
     portátiles con gráfica dual */
function HeroScene({ introDone = true }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ powerPreference: "high-performance", antialias: true }}
      camera={{
        position: [0, 0.2, 8.5],
        fov: 22,
      }}
    >
      {/* Suspense LOCAL: atrapa la carga del GLB y el HDRI
          aquí dentro — sin él, la suspensión subiría hasta el
          Suspense de rutas de App y escondería la página */}
      <Suspense fallback={null}>
        {/* Luz ambiental */}
        <ambientLight intensity={0.35} />

        {/* Luz principal */}
        <directionalLight
          position={[6, 7, 5]}
          intensity={2.5}
          color="#ffffff"
        />

        {/* Luz rosa */}
        <pointLight
          position={[4, 2, 5]}
          intensity={45}
          distance={20}
          color="#ffc6ea"
        />

        {/* Luz violeta */}
        <pointLight
          position={[-5, 3, 2]}
          intensity={30}
          distance={18}
          color="#c99bff"
        />

        {/* Luz azul hielo */}
        <pointLight
          position={[0, -1, 6]}
          intensity={28}
          distance={18}
          color="#bdefff"
        />

        {/* Contraluz para remarcar los bordes */}
        <directionalLight
          position={[0, 4, -8]}
          intensity={2.2}
          color="#ffffff"
        />

        {/* HDRI */}
        <Environment preset="city" />

        <Oyster introDone={introDone} />

        <ContactShadows
          position={[1.2, -2.05, 0]}
          opacity={0.25}
          blur={3}
          scale={10}
          far={5}
          frames={1}
        />
      </Suspense>
    </Canvas>
  );
}

export default HeroScene;