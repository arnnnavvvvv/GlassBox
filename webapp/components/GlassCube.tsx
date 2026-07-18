"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Colors mirror app/globals.css (--accent, --accent-2, --status-*) --
// Three.js materials can't read CSS custom properties, so these are kept
// in sync by hand. Update both if the palette changes.
const ACCENT = "#836ef9";
const ACCENT_2 = "#b9a4ff";
const STATUS_COLORS = ["#34d399", "#f87171", "#34d399", "#9aa1ab"];

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function RotatingCube() {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1.7, 1.7, 1.7), []);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);

  useFrame((_, delta) => {
    if (prefersReducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.22;
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.00018) * 0.18;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <MeshTransmissionMaterial
          color={ACCENT_2}
          thickness={0.6}
          roughness={0.04}
          transmission={1}
          ior={1.2}
          chromaticAberration={0.025}
          anisotropy={0.15}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.08}
          clearcoat={1}
          clearcoatRoughness={0.1}
          resolution={512}
          samples={6}
        />
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={ACCENT_2} transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

function Particle({ offset, color }: { offset: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !materialRef.current) return;
    if (prefersReducedMotion) {
      materialRef.current.opacity = 0.9;
      return;
    }
    const t = (clock.getElapsedTime() * 0.3 + offset) % 1;
    ref.current.position.y = 2.6 - t * 5.2;
    materialRef.current.opacity = Math.sin(t * Math.PI);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.075, 16, 16]} />
      <meshStandardMaterial ref={materialRef} color={color} emissive={color} emissiveIntensity={1.8} transparent opacity={0} />
    </mesh>
  );
}

export default function GlassCube() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 38 }}
      className="animate-canvas-fade-in"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 4]} intensity={1.2} color={ACCENT_2} />
      <pointLight position={[-3, -2, -3]} intensity={0.7} color={ACCENT} />
      {/* Procedural environment (no external HDRI fetch) -- just gives the
          transmissive glass material something to reflect/refract. */}
      <Environment resolution={256}>
        <Lightformer intensity={3} color={ACCENT_2} position={[0, 3, -2]} scale={[4, 3, 1]} />
        <Lightformer intensity={1.5} color={ACCENT} position={[-4, -1, 2]} scale={[2, 6, 1]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer intensity={1.5} color="white" position={[4, -1, 2]} scale={[2, 6, 1]} rotation={[0, -Math.PI / 2, 0]} />
      </Environment>
      <RotatingCube />
      {STATUS_COLORS.map((color, i) => (
        <Particle key={i} offset={i / STATUS_COLORS.length} color={color} />
      ))}
    </Canvas>
  );
}
