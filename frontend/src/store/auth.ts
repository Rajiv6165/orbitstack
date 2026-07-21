import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  email: string | null
  isAuthenticated: boolean
  setAuth: (token: string, email: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      isAuthenticated: false,

      setAuth: (token, email) =>
        set({ token, email, isAuthenticated: true }),

      clearAuth: () =>
        set({ token: null, email: null, isAuthenticated: false }),
    }),
    {
      name: 'orbitstack-auth',
    }
  )
)
