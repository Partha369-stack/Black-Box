/* eslint-disable react/no-unknown-property */
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { ShaderMaterial, PlaneGeometry } from "three";
import * as THREE from "three";

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

const SilkMesh: React.FC<SilkProps> = ({ 
  speed = 8, 
  scale = 1.2, 
  color = "#7B7481", 
  noiseIntensity = 2.0, 
  rotation = 0 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const material = useMemo(() => {
    const uniforms = {
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uColor: { value: new THREE.Color(color) },
      uNoiseIntensity: { value: noiseIntensity },
      uRotation: { value: rotation },
      uResolution: { value: new THREE.Vector2(
        typeof window !== 'undefined' ? window.innerWidth : 1920,
        typeof window !== 'undefined' ? window.innerHeight : 1080
      ) }
    };

    return new ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uNoiseIntensity;

        // Simple noise function
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          float noiseVal = noise(uv + uTime * uSpeed * 0.1);
          pos.z += sin(pos.x * 3.0 + uTime * uSpeed) * uNoiseIntensity * 0.1;
          pos.z += cos(pos.y * 2.0 + uTime * uSpeed * 0.7) * uNoiseIntensity * 0.1;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uSpeed;
        uniform vec3 uColor;
        uniform float uNoiseIntensity;
        uniform vec2 uResolution;
        varying vec2 vUv;
        varying vec3 vPosition;

        // Simple noise function
        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        // Smooth noise
        float smoothNoise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 st = vUv;
          
          // Create flowing silk pattern
          float time = uTime * uSpeed * 0.1;
          
          // Multiple layers of noise for silk-like texture
          float n1 = smoothNoise(st * 8.0 + vec2(time, time * 0.5));
          float n2 = smoothNoise(st * 16.0 + vec2(-time * 0.7, time * 0.3));
          float n3 = smoothNoise(st * 32.0 + vec2(time * 0.3, -time * 0.8));
          
          // Combine noise layers
          float combinedNoise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
          
          // Create silk wave pattern
          float wave1 = sin(st.x * 10.0 + time * 2.0) * 0.5 + 0.5;
          float wave2 = cos(st.y * 8.0 + time * 1.5) * 0.5 + 0.5;
          
          // Combine waves and noise
          float pattern = (wave1 + wave2) * 0.5 * combinedNoise;
          
          // Create flowing gradient
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(st, center);
          float gradient = 1.0 - dist;
          
          // Apply silk-like shimmering effect
          float shimmer = sin(pattern * 20.0 + time * 3.0) * 0.1 + 0.9;
          
          // Final color mixing
          vec3 finalColor = uColor * gradient * shimmer * (0.8 + pattern * 0.4);
          
          // Enhanced transparency for better red visibility
          float alpha = 0.3 + pattern * 0.4;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, [speed, scale, color, noiseIntensity, rotation]);

  useFrame(({ clock }) => {
    if (material.uniforms) {
      material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[20, 20, 64, 64]} />
    </mesh>
  );
};

const Silk: React.FC<SilkProps> = (props) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <SilkMesh {...props} />
    </>
  );
};

export default Silk;
