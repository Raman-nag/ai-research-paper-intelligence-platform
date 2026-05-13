import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = () => {
  const ref = useRef();
  
  // Generate random particles
  const sphere = new Float32Array(3000 * 3);
  for (let i = 0; i < 3000; i++) {
    const r = 20 * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    sphere[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    sphere[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    sphere[i * 3 + 2] = r * Math.cos(phi);
  }

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 20;
    ref.current.rotation.y -= delta / 30;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00f3ff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

const Background3D = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ParticleField />
      </Canvas>
    </div>
  );
};

export default Background3D;
