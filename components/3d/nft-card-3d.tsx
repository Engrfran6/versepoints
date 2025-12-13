"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { RoundedBox, Text, Float, Sparkles } from "@react-three/drei"
import * as THREE from "three"
import type { NFTTier } from "@/lib/types/phase2"

const TIER_HEX_COLORS: Record<NFTTier, string> = {
  basic: "#6B7280",
  silver: "#9CA3AF",
  gold: "#F59E0B",
  diamond: "#3B82F6",
  legendary: "#8B5CF6",
}

function NFTCard({
  tier,
  name,
  isHovered,
}: {
  tier: NFTTier
  name: string
  isHovered: boolean
}) {
  const cardRef = useRef<THREE.Mesh>(null)
  const color = TIER_HEX_COLORS[tier]

  useFrame((state) => {
    if (cardRef.current) {
      // Floating animation
      cardRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1

      // Rotation on hover
      if (isHovered) {
        cardRef.current.rotation.y += state.clock.getDelta() * 2
      } else {
        cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, 0, 0.1)
      }
    }
  })

  return (
    <Float speed={2} floatIntensity={0.5}>
      <group>
        {/* Card body */}
        <RoundedBox ref={cardRef} args={[2, 2.8, 0.15]} radius={0.1}>
          <meshStandardMaterial
            color={color}
            metalness={tier === "legendary" ? 0.9 : 0.6}
            roughness={tier === "legendary" ? 0.1 : 0.3}
            emissive={color}
            emissiveIntensity={isHovered ? 0.3 : 0.1}
          />
        </RoundedBox>

        {/* Tier label */}
        <Text position={[0, -1.1, 0.1]} fontSize={0.18} color="white" anchorX="center" anchorY="middle">
          {tier.toUpperCase()}
        </Text>

        {/* Name */}
        <Text position={[0, 0.8, 0.1]} fontSize={0.15} color="white" anchorX="center" anchorY="middle" maxWidth={1.8}>
          {name}
        </Text>

        {/* Legendary sparkles */}
        {tier === "legendary" && <Sparkles count={30} scale={3} size={2} speed={1} color={color} />}

        {/* Glow effect */}
        <mesh position={[0, 0, -0.2]} scale={1.1}>
          <planeGeometry args={[2.2, 3]} />
          <meshBasicMaterial color={color} transparent opacity={isHovered ? 0.3 : 0.1} />
        </mesh>
      </group>
    </Float>
  )
}

interface NFTCard3DProps {
  tier: NFTTier
  name: string
  className?: string
}

export function NFTCard3D({ tier, name, className = "" }: NFTCard3DProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`w-48 h-64 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, -3, 3]} intensity={0.5} color={TIER_HEX_COLORS[tier]} />
        <NFTCard tier={tier} name={name} isHovered={isHovered} />
      </Canvas>
    </div>
  )
}
