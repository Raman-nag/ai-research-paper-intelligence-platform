import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

const AnimatedShape = () => {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.2;
      sphereRef.current.rotation.x = t * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={sphereRef}>
        <icosahedronGeometry args={[2, 4]} />
        <MeshDistortMaterial 
          color="#9d00ff" 
          attach="material" 
          distort={0.4} 
          speed={2} 
          roughness={0.2} 
          metalness={0.8}
          wireframe={true}
        />
      </mesh>
      
      {/* Inner glowing core */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial 
          color="#00f3ff" 
          emissive="#00f3ff"
          emissiveIntensity={2}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

const Hero3D = () => {
  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <AnimatedShape />
      </Canvas>
    </div>
  );
};

export default Hero3D;
