import { useEffect, useRef, useCallback, useState } from 'react'
import ForceGraph2D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-2d'
import { motion } from 'framer-motion'
import type { TopologyEvent, ServiceId } from '@/types'

interface GraphNode extends NodeObject {
  id: ServiceId
  label: string
  color: string
  glowColor: string
  port: number
  pulsing?: boolean
}

interface GraphLink extends LinkObject {
  source: ServiceId
  target: ServiceId
  value: number
  active?: boolean
}

const NODES: GraphNode[] = [
  { id: 'auth', label: 'auth-service', color: '#6366f1', glowColor: '#6366f140', port: 8001 },
  { id: 'catalog', label: 'catalog-service', color: '#0ea5e9', glowColor: '#0ea5e940', port: 8002 },
  { id: 'order', label: 'order-service', color: '#f59e0b', glowColor: '#f59e0b40', port: 8003 },
  { id: 'notification', label: 'notification-service', color: '#10b981', glowColor: '#10b98140', port: 8004 },
]

const LINKS: GraphLink[] = [
  { source: 'auth', target: 'catalog', value: 1 },
  { source: 'auth', target: 'order', value: 1 },
  { source: 'catalog', target: 'order', value: 2 },
  { source: 'order', target: 'notification', value: 3 },
]

interface TopologyGraphProps {
  events: TopologyEvent[]
}

export function TopologyGraph({ events }: TopologyGraphProps) {
  const graphRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })
  const [activeLinks, setActiveLinks] = useState<Set<string>>(new Set())
  const [pulsingNodes, setPulsingNodes] = useState<Set<string>>(new Set())

  // Measure container
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Handle topology events — pulse nodes and highlight links
  useEffect(() => {
    if (!events.length) return
    const latest = events[events.length - 1]
    const linkKey = `${latest.from}-${latest.to}`

    setActiveLinks((prev) => {
      const next = new Set(prev)
      next.add(linkKey)
      return next
    })
    setPulsingNodes((prev) => {
      const next = new Set(prev)
      next.add(latest.from)
      next.add(latest.to)
      return next
    })

    const timer = setTimeout(() => {
      setActiveLinks((prev) => {
        const next = new Set(prev)
        next.delete(linkKey)
        return next
      })
      setPulsingNodes((prev) => {
        const next = new Set(prev)
        next.delete(latest.from)
        next.delete(latest.to)
        return next
      })
    }, 800)

    return () => clearTimeout(timer)
  }, [events])

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D) => {
      const r = 28
      const isPulsing = pulsingNodes.has(node.id)

      // Glow
      if (isPulsing) {
        ctx.beginPath()
        ctx.arc(node.x ?? 0, node.y ?? 0, r + 12, 0, 2 * Math.PI)
        const radialGrad = ctx.createRadialGradient(
          node.x ?? 0, node.y ?? 0, 0,
          node.x ?? 0, node.y ?? 0, r + 12
        )
        radialGrad.addColorStop(0, `${node.color}60`)
        radialGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = radialGrad
        ctx.fill()
      }

      // Outer ring
      ctx.beginPath()
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI)
      ctx.strokeStyle = isPulsing ? node.color : `${node.color}60`
      ctx.lineWidth = isPulsing ? 2 : 1
      ctx.stroke()

      // Inner fill
      ctx.beginPath()
      ctx.arc(node.x ?? 0, node.y ?? 0, r - 4, 0, 2 * Math.PI)
      const linearGrad = ctx.createRadialGradient(
        (node.x ?? 0) - 8, (node.y ?? 0) - 8, 0,
        node.x ?? 0, node.y ?? 0, r
      )
      linearGrad.addColorStop(0, `${node.color}40`)
      linearGrad.addColorStop(1, `${node.color}10`)
      ctx.fillStyle = linearGrad
      ctx.fill()

      // Icon letter
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `bold 11px Inter, sans-serif`
      ctx.fillStyle = isPulsing ? node.color : `${node.color}cc`
      ctx.fillText(node.id.slice(0, 3).toUpperCase(), node.x ?? 0, node.y ?? 0)

      // Label below
      ctx.font = `10px Inter, sans-serif`
      ctx.fillStyle = '#94a3b8'
      ctx.fillText(node.label, node.x ?? 0, (node.y ?? 0) + r + 10)

      // Port
      ctx.font = `9px JetBrains Mono, monospace`
      ctx.fillStyle = '#475569'
      ctx.fillText(`:${node.port}`, node.x ?? 0, (node.y ?? 0) + r + 22)
    },
    [pulsingNodes]
  )

  const linkColor = useCallback(
    (link: GraphLink) => {
      const from = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source
      const to = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target
      const key = `${from}-${to}`
      return activeLinks.has(key) ? '#6366f1' : '#334155'
    },
    [activeLinks]
  )

  const linkWidth = useCallback(
    (link: GraphLink) => {
      const from = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source
      const to = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target
      const key = `${from}-${to}`
      return activeLinks.has(key) ? 2.5 : 1
    },
    [activeLinks]
  )

  const graphData = { nodes: NODES, links: LINKS }

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={0.85}
        linkDirectionalArrowColor={linkColor}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link) => {
          const from = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source
          const to = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target
          const key = `${from}-${to}`
          return activeLinks.has(key) ? 3 : 0
        }}
        linkDirectionalParticleColor={() => '#6366f1'}
        linkDirectionalParticleSpeed={0.008}
        cooldownTime={3000}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        enableNodeDrag
        enableZoomInteraction
        nodeRelSize={28}
      />
    </div>
  )
}
