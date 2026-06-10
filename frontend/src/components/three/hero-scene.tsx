import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { hasWebGL, usePrefersReducedMotion } from "@/lib/motion";

type CrateProps = {
  position: [number, number, number];
  color: string;
  scale?: number;
  rotationOffset?: number;
};

function Crate({ position, color, scale = 1, rotationOffset = 0 }: CrateProps) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.18 + rotationOffset;
    ref.current.rotation.x = Math.sin(t * 0.25 + rotationOffset) * 0.18;
  });
  return (
    <Float
      floatIntensity={1.1}
      rotationIntensity={0.45}
      speed={1.15}
    >
      <mesh ref={ref} position={position} scale={scale} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          metalness={0.55}
          roughness={0.25}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>
    </Float>
  );
}

function CrateField() {
  const group = useRef<Group>(null);
  const crates = useMemo<CrateProps[]>(
    () => [
      { position: [0, 0, 0], color: "#7c3aed", scale: 1.45 },
      { position: [-1.85, 0.95, -0.4], color: "#4f46e5", scale: 0.72, rotationOffset: 0.6 },
      { position: [1.65, -0.55, -0.3], color: "#22d3ee", scale: 0.62, rotationOffset: 1.2 },
      { position: [1.4, 1.25, -1], color: "#a78bfa", scale: 0.5, rotationOffset: 2 },
      { position: [-1.5, -1.1, -0.4], color: "#67e8f9", scale: 0.46, rotationOffset: 2.4 },
      { position: [0.2, -1.6, -0.8], color: "#818cf8", scale: 0.4, rotationOffset: 3 },
    ],
    [],
  );

  useFrame(({ pointer }) => {
    if (!group.current) return;
    const targetY = pointer.x * 0.45;
    const targetX = -pointer.y * 0.28;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
  });

  return (
    <group ref={group}>
      {crates.map((c, i) => (
        <Crate key={i} {...c} />
      ))}
    </group>
  );
}

function StaticFallback({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(124,58,237,0.45), transparent 55%), radial-gradient(circle at 70% 60%, rgba(34,211,238,0.35), transparent 55%), radial-gradient(circle at 50% 90%, rgba(79,70,229,0.4), transparent 50%)",
      }}
    />
  );
}

export function HeroScene({ className }: { className?: string }) {
  const reduce = usePrefersReducedMotion();
  const webgl = typeof window !== "undefined" ? hasWebGL() : true;

  if (reduce || !webgl) {
    return <StaticFallback className={className} />;
  }

  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      dpr={[1, 1.6]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.45} />
      <pointLight position={[5, 5, 6]} color="#7c3aed" intensity={42} distance={20} decay={2} />
      <pointLight position={[-5, -3, 5]} color="#22d3ee" intensity={28} distance={20} decay={2} />
      <pointLight position={[0, 5, -5]} color="#4f46e5" intensity={22} distance={20} decay={2} />
      <Suspense fallback={null}>
        <CrateField />
      </Suspense>
    </Canvas>
  );
}
