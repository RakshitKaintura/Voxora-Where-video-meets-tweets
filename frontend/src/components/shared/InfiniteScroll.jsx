import { useEffect, useRef } from 'react'

// Wraps children and fires onIntersect() when the sentinel
// div enters the viewport. Used for infinite scroll feeds.
//
// Props:
//  - onIntersect: () => void  — called when bottom sentinel is visible
//  - hasMore: boolean         — stop observing when no more pages
//  - isLoading: boolean       — don't fire while already loading
//  - children: ReactNode
export default function InfiniteScroll({ onIntersect, hasMore, isLoading, children }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onIntersect()
        }
      },
      { rootMargin: '200px' } // trigger 200px before the end
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onIntersect, hasMore, isLoading])

  return (
    <>
      {children}
      {/* Invisible sentinel div at the bottom of the list */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </>
  )
}
