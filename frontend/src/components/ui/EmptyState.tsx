import React from 'react'
import { motion } from 'framer-motion'
import { PackageX, AlertOctagon, Inbox, ServerOff } from 'lucide-react'
import { Button } from './Button'

type EmptyStateVariant = 'empty-catalog' | 'empty-cart' | 'empty-orders' | 'error-service'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

const CONFIGS: Record<EmptyStateVariant, { icon: React.ComponentType<{ className?: string }>; defaultTitle: string; defaultDesc: string; color: string }> = {
  'empty-catalog': {
    icon: PackageX,
    defaultTitle: 'No products in catalog',
    defaultDesc: 'Check back later or try adjusting your search filters.',
    color: '#5b6cf5',
  },
  'empty-cart': {
    icon: Inbox,
    defaultTitle: 'Your cart is empty',
    defaultDesc: 'Explore our catalog and add items to your cart to get started.',
    color: '#14b8a6',
  },
  'empty-orders': {
    icon: Inbox,
    defaultTitle: 'No orders tracked yet',
    defaultDesc: 'Place an order in the storefront to see the real-time event pipeline in action.',
    color: '#f59e0b',
  },
  'error-service': {
    icon: ServerOff,
    defaultTitle: 'Service Connection Interrupted',
    defaultDesc: 'Unable to communicate with the microservice backend. Ensure docker services are running.',
    color: '#ef4444',
  },
}

export function EmptyState({
  variant = 'empty-catalog',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const cfg = CONFIGS[variant]
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border shadow-xl relative"
        style={{
          backgroundColor: `${cfg.color}15`,
          borderColor: `${cfg.color}35`,
          boxShadow: `0 0 30px ${cfg.color}20`,
        }}
      >
        <span style={{ color: cfg.color }}><Icon className="w-8 h-8" /></span>
      </div>

      <h3 className="text-xl font-bold text-text-1 mb-2">
        {title || cfg.defaultTitle}
      </h3>
      <p className="text-sm text-text-3 leading-relaxed mb-6">
        {description || cfg.defaultDesc}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
