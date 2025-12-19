"use client";

import {useRef} from "react";
import {Canvas, useFrame} from "@react-three/fiber";
import {Float, Sphere, MeshDistortMaterial} from "@react-three/drei";
import type * as THREE from "three";

function MiningCrystal({position, color}: {position: [number, number, number]; color: string}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#22d3ee" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function MiningCrystals3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{position: [0, 0, 5], fov: 50}}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

        <ParticleField />

        <MiningCrystal position={[-1.5, 0, 0]} color="#22d3ee" />
        <MiningCrystal position={[0, 0, 0]} color="#06b6d4" />
        <MiningCrystal position={[1.5, 0, 0]} color="#0891b2" />

        <Sphere args={[2, 32, 32]} position={[0, 0, -2]}>
          <MeshDistortMaterial
            color="#0e7490"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.4}
            transparent
            opacity={0.1}
          />
        </Sphere>
      </Canvas>
    </div>
  );
}

export {MiningCrystals3D};
