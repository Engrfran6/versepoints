"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial } from "@react-three/drei"
import type * as THREE from "three"

function NetworkNode({
  position,
  color,
  size = 0.3,
}: { position: [number, number, number]; color: string; size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1)
    }
  })

  return (
    <Float speed={3} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <MeshDistortMaterial color={color} distort={0.2} speed={2} roughness={0.2} metalness={0.8} />
      </mesh>
    </Float>
  )
}

function ConnectionLine({
  start,
  end,
  color,
}: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const lineRef = useRef<THREE.Mesh>(null)

  const { midpoint, length, rotation } = useMemo(() => {
    const dx = end[0] - start[0]
    const dy = end[1] - start[1]
    const dz = end[2] - start[2]
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const midpoint: [number, number, number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2,
    ]
    const rotation: [number, number, number] = [Math.atan2(Math.sqrt(dx * dx + dz * dz), dy), 0, Math.atan2(dx, dz)]
    return { midpoint, length, rotation }
  }, [start, end])

  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.MeshStandardMaterial
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
  })

  return (
    <mesh ref={lineRef} position={midpoint} rotation={rotation}>
      <cylinderGeometry args={[0.02, 0.02, length, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.5} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  )
}

function Network() {
  const nodes = useMemo(
    () => [
      { position: [0, 0, 0] as [number, number, number], color: "#00d9ff", size: 0.5 },
      { position: [1.5, 1, 0.5] as [number, number, number], color: "#22c55e", size: 0.3 },
      { position: [-1.5, 0.8, -0.5] as [number, number, number], color: "#22c55e", size: 0.3 },
      { position: [1, -1.2, 0.3] as [number, number, number], color: "#22c55e", size: 0.3 },
      { position: [-1.2, -0.9, 0.8] as [number, number, number], color: "#22c55e", size: 0.3 },
      { position: [0.3, 1.5, -0.8] as [number, number, number], color: "#8b5cf6", size: 0.2 },
      { position: [2.2, 0.3, 0] as [number, number, number], color: "#8b5cf6", size: 0.2 },
      { position: [-2, -0.2, 0.3] as [number, number, number], color: "#8b5cf6", size: 0.2 },
    ],
    [],
  )

  const connections = useMemo(
    () => [
      { start: 0, end: 1 },
      { start: 0, end: 2 },
      { start: 0, end: 3 },
      { start: 0, end: 4 },
      { start: 1, end: 5 },
      { start: 1, end: 6 },
      { start: 2, end: 7 },
    ],
    [],
  )

  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {connections.map((conn, i) => (
        <ConnectionLine key={i} start={nodes[conn.start].position} end={nodes[conn.end].position} color="#00d9ff" />
      ))}
      {nodes.map((node, i) => (
        <NetworkNode key={i} {...node} />
      ))}
    </group>
  )
}

export function ReferralNetwork3D({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00d9ff" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#8b5cf6" />
        <Network />
      </Canvas>
    </div>
  )
}
