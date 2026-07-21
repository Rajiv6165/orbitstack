import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, ChevronDown, Package } from 'lucide-react'
import { catalogApi, catalogKeys } from '@/api/catalog'
import { ProductCard } from '@/components/storefront/ProductCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name A→Z' },
  { value: 'name-desc', label: 'Name Z→A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'stock-desc', label: 'Most Available' },
]

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('name-asc')
  const [showOutOfStock, setShowOutOfStock] = useState(true)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const { data: products, isLoading, error } = useQuery({
    queryKey: catalogKeys.list(),
    queryFn: catalogApi.list,
    refetchInterval: 30_000,
  })

  const filtered = useMemo(() => {
    if (!products) return []

    let result = [...products]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }

    // Stock filter
    if (!showOutOfStock) {
      result = result.filter((p) => p.stock > 0)
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'name-asc': return a.name.localeCompare(b.name)
        case 'name-desc': return b.name.localeCompare(a.name)
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'stock-desc': return b.stock - a.stock
        default: return 0
      }
    })

    return result
  }, [products, search, sort, showOutOfStock])

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label

  return (
    <div className="min-h-screen bg-space-900">
      {/* Header */}
      <div className="bg-space-950 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
              <Package className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Product Catalog</h1>
            <p className="text-slate-500">
              {isLoading
                ? 'Loading products...'
                : `${filtered.length} of ${products?.length ?? 0} products`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          {/* Search */}
          <div className="flex-1">
            <Input
              id="catalog-search"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <Button
              id="catalog-sort-button"
              variant="secondary"
              onClick={() => setShowSortMenu((v) => !v)}
              rightIcon={<ChevronDown className="w-3.5 h-3.5" />}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {currentSortLabel}
            </Button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-space-900 border border-border-subtle rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value)
                        setShowSortMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sort === opt.value
                          ? 'text-orbital-300 bg-orbital-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stock toggle */}
          <button
            id="toggle-out-of-stock"
            onClick={() => setShowOutOfStock((v) => !v)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
              showOutOfStock
                ? 'bg-surface-elevated border-border-subtle text-slate-300 hover:border-border-bright'
                : 'bg-comet-500/10 border-comet-500/30 text-comet-300'
            }`}
          >
            {showOutOfStock ? 'All stock' : 'In stock only'}
          </button>
        </motion.div>

        {/* Active filter chips */}
        {(search || !showOutOfStock) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {search && (
              <Badge variant="orbital" dot>
                Search: {search}
              </Badge>
            )}
            {!showOutOfStock && (
              <Badge variant="comet" dot>
                In stock only
              </Badge>
            )}
          </motion.div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <div className="text-red-400 text-sm mb-4">Failed to load products</div>
            <p className="text-slate-600 text-xs">Make sure catalog-service is running on :8002</p>
          </div>
        )}

        {/* Product grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-2">No products found</p>
            <p className="text-slate-600 text-sm">
              {search ? `No results for "${search}"` : 'The catalog is empty.'}
            </p>
            {search && (
              <Button
                id="clear-search"
                variant="ghost"
                onClick={() => setSearch('')}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
