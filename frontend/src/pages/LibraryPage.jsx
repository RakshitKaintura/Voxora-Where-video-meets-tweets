import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { History, ListVideo, ThumbsUp, Loader2 } from 'lucide-react'
import { useUserPlaylists } from '@/hooks/usePlaylists'
import api from '@/api/axios'
import { useQuery } from '@tanstack/react-query'
import PlaylistCard from '@/components/playlist/PlaylistCard'
import VideoCard from '@/components/shared/VideoCard'
import EmptyState from '@/components/shared/EmptyState'

// A simple hook to fetch watch history directly here since we didn't make a dedicated useUser history hook yet
function useWatchHistory() {
  return useQuery({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      const res = await api.get('/users/history')
      return res.data.data
    },
  })
}

// A simple hook to fetch liked videos
function useLikedVideos() {
  return useQuery({
    queryKey: ['likedVideos'],
    queryFn: async () => {
      const res = await api.get('/likes/videos')
      return res.data.data?.likedVideos || []
    },
  })
}

export default function LibraryPage() {
  const { user } = useSelector((state) => state.auth)
  
  const { 
    data: playlists, 
    isLoading: isPlaylistsLoading 
  } = useUserPlaylists(user?._id)

  const { 
    data: history, 
    isLoading: isHistoryLoading 
  } = useWatchHistory()

  const {
    data: likedVideos,
    isLoading: isLikedVideosLoading
  } = useLikedVideos()

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="bg-[hsl(var(--muted))] rounded-xl p-8 text-center border border-[hsl(var(--border))] max-w-md w-full">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Sign in required</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">
            You must be logged in to view your library.
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

  return (
    <div className="w-full max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-12">
      
      {/* ── Watch History Section ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-[hsl(var(--red))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">History</h2>
          <Link to="/history" className="ml-auto text-sm font-semibold text-[hsl(var(--red))] hover:underline">
            View All
          </Link>
        </div>

        {isHistoryLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
          </div>
        ) : history?.length === 0 ? (
          <EmptyState
            title="No watch history"
            description="You haven't watched any videos yet."
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {history?.map((video) => (
              <div key={video._id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        )}
      </section>

      <hr className="border-[hsl(var(--border))]" />

      {/* ── Playlists Section ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <ListVideo className="w-6 h-6 text-[hsl(var(--red))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Playlists</h2>
        </div>

        {isPlaylistsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
          </div>
        ) : playlists?.length === 0 ? (
          <EmptyState
            title="No playlists"
            description="You haven't created any playlists yet."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {playlists?.map((playlist) => (
              <PlaylistCard key={playlist._id} playlist={playlist} />
            ))}
          </div>
        )}
      </section>

      <hr className="border-[hsl(var(--border))]" />

      {/* ── Liked Videos Section ── */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <ThumbsUp className="w-6 h-6 text-[hsl(var(--red))]" />
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Liked Videos</h2>
        </div>

        {isLikedVideosLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
          </div>
        ) : likedVideos?.length === 0 ? (
          <EmptyState
            title="No liked videos"
            description="You haven't liked any videos yet."
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {likedVideos?.map((like) => (
              <div key={like._id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                {/* like.video contains the fully populated video object thanks to our backend aggregation fix */}
                <VideoCard video={like.video} />
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
