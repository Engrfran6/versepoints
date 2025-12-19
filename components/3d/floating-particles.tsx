"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import type * as THREE from "three"

function ParticleField({ count = 2000, color = "#06b6d4" }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return positions
  }, [count])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.02
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.03
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color={color} size={0.03} sizeAttenuation={true} depthWrite={false} opacity={0.6} />
    </Points>
  )
}

interface FloatingParticlesProps {
  className?: string
  color?: string
  count?: number
}

export function FloatingParticles({ className = "", color = "#06b6d4", count = 2000 }: FloatingParticlesProps) {
  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField count={count} color={color} />
      </Canvas>
    </div>
  )
}
