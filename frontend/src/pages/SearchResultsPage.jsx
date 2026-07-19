import { useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, SearchX } from 'lucide-react'
import { useVideos } from '@/hooks/useVideos'
import VideoCard from '@/components/shared/VideoCard'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  // Fetch videos matching the query
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVideos({ query })

  const videos = data?.pages?.flatMap((page) => page.videos) || []

  // Infinite Scroll Observer
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

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-[hsl(var(--red))] mb-2">Search failed</h2>
          <p className="text-[hsl(var(--muted-foreground))]">
            {error?.response?.data?.message || 'Something went wrong.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* ── Search Header ── */}
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
          Search results
        </h1>
        {query && (
          <p className="text-[hsl(var(--muted-foreground))]">
            Showing results for <span className="font-semibold text-[hsl(var(--foreground))]">"{query}"</span>
          </p>
        )}
      </div>

      {/* ── Results Grid ── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--red))]" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="w-16 h-16 text-[hsl(var(--muted-foreground))] mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">No results found</h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-md">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          <div ref={lastElementRef} className="h-10 w-full" />
          
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--red))]" />
            </div>
          )}
        </div>
      )}

    </div>
  )
}
