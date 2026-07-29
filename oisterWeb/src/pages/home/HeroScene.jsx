
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";

import Oyster from "./Oyster";

function HeroScene({ introDone = true }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: [0, 0.2, 8.5],
        fov: 22,
      }}
    >
      {/* Luz ambiental */}
      <ambientLight intensity={0.35} />

      {/* Luz principal */}
      <directionalLight
        position={[6, 7, 5]}
        intensity={2.5}
        color="#ffffff"
        castShadow
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

      {/* <AccumulativeShadows
        temporal
        frames={120}
        alphaTest={0.9}
        opacity={0.75}
        scale={14}
        position={[1.2, -2.05, 0]}
      >
        <RandomizedLight
          amount={12}
          radius={8}
          ambient={0.45}
          intensity={3}
          position={[5, 6, -5]}
        />
      </AccumulativeShadows> */}

      <ContactShadows
        position={[1.2, -2.05, 0]}
        opacity={0.25}
        blur={3}
        scale={10}
        far={5}
      />
    </Canvas>
  );
}

export default HeroScene;