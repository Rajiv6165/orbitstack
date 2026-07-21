import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        style: {
          background: '#0c1220',
          border: '1px solid #263851',
          color: '#dde3ef',
          borderRadius: '12px',
          boxShadow: '0 16px 56px rgba(0,0,0,0.5)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem',
        },
        className: 'border border-border-bright bg-base-1 text-text-1 shadow-2xl',
      }}
    />
  )
}
