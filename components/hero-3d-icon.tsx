'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import { useRef, Suspense, Component, type ReactNode } from 'react';
import type { Mesh } from 'three';
import type { Category } from '@/lib/types';

class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function HotelShape() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2}>
      <mesh ref={ref}>
        <boxGeometry args={[1.2, 1.8, 1.2]} />
        <MeshDistortMaterial color="#1B3A5C" roughness={0.15} metalness={0.8} distort={0.15} speed={1.5} />
      </mesh>
      <mesh position={[0, -1.3, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.15, 32]} />
        <meshStandardMaterial color="#E8EDF3" roughness={0.4} metalness={0.2} />
      </mesh>
    </Float>
  );
}

function HomeShape() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.35;
  });
  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={1}>
      <group>
        <mesh ref={ref} position={[0, 0, 0]}>
          <coneGeometry args={[1.1, 1.2, 4]} />
          <MeshDistortMaterial color="#2D6A4F" roughness={0.2} metalness={0.7} distort={0.1} speed={1.2} />
        </mesh>
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[1.5, 1.2, 1.5]} />
          <meshStandardMaterial color="#E4F0EB" roughness={0.35} metalness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function FlightShape() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      ref.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });
  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.5}>
      <mesh ref={ref}>
        <coneGeometry args={[0.4, 2.2, 16]} />
        <meshStandardMaterial color="#9A6A00" roughness={0.12} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.1, 2.5, 0.5]} />
        <meshStandardMaterial color="#D4A843" roughness={0.15} metalness={0.8} />
      </mesh>
    </Float>
  );
}

function CarShape() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={1.2}>
      <group ref={ref as any}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.5, 1]} />
          <meshStandardMaterial color="#A02C2C" roughness={0.15} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.1, 0.5, 0.9]} />
          <meshStandardMaterial color="#7A2020" roughness={0.1} metalness={0.9} />
        </mesh>
        {[[-0.6, 0.55], [0.6, 0.55], [-0.6, -0.55], [0.6, -0.55]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.45, z]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 32]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.6} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function YachtShape() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.3;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.3}>
      <group ref={ref as any}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 2.5, 16]} />
          <meshStandardMaterial color="#0F4C75" roughness={0.2} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.5, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0.4, 0.9, 0]} rotation={[0, 0, -0.3]}>
          <planeGeometry args={[0.6, 1]} />
          <meshStandardMaterial color="#E0EDF5" roughness={0.2} metalness={0.3} side={2} />
        </mesh>
      </group>
    </Float>
  );
}

const SHAPES: Record<Category, ReactNode> = {
  hotels: <HotelShape />,
  homes: <HomeShape />,
  flights: <FlightShape />,
  cars: <CarShape />,
  yachts: <YachtShape />,
};

const FALLBACK = (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur animate-float" />
  </div>
);

export function Hero3DIcon({ category, className }: { category: Category; className?: string }) {
  return (
    <div className={className}>
      <CanvasErrorBoundary fallback={FALLBACK}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <directionalLight position={[-3, 2, -5]} intensity={0.4} color="#FFD700" />
            {SHAPES[category]}
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
