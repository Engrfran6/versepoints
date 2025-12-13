"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Box, Cylinder, Sphere, MeshWobbleMaterial, Float, Sparkles } from "@react-three/drei"
import type * as THREE from "three"

function MiningRig({ isMining, miningBoost }: { isMining: boolean; miningBoost: number }) {
  const rigRef = useRef<THREE.Group>(null)
  const drillRef = useRef<THREE.Mesh>(null)
  const [particles, setParticles] = useState<{ id: number; position: [number, number, number] }[]>([])

  useFrame((state) => {
    if (rigRef.current) {
      // Subtle idle animation
      rigRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    }

    if (drillRef.current) {
      // Drill rotation - faster when mining
      const speed = isMining ? 15 : 2
      drillRef.current.rotation.y += state.clock.getDelta() * speed
    }
  })

  // Spawn particles when mining
  useEffect(() => {
    if (isMining) {
      const interval = setInterval(() => {
        const newParticle = {
          id: Date.now(),
          position: [(Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2] as [
            number,
            number,
            number,
          ],
        }
        setParticles((prev) => [...prev.slice(-20), newParticle])
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isMining])

  // Boost glow intensity
  const glowIntensity = 0.3 + (miningBoost / 100) * 0.7

  return (
    <group ref={rigRef}>
      {/* Base platform */}
      <Box args={[2.5, 0.2, 2.5]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
      </Box>

      {/* Main body */}
      <Box args={[1.5, 1.2, 1.5]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#16213e" metalness={0.6} roughness={0.4} />
      </Box>

      {/* Drill head */}
      <group position={[0, 0.8, 0]}>
        <Cylinder ref={drillRef} args={[0.3, 0.1, 1, 8]} position={[0, 0.5, 0]}>
          <MeshWobbleMaterial
            color={isMining ? "#06b6d4" : "#0e4f5c"}
            metalness={0.9}
            roughness={0.1}
            factor={isMining ? 0.4 : 0}
            speed={isMining ? 4 : 0}
          />
        </Cylinder>

        {/* Drill tip glow */}
        <Sphere args={[0.15, 16, 16]} position={[0, 1.1, 0]}>
          <meshBasicMaterial color={isMining ? "#22d3ee" : "#0e4f5c"} transparent opacity={isMining ? 0.9 : 0.3} />
        </Sphere>
      </group>

      {/* Side vents */}
      {[-0.8, 0.8].map((x, i) => (
        <Box key={i} args={[0.1, 0.6, 0.8]} position={[x, 0, 0]}>
          <meshStandardMaterial
            color={isMining ? "#06b6d4" : "#1e3a5f"}
            emissive={isMining ? "#06b6d4" : "#000000"}
            emissiveIntensity={glowIntensity}
          />
        </Box>
      ))}

      {/* Boost indicator lights */}
      {miningBoost > 0 && (
        <group position={[0, 0.6, 0.8]}>
          {Array.from({ length: Math.min(5, Math.ceil(miningBoost / 20)) }).map((_, i) => (
            <Sphere key={i} args={[0.05, 8, 8]} position={[(i - 2) * 0.15, 0, 0]}>
              <meshBasicMaterial color="#22d3ee" />
            </Sphere>
          ))}
        </group>
      )}

      {/* Mining sparkles */}
      {isMining && <Sparkles count={50} scale={3} size={3} speed={2} opacity={0.8} color="#06b6d4" />}

      {/* Floating mined particles */}
      {particles.map((particle) => (
        <Float key={particle.id} speed={5} floatIntensity={2}>
          <Sphere args={[0.08, 8, 8]} position={particle.position}>
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
          </Sphere>
        </Float>
      ))}
    </group>
  )
}

interface MiningRigSceneProps {
  isMining?: boolean
  miningBoost?: number
  className?: string
}

export function MiningRigScene({ isMining = false, miningBoost = 0, className = "" }: MiningRigSceneProps) {
  return (
    <div className={`w-full h-64 ${className}`}>
      <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#06b6d4" />
        <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={isMining ? 2 : 0.5} color="#06b6d4" />
        <MiningRig isMining={isMining} miningBoost={miningBoost} />
      </Canvas>
    </div>
  )
}
