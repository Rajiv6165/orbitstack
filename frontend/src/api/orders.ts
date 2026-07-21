import { apiFetch, BASE } from './client'
import type { Order, OrderCreate } from '@/types'

export const ordersApi = {
  create: (data: OrderCreate) =>
    apiFetch<Order>(`${BASE.orders}/orders/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const orderKeys = {
  all: ['orders'] as const,
}
