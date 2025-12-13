"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, RoundedBox, MeshDistortMaterial } from "@react-three/drei"
import type * as THREE from "three"
import type { RankName } from "@/lib/types/phase2"
import { RANK_COLORS } from "@/lib/constants"
import { Shield, ShieldPlus, Award, Gem, Crown } from "lucide-react"

const RANK_ICONS = {
  rookie: Shield,
  silver: ShieldPlus,
  gold: Award,
  diamond: Gem,
  citizen: Crown,
}

function Badge3D({ rank, isHovered }: { rank: RankName; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const color = useMemo(() => RANK_COLORS[rank].hex, [rank])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1

      if (isHovered) {
        meshRef.current.rotation.y += state.clock.getDelta() * 2
      }
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
      glowRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef} scale={1.2}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Main badge */}
      <mesh ref={meshRef}>
        <RoundedBox args={[1.2, 1.4, 0.2]} radius={0.1} smoothness={4}>
          <MeshDistortMaterial
            color={color}
            metalness={0.8}
            roughness={0.2}
            distort={isHovered ? 0.2 : 0.1}
            speed={2}
          />
        </RoundedBox>
      </mesh>

      {/* Rank text */}
      <Text
        position={[0, -0.3, 0.15]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {rank.toUpperCase()}
      </Text>
    </group>
  )
}

interface AnimatedRankBadgeProps {
  rank: RankName
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AnimatedRankBadge3D({ rank, size = "md", className = "" }: AnimatedRankBadgeProps) {
  const sizeMap = {
    sm: "w-20 h-24",
    md: "w-32 h-40",
    lg: "w-48 h-56",
  }

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={RANK_COLORS[rank].hex} />
        <Badge3D rank={rank} isHovered={false} />
      </Canvas>
    </div>
  )
}

// 2D Fallback version for devices without WebGL
export function AnimatedRankBadge({ rank, size = "md", className = "" }: AnimatedRankBadgeProps) {
  const Icon = RANK_ICONS[rank]
  const colors = RANK_COLORS[rank]

  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  }

  const iconSizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }

  return (
    <div
      className={`
        ${sizeMap[size]} 
        ${colors.bg} 
        ${colors.border} 
        border-2 
        rounded-xl 
        flex items-center justify-center
        relative
        animate-pulse-slow
        ${className}
      `}
      style={{
        boxShadow: `0 0 30px ${colors.hex}40`,
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-50 blur-xl" style={{ backgroundColor: colors.hex }} />

      {/* Icon */}
      <Icon className={`${iconSizeMap[size]} ${colors.text} relative z-10`} />

      {/* Rank label */}
      <span className={`absolute -bottom-6 text-xs font-bold ${colors.text} uppercase tracking-wider`}>{rank}</span>
    </div>
  )
}
