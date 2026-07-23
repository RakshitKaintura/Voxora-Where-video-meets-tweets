import { useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Loader2, MessageSquare } from 'lucide-react'
import { useAllTweets, useCreateTweet } from '@/hooks/useTweets'
import TweetComposer from '@/components/tweet/TweetComposer'
import TweetCard from '@/components/tweet/TweetCard'
import EmptyState from '@/components/shared/EmptyState'
import ErrorState from '@/components/shared/ErrorState'

export default function TweetsPage() {
  const { user } = useSelector((state) => state.auth)
  
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAllTweets()

  const { mutate: createTweet, isLoading: isCreating } = useCreateTweet()

  const tweets = data?.pages?.flatMap((page) => page.tweets) || []

  // Infinite Scroll
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

  const handleCreate = (data, resetForm) => {
    let submitData = { content: data.content }
    if (data.image) {
      submitData = new FormData()
      submitData.append('content', data.content)
      submitData.append('image', data.image)
    }

    createTweet(submitData, {
      onSuccess: () => resetForm(),
    })
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
        <ErrorState
          message={error?.response?.data?.message || 'Failed to load tweets'}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      
      {/* Header & Composer */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[hsl(var(--red))]" />
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Twitter</h1>
        </div>

        {user ? (
          <TweetComposer onSubmit={handleCreate} isLoading={isCreating} />
        ) : (
          <div className="bg-[hsl(var(--muted))] rounded-xl p-6 text-center border border-[hsl(var(--border))]">
            <p className="text-[hsl(var(--muted-foreground))]">
              <Link to="/login" className="text-[hsl(var(--red))] font-semibold hover:underline">
                Sign in
              </Link>{' '}
              to join the conversation and post a tweet.
            </p>
          </div>
        )}
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-4 pb-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--red))]" />
          </div>
        ) : tweets.length === 0 ? (
          <EmptyState
            type="tweet"
            title="No tweets yet"
            description="Be the first one to share your thoughts with the community!"
          />
        ) : (
          tweets.map((tweet) => (
            <TweetCard key={tweet._id} tweet={tweet} />
          ))
        )}

        {/* Intersection Observer Trigger */}
        <div ref={lastElementRef} className="h-10 w-full" />
        
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--red))]" />
          </div>
        )}
      </div>
      
    </div>
  )
}
