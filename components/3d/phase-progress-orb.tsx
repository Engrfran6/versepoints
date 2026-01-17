"use client";

import {useRef} from "react";
import {Canvas, useFrame} from "@react-three/fiber";
import {Sphere, Ring, Text, MeshDistortMaterial} from "@react-three/drei";
import * as THREE from "three";

function ProgressOrb({
  phaseNumber,
  phaseName,
  progress,
}: {
  phaseNumber: number;
  phaseName: string;
  progress: number;
}) {
  const orbRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });

  // Color based on phase number
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
  ];
  const color = colors[(phaseNumber - 1) % colors.length];

  return (
    <group>
      {/* Main orb */}
      <Sphere ref={orbRef} args={[1, 32, 32]}>
        <MeshDistortMaterial
          color={color}
          metalness={0.5}
          roughness={0.2}
          distort={0.5}
          speed={2}
        />
      </Sphere>

      {/* Progress ring */}
      <Ring ref={ringRef} args={[1.3, 1.4, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
      </Ring>

      {/* Phase number */}
      <Text position={[0, 0, 1]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {phaseNumber}
      </Text>

      {/* Phase name */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={8}>
        {phaseName}
      </Text>

      {/* Progress indicator */}
      <group position={[0, -2.2, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[-1 + progress, 0, 0.01]}>
          <boxGeometry args={[progress * 2, 0.1, 0.1]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

interface PhaseProgressOrbProps {
  phaseNumber: number;
  phaseName: string;
  progress?: number;
  className?: string;
}

export function PhaseProgressOrb({
  phaseNumber,
  phaseName,
  progress = 0,
  className = "",
}: PhaseProgressOrbProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{position: [0, 0, 4], fov: 50}}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <ProgressOrb phaseNumber={phaseNumber} phaseName={phaseName} progress={progress} />
      </Canvas>
    </div>
  );
}
