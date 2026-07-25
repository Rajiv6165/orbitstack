import { motion } from 'framer-motion'
import { ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ImageWithSkeleton } from '@/components/ui/ImageWithSkeleton'
import { useCartStore } from '@/store/cart'
import { formatCurrency } from '@/lib/utils'
import { getProductImage } from '@/lib/productImages'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const imageMeta = getProductImage(product.sku, product.name, product.id)

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
      className="group glass-card overflow-hidden cursor-pointer hover:border-primary-500/30 transition-all duration-300 hover:shadow-card-hover"
    >
      {/* Product visual with Unsplash Image & Skeleton Blur-Up */}
      <div className="relative h-48 overflow-hidden bg-space-900">
        <ImageWithSkeleton
          src={imageMeta.url}
          alt={product.name}
          aspectRatio="h-48 w-full"
          imageMeta={imageMeta}
        />

        {/* SKU badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-mono text-slate-300 bg-space-950/80 px-2 py-1 rounded-md border border-border-subtle backdrop-blur-md shadow-sm">
            {product.sku}
          </span>
        </div>

        {/* Stock badge */}
        <div className="absolute top-3 right-3 z-10">
          {!inStock ? (
            <Badge variant="danger" dot>Out of stock</Badge>
          ) : lowStock ? (
            <Badge variant="amber" dot>Only {product.stock} left</Badge>
          ) : (
            <Badge variant="comet" dot>In stock</Badge>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-all duration-300 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="font-semibold text-slate-100 text-base leading-snug mb-1 group-hover:text-white transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Stars (decorative rating) */}
        <div className="flex items-center gap-0.5 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
            />
          ))}
          <span className="text-xs text-slate-500 ml-1 font-mono">(4.8 / 5)</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-white">
              {formatCurrency(product.price)}
            </span>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
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
