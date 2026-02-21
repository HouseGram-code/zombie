'use client';

import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import Player from '@/components/Player';
import World from '@/components/World';
import Zombie from '@/components/Zombie';
import MobileControls from '@/components/MobileControls';
import { Suspense, useEffect } from 'react';
import { useGameStore } from '@/lib/store';

function GameLogic() {
  const spawnZombie = useGameStore((state) => state.spawnZombie);
  const zombies = useGameStore((state) => state.zombies);

  useEffect(() => {
    const interval = setInterval(() => {
      if (zombies.length < 10) {
        spawnZombie();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [spawnZombie, zombies.length]);

  return (
    <>
      {zombies.map((zombie) => (
        <Zombie key={zombie.id} {...zombie} />
      ))}
    </>
  );
}

export default function GamePage() {
  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 text-white font-mono pointer-events-none bg-black/50 p-4 rounded-lg hidden md:block">
        <h1 className="text-xl font-bold mb-2">3D Zombie Shooter</h1>
        <p>Click to start</p>
        <p>WASD to move</p>
        <p>Mouse to look</p>
        <p>SPACE to shoot</p>
      </div>

      {/* Mobile Controls Overlay */}
      <div className="md:hidden block absolute inset-0 z-50 pointer-events-none">
        <MobileControls />
      </div>
      
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 pointer-events-none z-20 flex items-center justify-center">
        <div className="w-4 h-[2px] bg-white absolute"></div>
        <div className="h-4 w-[2px] bg-white absolute"></div>
      </div>

      <Canvas shadows camera={{ fov: 75, position: [0, 1.6, 5] }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Stars />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} castShadow />
          
          <Player />
          <World />
          <GameLogic />
        </Suspense>
      </Canvas>
    </div>
  );
}
