import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { LayoutDashboard, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { MetricCard } from '@/components/mission-control/MetricCard'
import { SkeletonMetricCard } from '@/components/ui/Skeleton'
import { fetchAllMetrics } from '@/api/metrics'
import { Button } from '@/components/ui/Button'
import { NumberTicker } from '@/components/ui/NumberTicker'
import { PageTransition } from '@/components/layout/PageTransition'
import { ringBuffer } from '@/lib/utils'
import { notify } from '@/hooks/useToast'
import type { ServiceMetrics } from '@/types'

export function DashboardPage() {
  const [metricsHistory, setMetricsHistory] = useState<Record<string, ServiceMetrics>>({})

  const { data, isLoading, error, refetch, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchAllMetrics,
    refetchInterval: 5_000,
    staleTime: 4_000,
  })

  // Track state changes to fire toasts if degraded
  useEffect(() => {
    if (!data) return
    setMetricsHistory((prev) => {
      const next = { ...prev }
      for (const m of data) {
        const existing = prev[m.name]
        if (existing && existing.status === 'healthy' && m.status !== 'healthy') {
          notify.serviceDegraded(m.name)
        }
        const history = existing
          ? ringBuffer(existing.history, { ts: Date.now(), value: m.requestRate }, 24)
          : m.history
        next[m.name] = { ...m, history }
      }
      return next
    })
  }, [data])

  const metrics = Object.values(metricsHistory)
  const showSkeletons = isLoading && metrics.length === 0
  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : '—'

  const allHealthy = metrics.length > 0 && metrics.every((m) => m.status === 'healthy')
  const totalRps = metrics.reduce((acc, m) => acc + m.requestRate, 0)

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 min-h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-3 mb-2 font-mono">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Mission Control</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-1 font-display mb-1">
              System Dashboard
            </h1>
            <p className="text-sm text-text-3">
              Prometheus telemetry parsed across microservices — updates live
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Spring Ticker Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-2 border border-border text-xs font-mono">
              <span className="text-text-3">Aggregate:</span>
              <NumberTicker value={totalRps} decimalPlaces={0} suffix=" req/s" className="text-primary-400 font-bold" />
            </div>

            <div className="flex items-center gap-2 text-xs text-text-3">
              {allHealthy ? (
                <Wifi className="w-4 h-4 text-positive" />
              ) : (
                <WifiOff className="w-4 h-4 text-warning" />
              )}
              <span className="hidden md:inline">Synced {lastUpdated}</span>
            </div>
            <Button
              id="refresh-metrics"
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              loading={isRefetching}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* System status banner */}
        {!isLoading && metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-6 ${
              allHealthy
                ? 'bg-positive/10 border-positive/30 text-positive'
                : 'bg-warning/10 border-warning/30 text-warning'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full animate-ping ${
                allHealthy ? 'bg-positive' : 'bg-warning'
              }`}
            />
            <span className="text-sm font-semibold">
              {allHealthy
                ? 'All Microservices Operational & Healthy'
                : `${metrics.filter((m) => m.status !== 'healthy').length} service(s) degraded`}
            </span>
            <span className="ml-auto text-xs font-mono opacity-80">
              {metrics.filter((m) => m.status === 'healthy').length}/{metrics.length} online
            </span>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-negative/10 border border-negative/30 rounded-xl p-4 mb-6 text-negative text-sm">
            Failed to fetch live metrics — using simulated Prometheus telemetry
          </div>
        )}

        {/* Metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {showSkeletons
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonMetricCard key={i} />)
            : metrics.map((m, i) => (
                <MetricCard key={m.name} metrics={m} index={i} />
              ))}
        </div>

        {/* Request volume overview */}
        {metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 card p-6"
          >
            <h2 className="text-base font-bold text-text-1 mb-4 font-display">Cumulative Requests Processed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <div key={m.name} className="text-center p-3 bg-base-2 rounded-lg border border-border/40">
                  <div className="text-2xl font-bold text-text-1 font-mono mb-1">
                    <NumberTicker value={m.totalRequests} decimalPlaces={0} />
                  </div>
                  <div className="text-xs text-text-3 font-mono capitalize">
                    {m.name.replace('-service', '')}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
