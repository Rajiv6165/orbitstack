import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  label: string
  description: string
}

interface CheckoutProgressProps {
  steps: Step[]
  currentStep: number
}

export function CheckoutProgress({ steps, currentStep }: CheckoutProgressProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const isDone = step.id < currentStep
        const isCurrent = step.id === currentStep
        const isUpcoming = step.id > currentStep

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Step dot */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  backgroundColor: isDone
                    ? '#10b981'
                    : isCurrent
                    ? '#6366f1'
                    : '#1e293b',
                  borderColor: isDone
                    ? '#10b981'
                    : isCurrent
                    ? '#6366f1'
                    : '#334155',
                  boxShadow: isCurrent
                    ? '0 0 20px rgba(99, 102, 241, 0.5)'
                    : 'none',
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'w-9 h-9 rounded-full border-2 flex items-center justify-center',
                  'relative shrink-0 z-10'
                )}
              >
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                ) : (
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isCurrent ? 'text-white' : 'text-slate-600'
                    )}
                  >
                    {step.id}
                  </span>
                )}

                {/* Pulse ring for current */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-orbital-400"
                    animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    'text-xs font-semibold whitespace-nowrap',
                    isCurrent ? 'text-orbital-300' : isDone ? 'text-comet-400' : 'text-slate-600'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-700 whitespace-nowrap">{step.description}</p>
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-px mx-3 bg-border-subtle relative overflow-hidden mt-[-24px]">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-comet-500 to-orbital-500"
                  initial={{ width: '0%' }}
                  animate={{ width: isDone ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
