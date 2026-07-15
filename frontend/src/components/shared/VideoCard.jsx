import { Link } from 'react-router-dom'
import { formatCount, formatDuration, timeAgo } from '@/lib/utils'
import Avatar from './Avatar'

export default function VideoCard({ video }) {
  if (!video) return null

  return (
    <div className="flex flex-col gap-3 group cursor-pointer w-full">
      {/* Thumbnail Container */}
      <Link to={`/watch/${video._id}`} className="relative aspect-video w-full rounded-xl overflow-hidden bg-white/5">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Duration badge */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>
      </Link>

      {/* Details Container */}
      <div className="flex gap-3 items-start px-0.5">
        {/* Owner Avatar */}
        <Link to={`/c/${video.owner?.username}`} className="shrink-0 mt-0.5">
          <Avatar src={video.owner?.avatar} alt={video.owner?.fullName} size="md" />
        </Link>

        {/* Text Details */}
        <div className="flex flex-col overflow-hidden">
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
            className="flex items-center text-xs gap-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <span>{formatCount(video.views)} views</span>
            <span className="text-[10px]">•</span>
            <span>{timeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
