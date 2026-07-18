import { Link } from 'react-router-dom'
import { Play, ListVideo } from 'lucide-react'
import { formatCount, timeAgo } from '@/lib/utils'

export default function PlaylistCard({ playlist }) {
  if (!playlist) return null

  return (
    <div className="flex flex-col gap-2 group cursor-pointer w-full">
      <Link to={`/playlist/${playlist._id}`} className="relative aspect-video rounded-xl overflow-hidden bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
        {/* Cover Image */}
        {playlist.coverImage ? (
          <img
            src={playlist.coverImage}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListVideo className="w-12 h-12 text-[hsl(var(--muted-foreground))] opacity-50" />
          </div>
        )}
        
        {/* Playlist Stack Effect Overlay */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1 text-white opacity-90 transition-opacity">
          <ListVideo className="w-6 h-6" />
          <span className="text-xs font-semibold">{playlist.totalVideos || 0} videos</span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-2 bg-black/80 px-4 py-2 rounded-full text-white backdrop-blur-sm">
            <Play className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold tracking-wider uppercase">Play All</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col pr-6">
        <Link 
          to={`/playlist/${playlist._id}`} 
          className="text-[hsl(var(--foreground))] font-semibold line-clamp-2 leading-tight group-hover:text-[hsl(var(--red))] transition-colors"
        >
          {playlist.name}
        </Link>
        <span className="text-sm text-[hsl(var(--muted-foreground))] mt-1 line-clamp-1">
          Updated {timeAgo(playlist.updatedAt)}
        </span>
      </div>
    </div>
  )
}
