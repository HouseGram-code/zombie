'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';

export default function Zombie({ id, position, speed }: { id: string; position: [number, number, number]; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const playerPosition = useGameStore((state) => state.playerPosition);
  const removeZombie = useGameStore((state) => state.removeZombie);
  const [dead, setDead] = useState(false);

  const handleHit = () => {
    setDead(true);
    // Shrink animation or particle effect could go here
    setTimeout(() => removeZombie(id), 100);
  };

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData = { isEnemy: true, hit: handleHit };
    }
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || dead) return;

    // Move towards player
    const currentPos = meshRef.current.position;
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, currentPos)
      .normalize();
    
    // Ignore Y axis for movement direction to keep them on ground
    direction.y = 0;
    direction.normalize();

    meshRef.current.position.add(direction.multiplyScalar(speed * delta));
    
    // Look at player
    meshRef.current.lookAt(playerPosition.x, 1, playerPosition.z);

    // Simple collision with player (Game Over check could go here)
    if (currentPos.distanceTo(playerPosition) < 1.5) {
      // console.log('Player hit!');
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color={dead ? 'red' : 'green'} />
      {/* Eyes */}
      <mesh position={[0.2, 0.5, 0.5]}>
        <boxGeometry args={[0.2, 0.2, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-0.2, 0.5, 0.5]}>
        <boxGeometry args={[0.2, 0.2, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </mesh>
  );
}
