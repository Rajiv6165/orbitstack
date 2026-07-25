import { useState } from 'react'
import { Camera, ExternalLink, Package } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import type { ProductImageMeta } from '@/lib/productImages'

interface ImageWithSkeletonProps {
  src: string
  alt: string
  aspectRatio?: string
  className?: string
  imageMeta?: ProductImageMeta
  showAttribution?: boolean
}

export function ImageWithSkeleton({
  src,
  alt,
  aspectRatio = 'aspect-video',
  className = '',
  imageMeta,
  showAttribution = true,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className} bg-space-900/80`}>
      {/* ── Skeleton Shimmer Overlay ───────────────────────────── */}
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none bg-space-800 animate-pulse" />
      )}

      {/* ── Main Image ─────────────────────────────────────────── */}
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ease-out ${
            isLoaded
              ? 'opacity-100 scale-100 blur-0'
              : 'opacity-0 scale-105 blur-md'
          }`}
        />
      ) : (
        /* Fallback if network blocks image */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-space-800 to-space-950 text-slate-500 p-4 text-center">
          <Package className="w-12 h-12 mb-2 text-primary-400/40" />
          <span className="text-xs font-mono text-slate-400">{alt}</span>
        </div>
      )}

      {/* ── Unsplash Attribution Hover Badge ───────────────────── */}
      {showAttribution && imageMeta && isLoaded && !hasError && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <a
            href={imageMeta.unsplashUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-space-950/80 hover:bg-space-900 border border-border-subtle backdrop-blur-md text-[10px] text-slate-300 hover:text-white transition-colors"
            title={`Photo by ${imageMeta.photographerName} on Unsplash`}
          >
            <Camera className="w-3 h-3 text-primary-400" />
            <span>{imageMeta.photographerName}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </a>
        </div>
      )}
    </div>
  )
}
