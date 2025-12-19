"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Sparkles, Trail } from "@react-three/drei"
import type * as THREE from "three"

function TunnelRing({ z, phase }: { z: number; phase: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isActive = phase >= Math.floor((-z + 15) / 2.5)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.2 + z * 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, z]}>
      <torusGeometry args={[3, 0.05, 8, 64]} />
      <meshBasicMaterial color={isActive ? "#06b6d4" : "#374151"} transparent opacity={isActive ? 0.8 : 0.3} />
    </mesh>
  )
}

function PhaseMarker({
  position,
  label,
  isActive,
  isCurrent,
}: {
  position: [number, number, number]
  label: string
  isActive: boolean
  isCurrent: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && isCurrent) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.1)
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshBasicMaterial color={isCurrent ? "#f59e0b" : isActive ? "#06b6d4" : "#374151"} />
        </mesh>
        {(isActive || isCurrent) && (
          <Sparkles count={10} scale={1} size={2} speed={0.5} color={isCurrent ? "#f59e0b" : "#06b6d4"} />
        )}
      </group>
    </Float>
  )
}

function TravelingOrb() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime()
      meshRef.current.position.z = ((t * 2) % 30) - 15
      meshRef.current.position.x = Math.sin(t * 2) * 0.5
      meshRef.current.position.y = Math.cos(t * 2) * 0.5
    }
  })

  return (
    <Trail width={0.5} length={8} color="#06b6d4" attenuation={(w) => w * w}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
    </Trail>
  )
}

export function RoadmapTunnel({ currentPhase = 2 }: { currentPhase?: number }) {
  const rings = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => -15 + i * 2.5)
  }, [])

  const phases = useMemo(
    () => [
      { z: -15, label: "1" },
      { z: -12.5, label: "2" },
      { z: -10, label: "3" },
      { z: -7.5, label: "4" },
      { z: -5, label: "5" },
      { z: -2.5, label: "6" },
      { z: 0, label: "7" },
      { z: 2.5, label: "8" },
      { z: 5, label: "9" },
      { z: 7.5, label: "10" },
      { z: 10, label: "11" },
      { z: 12.5, label: "12" },
    ],
    [],
  )

  return (
    <div className="w-full h-[400px]">
      <Canvas
        camera={{ position: [0, 2, -20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, -15]} intensity={2} color="#06b6d4" />

        {rings.map((z, i) => (
          <TunnelRing key={i} z={z} phase={currentPhase} />
        ))}

        {phases.map((phase, i) => (
          <PhaseMarker
            key={i}
            position={[0, 0, phase.z]}
            label={phase.label}
            isActive={i < currentPhase}
            isCurrent={i === currentPhase - 1}
          />
        ))}

        <TravelingOrb />
        <Sparkles count={100} scale={30} size={1} speed={0.2} color="#06b6d4" opacity={0.3} />
      </Canvas>
    </div>
  )
}
