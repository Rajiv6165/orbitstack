import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string | number
  width?: string | number
  rounded?: string
}

function Skeleton({ className, height, width, rounded = 'rounded-lg', style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', rounded, className)}
      style={{ height, width, ...style }}
      {...props}
    />
  )
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '60%' : '100%'}
          rounded="rounded-md"
        />
      ))}
    </div>
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card p-5 space-y-4', className)}>
      <Skeleton height={180} rounded="rounded-lg" />
      <div className="space-y-2">
        <Skeleton height={16} width="70%" rounded="rounded-md" />
        <Skeleton height={13} width="45%" rounded="rounded-md" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton height={20} width={80} rounded="rounded-md" />
        <Skeleton height={36} width={100} rounded="rounded-lg" />
      </div>
    </div>
  )
}

function SkeletonMetricCard({ className }: { className?: string }) {
  return (
    <div className={cn('glass-card p-5 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton height={14} width={100} rounded="rounded-md" />
        <Skeleton height={20} width={60} rounded="rounded-full" />
      </div>
      <Skeleton height={32} width={80} rounded="rounded-md" />
      <Skeleton height={48} rounded="rounded-lg" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton height={40} rounded="rounded-md" />
        <Skeleton height={40} rounded="rounded-md" />
      </div>
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonMetricCard }
