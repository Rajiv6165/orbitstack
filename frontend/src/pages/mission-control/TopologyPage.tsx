import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Network, Info } from 'lucide-react'
import { TopologyGraph } from '@/components/mission-control/TopologyGraph'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { TopologyEvent, WsEvent } from '@/types'

const SERVICE_DESCRIPTIONS: Record<string, { desc: string; stack: string; port: number; color: string }> = {
  auth: {
    desc: 'JWT-based authentication and token validation',
    stack: 'FastAPI + PostgreSQL + python-jose',
    port: 8001,
    color: '#6366f1',
  },
  catalog: {
    desc: 'Product inventory management and stock tracking',
    stack: 'FastAPI + PostgreSQL + Alembic',
    port: 8002,
    color: '#0ea5e9',
  },
  order: {
    desc: 'Order placement: validates JWT, checks stock, publishes events',
    stack: 'FastAPI + PostgreSQL + Redis pub/sub',
    port: 8003,
    color: '#f59e0b',
  },
  notification: {
    desc: 'Email notification dispatcher via Redis subscriber',
    stack: 'FastAPI + Redis subscriber + asyncio',
    port: 8004,
    color: '#10b981',
  },
}

export function TopologyPage() {
  const [events, setEvents] = useState<TopologyEvent[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [requestCount, setRequestCount] = useState(0)

  const handleWsMessage = useCallback((event: WsEvent) => {
    if (event.type === 'topology' && event.payload) {
      const payload = event.payload as TopologyEvent
      setEvents((prev) => {
        const next = [...prev, payload]
        return next.length > 50 ? next.slice(next.length - 50) : next
      })
      setRequestCount((c) => c + 1)
    }
  }, [])

  useWebSocket(handleWsMessage, true)

  // Recent edge activity (last 10 events)
  const recentActivity = events.slice(-10).reverse()

  return (
    <div className="flex h-full">
      {/* Graph area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                <Network className="w-3.5 h-3.5" />
                <span>Mission Control</span>
              </div>
              <h1 className="text-xl font-bold text-white">Service Topology</h1>
              <p className="text-sm text-slate-500">
                Live service-to-service call graph — nodes pulse on active requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-surface-elevated rounded-lg px-3 py-1.5 border border-border-subtle">
                <div className="w-1.5 h-1.5 rounded-full bg-comet-400 animate-pulse" />
                <span className="font-mono">{requestCount.toLocaleString()} req</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-space-950 bg-grid">
            <TopologyGraph events={events} />
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 glass-card px-4 py-3 text-xs space-y-2">
            <div className="text-slate-500 font-medium mb-2 uppercase tracking-wider text-[10px]">Legend</div>
            {Object.entries(SERVICE_DESCRIPTIONS).map(([id, cfg]) => (
              <button
                key={id}
                onClick={() => setSelectedNode(selectedNode === id ? null : id)}
                className="flex items-center gap-2 hover:text-slate-200 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }}
                />
                <span className="text-slate-400 capitalize">{id}-service</span>
                <span className="text-slate-700">:{cfg.port}</span>
              </button>
            ))}
          </div>

          {/* Hint */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] text-slate-700 bg-space-900/80 border border-border-subtle rounded-lg px-3 py-1.5">
            <Info className="w-3 h-3" />
            <span>Drag nodes · Scroll to zoom · WebSocket driven</span>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="w-72 border-l border-border-subtle flex flex-col bg-space-900">
        {/* Selected node detail */}
        {selectedNode && SERVICE_DESCRIPTIONS[selectedNode] && (
          <motion.div
            key={selectedNode}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 border-b border-border-subtle"
          >
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 border"
              style={{
                color: SERVICE_DESCRIPTIONS[selectedNode].color,
                borderColor: `${SERVICE_DESCRIPTIONS[selectedNode].color}30`,
                backgroundColor: `${SERVICE_DESCRIPTIONS[selectedNode].color}10`,
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: SERVICE_DESCRIPTIONS[selectedNode].color }}
              />
              {selectedNode}-service
            </div>
            <p className="text-sm text-slate-400 mb-3 leading-relaxed">
              {SERVICE_DESCRIPTIONS[selectedNode].desc}
            </p>
            <div className="text-xs text-slate-600 font-mono">
              {SERVICE_DESCRIPTIONS[selectedNode].stack}
            </div>
          </motion.div>
        )}

        {/* Live event feed */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border-subtle">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orbital-400 animate-pulse" />
              Live Requests
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {recentActivity.length === 0 ? (
              <div className="text-xs text-slate-700 text-center py-8">Waiting for requests...</div>
            ) : (
              recentActivity.map((ev, i) => (
                <motion.div
                  key={`${ev.requestId}-${i}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-xs py-1.5 border-b border-border-subtle last:border-0"
                >
                  <span className="text-orbital-400 font-mono">{ev.from}</span>
                  <span className="text-slate-700">→</span>
                  <span className="text-nebula-400 font-mono">{ev.to}</span>
                  <span className="ml-auto text-slate-700 font-mono">
                    {ev.latency.toFixed(0)}ms
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
