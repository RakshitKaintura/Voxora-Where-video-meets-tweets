import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ThumbsUp, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import { formatCount, timeAgo } from '@/lib/utils'
import { useToggleVideoLike } from '@/hooks/useLike'
import { useToggleSubscription } from '@/hooks/useSubscription'
import PlaylistModal from '@/components/playlist/PlaylistModal'
import { FolderPlus } from 'lucide-react'
import { getVideoSummary } from '@/api/video.api'

export default function VideoDescription({ video }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
  
  const [summary, setSummary] = useState(video?.summary || null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState(null)

  const handleGenerateSummary = async (e) => {
    e.stopPropagation();
    if (summary) return;
    
    setIsGeneratingSummary(true);
    setSummaryError(null);
    try {
      const res = await getVideoSummary(video._id);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setSummaryError("Failed to generate AI summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

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

        {/* Actions (Like & Save) */}
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
          <button
            onClick={() => setIsPlaylistModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))]"
          >
            <FolderPlus className="w-5 h-5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Description Box */}
      <div
        className="mt-2 bg-[hsl(var(--muted))] rounded-xl p-4 cursor-pointer hover:bg-[hsl(var(--border))] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))]">
            <span>{formatCount(video.views)} views</span>
            <span>•</span>
            <span>{timeAgo(video.createdAt)}</span>
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary || summary}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              summary 
                ? 'bg-purple-500/20 text-purple-400 cursor-default' 
                : 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-purple-500 hover:text-white'
            }`}
          >
            {isGeneratingSummary ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{summary ? 'AI Summary Generated' : '✨ AI Summary'}</span>
          </button>
        </div>

        {summaryError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {summaryError}
          </div>
        )}

        {summary && (
          <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <h3 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Summary
            </h3>
            <ul className="space-y-2">
              {summary.split('\n').map((point, idx) => {
                const cleanPoint = point.replace(/^-\s*/, '');
                return cleanPoint ? (
                  <li key={idx} className="text-sm text-[hsl(var(--foreground))] flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{cleanPoint}</span>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
        
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

      <PlaylistModal 
        videoId={video._id}
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
    </div>
  )
}
