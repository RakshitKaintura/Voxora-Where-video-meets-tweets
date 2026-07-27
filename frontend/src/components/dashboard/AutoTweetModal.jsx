import { useState, useEffect } from 'react'
import { X, Loader2, Megaphone, Send } from 'lucide-react'
import { generateAnnouncements } from '@/api/tweet.api'
import { useCreateTweet } from '@/hooks/useTweets'
import { useToast } from '@/components/shared/Toast'

export default function AutoTweetModal({ isOpen, onClose, video }) {
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  
  const { mutate: createTweet, isLoading: isCreating } = useCreateTweet()
  const toast = useToast()

  useEffect(() => {
    if (isOpen && video) {
      fetchAnnouncements()
    } else {
      setAnnouncements([])
      setSelectedOption(null)
    }
  }, [isOpen, video])

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const response = await generateAnnouncements(video._id)
      if (response && response.data) {
        setAnnouncements(response.data)
      }
    } catch (error) {
      toast.error('Failed to generate', error?.response?.data?.message || 'Could not generate announcements.')
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePost = () => {
    if (!selectedOption) return

    // Append the video link to the tweet content
    const videoLink = `${window.location.origin}/watch/${video._id}`
    const finalContent = `${selectedOption.content}\n\nWatch here: ${videoLink}`

    createTweet({ content: finalContent }, {
      onSuccess: () => {
        toast.success("Success", "Announcement tweeted successfully!")
        onClose()
      },
      onError: (error) => {
        toast.error("Failed to post tweet", error?.response?.data?.message || "Please try again.")
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[hsl(var(--border))] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[hsl(var(--red))]/10 text-[hsl(var(--red))] rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
              Announce Video
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--red))]" />
              <p className="text-[hsl(var(--muted-foreground))] font-medium">Generating styles with AI...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                Select a tweet style to announce <strong className="text-[hsl(var(--foreground))]">"{video?.title}"</strong>
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {announcements.map((option, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedOption(option)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedOption === option 
                        ? 'border-[hsl(var(--red))] bg-[hsl(var(--red))]/5' 
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--red))]/50 bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-full uppercase tracking-wider">
                        {option.style}
                      </span>
                    </div>
                    <p className="text-[hsl(var(--foreground))] whitespace-pre-wrap">
                      {option.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={!selectedOption || isCreating || isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold bg-[hsl(var(--red))] text-white hover:bg-[hsl(var(--red))]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Post Tweet
          </button>
        </div>
      </div>
    </div>
  )
}
