import { apiFetch, BASE } from './client'
import type { LoginRequest, RegisterRequest, TokenResponse, ValidateResponse } from '@/types'

export const authApi = {
  register: (data: RegisterRequest) =>
    apiFetch<TokenResponse>(`${BASE.auth}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    apiFetch<TokenResponse>(`${BASE.auth}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  validate: (token: string) =>
    apiFetch<ValidateResponse>(`${BASE.auth}/auth/validate`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
}
