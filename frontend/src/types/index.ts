// ─── Auth ────────────────────────────────────────────────────
export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface ValidateResponse {
  valid: boolean
  email?: string
}

// ─── Catalog ─────────────────────────────────────────────────
export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  sku: string
}

export interface ProductCreate {
  name: string
  description?: string
  price: number
  stock: number
  sku: string
}

export interface StockAdjust {
  quantity: number
}

// ─── Orders ──────────────────────────────────────────────────
export interface OrderCreate {
  product_id: number
  quantity: number
}

export interface Order {
  id: number
  product_id: number
  quantity: number
  customer_email: string
  status: string
  total_price: number
  created_at: string
}

// ─── Cart ────────────────────────────────────────────────────
export interface CartItem {
  product: Product
  quantity: number
}

// ─── Metrics ─────────────────────────────────────────────────
export interface ServiceMetrics {
  name: string
  port: number
  requestRate: number
  errorRate: number
  latencyP95: number
  totalRequests: number
  status: 'healthy' | 'degraded' | 'down'
  history: MetricPoint[]
}

export interface MetricPoint {
  ts: number
  value: number
}

// ─── Topology / WebSocket ────────────────────────────────────
export type ServiceId = 'auth' | 'catalog' | 'order' | 'notification'

export interface TopologyNode {
  id: ServiceId
  label: string
  color: string
  glowColor: string
  port: number
}

export interface TopologyLink {
  source: ServiceId
  target: ServiceId
  value: number
}

export interface WsEvent {
  type: 'order_flow' | 'topology' | 'ping'
  payload: OrderFlowEvent | TopologyEvent | null
}

export interface OrderFlowEvent {
  orderId: string
  stage: 'auth' | 'catalog' | 'order' | 'notification'
  status: 'processing' | 'complete' | 'error'
  timestamp: string
  message: string
}

export interface TopologyEvent {
  from: ServiceId
  to: ServiceId
  requestId: string
  latency: number
}

// ─── Command Palette ─────────────────────────────────────────
export interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: string
  href: string
  group: string
  shortcut?: string[]
}
