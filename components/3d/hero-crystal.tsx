"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Sparkles, MeshTransmissionMaterial } from "@react-three/drei"
import type * as THREE from "three"

function Crystal() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.5}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.5}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color="#06b6d4"
        />
      </mesh>
    </Float>
  )
}

function EnergyRings() {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.5
      ring1Ref.current.rotation.y = t * 0.3
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * -0.3
      ring2Ref.current.rotation.z = t * 0.4
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.4
      ring3Ref.current.rotation.z = t * -0.2
    }
  })

  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.8, 0.015, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[3.1, 0.01, 16, 100]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
    </>
  )
}

function FloatingOrbs() {
  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < 20; i++) {
      pos.push({
        position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5 - 2] as [
          number,
          number,
          number,
        ],
        scale: Math.random() * 0.1 + 0.05,
        speed: Math.random() * 0.5 + 0.5,
      })
    }
    return pos
  }, [])

  return (
    <>
      {positions.map((orb, i) => (
        <Float key={i} speed={orb.speed} floatIntensity={2}>
          <mesh position={orb.position} scale={orb.scale}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#06b6d4" : "#8b5cf6"} transparent opacity={0.8} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

export function HeroCrystal() {
  return (
    <div className="absolute inset-0 -z-5">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <Crystal />
        <EnergyRings />
        <FloatingOrbs />
        <Sparkles count={100} scale={10} size={2} speed={0.5} color="#06b6d4" />
      </Canvas>
    </div>
  )
}
