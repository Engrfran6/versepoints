"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Text, RoundedBox, MeshWobbleMaterial, Sparkles } from "@react-three/drei"
import type * as THREE from "three"

interface NFTCube3DProps {
  position: [number, number, number]
  color: string
  name: string
  tier: string
  delay?: number
}

function NFTCube3D({ position, color, name, tier, delay = 0 }: NFTCube3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5 + delay
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() + delay) * 0.2
    }
  })

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.2 : 1}
        >
          <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.1} smoothness={4}>
            <MeshWobbleMaterial color={color} factor={0.2} speed={hovered ? 3 : 1} metalness={0.8} roughness={0.2} />
          </RoundedBox>
        </mesh>
        <Text
          position={[0, -1.3, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Bold.ttf"
        >
          {name}
        </Text>
        <Text
          position={[0, -1.6, 0]}
          fontSize={0.15}
          color={color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist_Regular.json"
        >
          {tier}
        </Text>
      </Float>
      {hovered && <Sparkles count={30} scale={2} size={3} speed={0.5} color={color} />}
    </group>
  )
}

export function NFTShowcase3D() {
  const nfts = [
    { position: [-3, 0, 0] as [number, number, number], color: "#06b6d4", name: "Cyber Pickaxe", tier: "Legendary" },
    { position: [0, 0.5, 1] as [number, number, number], color: "#8b5cf6", name: "Quantum Core", tier: "Epic" },
    { position: [3, 0, 0] as [number, number, number], color: "#f59e0b", name: "Golden Miner", tier: "Rare" },
  ]

  return (
    <div className="w-full h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8b5cf6" />
        {nfts.map((nft, i) => (
          <NFTCube3D key={i} {...nft} delay={i * 2} />
        ))}
        <Sparkles count={50} scale={15} size={1.5} speed={0.3} color="#06b6d4" opacity={0.5} />
      </Canvas>
    </div>
  )
}
