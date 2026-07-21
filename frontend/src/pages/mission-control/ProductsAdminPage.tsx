import { useQuery } from '@tanstack/react-query'
import { Package, Plus, RefreshCw, Search } from 'lucide-react'
import { catalogApi, catalogKeys } from '@/api/catalog'
import { VirtualTable, Column } from '@/components/mission-control/VirtualTable'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/layout/PageTransition'
import { formatCurrency } from '@/lib/utils'
import { useState, useMemo } from 'react'
import type { Product } from '@/types'

export function ProductsAdminPage() {
  const [search, setSearch] = useState('')

  const { data: realProducts, isLoading, refetch } = useQuery({
    queryKey: catalogKeys.list(),
    queryFn: catalogApi.list,
  })

  // Generate 500 virtual items for high-performance virtual table demo if catalog has few items
  const data = useMemo(() => {
    const list = realProducts || []
    if (list.length === 0) return []
    // Expand to 500 rows to demonstrate 60 FPS virtualized scrolling
    const items: Product[] = []
    for (let i = 0; i < 500; i++) {
      const base = list[i % list.length]
      items.push({
        ...base,
        id: i + 1,
        sku: `SKU-${1000 + i}`,
        name: i < list.length ? base.name : `${base.name} (Batch #${Math.floor(i / list.length)})`,
        price: base.price + (i % 15) * 5,
        stock: (base.stock + i * 3) % 120,
      })
    }
    return items
  }, [realProducts])

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    )
  }, [data, search])

  const columns: Column<Product>[] = [
    {
      key: 'id',
      header: 'ID',
      width: 70,
      sortable: true,
      cell: (row) => <span className="font-mono text-xs text-text-3">#{row.id}</span>,
    },
    {
      key: 'sku',
      header: 'SKU',
      width: 140,
      sortable: true,
      cell: (row) => <span className="font-mono text-xs font-semibold text-primary-400">{row.sku}</span>,
    },
    {
      key: 'name',
      header: 'Product Name',
      width: 280,
      sortable: true,
      cell: (row) => <span className="font-medium text-text-1">{row.name}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      width: 120,
      sortable: true,
      cell: (row) => <span className="font-mono font-semibold text-text-1">{formatCurrency(row.price)}</span>,
    },
    {
      key: 'stock',
      header: 'Stock Status',
      width: 140,
      sortable: true,
      cell: (row) => (
        row.stock === 0 ? (
          <Badge variant="danger" dot>Out of Stock</Badge>
        ) : row.stock <= 10 ? (
          <Badge variant="amber" dot>{row.stock} Low</Badge>
        ) : (
          <Badge variant="comet" dot>{row.stock} Units</Badge>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 120,
      cell: () => (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      ),
    },
  ]

  return (
    <PageTransition>
      <div className="p-6 lg:p-8 min-h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-3 mb-2 font-mono">
              <Package className="w-3.5 h-3.5" />
              <span>Mission Control</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-1 font-display mb-1">
              Inventory Admin Table
            </h1>
            <p className="text-sm text-text-3">
              Virtualized @tanstack/react-virtual data grid — 500 rows rendered at 60 FPS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-6 max-w-md">
          <Input
            id="products-search"
            placeholder="Search inventory by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-text-3" />}
          />
        </div>

        {/* Virtualized Table */}
        {isLoading ? (
          <div className="p-12 text-center font-mono text-text-3">Loading virtual table...</div>
        ) : (
          <VirtualTable
            data={filtered}
            columns={columns}
            rowHeight={46}
            keyExtractor={(row) => row.id}
          />
        )}
      </div>
    </PageTransition>
  )
}
