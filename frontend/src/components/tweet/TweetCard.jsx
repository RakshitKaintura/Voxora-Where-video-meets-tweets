import { useState } from 'react'
import { MoreVertical, ThumbsUp, Trash2, Edit2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Avatar from '@/components/shared/Avatar'
import { formatCount, timeAgo } from '@/lib/utils'
import { useDeleteTweet, useUpdateTweet } from '@/hooks/useTweets'
import { useToggleTweetLike } from '@/hooks/useLike'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import TweetComposer from './TweetComposer'

export default function TweetCard({ tweet }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const currentUser = useSelector((state) => state.auth.user)
  const isOwner = currentUser?._id === tweet?.owner?._id

  // Mutations
  const { mutate: deleteTweet, isLoading: isDeleting } = useDeleteTweet()
  const { mutate: updateTweet, isLoading: isUpdating } = useUpdateTweet()
  const { mutate: toggleLike } = useToggleTweetLike()

  if (!tweet) return null

  const handleUpdate = (content, resetForm) => {
    updateTweet(
      { tweetId: tweet._id, content },
      {
        onSuccess: () => {
          setIsEditing(false)
          if (resetForm) resetForm()
        },
      }
    )
  }

  const handleDelete = () => {
    deleteTweet(tweet._id, {
      onSuccess: () => setShowDeleteDialog(false),
    })
  }

  return (
    <div className="flex gap-4 p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-colors group">
      <Link to={`/c/${tweet.owner?.username}`} className="shrink-0">
        <Avatar src={tweet.owner?.avatar} alt={tweet.owner?.fullName} size="md" />
      </Link>

      <div className="flex flex-col flex-1 gap-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link
            to={`/c/${tweet.owner?.username}`}
            className="text-sm font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--red))] transition-colors"
          >
            {tweet.owner?.fullName}
          </Link>
          <Link
            to={`/c/${tweet.owner?.username}`}
            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            @{tweet.owner?.username}
          </Link>
          <span className="text-xs text-[hsl(var(--muted-foreground))] flex-1 text-right sm:text-left sm:flex-none">
            • {timeAgo(tweet.createdAt)}
          </span>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="mt-2">
            <TweetComposer
              initialValue={tweet.content}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              onCancel={() => setIsEditing(false)}
              autoFocus
            />
          </div>
        ) : (
          <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap leading-relaxed">
            {tweet.content}
          </p>
        )}

        {/* Footer actions */}
        {!isEditing && (
          <div className="flex items-center gap-6 mt-2">
            <button
              onClick={() => toggleLike(tweet._id)}
              className={`flex items-center gap-2 p-1.5 -ml-1.5 rounded-full hover:bg-[hsl(var(--muted-foreground))/10] transition-colors ${
                tweet.isLiked ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--red))]'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${tweet.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{formatCount(tweet.likesCount)}</span>
            </button>
          </div>
        )}
      </div>

      {/* Options Menu (Only for Owner) */}
      {isOwner && !isEditing && (
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted-foreground))/10] rounded-full transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 mt-1 w-32 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--red))] hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Tweet"
        description="Are you sure you want to delete this tweet? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  )
}
