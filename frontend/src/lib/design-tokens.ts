/**
 * OrbitStack Design Tokens
 *
 * Single source of truth for the entire design system.
 * Use these in components — never hardcode raw hex or px values.
 *
 * Philosophy: two primaries max, one accent, strict neutrals.
 * Every value is deliberate. Nothing is default Tailwind.
 */

// ─── Color Palette ─────────────────────────────────────────────────────────

export const color = {
  // Base — very dark space navy (not pure black, warmer)
  base: {
    DEFAULT: '#070c14',
    1: '#0c1220',  // cards / panels
    2: '#101827',  // elevated elements
    3: '#16202f',  // hover surfaces
    overlay: '#1a2a3d', // overlays (modals, drawers)
  },

  // Border scale
  border: {
    dim: '#172133',
    DEFAULT: '#1e2d42',
    bright: '#263851',
    focus: '#5b6cf5',
  },

  // Primary — cooler, more restrained indigo than #6366f1
  primary: {
    50:  '#eef0ff',
    100: '#dde2fe',
    200: '#c3cbfc',
    300: '#9da9f8',
    400: '#7b88f5',
    500: '#5b6cf5', // ← main
    600: '#4a57e0',
    700: '#3b45c4',
    800: '#2f38a0',
    900: '#272f7e',
    950: '#171c50',
  },

  // Accent — teal (Linear, Vercel-adjacent vocabulary)
  accent: {
    50:  '#edfcfb',
    100: '#d0f7f5',
    200: '#a5eeea',
    300: '#6ddfd9',
    400: '#38c8c1',
    500: '#14b8a6', // ← main
    600: '#0d9b8a',
    700: '#0d7d70',
    800: '#0e635a',
    900: '#10524a',
    950: '#03302d',
  },

  // Semantic
  positive: {
    DEFAULT: '#22c55e',
    dim: '#15803d',
    bg: 'rgba(34, 197, 94, 0.08)',
    border: 'rgba(34, 197, 94, 0.2)',
  },
  warning: {
    DEFAULT: '#f59e0b',
    dim: '#b45309',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  negative: {
    DEFAULT: '#ef4444',
    dim: '#b91c1c',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.2)',
  },

  // Text scale
  text: {
    1: '#dde3ef',   // primary — slightly cool, not harsh white
    2: '#8b9ab8',   // secondary
    3: '#4d5e7a',   // muted / labels
    4: '#2d3d56',   // very muted / placeholders
    inverse: '#070c14',
  },
} as const

// ─── Typography ─────────────────────────────────────────────────────────────

export const font = {
  display: "'Syne', system-ui, sans-serif",        // headings — geometric, distinctive
  body: "'Inter', system-ui, sans-serif",            // body text
  mono: "'JetBrains Mono', 'Fira Code', monospace", // code, metrics

  size: {
    '2xs': '0.625rem',  // 10px
    xs:    '0.75rem',   // 12px
    sm:    '0.875rem',  // 14px
    base:  '1rem',      // 16px
    lg:    '1.125rem',  // 18px
    xl:    '1.25rem',   // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
  },

  weight: {
    light:    '300',
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
    extrabold:'800',
    black:    '900',
  },

  leading: {
    tight:   '1.1',
    snug:    '1.25',
    normal:  '1.5',
    relaxed: '1.625',
  },
} as const

// ─── Spacing (4px base) ──────────────────────────────────────────────────────

export const spacing = {
  0:    '0',
  0.5:  '0.125rem',  // 2px
  1:    '0.25rem',   // 4px
  1.5:  '0.375rem',  // 6px
  2:    '0.5rem',    // 8px
  3:    '0.75rem',   // 12px
  4:    '1rem',      // 16px
  5:    '1.25rem',   // 20px
  6:    '1.5rem',    // 24px
  8:    '2rem',      // 32px
  10:   '2.5rem',    // 40px
  12:   '3rem',      // 48px
  16:   '4rem',      // 64px
  20:   '5rem',      // 80px
  24:   '6rem',      // 96px
} as const

// ─── Border Radius ───────────────────────────────────────────────────────────

