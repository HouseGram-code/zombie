'use client';

import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

function Box({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#444" />
    </mesh>
  );
}

export default function World() {
  // Generate some random boxes
  const boxes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      // eslint-disable-next-line react-hooks/purity
      const x = (Math.random() - 0.5) * 50;
      // eslint-disable-next-line react-hooks/purity
      const z = (Math.random() - 0.5) * 50;
      temp.push({ id: i, position: [x, 0.5, z] as [number, number, number] });
    }
    return temp;
  }, []);

  return (
    <group>
      <Ground />
      {boxes.map((box) => (
        <Box key={box.id} position={box.position} />
      ))}
      <gridHelper args={[100, 100]} />
    </group>
  );
}
