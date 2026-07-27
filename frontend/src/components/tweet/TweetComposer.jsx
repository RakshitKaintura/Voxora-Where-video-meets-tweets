import { useState, useRef, useEffect } from 'react'
import Avatar from '@/components/shared/Avatar'
import { useSelector } from 'react-redux'
import { Loader2, Image as ImageIcon, X, Sparkles } from 'lucide-react'
import { polishTweet } from '@/api/tweet.api'
import { useToast } from '@/components/shared/Toast'

export default function TweetComposer({ onSubmit, isLoading, initialValue = '', initialImage = null, autoFocus = false, onCancel }) {
  const [content, setContent] = useState(initialValue)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialImage)
  const [imageRemoved, setImageRemoved] = useState(false)
  
  const [isPolishing, setIsPolishing] = useState(false)
  const [showPolishMenu, setShowPolishMenu] = useState(false)
  
  const fileInputRef = useRef(null)
  const currentUser = useSelector((state) => state.auth.user)
  const toast = useToast()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.polish-menu-container')) {
        setShowPolishMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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

  const handlePolish = async (tone) => {
    if (!content.trim()) return;
    
    setIsPolishing(true);
    setShowPolishMenu(false);
    try {
      const response = await polishTweet(content, tone);
      // The backend returns an ApiResponse where the payload is in the `data` field
      if (response && response.data && response.data.content) {
        setContent(response.data.content);
        toast.success("Success", "Tweet polished successfully!");
      } else if (response && response.content) {
        // Fallback just in case
        setContent(response.content);
        toast.success("Success", "Tweet polished successfully!");
      }
    } catch (error) {
      toast.error("Failed to polish tweet", error?.response?.data?.message || "Please try again later.");
    } finally {
      setIsPolishing(false);
    }
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

        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 relative">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[hsl(var(--red))] hover:bg-[hsl(var(--red))/10] rounded-full transition-colors disabled:opacity-50"
              title="Upload Image"
              disabled={isLoading || isPolishing}
            >
              <ImageIcon className="w-6 h-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="relative polish-menu-container">
              <button
                type="button"
                onClick={() => setShowPolishMenu(!showPolishMenu)}
                disabled={!content.trim() || isLoading || isPolishing}
                className="flex items-center gap-2 px-5 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--red))] hover:text-[hsl(var(--red))] rounded-full transition-all shadow-sm disabled:opacity-50 text-sm font-bold"
                title="Polish Tweet"
              >
                {isPolishing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span className="hidden sm:inline">Polish</span>
              </button>

              {showPolishMenu && !isPolishing && (
                <div className="absolute top-full left-0 mt-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl shadow-lg p-2 flex flex-col gap-1 z-10 w-48 animate-in fade-in slide-in-from-top-2">
                  <button type="button" onClick={() => handlePolish('grammar')} className="text-left px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">Fix Grammar</button>
                  <button type="button" onClick={() => handlePolish('professional')} className="text-left px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">Make Professional</button>
                  <button type="button" onClick={() => handlePolish('funny')} className="text-left px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">Make Funnier</button>
                  <button type="button" onClick={() => handlePolish('hype')} className="text-left px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">Build Hype 🔥</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium rounded-full hover:bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors"
                disabled={isLoading || isPolishing}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || isLoading || isPolishing}
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