export const radius = {
  none: '0',
  sm:   '4px',
  DEFAULT: '6px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  '2xl':'20px',
  '3xl':'24px',
  full: '9999px',
} as const

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadow = {
  none: 'none',
  sm:   '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
  DEFAULT: '0 4px 16px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.25)',
  md:   '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)',
  lg:   '0 16px 56px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.35)',
  xl:   '0 24px 80px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.4)',

  // Glow — use sparingly, only on interactive focal elements
  'glow-sm':      '0 0 12px rgba(91,108,245,0.35)',
  'glow-primary': '0 0 24px rgba(91,108,245,0.45), 0 0 64px rgba(91,108,245,0.15)',
  'glow-accent':  '0 0 24px rgba(20,184,166,0.45), 0 0 64px rgba(20,184,166,0.15)',
  'glow-positive':'0 0 16px rgba(34,197,94,0.4)',
} as const

// ─── Animation ───────────────────────────────────────────────────────────────

export const motion = {
  duration: {
    instant: 0,
    fast:   0.12,
    normal: 0.22,
    slow:   0.4,
    xslow:  0.7,
  },

  ease: {
    // Standard easing for UI elements
    out:     [0.16, 1, 0.3, 1] as const,
    in:      [0.4, 0, 1, 0.6] as const,
    inOut:   [0.45, 0, 0.55, 1] as const,
    // Spring-like cubic for entrances
    spring:  [0.23, 1, 0.32, 1] as const,
    // Elastic for micro-interactions
    bounce:  [0.68, -0.3, 0.32, 1.3] as const,
  },

  spring: {
    snappy:  { type: 'spring', stiffness: 500, damping: 30 } as const,
    smooth:  { type: 'spring', stiffness: 300, damping: 28 } as const,
    gentle:  { type: 'spring', stiffness: 180, damping: 24 } as const,
    ticker:  { stiffness: 120, damping: 20, mass: 0.8 } as const,
  },
} as const

// ─── Semantic component tokens ───────────────────────────────────────────────

export const component = {
  card: {
    bg: 'rgba(12, 18, 32, 0.85)',
    bgHover: 'rgba(16, 24, 39, 0.9)',
    border: color.border.DEFAULT,
    borderHover: color.border.bright,
    radius: radius.lg,
    shadow: shadow.DEFAULT,
    shadowHover: shadow.md,
    backdrop: 'blur(16px)',
  },

  input: {
    bg: color.base[1],
    border: color.border.DEFAULT,
    borderFocus: color.border.focus,
    radius: radius.md,
    text: color.text[1],
    placeholder: color.text[4],
  },

  button: {
    height: { sm: '32px', md: '38px', lg: '44px' },
    radius: radius.md,
    primary: {
      bg: color.primary[500],
      bgHover: color.primary[400],
      text: '#ffffff',
      shadow: shadow['glow-sm'],
    },
    secondary: {
      bg: 'transparent',
      bgHover: color.base[3],
      border: color.border.DEFAULT,
      borderHover: color.border.bright,
      text: color.text[1],
    },
    accent: {
      bg: color.accent[500],
      bgHover: color.accent[400],
      text: '#ffffff',
      shadow: shadow['glow-accent'],
    },
    ghost: {
      bg: 'transparent',
      bgHover: 'rgba(91,108,245,0.08)',
      text: color.text[2],
    },
  },

  badge: {
    radius: radius.full,
    dot: { size: '6px' },
  },

  toast: {
    bg: '#111827',
    border: color.border.bright,
    radius: radius.lg,
    shadow: shadow.xl,
  },

  navbar: {
    height: '56px',
    bg: 'rgba(7, 12, 20, 0.85)',
    border: color.border.dim,
    backdrop: 'blur(20px) saturate(180%)',
  },

  sidebar: {
    width: '220px',
    bg: color.base[1],
    border: color.border.dim,
  },

  commandPalette: {
    bg: '#0c1220',
    border: color.border.bright,
    radius: radius['2xl'],
    shadow: shadow.xl,
    highlight: 'rgba(91,108,245,0.12)',
  },
} as const

// ─── Viewport breakpoints ────────────────────────────────────────────────────

export const breakpoint = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ─── Z-index scale ───────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  raised:  10,
  dropdown:20,
  sticky:  30,
  overlay: 40,
  modal:   50,
  toast:   60,
  max:     9999,
} as const

// ─── Combined export ─────────────────────────────────────────────────────────

export const tokens = { color, font, spacing, radius, shadow, motion, component, breakpoint, zIndex } as const
export type Tokens = typeof tokens
