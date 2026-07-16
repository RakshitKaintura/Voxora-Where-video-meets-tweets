import { useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useVideoComments, useAddComment } from '@/hooks/useComments'
import CommentInput from './CommentInput'
import CommentCard from './CommentCard'

export default function CommentSection({ videoId }) {
  const { user } = useSelector((state) => state.auth)
  
  // Queries & Mutations
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVideoComments(videoId)
  
  const { mutate: addComment, isLoading: isAdding } = useAddComment()

  // Flatten comments
  const comments = data?.pages?.flatMap((page) => page.comments) || []
  const totalComments = data?.pages?.[0]?.totalDocs || 0

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

  const handleAddComment = (content, resetForm) => {
    addComment(
      { videoId, content },
      {
        onSuccess: () => resetForm(),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6 mt-8">
      {/* Header */}
      <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">
        {totalComments} Comments
      </h3>

      {/* Add Comment Input */}
      {user ? (
        <CommentInput onSubmit={handleAddComment} isLoading={isAdding} />
      ) : (
        <div className="bg-[hsl(var(--muted))] rounded-xl p-4 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            <Link to="/login" className="text-[hsl(var(--red))] font-semibold hover:underline">
              Sign in
            </Link>{' '}
            to add a comment.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="flex flex-col gap-6 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
            Failed to load comments.
          </p>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentCard key={comment._id} comment={comment} />
          ))
        )}
      </div>

      {/* Intersection Observer Trigger */}
      <div ref={lastElementRef} className="h-4 w-full" />
      
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--red))]" />
        </div>
      )}
    </div>
  )
}
