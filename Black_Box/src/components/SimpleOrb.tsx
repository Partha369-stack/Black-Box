import React from 'react';
import './Orb.css';

interface OrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function SimpleOrb({ hue = 0 }: OrbProps) {
  const hue1 = hue;
  const hue2 = (hue + 120) % 360;
  const hue3 = (hue + 240) % 360;
  
  return (
    <div className="orb-container" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <div 
        className="simple-orb-animation"
        style={{ 
          '--hue1': `${hue1}`,
          '--hue2': `${hue2}`,
          '--hue3': `${hue3}`,
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: '400px',
          minHeight: '400px',
          background: `radial-gradient(
            circle at center,
            hsla(${hue1}, 80%, 70%, 0.9) 0%,
            hsla(${hue2}, 80%, 60%, 0.7) 30%,
            hsla(${hue3}, 80%, 50%, 0.5) 60%,
            hsla(${hue1}, 60%, 40%, 0.3) 80%,
            transparent 100%
          )`,
          borderRadius: '50%',
          filter: 'blur(2px)',
          animation: 'orbPulse 4s ease-in-out infinite alternate, orbRotate 20s linear infinite'
        } as React.CSSProperties}
      />
    </div>
  );
}
