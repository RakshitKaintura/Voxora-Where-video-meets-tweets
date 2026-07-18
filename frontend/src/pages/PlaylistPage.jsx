import { useParams, Link } from 'react-router-dom'
import { Loader2, ListVideo, Play } from 'lucide-react'
import { usePlaylistDetail } from '@/hooks/usePlaylists'
import { timeAgo } from '@/lib/utils'
import ErrorState from '@/components/shared/ErrorState'
import VideoCard from '@/components/shared/VideoCard'

export default function PlaylistPage() {
  const { playlistId } = useParams()
  const { data: playlist, isLoading, isError, error, refetch } = usePlaylistDetail(playlistId)

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
          message={error?.response?.data?.message || 'Failed to load playlist'}
          onRetry={refetch}
        />
      </div>
    )
  }

  if (!playlist) return null

  // Assuming playlist.videos is an array of fully populated video objects from the backend aggregation
  const videos = playlist.videos || []
  const coverImage = videos[0]?.thumbnail

  return (
    <div className="w-full max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ── Left Sidebar: Playlist Info ── */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
          <div className="sticky top-24 flex flex-col gap-4 bg-[hsl(var(--muted))] p-6 rounded-2xl border border-[hsl(var(--border))]">
            {/* Cover */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/50 border border-[hsl(var(--border))] relative shadow-md">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListVideo className="w-16 h-16 text-[hsl(var(--muted-foreground))] opacity-50" />
                </div>
              )}
              {/* Overlay shadow for text readability if we had text over it */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50" />
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] break-words">
                {playlist.name}
              </h1>
              
              <div className="flex items-center gap-2 mt-2">
                <Link
                  to={`/c/${playlist.owner?.username}`}
                  className="font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--red))] transition-colors"
                >
                  {playlist.owner?.fullName}
                </Link>
              </div>

              <div className="text-sm text-[hsl(var(--muted-foreground))] flex flex-col gap-0.5 mt-2">
                <span>{playlist.totalVideos || 0} videos</span>
                <span>Last updated {timeAgo(playlist.updatedAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button 
                  className="flex-1 flex items-center justify-center gap-2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--muted-foreground))] py-2.5 rounded-full font-bold transition-colors disabled:opacity-50"
                  disabled={videos.length === 0}
                >
                  <Play className="w-5 h-5 fill-current" /> Play All
                </button>
              </div>

              {/* Description */}
              {playlist.description && (
                <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                  <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap">
                    {playlist.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Content: Video List ── */}
        <div className="flex-1 flex flex-col gap-4">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[hsl(var(--border))] rounded-2xl">
              <ListVideo className="w-16 h-16 text-[hsl(var(--muted-foreground))] mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
                No videos in this playlist
              </h3>
              <p className="text-[hsl(var(--muted-foreground))] max-w-sm">
                Videos added to this playlist will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
