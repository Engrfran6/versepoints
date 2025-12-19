"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { MeshTransmissionMaterial, Float, Environment } from "@react-three/drei"
import type * as THREE from "three"

function Portal() {
  const ringRef1 = useRef<THREE.Mesh>(null)
  const ringRef2 = useRef<THREE.Mesh>(null)
  const ringRef3 = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringRef1.current) ringRef1.current.rotation.z = t * 0.5
    if (ringRef2.current) ringRef2.current.rotation.z = -t * 0.3
    if (ringRef3.current) ringRef3.current.rotation.z = t * 0.7
    if (particlesRef.current) particlesRef.current.rotation.z = t * 0.2
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group>
        {/* Outer ring */}
        <mesh ref={ringRef1}>
          <torusGeometry args={[1.8, 0.08, 16, 64]} />
          <meshStandardMaterial
            color="#00d9ff"
            emissive="#00d9ff"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Middle ring */}
        <mesh ref={ringRef2}>
          <torusGeometry args={[1.4, 0.1, 16, 64]} />
          <MeshTransmissionMaterial
            color="#8b5cf6"
            thickness={0.3}
            roughness={0.1}
            transmission={0.7}
            ior={1.5}
            chromaticAberration={0.03}
          />
        </mesh>

        {/* Inner ring */}
        <mesh ref={ringRef3}>
          <torusGeometry args={[1, 0.06, 16, 64]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Center glow */}
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <MeshTransmissionMaterial
            color="#00d9ff"
            thickness={1}
            roughness={0}
            transmission={0.9}
            ior={2}
            chromaticAberration={0.1}
          />
        </mesh>

        {/* Particles */}
        <group ref={particlesRef}>
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = (i / 30) * Math.PI * 2
            const radius = 1.2 + Math.random() * 0.8
            const z = (Math.random() - 0.5) * 0.5
            return (
              <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, z]}>
                <sphereGeometry args={[0.03 + Math.random() * 0.03, 8, 8]} />
                <meshStandardMaterial
                  color={i % 3 === 0 ? "#00d9ff" : i % 3 === 1 ? "#8b5cf6" : "#22c55e"}
                  emissive={i % 3 === 0 ? "#00d9ff" : i % 3 === 1 ? "#8b5cf6" : "#22c55e"}
                  emissiveIntensity={2}
                />
              </mesh>
            )
          })}
        </group>
      </group>
    </Float>
  )
}

export function SignupPortal3D({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#00d9ff" />
        <pointLight position={[-3, -3, 3]} intensity={0.5} color="#8b5cf6" />
        <Environment preset="night" />
        <Portal />
      </Canvas>
    </div>
  )
}
