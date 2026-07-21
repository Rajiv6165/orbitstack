import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, ShoppingBag, User, CreditCard, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { CheckoutProgress } from '@/components/storefront/CheckoutProgress'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { ordersApi } from '@/api/orders'
import { formatCurrency } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Account', description: 'Who are you?' },
  { id: 2, label: 'Review', description: 'Check your order' },
  { id: 3, label: 'Confirm', description: "You're done!" },
]

const accountSchema = z.object({
  email: z.string().email('Enter a valid email'),
  name: z.string().min(2, 'Name is too short'),
})
type AccountFormData = z.infer<typeof accountSchema>

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const { items, totalPrice, clearCart } = useCartStore()
  const { isAuthenticated, email: storedEmail } = useAuthStore()
  const navigate = useNavigate()
  const total = totalPrice()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { email: storedEmail ?? '', name: '' },
  })

  const orderMutation = useMutation({
    mutationFn: () => {
      // Submit first item as the order (simplified for demo)
      const first = items[0]
      if (!first) throw new Error('Empty cart')
      return ordersApi.create({ product_id: first.product.id, quantity: first.quantity })
    },
    onSuccess: () => {
      setDir(1)
      setStep(3)
      clearCart()
    },
  })

  const goNext = () => {
    setDir(1)
    setStep((s) => s + 1)
  }

  const goBack = () => {
    setDir(-1)
    setStep((s) => s - 1)
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-space-900 flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag className="w-16 h-16 text-slate-700 mb-4" />
        <h2 className="text-xl font-semibold text-slate-300 mb-2">Your cart is empty</h2>
        <p className="text-slate-600 mb-6">Add some products before checking out</p>
        <Button id="goto-catalog" variant="primary" onClick={() => navigate('/catalog')}>
          Go to Catalog
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-space-900 bg-grid">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="mb-12">
          <CheckoutProgress steps={STEPS} currentStep={step} />
        </div>

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            {/* ── Step 1: Account ── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              >
                <div className="glass-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orbital-500/15 flex items-center justify-center">
                      <User className="w-5 h-5 text-orbital-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Your details</h2>
                      <p className="text-sm text-slate-500">We need this to process your order</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(goNext)} className="space-y-4">
                    <Input
                      id="checkout-email"
                      label="Email address"
                      type="email"
                      placeholder="you@example.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      id="checkout-name"
                      label="Full name"
                      placeholder="Jane Smith"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <div className="pt-2">
                      <Button
                        id="checkout-next-1"
                        variant="primary"
                        className="w-full"
                        type="submit"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Continue to Review
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Review ── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              >
                <div className="glass-card p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-nebula-500/15 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-nebula-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Order review</h2>
                      <p className="text-sm text-slate-500">Confirm your order before placing it</p>
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="bg-space-850 rounded-lg border border-border-subtle p-4 mb-4">
                    <div className="text-xs text-slate-600 uppercase tracking-wider mb-2 font-medium">
                      Customer
                    </div>
                    <p className="text-sm text-slate-200">{getValues('name')}</p>
                    <p className="text-sm text-slate-500">{getValues('email')}</p>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between bg-space-850 rounded-lg p-3 border border-border-subtle">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{item.product.name}</p>
                          <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center border-t border-border-subtle pt-4 mb-6">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold gradient-text">{formatCurrency(total)}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      id="checkout-back-2"
                      variant="secondary"
                      onClick={goBack}
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      id="checkout-place-order"
                      variant="gradient"
                      className="flex-1"
                      loading={orderMutation.isPending}
                      onClick={() => orderMutation.mutate()}
                    >
                      Place Order
                    </Button>
                  </div>

                  {orderMutation.isError && (
                    <p className="text-red-400 text-xs mt-3 text-center">
                      {(orderMutation.error as Error)?.message || 'Order failed. Please try again.'}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Confirmed ── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              >
                <div className="glass-card p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-comet-500/15 border-2 border-comet-500/40 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-comet-400" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h2 className="text-2xl font-bold text-white">Order placed!</h2>
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-slate-400 mb-2">
                      Your order has been placed and is being processed.
                    </p>
                    <p className="text-sm text-slate-600 mb-8">
                      A notification will be dispatched via the notification-service.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        id="continue-shopping"
                        variant="primary"
                        onClick={() => navigate('/catalog')}
                      >
                        Continue Shopping
                      </Button>
                      <Button
                        id="view-order-flow"
                        variant="secondary"
                        onClick={() => navigate('/admin/orders')}
                      >
                        View Order Flow
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
