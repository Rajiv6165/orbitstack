import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, RefreshCw, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { OrderFlowEvent, WsEvent } from '@/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const STAGES = [
  {
    id: 'auth' as const,
    label: 'Auth Service',
    description: 'Validates JWT token',
    color: '#6366f1',
    bg: 'bg-orbital-500/10',
    border: 'border-orbital-500/20',
    port: ':8001',
  },
  {
    id: 'catalog' as const,
    label: 'Catalog Service',
    description: 'Checks & reserves stock',
    color: '#0ea5e9',
    bg: 'bg-nebula-500/10',
    border: 'border-nebula-500/20',
    port: ':8002',
  },
  {
    id: 'order' as const,
    label: 'Order Service',
    description: 'Persists order to DB',
    color: '#f59e0b',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    port: ':8003',
  },
  {
    id: 'notification' as const,
    label: 'Notification Service',
    description: 'Dispatches email via Redis',
    color: '#10b981',
    bg: 'bg-comet-500/10',
    border: 'border-comet-500/20',
    port: ':8004',
  },
]

interface TrackedOrder {
  orderId: string
  events: OrderFlowEvent[]
  lastActivity: string
}

function StageIcon({ status }: { status?: 'processing' | 'complete' | 'error' }) {
  if (status === 'complete') return <CheckCircle2 className="w-4 h-4 text-comet-400" />
  if (status === 'error') return <XCircle className="w-4 h-4 text-red-400" />
  if (status === 'processing') return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <RefreshCw className="w-4 h-4 text-orbital-400" />
    </motion.div>
  )
  return <Clock className="w-4 h-4 text-slate-700" />
}

export function OrderFlowPage() {
  const [orders, setOrders] = useState<Map<string, TrackedOrder>>(new Map())
  const [eventLog, setEventLog] = useState<(OrderFlowEvent & { _ts: number })[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const handleWsMessage = useCallback((wsEvent: WsEvent) => {
    if (wsEvent.type !== 'order_flow' || !wsEvent.payload) return
    const ev = wsEvent.payload as OrderFlowEvent

    setOrders((prev) => {
      const next = new Map(prev)
      const existing = next.get(ev.orderId)
      if (existing) {
        // Update events for this order
        const evIdx = existing.events.findIndex((e) => e.stage === ev.stage)
        if (evIdx >= 0) {
          existing.events[evIdx] = ev
        } else {
          existing.events = [...existing.events, ev]
        }
        next.set(ev.orderId, { ...existing, lastActivity: ev.timestamp })
      } else {
        next.set(ev.orderId, {
          orderId: ev.orderId,
          events: [ev],
          lastActivity: ev.timestamp,
        })
      }
      // Keep only last 5 orders
      if (next.size > 5) {
        const oldest = Array.from(next.keys())[0]
        next.delete(oldest)
      }
      return next
    })

    setEventLog((prev) => {
      const next = [...prev, { ...ev, _ts: Date.now() }]
      return next.length > 100 ? next.slice(next.length - 100) : next
    })
  }, [])

  useWebSocket(handleWsMessage, true)

  // Auto-scroll event log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [eventLog])

  const ordersArr = Array.from(orders.values()).slice(-3).reverse()
  const recentLog = [...eventLog].reverse().slice(0, 30)

  return (
    <div className="flex h-full">
      {/* Main flow area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Mission Control</span>
          </div>
          <h1 className="text-xl font-bold text-white">Order Flow Visualizer</h1>
          <p className="text-sm text-slate-500">Watch orders animate through the microservice pipeline in real time</p>
        </div>

        {/* Stage headers */}
        <div className="grid grid-cols-4 gap-px bg-border-subtle border-b border-border-subtle shrink-0">
          {STAGES.map((stage) => (
            <div key={stage.id} className={cn('px-4 py-4 bg-space-900', stage.bg)}>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stage.color, boxShadow: `0 0 6px ${stage.color}` }}
                />
                <span className="text-xs font-semibold text-slate-200">{stage.label}</span>
              </div>
              <div className="text-[10px] text-slate-600">{stage.description}</div>
              <div className="text-[10px] font-mono text-slate-700 mt-0.5">{stage.port}</div>
            </div>
          ))}
        </div>

        {/* Order rows */}
        <div className="flex-1 overflow-y-auto px-0">
          {ordersArr.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertCircle className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Waiting for order events...</p>
              <p className="text-slate-700 text-xs mt-1">Orders will appear here when placed</p>
            </div>
          ) : (
            <AnimatePresence>
              {ordersArr.map((order) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-4 gap-px bg-border-subtle border-b border-border-subtle"
                >
                  {STAGES.map((stage) => {
                    const ev = order.events.find((e) => e.stage === stage.id)
                    const isActive = ev?.status === 'processing'
                    const isDone = ev?.status === 'complete'
                    const isError = ev?.status === 'error'
                    const isPending = !ev

                    return (
                      <div
                        key={stage.id}
                        className={cn(
                          'px-4 py-4 bg-space-900 relative transition-all duration-300',
                          isActive && 'bg-orbital-500/5',
                          isDone && 'bg-comet-500/3',
                          isError && 'bg-red-500/5',
                        )}
                      >
                        {/* Order ID (first column only) */}
                        {stage.id === 'auth' && (
                          <div className="text-[10px] font-mono text-slate-600 mb-2">{order.orderId}</div>
                        )}

                        <div className="flex items-center gap-2">
                          <StageIcon status={ev?.status} />
                          <span
                            className={cn(
                              'text-xs font-medium',
                              isPending && 'text-slate-700',
                              isActive && 'text-orbital-300',
                              isDone && 'text-comet-400',
                              isError && 'text-red-400',
                            )}
                          >
                            {isPending ? 'Pending' : ev.status}
                          </span>
                        </div>

                        {ev?.message && (
                          <p className="text-[10px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                            {ev.message}
                          </p>
                        )}

                        {/* Active glow */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none border-2 border-orbital-500/40 rounded-sm"
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}

                        {/* Connector arrow */}
                        {isDone && stage.id !== 'notification' && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-1/2 bg-comet-500/30"
                          />
                        )}
                      </div>
                    )
                  })}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Event log */}
      <div className="w-80 border-l border-border-subtle flex flex-col bg-space-900">
        <div className="px-4 py-3 border-b border-border-subtle shrink-0">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orbital-400 animate-pulse" />
            Event Log
          </div>
        </div>
        <div ref={logRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 font-mono text-[10px]">
          {recentLog.map((ev, i) => (
            <motion.div
              key={`${ev.orderId}-${ev.stage}-${ev._ts}-${i}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2 items-start leading-relaxed"
            >
              <span className="text-slate-700 shrink-0">
                {new Date(ev._ts).toLocaleTimeString('en', { hour12: false })}
              </span>
              <span
                className="shrink-0 font-semibold"
                style={{
                  color: STAGES.find((s) => s.id === ev.stage)?.color ?? '#94a3b8',
                }}
              >
                [{ev.stage}]
              </span>
              <span className="text-slate-500">{ev.message}</span>
            </motion.div>
          ))}
          {eventLog.length === 0 && (
            <div className="text-slate-700 text-center py-8">No events yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
