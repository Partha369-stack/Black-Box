import React from 'react';

interface SimpleTestOrbProps {
  hue?: number;
}

const SimpleTestOrb: React.FC<SimpleTestOrbProps> = ({ hue = 0 }) => {
  return (
    <div 
      className="simple-test-orb"
      style={{
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: `radial-gradient(
          circle at center,
          hsl(${hue}, 80%, 70%) 0%,
          hsl(${(hue + 120) % 360}, 80%, 60%) 30%,
          hsl(${(hue + 240) % 360}, 80%, 50%) 60%,
          transparent 100%
        )`,
        animation: 'orbPulse 4s ease-in-out infinite alternate, orbRotate 20s linear infinite',
        filter: 'blur(2px)',
        position: 'relative',
      }}
    />
  );
};

export default SimpleTestOrb;
