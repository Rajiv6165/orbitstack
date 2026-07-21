import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Network,
  GitBranch,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Command,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui'
import { useState } from 'react'

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Service health & metrics',
    end: true,
  },
  {
    href: '/admin/topology',
    label: 'Topology',
    icon: Network,
    description: 'Live service graph',
  },
  {
    href: '/admin/orders',
    label: 'Order Flow',
    icon: GitBranch,
    description: 'Real-time order visualizer',
  },
  {
    href: '/admin/products',
    label: 'Products Table',
    icon: ShoppingBag,
    description: 'Virtualized inventory admin',
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { openPalette } = useUiStore()

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-space-900 border-r border-border-subtle shrink-0"
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border-subtle">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-orbital flex items-center justify-center shadow-glow-sm shrink-0">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-base text-white tracking-tight whitespace-nowrap overflow-hidden"
              >
                Orbit<span className="gradient-text-orbital">Stack</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                isActive
                  ? 'bg-orbital-500/10 text-orbital-300 border border-orbital-500/20'
                  : 'text-slate-500 hover:bg-surface-elevated hover:text-slate-200'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive ? 'text-orbital-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-sm font-medium whitespace-nowrap">{item.label}</div>
                      <div className="text-xs text-slate-600 whitespace-nowrap">{item.description}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4 border-t border-border-subtle mt-4">
          {/* Command palette */}
          <button
            id="sidebar-command-palette"
            onClick={openPalette}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-500 hover:bg-surface-elevated hover:text-slate-300 transition-all duration-150"
            title={collapsed ? 'Command Palette' : undefined}
          >
            <Command className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between flex-1"
                >
                  <span className="text-sm font-medium whitespace-nowrap">Command Palette</span>
                  <kbd className="px-1.5 py-0.5 bg-space-800 rounded text-[10px] font-mono border border-border-subtle text-slate-600">
                    ⌘K
                  </kbd>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Back to storefront */}
          <Link
            to="/"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-500 hover:bg-surface-elevated hover:text-slate-300 transition-all duration-150"
            title={collapsed ? 'Storefront' : undefined}
          >
            <ShoppingBag className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Back to Store
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        id="sidebar-collapse-toggle"
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 w-6 h-6 bg-surface-elevated border border-border-subtle rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:border-orbital-500/50 transition-all duration-150 shadow-card z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </motion.aside>
  )
}
