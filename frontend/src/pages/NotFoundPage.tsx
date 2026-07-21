import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/layout/PageTransition'

export function NotFoundPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-base bg-stars bg-grid flex items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full glass p-10 relative overflow-hidden"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
            <Compass className="w-10 h-10 text-primary-400 animate-spin-slow" />
          </div>

          <h1 className="text-6xl font-extrabold text-text-1 font-display mb-2">404</h1>
          <h2 className="text-xl font-bold text-text-1 mb-2">Lost in Orbit</h2>
          <p className="text-sm text-text-3 mb-8 leading-relaxed">
            The requested trajectory does not exist in the OrbitStack cluster schema.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Mission Base
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
