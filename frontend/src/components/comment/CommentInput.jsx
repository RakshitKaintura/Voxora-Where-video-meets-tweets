import { useState } from 'react'
import Avatar from '@/components/shared/Avatar'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'

export default function CommentInput({ onSubmit, isLoading, initialValue = '', autoFocus = false, onCancel }) {
  const [content, setContent] = useState(initialValue)
  const currentUser = useSelector((state) => state.auth.user)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim() || isLoading) return
    onSubmit(content, () => setContent(''))
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-start w-full">
      <Avatar src={currentUser?.avatar} alt={currentUser?.fullName} size="md" />
      <div className="flex flex-col w-full gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          autoFocus={autoFocus}
          className="w-full bg-transparent border-b border-[hsl(var(--border))] focus:border-[hsl(var(--foreground))] outline-none py-1 text-sm text-[hsl(var(--foreground))] transition-colors"
          disabled={isLoading}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-full hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="flex items-center justify-center min-w-[80px] px-4 py-2 text-sm font-medium rounded-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-[hsl(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Comment'}
          </button>
        </div>
      </div>
    </form>
  )
}
