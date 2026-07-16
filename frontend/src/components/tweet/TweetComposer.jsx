import { useState } from 'react'
import Avatar from '@/components/shared/Avatar'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'

export default function TweetComposer({ onSubmit, isLoading, initialValue = '', autoFocus = false, onCancel }) {
  const [content, setContent] = useState(initialValue)
  const currentUser = useSelector((state) => state.auth.user)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim() || isLoading) return
    onSubmit(content, () => setContent(''))
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-start w-full bg-[hsl(var(--muted))] p-4 rounded-xl border border-[hsl(var(--border))] shadow-sm">
      <Avatar src={currentUser?.avatar} alt={currentUser?.fullName} size="lg" />
      <div className="flex flex-col w-full gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={initialValue ? "Edit your tweet..." : "What's happening?"}
          autoFocus={autoFocus}
          rows={3}
          className="w-full bg-transparent border-none resize-none focus:outline-none py-1 text-base text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
          disabled={isLoading}
        />
        <div className="flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-full hover:bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || isLoading}
            className="flex items-center justify-center min-w-[90px] px-5 py-2 text-sm font-bold rounded-full bg-[hsl(var(--red))] text-white hover:bg-[hsl(var(--red))/90] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialValue ? 'Update' : 'Post')}
          </button>
        </div>
      </div>
    </form>
  )
}
