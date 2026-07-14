import { cn } from '@/lib/utils'

/**
 * Shimmer skeleton card — matches the shape of a VideoCard.
 * Drop it anywhere a real VideoCard would appear during loading.
 */
export default function SkeletonCard({ className }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Thumbnail */}
      <div
        className="skeleton w-full rounded-xl"
        style={{ aspectRatio: '16/9' }}
      />
      <div className="flex gap-3 px-1">
        {/* Avatar */}
        <div className="skeleton w-9 h-9 rounded-full shrink-0 mt-0.5" />
        <div className="flex-1 flex flex-col gap-2">
          {/* Title — two lines */}
          <div className="skeleton h-3.5 w-full rounded" />
          <div className="skeleton h-3.5 w-3/4 rounded" />
          {/* Channel name + views */}
          <div className="skeleton h-3 w-1/2 rounded mt-1" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
      </div>
    </div>
  )
}
