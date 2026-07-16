import { useParams } from 'react'
import { useVideoDetail } from '@/hooks/useVideos'
import VideoPlayer from '@/components/video/VideoPlayer'
import VideoDescription from '@/components/video/VideoDescription'
import CommentSection from '@/components/comment/CommentSection'
import ErrorState from '@/components/shared/ErrorState'
import { Loader2 } from 'lucide-react'

export default function WatchPage() {
  const { videoId } = useParams()
  
  const { data: video, isLoading, isError, error, refetch } = useVideoDetail(videoId)

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
          message={error?.response?.data?.message || 'Failed to load video'}
          onRetry={refetch}
        />
      </div>
    )
  }

  if (!video) return null

  return (
    <div className="w-full max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Main Content (Player, Description, Comments) */}
        <div className="flex-1 min-w-0">
          <VideoPlayer src={video.videoFile} poster={video.thumbnail} />
          
          <VideoDescription video={video} />
          
          <div className="hidden lg:block mt-8">
            <CommentSection videoId={videoId} />
          </div>
        </div>

        {/* Sidebar (Recommended videos & Mobile comments) */}
        <div className="w-full lg:w-[350px] xl:w-[400px] flex flex-col shrink-0 gap-6">
          
          {/* Mobile/Tablet Comments (placed under video description but above recommendations) */}
          <div className="block lg:hidden">
            <CommentSection videoId={videoId} />
          </div>

          {/* Recommended Videos (Placeholder for future feature) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] hidden lg:block">
              Recommended
            </h3>
            {/* We will populate recommended videos here in the future. For now, empty state or just leave it blank */}
            <div className="bg-[hsl(var(--muted))] rounded-xl p-6 text-center border border-[hsl(var(--border))] border-dashed">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                More videos from this channel will appear here.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
