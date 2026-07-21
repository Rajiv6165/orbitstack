import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface ServiceNodeProps {
  position: [number, number, number]
  name: string
  port: number
  color: string
  isPulsing?: boolean
  onClick?: () => void
}

export function ServiceNode({ position, name, port, color, isPulsing, onClick }: ServiceNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  const pulseRef = useRef<THREE.Mesh>(null!)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.rotation.x += delta * 0.2
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8
    }
    if (pulseRef.current && isPulsing) {
      const scale = 1 + (Math.sin(state.clock.elapsedTime * 8) + 1) * 0.3
      pulseRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group position={position} onClick={onClick}>
      {/* Outer Glow Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.4, 0.03, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>

      {/* Pulse Shell */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={isPulsing ? 0.25 : 0.05} />
      </mesh>

      {/* Inner Core Sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isPulsing ? 1.2 : 0.6}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>

      {/* Embedded HTML Label */}
      <Html position={[0, 1.8, 0]} center distanceFactor={12}>
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div
            className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold border backdrop-blur-md shadow-lg flex items-center gap-1.5 whitespace-nowrap transition-all duration-300"
            style={{
              backgroundColor: 'rgba(12, 18, 32, 0.85)',
              borderColor: color,
              color: '#ffffff',
              boxShadow: `0 0 16px ${color}40`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: color }}
            />
            <span>{name}</span>
            <span className="text-[10px] opacity-60 font-normal">:{port}</span>
          </div>
        </div>
      </Html>
    </group>
  )
}
