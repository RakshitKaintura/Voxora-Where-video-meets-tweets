import { useState } from 'react'
import { MoreVertical, ThumbsUp, Trash2, Edit2, MessageCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Avatar from '@/components/shared/Avatar'
import { formatCount, timeAgo } from '@/lib/utils'
import { useDeleteComment, useUpdateComment, useAddComment, useCommentReplies } from '@/hooks/useComments'
import { useToggleCommentLike } from '@/hooks/useLike'
import CommentInput from './CommentInput'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

export default function CommentCard({ comment, isReply = false }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const currentUser = useSelector((state) => state.auth.user)
  const isOwner = currentUser?._id === comment?.owner?._id

  // Mutations
  const { mutate: deleteComment, isLoading: isDeleting } = useDeleteComment()
  const { mutate: updateComment, isLoading: isUpdating } = useUpdateComment()
  const { mutate: toggleLike } = useToggleCommentLike()
  const { mutate: addReply, isLoading: isAddingReply } = useAddComment()

  // Fetch replies
  const { 
    data: repliesData, 
    isLoading: isRepliesLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useCommentReplies(showReplies ? comment._id : null)

  const replies = repliesData?.pages?.flatMap(page => page.comments) || []

  if (!comment) return null

  const handleUpdate = (content, resetForm) => {
    updateComment(
      { commentId: comment._id, content, videoId: comment.video },
      {
        onSuccess: () => {
          setIsEditing(false)
          resetForm()
        },
      }
    )
  }

  const handleReplySubmit = (content, resetForm) => {
    addReply(
      { videoId: comment.video, content, parentComment: comment._id },
      {
        onSuccess: () => {
          setIsReplying(false)
          setShowReplies(true)
          if (resetForm) resetForm()
        },
      }
    )
  }

  const handleDelete = () => {
    deleteComment(
      { commentId: comment._id, videoId: comment.video },
      {
        onSuccess: () => setShowDeleteDialog(false),
      }
    )
  }

  return (
    <div className="flex gap-4 group">
      <Link to={`/c/${comment.owner?.username}`}>
        <Avatar src={comment.owner?.avatar} alt={comment.owner?.fullName} size="md" />
      </Link>

      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-center gap-2">
          <Link
            to={`/c/${comment.owner?.username}`}
            className="text-sm font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--red))] transition-colors"
          >
            {comment.owner?.fullName}
          </Link>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {timeAgo(comment.createdAt)}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <CommentInput
              initialValue={comment.content}
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              onCancel={() => setIsEditing(false)}
              autoFocus
            />
          </div>
        ) : (
          <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => toggleLike({ commentId: comment._id, videoId: comment.video })}
              className={`flex items-center gap-1.5 p-1.5 rounded-full hover:bg-[hsl(var(--muted))] transition-colors ${
                comment.isLiked ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{formatCount(comment.likesCount)}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1.5 p-1.5 rounded-full text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Reply</span>
              </button>
            )}
          </div>
        )}

        {isReplying && !isEditing && (
          <div className="mt-3 w-full">
            <CommentInput 
              onSubmit={handleReplySubmit} 
              isLoading={isAddingReply}
              onCancel={() => setIsReplying(false)}
              autoFocus
            />
          </div>
        )}

        {/* View Replies Toggle */}
        {comment.repliesCount > 0 && !isReply && (
          <div className="mt-1">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-[hsl(var(--blue))] hover:bg-[hsl(var(--blue))/10] rounded-full transition-colors"
            >
              {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}
            </button>
          </div>
        )}

        {/* Replies List */}
        {showReplies && !isReply && (
          <div className="mt-3 flex flex-col gap-4">
            {isRepliesLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--muted-foreground))]" />
              </div>
            ) : (
              replies.map(reply => (
                <CommentCard key={reply._id} comment={reply} isReply={true} />
              ))
            )}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-sm font-medium text-[hsl(var(--blue))] hover:underline self-start"
              >
                {isFetchingNextPage ? 'Loading...' : 'Show more replies'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Options Menu (Only for Owner) */}
      {isOwner && !isEditing && (
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-[hsl(var(--foreground))] opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--muted))] rounded-full transition-all"
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
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  )
}
