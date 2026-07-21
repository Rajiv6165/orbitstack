import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { CartDrawer } from '@/components/storefront/CartDrawer'
import { CommandPalette } from '@/components/mission-control/CommandPalette'
import { Toaster } from '@/components/ui/Toaster'

export function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-base text-text-1 flex flex-col selection:bg-primary-500/30 selection:text-text-1">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <CommandPalette />
      <Toaster />
    </div>
  )
}
