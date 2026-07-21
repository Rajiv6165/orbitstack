import { useEffect, useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Network,
  GitBranch,
  ShoppingBag,
  Tag,
  Settings,
  X,
  Command,
  Search,
  History,
  Activity,
  ListFilter,
} from 'lucide-react'
import { useUiStore } from '@/store/ui'
import type { CommandItem } from '@/types'
import { cn } from '@/lib/utils'

const ALL_COMMANDS: CommandItem[] = [
  // Navigation
  { id: 'home', label: 'Go to Storefront Landing', description: 'Hero page & architecture', icon: 'home', href: '/', group: 'Storefront' },
  { id: 'catalog', label: 'Browse Catalog', description: 'Product grid & stock management', icon: 'catalog', href: '/catalog', group: 'Storefront' },
  { id: 'checkout', label: 'Go to Checkout', description: 'Multi-step purchase review', icon: 'checkout', href: '/checkout', group: 'Storefront' },
  { id: 'login', label: 'Sign In / Register', description: 'JWT authentication', icon: 'user', href: '/login', group: 'Storefront' },

  // Mission Control
  { id: 'admin', label: 'System Dashboard', description: 'Live Prometheus microservice metrics', icon: 'dashboard', href: '/admin', group: 'Mission Control', shortcut: ['⌘', 'D'] },
  { id: 'topology', label: 'Service Topology Graph', description: 'Real-time 2D/3D service call map', icon: 'network', href: '/admin/topology', group: 'Mission Control', shortcut: ['⌘', 'T'] },
  { id: 'order-flow', label: 'Order Pipeline Visualizer', description: 'Live order event swimlanes', icon: 'flow', href: '/admin/orders', group: 'Mission Control', shortcut: ['⌘', 'F'] },
  { id: 'products-admin', label: 'Products Admin Table', description: 'High-performance virtualized inventory', icon: 'products', href: '/admin/products', group: 'Mission Control', shortcut: ['⌘', 'P'] },
  { id: 'system-status', label: 'System Status Page', description: 'Public microservice SLA & health', icon: 'status', href: '/status', group: 'System' },
]

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: ShoppingBag,
  catalog: Tag,
  checkout: ShoppingBag,
  user: Settings,
  dashboard: LayoutDashboard,
  network: Network,
  flow: GitBranch,
  products: ListFilter,
  status: Activity,
}

// Simple Levenshtein / fuzzy scorer
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return 100 - (t.indexOf(q) * 5)
  let score = 0
  let qIdx = 0
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      score += 10
      qIdx++
    }
  }
  return qIdx === q.length ? score : 0
}

export function CommandPalette() {
  const { isPaletteOpen, closePalette } = useUiStore()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('orbitstack_recent_cmd') || '["admin", "catalog"]')
    } catch {
      return ['admin', 'catalog']
    }
  })

  const navigate = useNavigate()

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return ALL_COMMANDS
    }
    return ALL_COMMANDS.map((cmd) => {
      const scoreLabel = fuzzyScore(query, cmd.label)
      const scoreDesc = cmd.description ? fuzzyScore(query, cmd.description) : 0
      const scoreGroup = fuzzyScore(query, cmd.group)
      return { cmd, score: Math.max(scoreLabel, scoreDesc, scoreGroup) }
    })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.cmd)
  }, [query])

  const groups = useMemo(() => {
    if (!query.trim() && recentIds.length > 0) {
      return ['Recent', ...new Set(ALL_COMMANDS.map((c) => c.group))]
    }
    return [...new Set(filtered.map((c) => c.group))]
  }, [filtered, query, recentIds])

  const handleSelect = useCallback(
    (item: CommandItem) => {
      // Record history
      setRecentIds((prev) => {
        const next = [item.id, ...prev.filter((id) => id !== item.id)].slice(0, 4)
        localStorage.setItem('orbitstack_recent_cmd', JSON.stringify(next))
        return next
      })

      navigate(item.href)
      closePalette()
      setQuery('')
    },
    [navigate, closePalette]
  )

  // Keyboard controls
  useEffect(() => {
    if (!isPaletteOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[activeIndex]) {
          handleSelect(filtered[activeIndex])
        }
      } else if (e.key === 'Escape') {
        closePalette()
        setQuery('')
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPaletteOpen, filtered, activeIndex, handleSelect, closePalette])

  useEffect(() => setActiveIndex(0), [query])

  // Cmd+K shortcut listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useUiStore.getState().togglePalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  let flatIndex = 0

  return (
    <AnimatePresence>
      {isPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
            onClick={() => {
              closePalette()
              setQuery('')
            }}
          />

          {/* Dialog Panel */}
          <motion.div
            key="palette-panel"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="bg-base-1 border border-border-bright rounded-2xl shadow-2xl overflow-hidden glass">
              {/* Input Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <Search className="w-4 h-4 text-text-3 shrink-0" />
                <input
                  id="command-palette-input"
                  type="text"
                  autoFocus
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-text-1 placeholder:text-text-4 focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-base-2 border border-border rounded font-mono text-text-3">⌘K</kbd>
                </div>
                <button
                  onClick={() => { closePalette(); setQuery('') }}
                  className="text-text-3 hover:text-text-1 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action List */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-10 text-center text-text-3 text-sm">
                    No commands matching "{query}"
                  </div>
                ) : (
                  groups.map((group) => {
                    const groupItems =
                      !query.trim() && group === 'Recent'
                        ? ALL_COMMANDS.filter((c) => recentIds.includes(c.id))
                        : filtered.filter((c) => c.group === group)

                    if (groupItems.length === 0) return null

                    return (
                      <div key={group} className="mb-2 last:mb-0">
                        <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-3 flex items-center gap-1.5">
                          {group === 'Recent' && <History className="w-3 h-3 text-primary-400" />}
                          {group}
                        </div>
                        {groupItems.map((cmd) => {
                          const idx = flatIndex++
                          const isSelected = idx === activeIndex
                          const IconComp = ICON_MAP[cmd.icon ?? ''] ?? Settings

                          return (
                            <button
                              key={`${group}-${cmd.id}`}
                              onClick={() => handleSelect(cmd)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className={cn(
                                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 relative',
                                isSelected
                                  ? 'bg-primary-500/15 text-text-1 font-medium'
                                  : 'text-text-2 hover:bg-base-2'
                              )}
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="active-indicator"
                                  className="absolute left-0 w-1 top-2 bottom-2 bg-primary-500 rounded-r"
                                />
                              )}
                              <div
                                className={cn(
                                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border',
                                  isSelected
                                    ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                                    : 'bg-base-2 border-border text-text-3'
                                )}
                              >
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm truncate">{cmd.label}</div>
                                {cmd.description && (
                                  <div className="text-xs text-text-3 truncate">{cmd.description}</div>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <div className="flex items-center gap-1 shrink-0">
                                  {cmd.shortcut.map((k, i) => (
                                    <kbd
                                      key={i}
                                      className="px-1.5 py-0.5 text-[10px] bg-base-2 border border-border rounded font-mono text-text-3"
                                    >
                                      {k}
                                    </kbd>
                                  ))}
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Keyboard Footer Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-[11px] text-text-3 bg-base-2/50">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 bg-base-2 border border-border rounded font-mono">↑↓</kbd> navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 bg-base-2 border border-border rounded font-mono">↵</kbd> select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 bg-base-2 border border-border rounded font-mono">esc</kbd> close
                  </span>
                </div>
                <span>{filtered.length} actions</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
