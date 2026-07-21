import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { Sparkline } from './Sparkline'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatLatency } from '@/lib/utils'
import type { ServiceMetrics } from '@/types'

const SERVICE_COLORS: Record<string, { accent: string; glow: string; label: string }> = {
  'auth-service': {
    accent: '#6366f1',
    glow: 'rgba(99,102,241,0.3)',
    label: 'Auth',
  },
  'catalog-service': {
    accent: '#0ea5e9',
    glow: 'rgba(14,165,233,0.3)',
    label: 'Catalog',
  },
  'order-service': {
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    label: 'Order',
  },
  'notification-service': {
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
    label: 'Notification',
  },
}

interface MetricCardProps {
  metrics: ServiceMetrics
  index?: number
}

export function MetricCard({ metrics, index = 0 }: MetricCardProps) {
  const config = SERVICE_COLORS[metrics.name] ?? {
    accent: '#6366f1',
    glow: 'rgba(99,102,241,0.3)',
    label: metrics.name,
  }

  const statusBadgeVariant =
    metrics.status === 'healthy' ? 'healthy' : metrics.status === 'degraded' ? 'degraded' : 'down'

  const trendUp = metrics.requestRate > 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="metric-card group"
      style={{
        borderColor: `${config.accent}20`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse-glow"
              style={{
                backgroundColor: config.accent,
                boxShadow: `0 0 8px ${config.glow}`,
              }}
            />
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              :{metrics.port}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">{config.label}</h3>
        </div>
        <Badge variant={statusBadgeVariant} dot>
          {metrics.status}
        </Badge>
      </div>

      {/* Request rate — big number */}
      <div className="mb-4">
        <div className="flex items-end gap-2">
          <motion.span
            key={metrics.requestRate.toFixed(0)}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white font-mono"
          >
            {formatNumber(metrics.requestRate)}
          </motion.span>
          <span className="text-slate-500 text-sm mb-1">req/s</span>
          {trendUp ? (
            <TrendingUp className="w-4 h-4 text-comet-400 mb-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-slate-600 mb-1" />
          )}
        </div>
      </div>

      {/* Sparkline */}
      <div className="mb-4 h-12">
        <Sparkline data={metrics.history} color={config.accent} height={48} />
      </div>

      {/* Sub-metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-space-850 rounded-lg p-3 border border-border-subtle">
          <div className="flex items-center gap-1.5 mb-1">
            {metrics.errorRate > 1 ? (
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            ) : (
              <CheckCircle className="w-3 h-3 text-comet-500" />
            )}
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">
              Error rate
            </span>
          </div>
          <span
            className={`text-sm font-semibold font-mono ${
              metrics.errorRate > 1 ? 'text-amber-400' : 'text-comet-400'
            }`}
          >
            {metrics.errorRate.toFixed(2)}%
          </span>
        </div>
        <div className="bg-space-850 rounded-lg p-3 border border-border-subtle">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-3 h-3 text-nebula-400">⚡</span>
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">
              Latency p95
            </span>
          </div>
          <span
            className={`text-sm font-semibold font-mono ${
              metrics.latencyP95 > 200 ? 'text-amber-400' : 'text-slate-200'
            }`}
          >
            {formatLatency(metrics.latencyP95)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
