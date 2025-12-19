"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import type * as THREE from "three"

function WaveParticles({ count = 5000 }) {
  const meshRef = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const cyan = { r: 6 / 255, g: 182 / 255, b: 212 / 255 }
    const purple = { r: 139 / 255, g: 92 / 255, b: 246 / 255 }

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 30
      const z = (Math.random() - 0.5) * 30
      positions[i * 3] = x
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = z

      const t = Math.random()
      colors[i * 3] = cyan.r * (1 - t) + purple.r * t
      colors[i * 3 + 1] = cyan.g * (1 - t) + purple.g * t
      colors[i * 3 + 2] = cyan.b * (1 - t) + purple.b * t
    }

    return { positions, colors }
  }, [count])

  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array
      const time = state.clock.getElapsedTime()

      for (let i = 0; i < count; i++) {
        const x = positions[i * 3]
        const z = positions[i * 3 + 2]
        positions[i * 3 + 1] =
          Math.sin(x * 0.3 + time) * 0.5 +
          Math.sin(z * 0.3 + time * 0.8) * 0.5 +
          Math.sin((x + z) * 0.2 + time * 1.2) * 0.3
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

export function ParticleWave({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 8, 15], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <WaveParticles />
      </Canvas>
    </div>
  )
}
