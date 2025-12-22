"use client";

import {useRef, useState, useEffect} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Float, Text, MeshDistortMaterial} from "@react-three/drei";
import * as THREE from "three";

function TunnelScene({onComplete}: {onComplete: () => void}) {
  const {camera} = useThree();
  const completedRef = useRef(false);
  const progressRef = useRef(0);
  const textGroupRef = useRef<THREE.Group>(null);

  const targetZ = -50;

  useFrame((state, delta) => {
    if (completedRef.current) return;

    progressRef.current = Math.min(progressRef.current + delta * 0.3, 1);
    const p = progressRef.current;

    camera.position.z = THREE.MathUtils.lerp(5, targetZ, easeInOutCubic(p));

    camera.rotation.z = Math.sin(state.clock.getElapsedTime() * 2) * 0.02;

    // 👇 Text shrink near the end
    if (textGroupRef.current) {
      const shrinkStart = 0.75; // when shrinking begins
      const shrinkProgress = THREE.MathUtils.clamp((p - shrinkStart) / (1 - shrinkStart), 0, 1);

      const scale = THREE.MathUtils.lerp(1, 0.2, easeInOutCubic(shrinkProgress));
      textGroupRef.current.scale.setScalar(scale);
    }

    if (p >= 1) {
      completedRef.current = true;
      onComplete();
    }
  });

  return (
    <group>
      {/* Tunnel rings */}
      {Array.from({length: 30}).map((_, i) => (
        <group key={i} position={[0, 0, -i * 2]}>
          <mesh>
            <torusGeometry args={[3 + Math.sin(i * 0.5) * 0.5, 0.1, 16, 32]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={0.5 - i * 0.015}
              transparent
              opacity={0.8 - i * 0.02}
            />
          </mesh>
        </group>
      ))}

      {/* Floating particles in tunnel */}
      {Array.from({length: 100}).map((_, i) => (
        <Float key={i} speed={2} floatIntensity={1}>
          <mesh
            position={[(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, -Math.random() * 60]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#22d3ee" />
          </mesh>
        </Float>
      ))}

      {/* Welcome text at end */}
      <group ref={textGroupRef} position={[0, 0, -55]}>
        <Text fontSize={0.8} color="#ffffff" anchorX="center" anchorY="middle">
          VERSEPOINTS
        </Text>

        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[8, 4]} />
          <MeshDistortMaterial color="#06b6d4" transparent opacity={0.3} distort={0.3} speed={2} />
        </mesh>
      </group>
    </group>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface LoginTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

export function LoginTransition({isActive, onComplete}: LoginTransitionProps) {
  const [showTransition, setShowTransition] = useState(false);
  const completedRef = useRef(false); // ✅ ALWAYS called

  useEffect(() => {
    if (isActive) {
      setShowTransition(true);
    }
  }, [isActive]);

  const safeComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  if (!showTransition) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <Canvas camera={{position: [0, 0, 5], fov: 75}}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 10]} intensity={1} color="#06b6d4" />
        <TunnelScene onComplete={safeComplete} />
      </Canvas>

      <button
        onClick={safeComplete}
        className="absolute bottom-8 right-8 text-muted-foreground hover:text-foreground text-sm transition-colors">
        Skip →
      </button>
    </div>
  );
}
