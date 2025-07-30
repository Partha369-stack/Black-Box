import React, { useEffect, useRef, useState } from 'react';

interface TextPressureProps {
  text: string;
  flex?: boolean;
  alpha?: boolean;
  stroke?: boolean;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  textColor?: string;
  strokeColor?: string;
  minFontSize?: number;
}

const TextPressure: React.FC<TextPressureProps> = ({
  text,
  flex = true,
  alpha = false,
  stroke = false,
  width = true,
  weight = true,
  italic = true,
  textColor = '#000000',
  strokeColor = '#ff0000',
  minFontSize = 36,
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [pressure, setPressure] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );
        
        const maxDistance = Math.max(rect.width, rect.height);
        const normalizedPressure = Math.max(0, 1 - distance / maxDistance);
        
        setPressure(normalizedPressure);
      }
    };

    const handlePointerDown = () => setIsPressed(true);
    const handlePointerUp = () => setIsPressed(false);

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const getTextStyle = () => {
    const basePressure = isPressed ? pressure * 2 : pressure;
    const clampedPressure = Math.min(1, Math.max(0, basePressure));

    let style: React.CSSProperties = {
      color: textColor,
      fontSize: `${minFontSize + clampedPressure * 40}px`,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      transition: 'all 0.1s ease-out',
      cursor: 'pointer',
      userSelect: 'none',
      display: flex ? 'flex' : 'block',
      alignItems: flex ? 'center' : 'initial',
      justifyContent: flex ? 'center' : 'initial',
      textAlign: flex ? 'center' : 'left',
    };

    if (alpha) {
      style.opacity = 0.3 + clampedPressure * 0.7;
    }

    if (stroke) {
      style.WebkitTextStroke = `${1 + clampedPressure * 2}px ${strokeColor}`;
      style.WebkitTextFillColor = 'transparent';
    }

    if (width) {
      style.fontStretch = `${75 + clampedPressure * 50}%`;
    }

    if (weight) {
      style.fontWeight = 100 + clampedPressure * 800;
    }

    if (italic) {
      style.fontStyle = clampedPressure > 0.3 ? 'italic' : 'normal';
    }

    return style;
  };

  return (
    <div
      ref={textRef}
      style={getTextStyle()}
      className="text-pressure-component"
    >
      {text}
    </div>
  );
};

export default TextPressure;
