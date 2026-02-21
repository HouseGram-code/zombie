import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';

interface Zombie {
  id: string;
  position: [number, number, number];
  speed: number;
}

interface GameState {
  score: number;
  zombies: Zombie[];
  playerPosition: THREE.Vector3;
  isGameOver: boolean;
  addScore: (points: number) => void;
  spawnZombie: () => void;
  removeZombie: (id: string) => void;
  updatePlayerPosition: (pos: THREE.Vector3) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  zombies: [],
  playerPosition: new THREE.Vector3(0, 1.6, 0),
  isGameOver: false,
  addScore: (points) => set((state) => ({ score: state.score + points })),
  spawnZombie: () =>
    set((state) => {
      // Spawn away from player
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 10;
      const x = state.playerPosition.x + Math.cos(angle) * distance;
      const z = state.playerPosition.z + Math.sin(angle) * distance;
      
      return {
        zombies: [
          ...state.zombies,
          {
            id: uuidv4(),
            position: [x, 1, z],
            speed: 2 + Math.random() * 2,
          },
        ],
      };
    }),
  removeZombie: (id) =>
    set((state) => ({
      zombies: state.zombies.filter((z) => z.id !== id),
    })),
  updatePlayerPosition: (pos) => set({ playerPosition: pos }),
  resetGame: () => set({ score: 0, zombies: [], isGameOver: false }),
}));
