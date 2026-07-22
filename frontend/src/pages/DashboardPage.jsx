import { useState, useRef, useCallback } from 'react'
import { 
  Users, PlaySquare, Eye, Heart, 
  Upload, Loader2, MoreVertical, 
  Trash2, Edit2, CheckCircle2, XCircle, FolderPlus
} from 'lucide-react'
import { useChannelStats, useDashboardVideos } from '@/hooks/useDashboard'
import { useDeleteVideo, useTogglePublishStatus } from '@/hooks/useVideos'
import { formatCount, formatDuration, timeAgo } from '@/lib/utils'
import VideoUploadModal from '@/components/dashboard/VideoUploadModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import ErrorState from '@/components/shared/ErrorState'
import EmptyState from '@/components/shared/EmptyState'
import PlaylistModal from '@/components/playlist/PlaylistModal'
import PlaylistCard from '@/components/playlist/PlaylistCard'
import { useSelector } from 'react-redux'
import { useUserPlaylists } from '@/hooks/usePlaylists'

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="bg-[hsl(var(--muted))] p-6 rounded-2xl border border-[hsl(var(--border))]">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-[hsl(var(--background))] rounded-xl text-[hsl(var(--red))]">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-[hsl(var(--muted-foreground))] font-medium">{title}</span>
          <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{value}</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('videos') // 'videos' or 'playlists'
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [deletingVideoId, setDeletingVideoId] = useState(null)
  const [playlistModalVideoId, setPlaylistModalVideoId] = useState(null)
  
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = useChannelStats()
  const { data: playlists, isLoading: isPlaylistsLoading } = useUserPlaylists(activeTab === 'playlists' ? user?._id : null)
  
  const { 
    data: videosData, 
    isLoading: isVideosLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useDashboardVideos()

  const { mutate: deleteVideo, isLoading: isDeleting } = useDeleteVideo()
  const { mutate: togglePublish, isLoading: isToggling } = useTogglePublishStatus()

  const videos = videosData?.pages?.flatMap((page) => page.videos || []) || []

  // Infinite Scroll
  const observer = useRef()
  const lastElementRef = useCallback(
    (node) => {
      if (isVideosLoading || isFetchingNextPage) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      if (node) observer.current.observe(node)
    },
    [isVideosLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  const handleDelete = () => {
    if (!deletingVideoId) return
    deleteVideo(deletingVideoId, {
      onSuccess: () => setDeletingVideoId(null)
    })
  }

  if (isStatsError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-4">
        <ErrorState message="Failed to load dashboard stats" onRetry={refetchStats} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
          Channel Dashboard
        </h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[hsl(var(--red))] text-white font-semibold hover:bg-[hsl(var(--red))/90] transition-colors"
        >
          <Upload className="w-5 h-5" /> Upload Video
        </button>
      </div>

      {/* ── Stats Grid ── */}
      {isStatsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-[hsl(var(--muted))] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard icon={Users} title="Total Subscribers" value={formatCount(stats.totalSubscribers)} />
          <StatCard icon={PlaySquare} title="Total Videos" value={formatCount(stats.totalVideos)} />
          <StatCard icon={Eye} title="Total Views" value={formatCount(stats.totalViews)} />
          <StatCard icon={Heart} title="Total Likes" value={formatCount(stats.totalLikes)} />
        </div>
      ) : null}

      {/* ── Tabs ── */}
      <div className="flex gap-8 border-b border-[hsl(var(--border))] mt-4">
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
      </div>

      {activeTab === 'videos' && (
        <div className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[hsl(var(--border))]">
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Your Videos</h2>
          </div>
        
        {isVideosLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--red))]" />
          </div>
        ) : videos.length === 0 ? (
          <div className="py-20">
            <EmptyState title="No videos uploaded" description="Upload a video to see it here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-sm">
                  <th className="px-6 py-4 font-semibold">Video</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Views</th>
                  <th className="px-6 py-4 font-semibold text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {videos.map((video, index) => {
                  const isLast = index === videos.length - 1
                  return (
                    <tr 
                      key={video._id} 
                      ref={isLast ? lastElementRef : null}
                      className="group hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      {/* Video Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-24 aspect-video rounded-md overflow-hidden bg-black/50 shrink-0 relative">
                            <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                              {formatDuration(video.duration)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[hsl(var(--foreground))] line-clamp-2">
                              {video.title}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublish(video._id)}
                          disabled={isToggling}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            video.isPublished 
                              ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20' 
                              : 'bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--muted-foreground))]/20'
                          }`}
                        >
                          {video.isPublished ? (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Published</>
                          ) : (
                            <><XCircle className="w-3.5 h-3.5" /> Hidden</>
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                        {timeAgo(video.createdAt)}
                      </td>

                      {/* Views */}
                      <td className="px-6 py-4 text-sm text-[hsl(var(--muted-foreground))]">
                        {formatCount(video.views)}
                      </td>

                      {/* Options */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPlaylistModalVideoId(video._id)}
                            className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-colors"
                            title="Save to Playlist"
                          >
                            <FolderPlus className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeletingVideoId(video._id)}
                            className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--red))] hover:bg-[hsl(var(--red))]/10 rounded-full transition-colors"
                            title="Delete Video"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {isFetchingNextPage && (
              <div className="flex justify-center py-4 border-t border-[hsl(var(--border))]">
                <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--red))]" />
              </div>
            )}
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
                description="You haven't created any playlists." 
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

      {/* Modals */}
      <VideoUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      
      <ConfirmDialog
        isOpen={!!deletingVideoId}
        onClose={() => setDeletingVideoId(null)}
        onConfirm={handleDelete}
        title="Delete Video"
        description="Are you sure you want to delete this video? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />

      <PlaylistModal 
        videoId={playlistModalVideoId}
        isOpen={!!playlistModalVideoId}
        onClose={() => setPlaylistModalVideoId(null)}
      />
    </div>
  )
}
