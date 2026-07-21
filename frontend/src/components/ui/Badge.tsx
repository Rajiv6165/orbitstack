import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
  {
    variants: {
      variant: {
        default: 'bg-surface-elevated text-slate-300 border-border-subtle',
        orbital: 'bg-orbital-500/10 text-orbital-300 border-orbital-500/30',
        nebula: 'bg-nebula-500/10 text-nebula-300 border-nebula-500/30',
        comet: 'bg-comet-500/10 text-comet-300 border-comet-500/30',
        amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        danger: 'bg-red-500/10 text-red-300 border-red-500/30',
        healthy: 'bg-comet-500/10 text-comet-300 border-comet-500/30',
        degraded: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        down: 'bg-red-500/10 text-red-300 border-red-500/30',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const dotColor: Record<string, string> = {
    healthy: 'bg-comet-400',
    degraded: 'bg-amber-400',
    down: 'bg-red-400',
    orbital: 'bg-orbital-400',
    nebula: 'bg-nebula-400',
    comet: 'bg-comet-400',
    amber: 'bg-amber-400',
    danger: 'bg-red-400',
    default: 'bg-slate-400',
  }

  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'inline-block w-1.5 h-1.5 rounded-full',
            dotColor[variant ?? 'default']
          )}
        />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
