import React from 'react';

interface TestOrbProps {
  hue?: number;
}

export default function TestOrb({ hue = 0 }: TestOrbProps) {
  return (
    <div 
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: `radial-gradient(
          circle at center,
          hsla(${hue}, 80%, 70%, 0.6) 0%,
          hsla(${(hue + 60) % 360}, 75%, 65%, 0.4) 25%,
          hsla(${(hue + 120) % 360}, 70%, 60%, 0.3) 50%,
          hsla(${(hue + 180) % 360}, 65%, 55%, 0.2) 75%,
          transparent 100%
        )`,
        filter: 'blur(3px)',
        animation: 'orbPulse 4s ease-in-out infinite alternate, orbFloat 8s ease-in-out infinite',
        zIndex: 1,
        opacity: 0.8
      }}
    >
      <style>{`
        @keyframes orbPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes orbFloat {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
