import { useEffect, useRef, useCallback } from 'react'
import { useVideos } from '@/hooks/useVideos'
import VideoGrid from '@/components/shared/VideoGrid'
import EmptyState from '@/components/shared/EmptyState'
import ErrorState from '@/components/shared/ErrorState'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useVideos()

  // Flatten all pages of videos into a single array
  const videos = data?.pages?.flatMap((page) => page.videos) || []

  // ─── Infinite Scroll Observer ─────────────────────────────────────────────────
  const observer = useRef()
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) observer.current.observe(node)
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  // ─── Render States ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
        <ErrorState
          message={error?.response?.data?.message || 'Failed to load videos'}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Filters/Categories could go here in the future */}

      <VideoGrid videos={videos} isLoading={isLoading} />

      {!isLoading && videos.length === 0 && (
        <div className="pt-20">
          <EmptyState
            type="video"
            title="No videos found"
            description="There are no published videos available right now."
          />
        </div>
      )}

      {/* Invisible element to trigger next page load */}
      <div ref={lastElementRef} className="h-10 w-full" />

      {/* Loading indicator for subsequent pages */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'hsl(var(--red))' }} />
        </div>
      )}
    </div>
  )
}
