"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, RoundedBox } from "@react-three/drei"
import type * as THREE from "three"

interface NFTCube {
  position: [number, number, number]
  color: string
  rotationSpeed: number
}

function NFTCubes() {
  const groupRef = useRef<THREE.Group>(null)

  const cubes: NFTCube[] = [
    { position: [-2, 1, 0], color: "#f59e0b", rotationSpeed: 0.01 },
    { position: [2, 1, 0], color: "#8b5cf6", rotationSpeed: 0.012 },
    { position: [-2, -1, 0], color: "#06b6d4", rotationSpeed: 0.015 },
    { position: [2, -1, 0], color: "#6b7280", rotationSpeed: 0.008 },
  ]

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {cubes.map((cube, index) => (
        <NFTCube key={index} {...cube} />
      ))}

      {/* Center connecting lines */}
      <mesh>
        <boxGeometry args={[0.1, 3, 0.1]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.1, 5, 0.1]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function NFTCube({ position, color, rotationSpeed }: NFTCube) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed
      meshRef.current.rotation.y += rotationSpeed * 0.7
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2
    }
  })

  return (
    <RoundedBox ref={meshRef} position={position} args={[1, 1, 1]} radius={0.1} smoothness={4}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
    </RoundedBox>
  )
}

export function NFTGrid3D() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
      <spotLight position={[0, 5, 0]} angle={0.5} penumbra={1} intensity={1} color="#8b5cf6" />

      <NFTCubes />

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  )
}
