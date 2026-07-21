import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LandingPage } from '@/pages/storefront/LandingPage'
import { CatalogPage } from '@/pages/storefront/CatalogPage'
import { CheckoutPage } from '@/pages/storefront/CheckoutPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/mission-control/DashboardPage'
import { TopologyPage } from '@/pages/mission-control/TopologyPage'
import { OrderFlowPage } from '@/pages/mission-control/OrderFlowPage'
import { ProductsAdminPage } from '@/pages/mission-control/ProductsAdminPage'
import { StatusPage } from '@/pages/StatusPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Storefront */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Mission Control */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="topology" element={<TopologyPage />} />
          <Route path="orders" element={<OrderFlowPage />} />
          <Route path="products" element={<ProductsAdminPage />} />
        </Route>

        {/* System Status & Fallback */}
        <Route path="/status" element={<StatusPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}
