import { useState, useRef } from 'react'
import Avatar from '@/components/shared/Avatar'
import { useSelector } from 'react-redux'
import { Loader2, Image as ImageIcon, X } from 'lucide-react'

export default function TweetComposer({ onSubmit, isLoading, initialValue = '', initialImage = null, autoFocus = false, onCancel }) {
  const [content, setContent] = useState(initialValue)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialImage)
  const [imageRemoved, setImageRemoved] = useState(false)
  const fileInputRef = useRef(null)
  const currentUser = useSelector((state) => state.auth.user)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImageRemoved(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
    setImageRemoved(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim() || isLoading) return
    
    let submittedImage = undefined;
    if (image) {
      submittedImage = image; // New file
    } else if (imageRemoved) {
      submittedImage = null; // Tell backend to delete
    } // else undefined, leave it alone

    onSubmit({ content, image: submittedImage }, () => {
      setContent('')
      setImage(null)
      setImagePreview(null)
      setImageRemoved(false)
    })
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
        
        {imagePreview && (
          <div className="relative inline-block mt-2">
            <img src={imagePreview} alt="Preview" className="max-h-60 rounded-xl object-contain bg-black/10" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[hsl(var(--red))] hover:bg-[hsl(var(--red))/10] rounded-full transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex gap-2">
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
      </div>
    </form>
  )
}
