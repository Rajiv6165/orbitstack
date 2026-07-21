import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Zap, Shield, BarChart3, Bell, Package, GitBranch, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/layout/PageTransition'

// Code-split Three.js WebGL scene for instant initial load
const MicroserviceScene = lazy(() =>
  import('@/components/three/MicroserviceScene').then((m) => ({ default: m.MicroserviceScene }))
)

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
  delay: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className="card p-6 cursor-default group hover:border-primary-500/40 transition-all duration-300"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 border"
        style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}
      >
        <span style={{ color }}><Icon className="w-5 h-5" /></span>
      </div>
      <h3 className="font-semibold text-text-1 text-base mb-2 font-display">{title}</h3>
      <p className="text-sm text-text-3 leading-relaxed">{description}</p>
    </motion.div>
  )
}

import { useRef } from 'react'

const FEATURES = [
  {
    icon: Shield,
    title: 'Auth Service',
    description: 'JWT-based authentication with bcrypt password hashing, user registration, and token validation.',
    color: '#5b6cf5',
  },
  {
    icon: Package,
    title: 'Catalog Service',
    description: 'Real-time product inventory management with stock tracking, CRUD operations, and SKU management.',
    color: '#14b8a6',
  },
  {
    icon: GitBranch,
    title: 'Order Service',
    description: 'End-to-end order placement: JWT validation → stock check → order persistence → event publishing.',
    color: '#f59e0b',
  },
  {
    icon: Bell,
    title: 'Notification Service',
    description: 'Redis pub/sub subscriber that dispatches mock email notifications on every order event.',
    color: '#22c55e',
  },
  {
    icon: BarChart3,
    title: 'Prometheus Metrics',
    description: 'Every microservice exposes /metrics in Prometheus format for live observability.',
    color: '#a5b4fc',
  },
  {
    icon: Zap,
    title: 'Mission Control',
    description: 'Real-time admin dashboard with service topology, live metrics, and order flow visualization.',
    color: '#38c8c1',
  },
]

export function LandingPage() {
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true })

  return (
    <PageTransition>
      <div className="relative overflow-hidden bg-base">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-stars bg-grid">
          {/* 3D WebGL Scene Container */}
          <div className="absolute inset-0 z-0">
            <Suspense fallback={<div className="w-full h-full bg-base" />}>
              <MicroserviceScene />
            </Suspense>
          </div>

          {/* Foreground Hero Overlay */}
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-12 pb-16 pointer-events-none">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base-1/90 border border-primary-500/30 text-primary-300 text-xs font-mono font-medium mb-8 backdrop-blur-md shadow-glow-sm pointer-events-auto"
            >
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-ping" />
              <span>Real-Time 3D Microservice Constellation</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mb-6 leading-[1.05] font-display text-text-1"
            >
              Orbit<span className="gradient-text">Stack</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-text-2 max-w-2xl mx-auto mb-10 leading-relaxed text-balance"
            >
              A flagship, production-grade microservices platform. Watch real requests illuminate 3D service topology in real time.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
            >
              <Link to="/catalog">
                <Button
                  id="hero-explore-catalog"
                  variant="gradient"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Storefront
                </Button>
              </Link>
              <Link to="/admin">
                <Button
                  id="hero-mission-control"
                  variant="secondary"
                  size="lg"
                  leftIcon={<Zap className="w-4 h-4 text-primary-400" />}
                >
                  Launch Mission Control
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <section
          ref={statsRef}
          className="relative bg-base-1 border-y border-border py-12"
        >
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '4', label: 'Microservices', suffix: ' Active' },
              { value: '99.99', label: 'Uptime SLA', suffix: '%' },
              { value: '<25', label: 'p95 Latency', suffix: 'ms' },
              { value: '10k', label: 'Throughput', suffix: ' rps' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className="text-3xl md:text-4xl font-extrabold text-text-1 mb-1 font-mono">
                  {stat.value}
                  <span className="text-primary-400">{stat.suffix}</span>
                </div>
                <div className="text-xs text-text-3 uppercase tracking-wider font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Architecture Grid ─────────────────────────────────── */}
        <section className="py-24 px-4 bg-base relative">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="text-xs font-mono font-semibold uppercase tracking-widest text-primary-400 mb-3">
                Architecture
              </div>
              <h2 className="text-4xl font-bold text-text-1 mb-4 font-display">
                Engineered for High Concurrency
              </h2>
              <p className="text-text-3 max-w-xl mx-auto text-sm leading-relaxed">
                FastAPI endpoints backed by PostgreSQL isolation, Redis event broadcasting, and Prometheus scrape targets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <FeatureCard key={f.title} {...f} delay={i * 0.08} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer className="bg-base-1 border-t border-border py-8 px-4 text-center text-xs text-text-3 font-mono">
          <p>© 2026 OrbitStack Platform. Flagship Grade Commerce Architecture.</p>
        </footer>
      </div>
    </PageTransition>
  )
}
