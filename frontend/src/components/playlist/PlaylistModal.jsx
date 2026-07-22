import { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import {
  useUserPlaylists,
  useAddVideoToPlaylist,
  useRemoveVideoFromPlaylist,
  useCreatePlaylist,
} from '@/hooks/usePlaylists'

export default function PlaylistModal({ videoId, isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: playlists, isLoading } = useUserPlaylists(user?._id)
  
  const { mutate: addVideo } = useAddVideoToPlaylist()
  const { mutate: removeVideo } = useRemoveVideoFromPlaylist()
  const { mutate: createPlaylist, isPending: isCreating } = useCreatePlaylist()

  if (!isOpen) return null

  const handleToggle = (playlist, isChecked) => {
    if (isChecked) {
      addVideo({ videoId, playlistId: playlist._id })
    } else {
      removeVideo({ videoId, playlistId: playlist._id })
    }
  }

  const handleCreate = (e) => {
    e.preventDefault()
    if (!name.trim() || !description.trim()) return

    createPlaylist(
      { name, description },
      {
        onSuccess: (res) => {
          // Immediately add the video to the newly created playlist
          const newPlaylistId = res.data.data._id
          addVideo({ videoId, playlistId: newPlaylistId })
          setShowCreate(false)
          setName('')
          setDescription('')
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">Save video to...</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <X className="w-5 h-5 text-[hsl(var(--foreground))]" />
          </button>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto max-h-[40vh] p-4 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--red))]" />
            </div>
          ) : playlists?.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-2">
              You don't have any playlists yet.
            </p>
          ) : (
            playlists?.map((playlist) => {
              // The backend now returns the videos array containing object IDs
              const isChecked = playlist.videos?.includes(videoId)
              return (
                <label
                  key={playlist._id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked || false}
                    onChange={(e) => handleToggle(playlist, e.target.checked)}
                    className="w-5 h-5 accent-[hsl(var(--red))] cursor-pointer bg-[hsl(var(--muted))] border-[hsl(var(--border))] rounded"
                  />
                  <span className="text-sm font-medium text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--red))] transition-colors line-clamp-1">
                    {playlist.name}
                  </span>
                </label>
              )
            })
          )}
        </div>

        {/* Create New Playlist Section */}
        <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))/30]">
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 text-[hsl(var(--foreground))] hover:text-[hsl(var(--red))] font-medium text-sm transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create new playlist
            </button>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                required
                className="w-full bg-transparent border-b border-[hsl(var(--border))] focus:border-[hsl(var(--foreground))] pb-1 text-sm text-[hsl(var(--foreground))] outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={150}
                required
                className="w-full bg-transparent border-b border-[hsl(var(--border))] focus:border-[hsl(var(--foreground))] pb-1 text-sm text-[hsl(var(--foreground))] outline-none transition-colors"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--border))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !name.trim() || !description.trim()}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[hsl(var(--red))] text-white hover:bg-[hsl(var(--red))/90] transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
