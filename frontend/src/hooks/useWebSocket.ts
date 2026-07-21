import { useEffect, useRef, useCallback } from 'react'
import type { WsEvent } from '@/types'

type Handler = (event: WsEvent) => void

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws'

/**
 * Connects to the OrbitStack WebSocket server.
 * Falls back to a mock event stream if the socket cannot connect.
 */
export function useWebSocket(onMessage: Handler, enabled = true) {
  const ws = useRef<WebSocket | null>(null)
  const mockTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  const startMock = useCallback(() => {
    const stages = ['auth', 'catalog', 'order', 'notification'] as const
    let stageIndex = 0
    let orderId = `ORD-${Math.floor(Math.random() * 9000 + 1000)}`

    mockTimer.current = setInterval(() => {
      const stage = stages[stageIndex % stages.length]
      stageIndex++

      if (stageIndex % stages.length === 1) {
        orderId = `ORD-${Math.floor(Math.random() * 9000 + 1000)}`
      }

      const event: WsEvent = {
        type: 'order_flow',
        payload: {
          orderId,
          stage,
          status: stageIndex % 10 === 0 ? 'error' : stage === stages[stages.length - 1] ? 'complete' : 'processing',
          timestamp: new Date().toISOString(),
          message: getStageMessage(stage),
        },
      }
      onMessageRef.current(event)

      // Also emit topology event
      const topoStages = [
        { from: 'auth', to: 'catalog' },
        { from: 'catalog', to: 'order' },
        { from: 'order', to: 'notification' },
        { from: 'auth', to: 'order' },
      ] as const

      const topo = topoStages[Math.floor(Math.random() * topoStages.length)]
      onMessageRef.current({
        type: 'topology',
        payload: {
          from: topo.from,
          to: topo.to,
          requestId: Math.random().toString(36).slice(2, 10),
          latency: Math.random() * 80 + 10,
        },
      })
    }, 1200)
  }, [])

  useEffect(() => {
    if (!enabled) return

    let connected = false

    try {
      const socket = new WebSocket(WS_URL)
      ws.current = socket

      socket.onopen = () => {
        connected = true
      }

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as WsEvent
          onMessageRef.current(data)
        } catch {
          // ignore parse errors
        }
      }

      socket.onerror = () => {
        if (!connected) {
          startMock()
        }
      }

      socket.onclose = () => {
        if (!connected) {
          startMock()
        }
      }

      // If socket hasn't connected in 800ms, start mock
      const fallbackTimer = setTimeout(() => {
        if (!connected && socket.readyState !== WebSocket.OPEN) {
          startMock()
        }
      }, 800)

      return () => {
        clearTimeout(fallbackTimer)
        socket.close()
        if (mockTimer.current) {
          clearInterval(mockTimer.current)
          mockTimer.current = null
        }
      }
    } catch {
      startMock()
      return () => {
        if (mockTimer.current) {
          clearInterval(mockTimer.current)
          mockTimer.current = null
        }
      }
    }
  }, [enabled, startMock])
}

function getStageMessage(stage: string): string {
  const messages: Record<string, string> = {
    auth: 'JWT validated — user authenticated',
    catalog: 'Stock reserved — inventory updated',
    order: 'Order persisted to database',
    notification: 'Email notification dispatched',
  }
  return messages[stage] ?? 'Processing...'
}
