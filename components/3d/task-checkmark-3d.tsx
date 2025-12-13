"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshTransmissionMaterial, Environment } from "@react-three/drei"
import type * as THREE from "three"

function CheckMark() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Circle background */}
        <mesh>
          <torusGeometry args={[1.2, 0.15, 16, 64]} />
          <MeshTransmissionMaterial
            color="#22c55e"
            thickness={0.5}
            roughness={0.1}
            transmission={0.6}
            ior={1.5}
            chromaticAberration={0.02}
          />
        </mesh>

        {/* Checkmark - short arm */}
        <mesh position={[-0.3, -0.1, 0.1]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.5, 0.2, 0.2]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Checkmark - long arm */}
        <mesh position={[0.3, 0.2, 0.1]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.9, 0.2, 0.2]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Glow sphere */}
        <mesh scale={1.8}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.05} />
        </mesh>

        {/* Sparkles */}
        {Array.from({ length: 15 }).map((_, i) => {
          const angle = (i / 15) * Math.PI * 2
          const radius = 1.8
          return (
            <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#fff" emissive="#22c55e" emissiveIntensity={2} />
            </mesh>
          )
        })}
      </group>
    </Float>
  )
}

export function TaskCheckmark3D({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#22c55e" />
        <pointLight position={[-3, -3, 3]} intensity={0.5} color="#00d9ff" />
        <Environment preset="city" />
        <CheckMark />
      </Canvas>
    </div>
  )
}
