import { useState, useRef } from 'react'
import { X, UploadCloud, Image as ImageIcon, Video as VideoIcon, Loader2 } from 'lucide-react'
import { useUploadVideo } from '@/hooks/useVideos'
import { useToast } from '@/components/shared/Toast'

export default function VideoUploadModal({ isOpen, onClose }) {
  const toast = useToast()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)

  const videoInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)

  const { mutate: uploadVideo, isPending: isLoading } = useUploadVideo()

  if (!isOpen) return null

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
    } else {
      toast.error('Invalid file', 'Please select a valid video file.')
    }
  }

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file)
    } else {
      toast.error('Invalid file', 'Please select a valid image file.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || !videoFile || !thumbnailFile) {
      toast.error('Missing fields', 'Please fill in all fields and select both files.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('videoFile', videoFile)
    formData.append('thumbnail', thumbnailFile)

    uploadVideo(formData, {
      onSuccess: () => {
        toast.success('Upload complete', 'Your video has been published!')
        handleClose()
      },
      onError: (err) => {
        toast.error('Upload failed', err.response?.data?.message || 'Something went wrong.')
      }
    })
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setVideoFile(null)
    setThumbnailFile(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isLoading ? handleClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))] shrink-0">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Upload Video</h2>
          <button 
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Title <span className="text-[hsl(var(--red))]">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title that describes your video"
                disabled={isLoading}
                className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--red))]/50 transition-all"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Description <span className="text-[hsl(var(--red))]">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                disabled={isLoading}
                rows={4}
                className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--red))]/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Video File Picker */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Video File <span className="text-[hsl(var(--red))]">*</span>
                </span>
                <input
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  onChange={handleVideoSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => videoInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-all ${
                    videoFile 
                      ? 'bg-[hsl(var(--red))]/5 border-[hsl(var(--red))]/30 text-[hsl(var(--red))] hover:bg-[hsl(var(--red))]/10' 
                      : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground))]/10 hover:border-[hsl(var(--muted-foreground))]/50'
                  }`}
                >
                  <VideoIcon className={`w-8 h-8 ${videoFile ? 'text-[hsl(var(--red))]' : ''}`} />
                  <div className="text-center">
                    <p className="font-semibold text-sm line-clamp-1">{videoFile ? videoFile.name : 'Select Video'}</p>
                    <p className="text-xs opacity-70 mt-1">{videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'MP4, WebM, etc.'}</p>
                  </div>
                </button>
              </div>

              {/* Thumbnail Picker */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Thumbnail <span className="text-[hsl(var(--red))]">*</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  ref={thumbnailInputRef}
                  onChange={handleThumbnailSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => thumbnailInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-all relative overflow-hidden ${
                    thumbnailFile 
                      ? 'border-[hsl(var(--red))]/30' 
                      : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground))]/10 hover:border-[hsl(var(--muted-foreground))]/50'
                  }`}
                >
                  {thumbnailFile ? (
                    <img 
                      src={URL.createObjectURL(thumbnailFile)} 
                      alt="Thumbnail Preview" 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8" />
                      <div className="text-center">
                        <p className="font-semibold text-sm">Select Thumbnail</p>
                        <p className="text-xs opacity-70 mt-1">JPG, PNG</p>
                      </div>
                    </>
                  )}
                  {/* Change overlay */}
                  {thumbnailFile && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Change</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[hsl(var(--border))] shrink-0 bg-[hsl(var(--muted))]/30">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-full font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="upload-form"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 min-w-[120px] px-6 py-2.5 rounded-full font-semibold bg-[hsl(var(--red))] text-white hover:bg-[hsl(var(--red))/90] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                Publish
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  )
}
