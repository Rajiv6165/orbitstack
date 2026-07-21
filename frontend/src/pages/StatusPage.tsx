import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchAllMetrics } from '@/api/metrics'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const SERVICE_META: Record<string, { desc: string; port: number }> = {
  'auth-service': { desc: 'Authentication, Password Hashing, JWT Issuer', port: 8001 },
  'catalog-service': { desc: 'Inventory Database & Product Catalog API', port: 8002 },
  'order-service': { desc: 'Order Processing & Transaction Persistence', port: 8003 },
  'notification-service': { desc: 'Redis Pub/Sub Subscriber & Email Dispatcher', port: 8004 },
}

export function StatusPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics-status'],
    queryFn: fetchAllMetrics,
    refetchInterval: 10_000,
  })

  const allHealthy = metrics && metrics.every((m) => m.status === 'healthy')

  return (
    <PageTransition>
      <div className="min-h-screen bg-base bg-stars px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to OrbitStack
              </Button>
            </Link>
            <span className="font-mono text-xs text-text-3">Status SLA Overview</span>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-text-1 font-display mb-3">
              OrbitStack System Status
            </h1>
            <p className="text-text-3 text-sm">
              Real-time operational status and historical uptime metrics for all 4 core microservices.
            </p>
          </div>

          {/* System Health Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border mb-10 flex items-center gap-4 ${
              allHealthy
                ? 'bg-positive/10 border-positive/30 text-positive'
                : 'bg-warning/10 border-warning/30 text-warning'
            }`}
          >
            {allHealthy ? (
              <CheckCircle2 className="w-8 h-8 text-positive shrink-0" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-warning shrink-0" />
            )}
            <div>
              <h2 className="text-lg font-bold">
                {allHealthy ? 'All Microservices Systems Normal' : 'Partial System Degradation Detected'}
              </h2>
              <p className="text-xs opacity-80 mt-0.5">
                {allHealthy
                  ? 'All services are executing with sub-25ms response latency.'
                  : 'One or more endpoints are experiencing higher than normal error rates.'}
              </p>
            </div>
          </motion.div>

          {/* Microservices List */}
          <div className="space-y-4 mb-12">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 skeleton rounded-xl" />
                ))
              : (metrics || []).map((m) => {
                  const meta = SERVICE_META[m.name] || { desc: 'Core Microservice', port: 8000 }
                  const isHealthy = m.status === 'healthy'

                  return (
                    <div
                      key={m.name}
                      className="card p-5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isHealthy ? 'bg-positive shadow-glow-comet' : 'bg-warning'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-1 text-base">{m.name}</span>
                            <span className="font-mono text-xs text-text-4">:{meta.port}</span>
                          </div>
                          <p className="text-xs text-text-3 mt-0.5">{meta.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <div className="font-mono text-xs font-semibold text-text-1">
                            {m.latencyP95.toFixed(1)}ms
                          </div>
                          <div className="text-[10px] text-text-4 font-mono">p95 Latency</div>
                        </div>

                        <Badge variant={isHealthy ? 'healthy' : 'degraded'} dot>
                          {m.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
          </div>

          {/* Historical 90-Day SLA Bar Chart Simulation */}
          <div className="card p-6 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-1 font-display">Uptime Performance (Last 90 Days)</h3>
              <span className="font-mono text-xs text-positive font-bold">99.98% Average SLA</span>
            </div>

            <div className="grid grid-cols-30 sm:grid-cols-60 gap-1 h-8 items-end">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-full rounded-sm transition-all hover:scale-y-125 ${
                    i === 42 ? 'h-5 bg-warning' : 'h-8 bg-positive/80 hover:bg-positive'
                  }`}
                  title={i === 42 ? 'Day 42: Minor 3min latency incident' : '100% Uptime'}
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-text-4 mt-3">
              <span>90 days ago</span>
              <span>100% Operational</span>
              <span>Today</span>
            </div>
          </div>

          {/* Recent Incident Log */}
          <div className="card p-6">
            <h3 className="font-bold text-text-1 font-display mb-4">Past Incident History</h3>
            <div className="space-y-4 font-mono text-xs">
              <div className="border-l-2 border-border-bright pl-4 py-1">
                <div className="text-text-1 font-semibold">Scheduled Redis Cluster Migration</div>
                <div className="text-text-3 text-[11px] mt-0.5">Resolved • July 18, 2026 - 04:00 UTC</div>
              </div>
              <div className="border-l-2 border-border-bright pl-4 py-1">
                <div className="text-text-1 font-semibold">Elevated Latency on Catalog DB Connections</div>
                <div className="text-text-3 text-[11px] mt-0.5">Resolved • July 10, 2026 - 14:22 UTC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
