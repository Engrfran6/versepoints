"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, RoundedBox, useTexture } from "@react-three/drei";
import type * as THREE from "three";

import type { RankName } from "@/lib/types/phase2";
import { RANK_COLORS } from "@/lib/constants";

/* ----------------------------------------------------
   Rank Images (single source of truth)
---------------------------------------------------- */
const RANK_IMAGES: Record<RankName, string> = {
  rookie: "/ranks/rookie.jpg",
  silver: "/ranks/silver.jpg",
  gold: "/ranks/gold.jpg",
  diamond: "/ranks/diamond.jpg",
  citizen: "/ranks/citizen.jpg",
};

/* ----------------------------------------------------
   3D Badge (Image Texture)
---------------------------------------------------- */
function Badge3D({ rank, isHovered }: { rank: RankName; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const color = RANK_COLORS[rank].hex;
  const texture = useTexture(RANK_IMAGES[rank]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;

      meshRef.current.rotation.x =
        Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;

      if (isHovered) {
        meshRef.current.rotation.y += state.clock.getDelta() * 2;
      }
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Outer Glow */}
      <mesh ref={glowRef} scale={1.25}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Main Badge */}
      <mesh ref={meshRef}>
        <RoundedBox args={[1.3, 1.5, 0.25]} radius={0.12} smoothness={4}>
          <meshStandardMaterial
            map={texture}
            metalness={0.7}
            roughness={0.25}
          />
        </RoundedBox>
      </mesh>

      {/* Rank Label */}
      <Text
        position={[0, -0.45, 0.2]}
        fontSize={0.14}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {rank.toUpperCase()}
      </Text>
    </group>
  );
}

/* ----------------------------------------------------
   3D Wrapper
---------------------------------------------------- */
interface AnimatedRankBadgeProps {
  rank: RankName;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AnimatedRankBadge3D({
  rank,
  size = "md",
  className = "",
}: AnimatedRankBadgeProps) {
  const sizeMap = {
    sm: "w-20 h-24",
    md: "w-32 h-40",
    lg: "w-48 h-56",
  };

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[8, 8, 8]} intensity={1} />
        <pointLight
          position={[-8, -8, -8]}
          intensity={0.6}
          color={RANK_COLORS[rank].hex}
        />
        <Badge3D rank={rank} isHovered={false} />
      </Canvas>
    </div>
  );
}

/* ----------------------------------------------------
   2D Fallback Badge (Image, NO ICONS)
---------------------------------------------------- */
export function AnimatedRankBadge({
  rank,
  size = "md",
  className = "",
}: AnimatedRankBadgeProps) {
  const colors = RANK_COLORS[rank];

  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  return (
    <div
      className={`
        ${sizeMap[size]}
        ${colors.border}
        border-2
        rounded-xl
        relative
        overflow-hidden
        flex
        items-center
        justify-center
        animate-bounce
        ${className}
      `}
      style={{
        boxShadow: `0 0 30px ${colors.hex}40`,
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 blur-xl opacity-40"
        style={{ backgroundColor: colors.hex }}
      />

      {/* Rank Image */}
      <Image
        src={RANK_IMAGES[rank]}
        alt={`${rank} rank`}
        fill
        className="object-contain p-3 relative z-10"
        priority
      />

      {/* Label */}
      <span
        className={`absolute -bottom-6 text-xs font-bold uppercase tracking-wider ${colors.text}`}
      >
        {rank}
      </span>
    </div>
  );
}
