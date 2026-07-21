import { apiFetch, BASE } from './client'
import type { Product, ProductCreate, StockAdjust } from '@/types'

export const catalogApi = {
  list: () =>
    apiFetch<Product[]>(`${BASE.catalog}/products/`),

  get: (id: number) =>
    apiFetch<Product>(`${BASE.catalog}/products/${id}`),

  create: (data: ProductCreate) =>
    apiFetch<Product>(`${BASE.catalog}/products/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adjustStock: (id: number, data: StockAdjust) =>
    apiFetch<Product>(`${BASE.catalog}/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

export const catalogKeys = {
  all: ['products'] as const,
  list: () => [...catalogKeys.all, 'list'] as const,
  detail: (id: number) => [...catalogKeys.all, 'detail', id] as const,
}
