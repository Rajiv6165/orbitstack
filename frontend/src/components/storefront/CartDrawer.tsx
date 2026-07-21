import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } =
    useCartStore()

  const total = totalPrice()
  const count = totalItems()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-space-900 border-l border-border-subtle flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-orbital-400" />
                <h2 className="font-semibold text-white">
                  Cart
                </h2>
                {count > 0 && (
                  <span className="bg-orbital-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <button
                id="close-cart"
                onClick={closeCart}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence mode="popLayout">
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-4 text-center py-16"
                  >
                    <ShoppingCart className="w-16 h-16 text-slate-700" />
                    <p className="text-slate-500 text-sm">Your cart is empty</p>
                    <Button variant="secondary" size="sm" onClick={closeCart}>
                      Continue shopping
                    </Button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="flex gap-4 py-4 border-b border-border-subtle last:border-0"
                    >
                      {/* Product visual */}
                      <div className="w-16 h-16 rounded-lg bg-surface-elevated border border-border-subtle flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-6 h-6 text-orbital-500/60" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-100 text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-500 mb-2">{item.product.sku}</p>

                        <div className="flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center gap-2 bg-surface-elevated rounded-lg border border-border-subtle px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="text-slate-500 hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium text-slate-100 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.stock))
                              }
                              className="text-slate-500 hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-white text-sm">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="text-slate-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-border-subtle space-y-4 bg-space-950/50">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Subtotal</span>
                  <span className="text-white font-semibold">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Shipping</span>
                  <span className="text-comet-400 text-sm font-medium">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                  <span className="text-white font-semibold">Total</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.1, color: '#6366f1' }}
                    animate={{ scale: 1, color: '#f8fafc' }}
                    className="text-xl font-bold"
                  >
                    {formatCurrency(total)}
                  </motion.span>
                </div>

                <Link to="/checkout" onClick={closeCart}>
                  <Button
                    id="checkout-button"
                    variant="gradient"
                    className="w-full"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
