import { useState, useRef, useCallback } from 'react'
import { Link, useParams as useRouterParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useChannelProfile } from '@/hooks/useUser'
import { useUserPlaylists } from '@/hooks/usePlaylists'
import { useToggleSubscription } from '@/hooks/useSubscription'
import { useUserTweets } from '@/hooks/useTweets'
import Avatar from '@/components/shared/Avatar'
import { formatCount } from '@/lib/utils'
import ErrorState from '@/components/shared/ErrorState'
import TweetCard from '@/components/tweet/TweetCard'
import VideoCard from '@/components/shared/VideoCard'
import PlaylistCard from '@/components/playlist/PlaylistCard'
import EmptyState from '@/components/shared/EmptyState'
import { useVideos } from '@/hooks/useVideos'

export default function ChannelPage() {
  const { username } = useRouterParams()
  const { data: channel, isLoading, isError, error, refetch } = useChannelProfile(username)
  const { mutate: toggleSubscription, isLoading: isToggling } = useToggleSubscription()

  const [activeTab, setActiveTab] = useState('videos') // 'videos', 'playlists', or 'tweets'

  const { data: playlists, isLoading: isPlaylistsLoading } = useUserPlaylists(activeTab === 'playlists' ? channel?._id : null)

  // Tweets query (only enabled if we are on tweets tab and have channel id)
  const {
    data: tweetsData,
    isLoading: isTweetsLoading,
    fetchNextPage: fetchNextTweetsPage,
    hasNextPage: hasNextTweetsPage,
    isFetchingNextPage: isFetchingNextTweetsPage,
  } = useUserTweets(activeTab === 'tweets' ? channel?._id : null)

  const tweets = tweetsData?.pages?.flatMap((page) => page.tweets) || []

  // Videos query
  const {
    data: videosData,
    isLoading: isVideosLoading,
    fetchNextPage: fetchNextVideosPage,
    hasNextPage: hasNextVideosPage,
    isFetchingNextPage: isFetchingNextVideosPage,
  } = useVideos({ userId: channel?._id })

  const videos = videosData?.pages?.flatMap((page) => page.videos) || []

  // Infinite Scroll Observer for tweets
  const tweetsObserver = useRef()
  const lastTweetRef = useCallback(
    (node) => {
      if (isTweetsLoading || isFetchingNextTweetsPage) return
      if (tweetsObserver.current) tweetsObserver.current.disconnect()

      tweetsObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextTweetsPage) {
          fetchNextTweetsPage()
        }
      })

      if (node) tweetsObserver.current.observe(node)
    },
    [isTweetsLoading, isFetchingNextTweetsPage, hasNextTweetsPage, fetchNextTweetsPage]
  )

  // Infinite Scroll Observer for videos
  const videosObserver = useRef()
  const lastVideoRef = useCallback(
    (node) => {
      if (isVideosLoading || isFetchingNextVideosPage) return
      if (videosObserver.current) videosObserver.current.disconnect()

      videosObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextVideosPage) {
          fetchNextVideosPage()
        }
      })

      if (node) videosObserver.current.observe(node)
    },
    [isVideosLoading, isFetchingNextVideosPage, hasNextVideosPage, fetchNextVideosPage]
  )

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--red))]" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <ErrorState
          message={error?.response?.data?.message || 'Failed to load channel'}
          onRetry={refetch}
        />
      </div>
    )
  }

  if (!channel) return null

  return (
    <div className="w-full">
      {/* Cover Image */}
      <div className="w-full h-32 sm:h-48 md:h-64 lg:h-80 relative bg-[hsl(var(--muted))]">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Channel Info Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mt-4 sm:-mt-8 mb-8 relative">
          <Avatar
            src={channel.avatar}
            alt={channel.fullName}
            size="2xl"
            className="ring-4 ring-[hsl(var(--background))]"
          />
          <div className="flex flex-col items-center sm:items-start flex-1 sm:pt-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
              {channel.fullName}
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">@{channel.username}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {formatCount(channel.subscribersCount)} subscribers • {formatCount(channel.channelSubscribedToCount)} subscribed
            </p>
          </div>
          <div className="sm:pt-10">
            <button
              onClick={() => toggleSubscription(channel._id)}
              disabled={isToggling}
              className={`px-6 py-2.5 rounded-full font-semibold transition-colors disabled:opacity-70 ${
                channel.isSubscribed
                  ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]'
                  : 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--muted-foreground))]'
              }`}
            >
              {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-[hsl(var(--border))] mb-6">
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'videos'
                ? 'text-[hsl(var(--foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            VIDEOS
            {activeTab === 'videos' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[hsl(var(--foreground))]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`pb-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'playlists'
                ? 'text-[hsl(var(--foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            PLAYLISTS
            {activeTab === 'playlists' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[hsl(var(--foreground))]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('tweets')}
            className={`pb-4 text-sm font-semibold transition-colors relative ${
              activeTab === 'tweets'
                ? 'text-[hsl(var(--foreground))]'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            TWEETS
            {activeTab === 'tweets' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[hsl(var(--foreground))]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === 'videos' && (
            <div className="flex flex-col gap-4">
              {isVideosLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
                </div>
              ) : videos.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-[hsl(var(--muted-foreground))]">
                  <EmptyState 
                    title="No videos yet" 
                    description="This channel hasn't uploaded any videos." 
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              )}

              <div ref={lastVideoRef} className="h-10 w-full" />
              {isFetchingNextVideosPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--red))]" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="flex flex-col gap-4">
              {isPlaylistsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
                </div>
              ) : playlists?.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-[hsl(var(--muted-foreground))]">
                  <EmptyState 
                    title="No playlists yet" 
                    description="This channel hasn't created any playlists." 
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {playlists.map((playlist) => (
                    <PlaylistCard key={playlist._id} playlist={playlist} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tweets' && (
            <div className="max-w-3xl flex flex-col gap-4">
              {isTweetsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
                </div>
              ) : tweets.length === 0 ? (
                 <EmptyState 
                  type="tweet"
                  title="No tweets yet" 
                  description="This channel hasn't posted any tweets." 
                />
              ) : (
                tweets.map((tweet) => (
                  <TweetCard key={tweet._id} tweet={tweet} />
                ))
              )}

              <div ref={lastTweetRef} className="h-10 w-full" />
              {isFetchingNextTweetsPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--red))]" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
