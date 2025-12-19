"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshTransmissionMaterial, Environment } from "@react-three/drei"
import type * as THREE from "three"

function Vault() {
  const groupRef = useRef<THREE.Group>(null)
  const lockRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
    if (lockRef.current) {
      lockRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Vault body */}
        <mesh>
          <boxGeometry args={[2.5, 2.5, 1.5]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Door frame */}
        <mesh position={[0, 0, 0.76]}>
          <boxGeometry args={[2.2, 2.2, 0.1]} />
          <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Lock dial */}
        <mesh ref={lockRef} position={[0, 0, 0.9]}>
          <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
          <MeshTransmissionMaterial
            color="#00d9ff"
            thickness={0.3}
            roughness={0.1}
            transmission={0.6}
            ior={1.5}
            chromaticAberration={0.02}
          />
        </mesh>

        {/* Lock dial marks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0.98]}>
              <boxGeometry args={[0.05, 0.1, 0.02]} />
              <meshStandardMaterial color="#fff" emissive="#00d9ff" emissiveIntensity={1} />
            </mesh>
          )
        })}

        {/* Handle */}
        <mesh position={[0.7, 0, 0.85]}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Lock icon */}
        <mesh position={[0, 0.8, 0.85]}>
          <boxGeometry args={[0.3, 0.4, 0.1]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 1.1, 0.85]}>
          <torusGeometry args={[0.15, 0.05, 8, 16, Math.PI]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>

        {/* Coins inside (visible through glass) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            position={[(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 0.5]}
          >
            <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
            <meshStandardMaterial
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={0.3}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>
    </Float>
  )
}

export function Vault3D({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00d9ff" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#8b5cf6" />
        <Environment preset="night" />
        <Vault />
      </Canvas>
    </div>
  )
}
