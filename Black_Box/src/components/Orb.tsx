import React, { useEffect, useRef, useState } from "react";

import './Orb.css';

interface OrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
  shape?: 'circle' | 'square';
}

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  shape = 'square',
}: OrbProps) {
  const [isHovered, setIsHovered] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic colors based on hue
  const hue1 = hue;
  const hue2 = (hue + 120) % 360;
  const hue3 = (hue + 240) % 360;

  const baseIntensity = forceHoverState ? 1 : (isHovered ? 1 : 0.7);
  const scaleValue = forceHoverState ? 1.1 : (isHovered ? 1.1 : 1);



  return (
    <div
      ref={orbRef}
      className="orb-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        pointerEvents: 'none'
      }}
    >
      <div
        className="orb-main"
        style={{
          position: 'relative',
          width: '500px',
          height: '500px',
          borderRadius: shape === 'circle' ? '50%' : '20%',
          background: `radial-gradient(
            circle at 30% 30%,
            hsla(${hue1}, 90%, 80%, ${baseIntensity * 0.9}) 0%,
            hsla(${hue2}, 85%, 70%, ${baseIntensity * 0.7}) 25%,
            hsla(${hue3}, 80%, 60%, ${baseIntensity * 0.5}) 50%,
            hsla(${hue1}, 75%, 50%, ${baseIntensity * 0.3}) 75%,
            transparent 100%
          )`,
          filter: `blur(3px) brightness(${baseIntensity})`,
          transform: `scale(${scaleValue})`,
          transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
          animation: rotateOnHover
            ? 'orbPulse 4s ease-in-out infinite alternate, orbRotate 20s linear infinite'
            : 'orbPulse 4s ease-in-out infinite alternate',
          opacity: baseIntensity,
          pointerEvents: 'none'
        } as React.CSSProperties}
      />

      {/* Additional glow layer */}
      <div
        className="orb-glow"
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: shape === 'circle' ? '50%' : '25%',
          background: `radial-gradient(
            circle at center,
            hsla(${hue1}, 100%, 90%, ${baseIntensity * 0.3}) 0%,
            hsla(${hue2}, 95%, 80%, ${baseIntensity * 0.2}) 40%,
            transparent 70%
          )`,
          filter: 'blur(8px)',
          transform: `scale(${scaleValue * 0.8})`,
          transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
          animation: 'orbGlow 6s ease-in-out infinite alternate',
          opacity: baseIntensity * 0.6,
          pointerEvents: 'none'
        } as React.CSSProperties}
      />
    </div>
  );
}
