import { toast as sonnerToast } from 'sonner'

export const notify = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      style: { borderLeft: '4px solid #22c55e' },
    })
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      style: { borderLeft: '4px solid #ef4444' },
    })
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      style: { borderLeft: '4px solid #f59e0b' },
    })
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      style: { borderLeft: '4px solid #5b6cf5' },
    })
  },

  orderPlaced: (orderId: string, amount: string) => {
    sonnerToast.success(`Order Placed Successfully!`, {
      description: `Order ID: ${orderId} • Total: ${amount}`,
      style: { borderLeft: '4px solid #5b6cf5' },
    })
  },

  serviceDegraded: (serviceName: string) => {
    sonnerToast.warning(`Service Degraded: ${serviceName}`, {
      description: 'Latency spiked above threshold',
      style: { borderLeft: '4px solid #f59e0b' },
    })
  },
}
