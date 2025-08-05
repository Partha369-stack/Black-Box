import React from 'react';

interface SimpleHyperspeedProps {
  className?: string;
  style?: React.CSSProperties;
}

const SimpleHyperspeed: React.FC<SimpleHyperspeedProps> = ({ className, style }) => {
  return (
    <div 
      className={`hyperspeed-container ${className || ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        background: 'linear-gradient(180deg, #000011 0%, #000033 50%, #000011 100%)',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Stars background */}
      <div className="stars-field">
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Speed lines */}
      <div className="speed-lines">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="speed-line"
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 50}px`,
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${
                ['#03b3c3', '#6750a2', '#d856bf'][Math.floor(Math.random() * 3)]
              } 50%, transparent 100%)`,
              animation: `speedLine ${Math.random() * 2 + 1}s infinite linear`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 20 - 10}deg)`
            }}
          />
        ))}
      </div>

      {/* Central vortex */}
      <div 
        className="vortex"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          background: `
            radial-gradient(circle, 
              transparent 30%, 
              rgba(3, 179, 195, 0.1) 40%, 
              rgba(103, 80, 162, 0.2) 60%, 
              rgba(216, 86, 191, 0.1) 80%, 
              transparent 100%
            )
          `,
          borderRadius: '50%',
          animation: 'vortexSpin 4s infinite linear'
        }}
      />

      {/* Particle effects */}
      <div className="particles">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: ['#03b3c3', '#6750a2', '#d856bf', '#ffffff'][Math.floor(Math.random() * 4)],
              borderRadius: '50%',
              animation: `particle ${Math.random() * 3 + 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes speedLine {
          0% { transform: translateX(-100px) scaleX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100vw) scaleX(1); opacity: 0; }
        }

        @keyframes vortexSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes particle {
          0% { 
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: scale(1);
          }
          80% {
            opacity: 1;
          }
          100% { 
            transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
            opacity: 0;
          }
        }

        .hyperspeed-container {
          animation: backgroundPulse 3s infinite ease-in-out;
        }

        @keyframes backgroundPulse {
          0%, 100% { filter: brightness(1) contrast(1); }
          50% { filter: brightness(1.1) contrast(1.2); }
        }
      `}</style>
    </div>
  );
};

export default SimpleHyperspeed;
