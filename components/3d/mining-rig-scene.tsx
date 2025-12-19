"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, Cylinder, Sphere, Float, Sparkles } from "@react-three/drei";
import type * as THREE from "three";

function DrillRig({
  isMining,
  miningBoost,
}: {
  isMining: boolean;
  miningBoost: number;
}) {
  const rigRef = useRef<THREE.Group>(null);
  const drillRef = useRef<THREE.Mesh>(null);
  const [rocks, setRocks] = useState<
    { id: number; position: [number, number, number] }[]
  >([]);

  useFrame((state) => {
    if (rigRef.current) {
      rigRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.02;
    }

    if (drillRef.current && isMining) {
      drillRef.current.rotation.y +=
        state.clock.getDelta() * (8 + miningBoost / 10);
    }
  });

  useEffect(() => {
    if (!isMining) return;

    const interval = setInterval(() => {
      setRocks((prev) => [
        ...prev.slice(-30),
        {
          id: Date.now(),
          position: [
            (Math.random() - 0.5) * 1.2,
            0.2,
            (Math.random() - 0.5) * 1.2,
          ],
        },
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [isMining]);

  return (
    <group ref={rigRef}>
      {/* Ground */}
      <Box args={[6, 0.3, 6]} position={[0, -1.2, 0]}>
        <meshStandardMaterial color="#a16207" roughness={1} />
      </Box>

      {/* Tracks */}
      {[-0.9, 0.9].map((x, i) => (
        <Box key={i} args={[2, 0.4, 0.6]} position={[x, -0.8, 0]}>
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </Box>
      ))}

      {/* Main chassis */}
      <Box args={[2.2, 1, 1.6]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#eab308" metalness={0.2} roughness={0.6} />
      </Box>

      {/* Drill mast */}
      <Box args={[0.4, 2.2, 0.4]} position={[0, 1.3, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.4} />
      </Box>

      {/* Drill bit */}
      <Cylinder
        ref={drillRef}
        args={[0.25, 0.15, 1.2, 12]}
        position={[0, 0.2, 0]}
      >
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </Cylinder>

      {/* Hydraulic arms */}
      {[-0.6, 0.6].map((x, i) => (
        <Cylinder
          key={i}
          args={[0.05, 0.05, 1.5]}
          position={[x, 0.6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial color="#64748b" metalness={0.6} />
        </Cylinder>
      ))}

      {/* Falling rocks */}
      {rocks.map((r) => (
        <Float key={r.id} speed={2} floatIntensity={0.3}>
          <Sphere args={[0.07, 6, 6]} position={r.position}>
            <meshStandardMaterial color="#78350f" roughness={1} />
          </Sphere>
        </Float>
      ))}

      {/* Dust cloud */}
      {isMining && (
        <Sparkles
          count={100}
          scale={[2.5, 1, 2.5]}
          size={2}
          speed={0.6}
          opacity={0.4}
          color="#d6d3d1"
        />
      )}
    </group>
  );
}

interface MiningRigSceneProps {
  isMining?: boolean;
  miningBoost?: number;
  className?: string;
}

export function MiningRigScene({
  isMining = false,
  miningBoost = 0,
  className = "",
}: MiningRigSceneProps) {
  return (
    <div className={`w-full h-72 ${className}`}>
      <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
        {/* Daylight mine */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 8, 4]} intensity={1.5} castShadow />
        <pointLight position={[-3, 2, -2]} intensity={0.4} />

        {/* Dry dusty atmosphere */}
        <fog attach="fog" args={["#f5f5f4", 5, 10]} />

        <DrillRig isMining={isMining} miningBoost={miningBoost} />
      </Canvas>
    </div>
  );
}
