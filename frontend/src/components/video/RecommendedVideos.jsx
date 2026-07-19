import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useVideos } from '@/hooks/useVideos'
import { formatCount, timeAgo } from '@/lib/utils'
import Avatar from '@/components/shared/Avatar'

function CompactVideoCard({ video }) {
  return (
    <div className="flex gap-3 group cursor-pointer w-full">
      {/* Thumbnail */}
      <Link to={`/watch/${video._id}`} className="relative aspect-video w-[140px] shrink-0 rounded-xl overflow-hidden bg-white/5">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 min-w-0 py-0.5">
        <Link
          to={`/watch/${video._id}`}
          className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-[hsl(var(--red))] transition-colors"
          style={{ color: 'hsl(var(--foreground))' }}
          title={video.title}
        >
          {video.title}
        </Link>
        
        <Link
          to={`/c/${video.owner?.username}`}
          className="text-xs mt-1 transition-colors hover:text-[hsl(var(--foreground))]"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {video.owner?.fullName || video.owner?.username}
        </Link>

        <div
          className="flex items-center text-xs gap-1 mt-0.5"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <span>{formatCount(video.views)} views</span>
          <span className="text-[10px]">•</span>
          <span>{timeAgo(video.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default function RecommendedVideos({ currentVideo }) {
  // Extract a pseudo-tag from the current video title (e.g. first word > 3 chars, or just the first word)
  const query = useMemo(() => {
    if (!currentVideo?.title) return ''
    const words = currentVideo.title.split(' ').filter(w => w.length > 3)
    return words.length > 0 ? words[0] : currentVideo.title.split(' ')[0]
  }, [currentVideo])

  const { data, isLoading, isError } = useVideos({ query })

  // Flatten and filter out the current video
  const recommendations = useMemo(() => {
    const all = data?.pages?.flatMap(page => page.videos) || []
    return all.filter(v => v._id !== currentVideo?._id).slice(0, 10) // show up to 10 recommendations
  }, [data, currentVideo])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Recommended</h3>
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--red))]" />
        </div>
      </div>
    )
  }

  if (isError || recommendations.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Recommended</h3>
        <div className="bg-[hsl(var(--muted))] rounded-xl p-6 text-center border border-[hsl(var(--border))] border-dashed">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No similar videos found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
        Recommended
      </h3>
      <div className="flex flex-col gap-3">
        {recommendations.map(video => (
          <CompactVideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  )
}
