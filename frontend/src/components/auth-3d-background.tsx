import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshTransmissionMaterial } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

function detectWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return !!ctx;
  } catch {
    return false;
  }
}

function Blob({
  position,
  color,
  speed = 1,
  scale = 1,
  distort = 0.45,
}: {
  position: [number, number, number];
  color: string;
  speed?: number;
  scale?: number;
  distort?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(t * 0.18 * speed) * 0.3;
    ref.current.rotation.y = Math.cos(t * 0.22 * speed) * 0.3;
  });
  return (
    <Float speed={1.4 * speed} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 32]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={1.5 * speed}
          roughness={0.15}
          metalness={0.35}
        />
      </mesh>
    </Float>
  );
}

function GlassShape({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.25;
    ref.current.rotation.y = t * 0.18;
  });
  return (
    <Float speed={0.8} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[0.9, 0]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={0.6}
          roughness={0.1}
          ior={1.4}
          chromaticAberration={0.04}
          backside
          samples={6}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const { resolvedTheme } = useTheme();
  const palette = useMemo(() => {
    if (resolvedTheme === "dark") {
      return { ambient: 0.4, a: "#6366f1", b: "#8b5cf6", c: "#06b6d4" };
    }
    return { ambient: 0.9, a: "#a5b4fc", b: "#c4b5fd", c: "#7dd3fc" };
  }, [resolvedTheme]);

  return (
    <>
      <ambientLight intensity={palette.ambient} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, -3, 2]} intensity={0.5} color={palette.b} />

      <Blob position={[-2.6, 0.8, -1]} color={palette.a} speed={0.9} scale={1.35} distort={0.5} />
      <Blob position={[2.8, -0.4, -2]} color={palette.b} speed={1.1} scale={1.6} distort={0.6} />
      <Blob position={[0.4, 2.2, -3]} color={palette.c} speed={0.7} scale={0.9} distort={0.35} />
      <GlassShape position={[1.8, 1.6, -0.5]} />
    </>
  );
}

export function Auth3DBackground() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-90" />
      <div className="grid-mask absolute inset-0 opacity-40" />
      {supported && (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          className="!absolute inset-0"
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      )}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-3xl" />
    </div>
  );
}
