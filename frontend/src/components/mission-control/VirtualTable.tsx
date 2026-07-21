import React, { useRef, useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  width?: number
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface VirtualTableProps<T> {
  data: T[]
  columns: Column<T>[]
  rowHeight?: number
  keyExtractor: (row: T) => string | number
  onRowClick?: (row: T) => void
}

export function VirtualTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  rowHeight = 48,
  keyExtractor,
  onRowClick,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Column width state for manual resize
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    initialColumns.forEach((c) => {
      initial[String(c.key)] = c.width || 150
    })
    return initial
  })

  // Sort state
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else setSortKey(null)
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const valA = a[sortKey]
      const valB = b[sortKey]
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDir])

  // Row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  // Column resize handler
  const startResize = (key: string, startX: number, startWidth: number) => {
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX
      setColWidths((prev) => ({
        ...prev,
        [key]: Math.max(80, startWidth + delta),
      }))
    }
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="w-full flex flex-col border border-border rounded-xl bg-base-1 overflow-hidden shadow-lg">
      {/* Table Header */}
      <div className="flex border-b border-border bg-base-2 font-mono text-xs font-semibold text-text-3 select-none">
        {initialColumns.map((col) => {
          const keyStr = String(col.key)
          const width = colWidths[keyStr] || 150
          const isSorted = sortKey === keyStr

          return (
            <div
              key={keyStr}
              className="relative px-4 py-3 flex items-center justify-between border-r border-border/50 last:border-r-0 group shrink-0"
              style={{ width }}
            >
              <button
                className={cn(
                  'flex items-center gap-1.5 font-semibold transition-colors w-full text-left truncate',
                  col.sortable && 'hover:text-text-1 cursor-pointer',
                  isSorted && 'text-primary-400'
                )}
                onClick={() => col.sortable && handleSort(keyStr)}
                disabled={!col.sortable}
              >
                <span className="truncate">{col.header}</span>
                {col.sortable && (
                  <span>
                    {isSorted ? (
                      sortDir === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-text-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </span>
                )}
              </button>

              {/* Column Resize Handle */}
              <div
                onMouseDown={(e) => startResize(keyStr, e.clientX, width)}
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary-500/50 transition-colors z-10"
              />
            </div>
          )
        })}
      </div>

      {/* Virtualized Body Container */}
      <div
        ref={parentRef}
        className="overflow-auto max-h-[600px] relative font-sans text-sm"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = sortedData[virtualRow.index]
            const key = keyExtractor(row)

            return (
              <div
                key={key}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'absolute top-0 left-0 flex items-center border-b border-border-dim hover:bg-base-2/80 transition-colors text-text-2',
                  onRowClick && 'cursor-pointer'
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  width: '100%',
                }}
              >
                {initialColumns.map((col) => {
                  const keyStr = String(col.key)
                  const width = colWidths[keyStr] || 150
                  return (
                    <div
                      key={keyStr}
                      className="px-4 truncate border-r border-border-dim/40 last:border-r-0 shrink-0"
                      style={{ width }}
                    >
                      {col.cell ? col.cell(row) : String(row[keyStr] ?? '')}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-2 bg-base-2 border-t border-border text-xs text-text-3 font-mono flex items-center justify-between">
        <span>Showing {sortedData.length.toLocaleString()} records (Virtualized)</span>
        <span>60 FPS Virtual Scroll Active</span>
      </div>
    </div>
  )
}
