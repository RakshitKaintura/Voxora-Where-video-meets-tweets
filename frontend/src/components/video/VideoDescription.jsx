import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import { formatCount, timeAgo } from '@/lib/utils'
import { useToggleVideoLike } from '@/hooks/useLike'
import { useToggleSubscription } from '@/hooks/useSubscription'

export default function VideoDescription({ video }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { mutate: toggleLike } = useToggleVideoLike()
  const { mutate: toggleSubscription, isPending: isTogglingSub } = useToggleSubscription()

  if (!video) return null

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">
        {video.title}
      </h1>

      {/* Action Bar: Channel Info + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Channel Info */}
        <div className="flex items-center gap-4">
          <Link to={`/c/${video.owner?.username}`}>
            <Avatar src={video.owner?.avatar} alt={video.owner?.fullName} size="lg" />
          </Link>
          <div className="flex flex-col">
            <Link
              to={`/c/${video.owner?.username}`}
              className="font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--red))] transition-colors"
            >
              {video.owner?.fullName}
            </Link>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {formatCount(video.owner?.subscribersCount || 0)} subscribers
            </span>
          </div>
          {/* Subscribe Button */}
          <button
            onClick={() => toggleSubscription(video.owner?._id)}
            disabled={isTogglingSub}
            className={`ml-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
              video.owner?.isSubscribed
                ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]'
                : 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--muted-foreground))]'
            }`}
          >
            {video.owner?.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Actions (Like) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleLike(video._id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
              video.isLiked
                ? 'bg-[hsl(var(--red))] text-white'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]'
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${video.isLiked ? 'fill-current' : ''}`} />
            <span>{formatCount(video.likesCount)}</span>
          </button>
        </div>
      </div>

      {/* Description Box */}
      <div
        className="mt-2 bg-[hsl(var(--muted))] rounded-xl p-4 cursor-pointer hover:bg-[hsl(var(--border))] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))] mb-2">
          <span>{formatCount(video.views)} views</span>
          <span>•</span>
          <span>{timeAgo(video.createdAt)}</span>
        </div>
        
        <div
          className={`text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap ${
            !isExpanded ? 'line-clamp-2' : ''
          }`}
        >
          {video.description}
        </div>
        
        <button
          className="mt-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>
    </div>
  )
}
