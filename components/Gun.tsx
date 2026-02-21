'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Gun({ isShooting }: { isShooting: boolean }) {
  const gunRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!gunRef.current) return;
    
    // Recoil animation
    if (isShooting) {
      gunRef.current.position.z = 0.2; // Move back
    } else {
      gunRef.current.position.z = THREE.MathUtils.lerp(gunRef.current.position.z, 0, 0.2); // Recover
    }
  });

  return (
    <group ref={gunRef} position={[0.3, -0.3, -0.5]}>
      {/* Gun Body */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[0.1, 0.1, 0.6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.1, 0.4]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}
