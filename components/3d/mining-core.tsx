"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Sparkles, MeshDistortMaterial } from "@react-three/drei"
import type * as THREE from "three"

function Core() {
  const coreRef = useRef<THREE.Mesh>(null)
  const innerCoreRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.3
      coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.2
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y = -t * 0.5
      innerCoreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.1)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group>
        {/* Outer shell */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[2, 1]} />
          <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.3} />
        </mesh>

        {/* Inner core */}
        <mesh ref={innerCoreRef}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <MeshDistortMaterial color="#8b5cf6" distort={0.4} speed={2} roughness={0.1} metalness={0.8} />
        </mesh>

        {/* Energy particles */}
        <Sparkles count={100} scale={5} size={3} speed={1} color="#06b6d4" />
      </group>
    </Float>
  )
}

function OrbitingElements() {
  const group1Ref = useRef<THREE.Group>(null)
  const group2Ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (group1Ref.current) {
      group1Ref.current.rotation.y = t * 0.5
    }
    if (group2Ref.current) {
      group2Ref.current.rotation.y = -t * 0.3
      group2Ref.current.rotation.x = t * 0.2
    }
  })

  return (
    <>
      <group ref={group1Ref}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * 3, 0, Math.sin((i / 4) * Math.PI * 2) * 3]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        ))}
      </group>
      <group ref={group2Ref}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 4,
              Math.sin((i / 6) * Math.PI * 2) * 0.5,
              Math.sin((i / 6) * Math.PI * 2) * 4,
            ]}
          >
            <octahedronGeometry args={[0.15, 0]} />
            <meshBasicMaterial color="#8b5cf6" />
          </mesh>
        ))}
      </group>
    </>
  )
}

export function MiningCore({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <Core />
        <OrbitingElements />
      </Canvas>
    </div>
  )
}
