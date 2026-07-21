import { useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { ServiceNode } from './ServiceNode'
import { ConnectionBeam } from './ConnectionBeam'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { WsEvent, TopologyEvent } from '@/types'

// Constellation positions for the 4 microservices
const NODES = [
  { id: 'auth', name: 'auth-service', port: 8001, color: '#5b6cf5', pos: [-3.2, 1, 0] as [number, number, number] },
  { id: 'catalog', name: 'catalog-service', port: 8002, color: '#14b8a6', pos: [0, 2, -1.5] as [number, number, number] },
  { id: 'order', name: 'order-service', port: 8003, color: '#f59e0b', pos: [3.2, 0.5, 0] as [number, number, number] },
  { id: 'notification', name: 'notification-service', port: 8004, color: '#22c55e', pos: [0, -1.8, 1] as [number, number, number] },
]

const CONNECTIONS = [
  { from: 'auth', to: 'catalog', start: NODES[0].pos, end: NODES[1].pos },
  { from: 'auth', to: 'order', start: NODES[0].pos, end: NODES[2].pos },
  { from: 'catalog', to: 'order', start: NODES[1].pos, end: NODES[2].pos },
  { from: 'order', to: 'notification', start: NODES[2].pos, end: NODES[3].pos },
]

function CameraRig({ mouse }: { mouse: { x: number; y: number } }) {
  useFrame((state) => {
    // Parallax lookAt & position drift
    const targetX = mouse.x * 0.8
    const targetY = mouse.y * 0.5 + 0.2
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export function MicroserviceScene() {
  const [activeEdge, setActiveEdge] = useState<string | null>(null)
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set())
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  // Listen to mouse movement for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Listen to WebSocket events to pulse 3D nodes & beams
  const handleWs = useCallback((event: WsEvent) => {
    if (event.type === 'topology' && event.payload) {
      const topo = event.payload as TopologyEvent
      const edgeKey = `${topo.from}-${topo.to}`
      setActiveEdge(edgeKey)
      setActiveNodes(new Set([topo.from, topo.to]))

      setTimeout(() => {
        setActiveEdge(null)
        setActiveNodes(new Set())
      }, 1000)
    }
  }, [])

  useWebSocket(handleWs, true)

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#5b6cf5" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#14b8a6" />

        <CameraRig mouse={mouse} />

        <Stars radius={50} depth={50} count={1200} factor={4} saturation={0} fade speed={1} />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <group>
            {/* Connection Beams */}
            {CONNECTIONS.map((conn) => {
              const key = `${conn.from}-${conn.to}`
              return (
                <ConnectionBeam
                  key={key}
                  start={conn.start}
                  end={conn.end}
                  active={activeEdge === key}
                  color={activeEdge === key ? '#5b6cf5' : '#263851'}
                />
              )
            })}

            {/* Service Nodes */}
            {NODES.map((node) => (
              <ServiceNode
                key={node.id}
                position={node.pos}
                name={node.name}
                port={node.port}
                color={node.color}
                isPulsing={activeNodes.has(node.id)}
              />
            ))}
          </group>
        </Float>
      </Canvas>
    </div>
  )
}
