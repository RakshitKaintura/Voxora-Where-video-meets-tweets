import { useSelector } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { History, ListVideo, ThumbsUp, Loader2 } from 'lucide-react'
import { useUserPlaylists } from '@/hooks/usePlaylists'
import api from '@/api/axios'
import { useQuery } from '@tanstack/react-query'
import PlaylistCard from '@/components/playlist/PlaylistCard'
import VideoCard from '@/components/shared/VideoCard'
import EmptyState from '@/components/shared/EmptyState'

function useWatchHistory() {
  return useQuery({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      const res = await api.get('/users/history')
      return res.data.data
    },
  })
}

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
  const [searchParams] = useSearchParams()
  const currentTab = searchParams.get('tab')
  
  const { data: playlists, isLoading: isPlaylistsLoading } = useUserPlaylists(user?._id)
  const { data: history, isLoading: isHistoryLoading } = useWatchHistory()
  const { data: likedVideos, isLoading: isLikedVideosLoading } = useLikedVideos()

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="bg-[hsl(var(--muted))] rounded-xl p-8 text-center border border-[hsl(var(--border))] max-w-md w-full">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Sign in required</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">You must be logged in to view your library.</p>
          <Link to="/login" className="inline-flex px-6 py-2 rounded-full bg-[hsl(var(--red))] text-white font-semibold hover:bg-[hsl(var(--red))/90] transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  const renderHorizontalList = (items, Component, itemPropName, idField) => (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
      {items?.map((item) => (
        <div key={item[idField] || item._id} className="min-w-[280px] sm:min-w-[320px] snap-start">
          <Component {...{ [itemPropName]: item }} />
        </div>
      ))}
    </div>
  )

  const renderGrid = (items, Component, itemPropName, idField) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {items?.map((item) => (
        <Component key={item[idField] || item._id} {...{ [itemPropName]: item }} />
      ))}
    </div>
  )

  const showAll = !currentTab
  const showHistory = showAll || currentTab === 'history'
  const showPlaylists = showAll || currentTab === 'playlists'
  const showLiked = showAll || currentTab === 'liked'

  return (
    <div className="w-full max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-12">
      
      {/* ── Watch History Section ── */}
      {showHistory && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <History className="w-6 h-6 text-[hsl(var(--red))]" />
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">History</h2>
            {showAll && (
              <Link to="/library?tab=history" className="ml-auto text-sm font-semibold text-[hsl(var(--red))] hover:underline">
                View All
              </Link>
            )}
          </div>

          {isHistoryLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
            </div>
          ) : history?.length === 0 ? (
            <EmptyState title="No watch history" description="You haven't watched any videos yet." />
          ) : showAll ? (
            renderHorizontalList(history, VideoCard, 'video', '_id')
          ) : (
            renderGrid(history, VideoCard, 'video', '_id')
          )}
        </section>
      )}

      {showAll && <hr className="border-[hsl(var(--border))]" />}

      {/* ── Playlists Section ── */}
      {showPlaylists && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ListVideo className="w-6 h-6 text-[hsl(var(--red))]" />
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Playlists</h2>
            {showAll && (
              <Link to="/library?tab=playlists" className="ml-auto text-sm font-semibold text-[hsl(var(--red))] hover:underline">
                View All
              </Link>
            )}
          </div>

          {isPlaylistsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
            </div>
          ) : playlists?.length === 0 ? (
            <EmptyState title="No playlists" description="You haven't created any playlists yet." />
          ) : showAll ? (
            renderHorizontalList(playlists, PlaylistCard, 'playlist', '_id')
          ) : (
            renderGrid(playlists, PlaylistCard, 'playlist', '_id')
          )}
        </section>
      )}

      {showAll && <hr className="border-[hsl(var(--border))]" />}

      {/* ── Liked Videos Section ── */}
      {showLiked && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <ThumbsUp className="w-6 h-6 text-[hsl(var(--red))]" />
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Liked Videos</h2>
            {showAll && (
              <Link to="/library?tab=liked" className="ml-auto text-sm font-semibold text-[hsl(var(--red))] hover:underline">
                View All
              </Link>
            )}
          </div>

          {isLikedVideosLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
            </div>
          ) : likedVideos?.length === 0 ? (
            <EmptyState title="No liked videos" description="You haven't liked any videos yet." />
          ) : showAll ? (
            renderHorizontalList(likedVideos.map(l => l.video), VideoCard, 'video', '_id')
          ) : (
            renderGrid(likedVideos.map(l => l.video), VideoCard, 'video', '_id')
          )}
        </section>
      )}

    </div>
  )
}
