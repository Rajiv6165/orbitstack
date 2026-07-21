import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orbital-400',
  {
    variants: {
      variant: {
        primary:
          'bg-orbital-500 text-white hover:bg-orbital-400 hover:shadow-glow-orbital hover:scale-105',
        secondary:
          'bg-surface-elevated text-slate-200 border border-border-subtle hover:bg-surface-overlay hover:border-orbital-500/50 hover:text-white hover:scale-105',
        ghost:
          'text-slate-400 hover:text-white hover:bg-surface-elevated',
        danger:
          'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-400 hover:scale-105',
        nebula:
          'bg-nebula-500 text-white hover:bg-nebula-400 hover:shadow-glow-nebula hover:scale-105',
        comet:
          'bg-comet-500 text-white hover:bg-comet-400 hover:shadow-glow-comet hover:scale-105',
        gradient:
          'bg-gradient-orbital text-white hover:opacity-90 hover:scale-105 hover:shadow-glow-orbital',
        outline:
          'border border-border-subtle text-slate-300 hover:border-orbital-500/60 hover:text-white hover:bg-orbital-500/5',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-5',
        lg: 'h-12 px-7 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
