import { motion } from 'framer-motion'
import { ShoppingCart, Package, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index?: number
}

// Generate a deterministic gradient from product id
function productGradient(id: number) {
  const gradients = [
    'from-orbital-900 to-nebula-900',
    'from-nebula-900 to-comet-900',
    'from-comet-900 to-orbital-900',
    'from-orbital-950 to-space-700',
    'from-space-700 to-nebula-950',
  ]
  return gradients[id % gradients.length]
}

function productAccent(id: number) {
  const accents = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6']
  return accents[id % accents.length]
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product)
    openCart()
  }

  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      layout
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      className="group glass-card overflow-hidden cursor-pointer hover:border-orbital-500/30 transition-all duration-300 hover:shadow-card-hover"
    >
      {/* Product visual */}
      <div
        className={`relative h-48 bg-gradient-to-br ${productGradient(product.id)} overflow-hidden`}
      >
        {/* Glow orb */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ filter: `drop-shadow(0 0 40px ${productAccent(product.id)}40)` }}
        >
          <span style={{ color: productAccent(product.id) }}>
            <Package
              className="w-20 h-20 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
            />
          </span>
        </div>

        {/* SKU badge */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-mono text-slate-500 bg-space-900/60 px-2 py-1 rounded-md border border-border-subtle backdrop-blur-sm">
            {product.sku}
          </span>
        </div>

        {/* Stock badge */}
        <div className="absolute top-3 right-3">
          {!inStock ? (
            <Badge variant="danger" dot>Out of stock</Badge>
          ) : lowStock ? (
            <Badge variant="amber" dot>Only {product.stock} left</Badge>
          ) : (
            <Badge variant="comet" dot>In stock</Badge>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-orbital-500/0 group-hover:bg-orbital-500/5 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-semibold text-slate-100 text-base leading-snug mb-1 group-hover:text-white transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Stars (decorative) */}
        <div className="flex items-center gap-0.5 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3 h-3 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
            />
          ))}
          <span className="text-xs text-slate-600 ml-1">(128)</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-white">
              {formatCurrency(product.price)}
            </span>
            <div className="text-xs text-slate-600 mt-0.5">
              {product.stock} units available
            </div>
          </div>

          <Button
            id={`add-to-cart-${product.id}`}
            variant="primary"
            size="sm"
            disabled={!inStock}
            onClick={handleAddToCart}
            leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
