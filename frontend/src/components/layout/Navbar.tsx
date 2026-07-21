import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Sun,
  Moon,
  Zap,
  User,
  LogOut,
  Command,
} from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const location = useLocation()
  const { totalItems, openCart } = useCartStore()
  const { isAuthenticated, email, clearAuth } = useAuthStore()
  const { isDark, toggleDark, openPalette } = useUiStore()
  const cartCount = totalItems()

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/catalog', label: 'Catalog' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-space-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-orbital flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-orbital transition-all duration-300">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Orbit<span className="gradient-text-orbital">Stack</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white bg-surface-elevated'
                    : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Command palette shortcut */}
          <button
            id="open-command-palette"
            onClick={openPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-subtle text-slate-500 text-xs hover:text-slate-300 hover:border-border-bright transition-all"
          >
            <Command className="w-3 h-3" />
            <span>Search</span>
            <kbd className="ml-1 px-1.5 py-0.5 bg-space-800 rounded text-[10px] font-mono border border-border-subtle">
              ⌘K
            </kbd>
          </button>

          {/* Dark mode */}
          <Button
            id="toggle-dark-mode"
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Cart */}
          <Button
            id="open-cart"
            variant="ghost"
            size="icon"
            onClick={openCart}
            className="relative"
          >
            <ShoppingCart className="w-4 h-4" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-orbital-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-slate-500 max-w-28 truncate">
                {email}
              </span>
              <Button
                id="logout-button"
                variant="ghost"
                size="icon"
                onClick={clearAuth}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button id="login-nav-button" variant="secondary" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
                Sign In
              </Button>
            </Link>
          )}

          {/* Mission Control */}
          <Link to="/admin">
            <Button id="mission-control-nav" variant="gradient" size="sm">
              <Zap className="w-3.5 h-3.5" />
              Mission Control
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
