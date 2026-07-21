import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

interface NumberTickerProps {
  value: number
  direction?: 'up' | 'down'
  delay?: number
  className?: string
  decimalPlaces?: number
  prefix?: string
  suffix?: string
}

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className = '',
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === 'down' ? value : 0)
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 18,
    mass: 0.8,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      motionValue.set(value)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [value, delay, motionValue])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString('en-US', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        })}${suffix}`
      }
    })
  }, [springValue, decimalPlaces, prefix, suffix])

  return (
    <span
      ref={ref}
      className={`font-mono tabular-nums ${className}`}
    >
      {prefix}{value.toLocaleString('en-US', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces })}{suffix}
    </span>
  )
}
