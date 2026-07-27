import { PlaySquare, MessageSquare, ListVideo, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// Shown when a list/feed has no items.
//
// Props:
//  - type: 'video' | 'tweet' | 'playlist' | 'comment' | 'channel' | 'generic'
//  - title: string   — override default title
//  - message: string — override default subtitle
//  - action: ReactNode — optional CTA button
//  - className: string

const PRESETS = {
  video: {
    icon: PlaySquare,
    title: 'No videos yet',
    message: 'Videos uploaded here will appear in this section.',
  },
  tweet: {
    icon: MessageSquare,
    title: 'No tweets yet',
    message: 'Be the first to post something to the community.',
  },
  playlist: {
    icon: ListVideo,
    title: 'No playlists yet',
    message: 'Create your first playlist to organize your videos.',
  },
  comment: {
    icon: MessageSquare,
    title: 'No comments yet',
    message: 'Be the first to share your thoughts.',
  },
  channel: {
    icon: Users,
    title: 'No channels found',
    message: 'Try searching for something else.',
  },
  generic: {
    icon: PlaySquare,
    title: 'Nothing here yet',
    message: 'Content will appear here once available.',
  },
}

export default function EmptyState({
  type = 'generic',
  title,
  message,
  action,
  className,
}) {
  const preset = PRESETS[type] ?? PRESETS.generic
  const Icon = preset.icon

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-20 text-center px-6',
        className
      )}
    >
      {/* Icon container with subtle ring */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'hsl(var(--muted))' }}
      >
        <Icon className="w-9 h-9" style={{ color: 'hsl(var(--muted-foreground))' }} />
      </div>

      <div className="flex flex-col gap-1.5 max-w-xs">
        <p className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
          {title ?? preset.title}
        </p>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {message ?? preset.message}
        </p>
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
