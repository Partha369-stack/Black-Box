import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

const defaultColors = ["#ffffff", "#ffffff", "#ffffff"];

const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const int = parseInt(hex, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const colorCycle = [
    [0.0, 1.0, 0.533], // Cyber Green
    [0.2, 1.0, 0.6],   // Minty Green
    [0.0, 0.9, 0.4],   // Electric Lime
    [0.1, 1.0, 0.3],   // Digital Green
];
      


const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vFlicker;
  
  void main() {
    vRandom = random;
    vColor = color;
    // Firefly wandering: combine several sines for smooth, random motion
    float t = uTime + random.x * 10.0;
    vec3 pos = position * uSpread;
    pos.x += sin(t * 0.7 + random.y * 6.28) * 0.7 + cos(t * 0.3 + random.z * 6.28) * 0.4;
    pos.y += cos(t * 0.5 + random.z * 6.28) * 0.7 + sin(t * 0.2 + random.x * 6.28) * 0.4;
    pos.z += sin(t * 0.4 + random.w * 6.28) * 0.7 + cos(t * 0.6 + random.y * 6.28) * 0.4;
    
    // Flicker: each firefly has its own flicker phase
    vFlicker = 0.7 + 0.3 * sin(uTime * 2.0 + random.x * 10.0 + random.y * 10.0);
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vFlicker;

  uniform vec3 uCycleColor1;
  uniform vec3 uCycleColor2;
  uniform float uColorMix;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    vec3 cycleColor = mix(uCycleColor1, uCycleColor2, uColorMix);
    vec3 finalColor = mix(vColor, cycleColor, 0.7);
    float glow = smoothstep(0.25, 0.0, d); // soft radial glow
    float alpha = glow * vFlicker;
    if (d > 0.5) discard;
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const Particles = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.5,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className,
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, false);
    resize();

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    if (moveParticlesOnHover) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;

    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
        uCycleColor1: { value: colorCycle[0] },
        uCycleColor2: { value: colorCycle[1] },
        uColorMix: { value: 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrameId;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (t) => {
      animationFrameId = requestAnimationFrame(update);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      if (moveParticlesOnHover) {
        particles.position.x = -mouseRef.current.x * particleHoverFactor;
        particles.position.y = -mouseRef.current.y * particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }

      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }

      // Color cycling logic
      const cycleTime = 5.0; // seconds per color
      const tSec = (elapsed * 0.001) / cycleTime;
      const idx = Math.floor(tSec) % colorCycle.length;
      const nextIdx = (idx + 1) % colorCycle.length;
      const mixVal = tSec % 1;
      program.uniforms.uCycleColor1.value = colorCycle[idx];
      program.uniforms.uCycleColor2.value = colorCycle[nextIdx];
      program.uniforms.uColorMix.value = mixVal;

      renderer.render({ scene: particles, camera });
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", resize);
      if (moveParticlesOnHover) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    particleCount,
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
    />
  );
};

export default Particles; 