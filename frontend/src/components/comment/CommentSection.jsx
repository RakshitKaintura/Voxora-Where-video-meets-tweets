import { useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'
import { useVideoComments, useAddComment, useCommentSentiment } from '@/hooks/useComments'
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
  const { data: sentimentData, isLoading: isSentimentLoading, isFetching: isSentimentFetching, refetch: fetchSentiment, isSuccess: isSentimentSuccess } = useCommentSentiment(videoId)

  // Flatten comments
  const comments = data?.pages?.flatMap((page) => page.comments) || []
  const totalComments = data?.pages?.[0]?.totalComments || 0

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

  const isAnalyzing = isSentimentLoading || isSentimentFetching;

  return (
    <div className="flex flex-col gap-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">
          {totalComments} Comments
        </h3>
        
        {totalComments >= 3 && !isSentimentSuccess && (
          <button
            onClick={() => fetchSentiment()}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-1.5 bg-[hsl(var(--red))] hover:bg-[hsl(var(--red))]/90 text-white rounded-full text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isAnalyzing && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            <span>{isAnalyzing ? 'Analyzing...' : 'AI Insight'}</span>
          </button>
        )}
      </div>

      {/* AI Sentiment Badge */}
      {isSentimentSuccess && (
        <div className="flex items-start gap-3 p-4 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--red))]" />
          <div className="shrink-0 p-2 bg-[hsl(var(--muted))] rounded-full">
            <Sparkles className="w-4 h-4 text-[hsl(var(--red))]" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[hsl(var(--foreground))] uppercase tracking-wider">
              AI Insight
            </span>
            <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed">
              {sentimentData?.insight ? (
                sentimentData.insight
              ) : (
                <span className="text-[hsl(var(--muted-foreground))]">Not enough data to analyze sentiment.</span>
              )}
            </p>
          </div>
        </div>
      )}

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
