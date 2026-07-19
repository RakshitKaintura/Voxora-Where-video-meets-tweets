import { useParams } from 'react-router-dom'
import { useVideoDetail } from '@/hooks/useVideos'
import VideoPlayer from '@/components/video/VideoPlayer'
import VideoDescription from '@/components/video/VideoDescription'
import CommentSection from '@/components/comment/CommentSection'
import RecommendedVideos from '@/components/video/RecommendedVideos'
import ErrorState from '@/components/shared/ErrorState'
import { Loader2 } from 'lucide-react'

export default function WatchPage() {
  const { videoId } = useParams()
  
  const { data: responseData, isLoading, isError, error, refetch } = useVideoDetail(videoId)
  const video = responseData?.video

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
    <div className="w-full max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 lg:gap-8">
      
      {/* Top Section: Full Width Video & Description */}
      <div className="w-full flex flex-col">
        <VideoPlayer src={video.videoFile} poster={video.thumbnail} />
        <VideoDescription video={video} />
      </div>

      {/* Bottom Section: Comments on left, Recommended on right */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 border-t border-[hsl(var(--border))] pt-6 lg:pt-8 mt-2">
        
        {/* Comments - flex-1 (takes remaining space) */}
        <div className="flex-1 min-w-0">
          <CommentSection videoId={videoId} />
        </div>

        {/* Recommended Videos Sidebar */}
        <div className="w-full lg:w-[350px] xl:w-[400px] flex flex-col shrink-0 gap-6">
          <RecommendedVideos currentVideo={video} />
        </div>

      </div>
    </div>
  )
}
