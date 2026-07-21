import { create } from 'zustand'

interface UiState {
  isDark: boolean
  isPaletteOpen: boolean
  toggleDark: () => void
  openPalette: () => void
  closePalette: () => void
  togglePalette: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  isDark: true,
  isPaletteOpen: false,

  toggleDark: () =>
    set((state) => {
      const next = !state.isDark
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { isDark: next }
    }),

  openPalette: () => set({ isPaletteOpen: true }),
  closePalette: () => set({ isPaletteOpen: false }),
  togglePalette: () => set((state) => ({ isPaletteOpen: !state.isPaletteOpen })),
}))
