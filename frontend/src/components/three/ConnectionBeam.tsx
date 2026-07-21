import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ConnectionBeamProps {
  start: [number, number, number]
  end: [number, number, number]
  color?: string
  active?: boolean
}

export function ConnectionBeam({ start, end, color = '#5b6cf5', active = false }: ConnectionBeamProps) {
  const pulseParticleRef = useRef<THREE.Mesh>(null!)

  const curve = useMemo(() => {
    const vStart = new THREE.Vector3(...start)
    const vEnd = new THREE.Vector3(...end)
    const mid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5)
    // Add subtle arc in Y
    mid.y += 0.6
    return new THREE.QuadraticBezierCurve3(vStart, mid, vEnd)
  }, [start, end])

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 32, 0.03, 8, false)
  }, [curve])

  useFrame((state) => {
    if (pulseParticleRef.current) {
      const speed = active ? 2.5 : 0.8
      const t = (state.clock.elapsedTime * speed) % 1
      const pos = curve.getPoint(t)
      pulseParticleRef.current.position.copy(pos)
    }
  })

  return (
    <group>
      {/* Base Line/Tube */}
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.8 : 0.25}
          wireframe={false}
        />
      </mesh>

      {/* Traveling Energy Pulse Sphere */}
      <mesh ref={pulseParticleRef}>
        <sphereGeometry args={[active ? 0.18 : 0.08, 16, 16]} />
        <meshBasicMaterial
          color={active ? '#ffffff' : color}
          transparent
          opacity={active ? 1 : 0.6}
        />
      </mesh>
    </group>
  )
}
