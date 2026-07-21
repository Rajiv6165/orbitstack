import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { CommandPalette } from '@/components/mission-control/CommandPalette'
import { Toaster } from '@/components/ui/Toaster'
import { useUiStore } from '@/store/ui'
import { Command, Search } from 'lucide-react'

export function AdminLayout() {
  const togglePalette = useUiStore((s) => s.togglePalette)

  return (
    <div className="flex h-screen bg-base overflow-hidden selection:bg-primary-500/30 selection:text-text-1">
      {/* Skip Link */}
      <a href="#admin-main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-border bg-base-1/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <button
            onClick={togglePalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-2 border border-border text-xs text-text-3 hover:text-text-1 hover:border-border-bright transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search or command...</span>
            <span className="flex items-center gap-0.5 ml-4 font-mono text-[10px] text-text-4 bg-base border border-border px-1.5 py-0.5 rounded">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </button>

          <div className="flex items-center gap-3 text-xs text-text-3">
            <span className="w-2 h-2 rounded-full bg-positive animate-ping" />
            <span className="font-mono font-medium text-text-2">OrbitStack Cluster: Production</span>
          </div>
        </header>

        {/* Page Content */}
        <main id="admin-main-content" className="flex-1 overflow-y-auto bg-base">
          <Outlet />
        </main>
      </div>

      <CommandPalette />
      <Toaster />
    </div>
  )
}
