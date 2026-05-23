import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function RobotModel() {
  const robotRef = useRef();

  const { scene } = useGLTF("/models/ai_robot.glb");

  useFrame(({ mouse }) => {
    if (robotRef.current) {
      robotRef.current.rotation.y =
        THREE.MathUtils.lerp(
          robotRef.current.rotation.y,
          mouse.x * 0.8,
          0.05
        );

      robotRef.current.rotation.x =
        THREE.MathUtils.lerp(
          robotRef.current.rotation.x,
          -mouse.y * 0.3,
          0.05
        );
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <primitive
        ref={robotRef}
        object={scene}
        scale={4.5}
        position={[0, -3.2, 0]}
      />
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div
      style={{
        width: "100%",
        height: "650px",
      }}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={1.5} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={3}
          color="#00f3ff"
        />

        <pointLight
          position={[-5, 2, 5]}
          intensity={2}
          color="#9d4edd"
        />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <RobotModel />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}