'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';
import Gun from '@/components/Gun';

const SPEED = 5;

export default function Player() {
  const { camera, scene } = useThree();
  const updatePlayerPosition = useGameStore((state) => state.updatePlayerPosition);
  
  // Movement refs
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  
  // Mobile controls refs
  const joystickVector = useRef(new THREE.Vector2());
  const touchLookDelta = useRef(new THREE.Vector2());
  
  // Gun state
  const [isShooting, setIsShooting] = useState(false);
  const raycaster = useRef(new THREE.Raycaster());

  const shoot = useCallback(() => {
    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 100);

    // Raycast from camera center
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    for (const intersect of intersects) {
      if (intersect.object.userData?.hit) {
        intersect.object.userData.hit();
        break; // Hit first object
      }
    }
  }, [camera, scene]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward.current = true; break;
        case 'ArrowLeft': case 'KeyA': moveLeft.current = true; break;
        case 'ArrowDown': case 'KeyS': moveBackward.current = true; break;
        case 'ArrowRight': case 'KeyD': moveRight.current = true; break;
        case 'Space': shoot(); break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward.current = false; break;
        case 'ArrowLeft': case 'KeyA': moveLeft.current = false; break;
        case 'ArrowDown': case 'KeyS': moveBackward.current = false; break;
        case 'ArrowRight': case 'KeyD': moveRight.current = false; break;
      }
    };

    // Mobile input listeners (dispatched from UI)
    const handleJoystickMove = (e: CustomEvent<{ x: number; y: number }>) => {
      joystickVector.current.set(e.detail.x, e.detail.y);
    };

    const handleTouchLook = (e: CustomEvent<{ dx: number; dy: number }>) => {
      touchLookDelta.current.set(e.detail.dx, e.detail.dy);
    };

    const handleShoot = () => {
      shoot();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('joystick-move', handleJoystickMove as EventListener);
    window.addEventListener('touch-look', handleTouchLook as EventListener);
    window.addEventListener('shoot', handleShoot);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('joystick-move', handleJoystickMove as EventListener);
      window.removeEventListener('touch-look', handleTouchLook as EventListener);
      window.removeEventListener('shoot', handleShoot);
    };
  }, [shoot]);

  useFrame((state, delta) => {
    const velocity = SPEED * delta;

    // Keyboard Movement
    if (moveForward.current) camera.translateZ(-velocity);
    if (moveBackward.current) camera.translateZ(velocity);
    if (moveLeft.current) camera.translateX(-velocity);
    if (moveRight.current) camera.translateX(velocity);

    // Joystick Movement
    if (joystickVector.current.length() > 0) {
      // Forward/Back is Y (inverted for forward), Left/Right is X
      // Joystick Y up is negative (forward), down is positive (backward)
      // Joystick X left is negative, right is positive
      
      // TranslateZ: negative is forward
      camera.translateZ(joystickVector.current.y * velocity);
      camera.translateX(joystickVector.current.x * velocity);
    }

    // Touch Look
    if (touchLookDelta.current.length() > 0) {
      const sensitivity = 0.005;
      // eslint-disable-next-line react-hooks/immutability
      camera.rotation.y -= touchLookDelta.current.x * sensitivity;
      // Clamp X rotation (pitch)
      // camera.rotation.x -= touchLookDelta.current.y * sensitivity;
      // camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
      
      // Reset delta after applying
      touchLookDelta.current.set(0, 0);
    }

    // eslint-disable-next-line react-hooks/immutability
    camera.position.y = 1.6;
    updatePlayerPosition(camera.position.clone());
  });

  return (
    <>
      <PointerLockControls />
      <GunController camera={camera} isShooting={isShooting} />
    </>
  );
}

function GunController({ camera, isShooting }: { camera: THREE.Camera; isShooting: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(camera.position);
      groupRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={groupRef}>
      <Gun isShooting={isShooting} />
    </group>
  );
}
