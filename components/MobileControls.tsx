'use client';

import { useEffect, useRef, useState } from 'react';

export default function MobileControls() {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // We keep a ref for calculation to avoid stale state in event handlers if we attached them manually,
  // but here we use React event handlers so state is fine? 
  // Actually, touch move fires rapidly, refs are better for calculation, state for render.
  const startPosRef = useRef({ x: 0, y: 0 });

  // Joystick Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const start = { x: touch.clientX, y: touch.clientY };
    startPosRef.current = start;
    setStartPos(start);
    setJoystickActive(true);
    setJoystickPos({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickActive) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startPosRef.current.x;
    const dy = touch.clientY - startPosRef.current.y;
    
    const maxDist = 50;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(distance, maxDist);
    const angle = Math.atan2(dy, dx);
    
    const x = Math.cos(angle) * clampedDist;
    const y = Math.sin(angle) * clampedDist;

    setJoystickPos({ x, y });

    // Dispatch event
    // Normalize to -1 to 1
    const normX = x / maxDist;
    const normY = y / maxDist;
    
    window.dispatchEvent(new CustomEvent('joystick-move', { detail: { x: normX, y: normY } }));
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    window.dispatchEvent(new CustomEvent('joystick-move', { detail: { x: 0, y: 0 } }));
  };

  // Look Logic
  const lastLookPos = useRef({ x: 0, y: 0 });
  
  const handleLookStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - lastLookPos.current.x;
    const dy = touch.clientY - lastLookPos.current.y;
    
    lastLookPos.current = { x: touch.clientX, y: touch.clientY };

    window.dispatchEvent(new CustomEvent('touch-look', { detail: { dx, dy } }));
  };

  const handleShoot = () => {
    window.dispatchEvent(new Event('shoot'));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex">
      {/* Left: Joystick Area */}
      <div 
        className="w-1/2 h-full pointer-events-auto relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {joystickActive && (
          <div 
            className="absolute w-24 h-24 bg-white/20 rounded-full -ml-12 -mt-12 pointer-events-none"
            style={{ left: startPos.x, top: startPos.y }}
          >
            <div 
              className="absolute w-10 h-10 bg-white/50 rounded-full -ml-5 -mt-5 top-1/2 left-1/2"
              style={{ transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)` }}
            />
          </div>
        )}
      </div>

      {/* Right: Look Area */}
      <div 
        className="w-1/2 h-full pointer-events-auto touch-none relative"
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
      >
        {/* Shoot Button */}
        <button 
          className="absolute bottom-8 right-8 w-20 h-20 bg-red-500/50 rounded-full border-4 border-white/50 active:bg-red-500/80 touch-none flex items-center justify-center text-white font-bold"
          onTouchStart={(e) => { e.stopPropagation(); handleShoot(); }}
        >
          FIRE
        </button>
      </div>
    </div>
  );
}
