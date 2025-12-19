"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { MeshTransmissionMaterial, Float, Environment } from "@react-three/drei"
import type * as THREE from "three"

function Trophy() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Base */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.3, 32]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.4, 0.6, 0.4, 32]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Stem */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.15, 0.25, 1, 16]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Cup */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <MeshTransmissionMaterial
            color="#ffd700"
            thickness={0.3}
            roughness={0.1}
            transmission={0.5}
            ior={1.5}
            chromaticAberration={0.03}
          />
        </mesh>

        {/* Handles */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.9, 0.4, 0]} rotation={[0, 0, side * -0.3]}>
            <torusGeometry args={[0.25, 0.08, 16, 32, Math.PI]} />
            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
          </mesh>
        ))}

        {/* Star on top */}
        <mesh position={[0, 1.2, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#fff" emissive="#ffd700" emissiveIntensity={2} />
        </mesh>

        {/* Sparkles */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2
          const radius = 1.5 + Math.random() * 0.5
          const y = Math.random() * 2 - 0.5
          return (
            <mesh key={i} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={3} />
            </mesh>
          )
        })}
      </group>
    </Float>
  )
}

export function LeaderboardTrophy3D({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ffd700" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#00d9ff" />
        <Environment preset="city" />
        <Trophy />
      </Canvas>
    </div>
  )
}
