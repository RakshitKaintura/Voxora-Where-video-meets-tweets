import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useSubscribedChannels, useToggleSubscription } from '@/hooks/useSubscription'
import Avatar from '@/components/shared/Avatar'
import { formatCount } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import ErrorState from '@/components/shared/ErrorState'
import { Loader2 } from 'lucide-react'

export default function SubscriptionsPage() {
  const { user } = useSelector((state) => state.auth)
  
  const {
    data: channels,
    isLoading,
    isError,
    error,
    refetch,
  } = useSubscribedChannels(user?._id)

  const { mutate: toggleSubscription, isLoading: isToggling } = useToggleSubscription()

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="bg-[hsl(var(--muted))] rounded-xl p-8 text-center border border-[hsl(var(--border))] max-w-md w-full">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Sign in required</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
            You must be logged in to view your subscriptions.
          </p>
          <Link
            to="/login"
            className="inline-flex px-6 py-2 rounded-full bg-[hsl(var(--red))] text-white font-semibold hover:bg-[hsl(var(--red))/90] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--red))]" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <ErrorState
          message={error?.response?.data?.message || 'Failed to load subscriptions'}
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mb-8">
        Your Subscriptions
      </h1>

      {channels?.length === 0 ? (
        <EmptyState
          title="No subscriptions"
          description="You aren't subscribed to any channels yet. Discover new content and subscribe!"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {channels?.map((channel) => (
            <div
              key={channel._id}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors border border-transparent hover:border-[hsl(var(--border))]"
            >
              <Link to={`/c/${channel.username}`} className="shrink-0">
                <Avatar
                  src={channel.avatar}
                  alt={channel.fullName}
                  size="xl"
                />
              </Link>
              
              <div className="flex flex-col flex-1 min-w-0">
                <Link
                  to={`/c/${channel.username}`}
                  className="font-bold text-lg text-[hsl(var(--foreground))] truncate hover:text-[hsl(var(--red))] transition-colors"
                >
                  {channel.fullName}
                </Link>
                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <span>@{channel.username}</span>
                  {/* Note: backend doesn't currently return subscribers count in this endpoint, 
                      so we omit it or would need to update the backend populate later */}
                </div>
              </div>

              <div className="shrink-0 ml-4">
                <button
                  onClick={() => toggleSubscription(channel._id)}
                  disabled={isToggling}
                  className="px-4 sm:px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-70 bg-[hsl(var(--muted-foreground))/20] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]"
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
