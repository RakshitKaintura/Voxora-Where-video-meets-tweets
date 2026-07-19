import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Camera, Loader2, Save } from 'lucide-react'
import { 
  useUpdateAccountDetails, 
  useChangePassword, 
  useUpdateAvatar, 
  useUpdateCoverImage 
} from '@/hooks/useUser'
import { useToast } from '@/components/shared/Toast'
import Avatar from '@/components/shared/Avatar'
// Note: In a real app we'd also update the redux state on success, 
// but invalidating the queries is sufficient if we fetch `current-user` again, 
// or we can just trigger a page reload/refetch to sync auth state.

export default function SettingsPage() {
  const toast = useToast()
  const { user } = useSelector((state) => state.auth)
  
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const { mutate: updateAccount, isLoading: isUpdatingAccount } = useUpdateAccountDetails()
  const { mutate: changePassword, isLoading: isChangingPassword } = useChangePassword()
  const { mutate: updateAvatar, isLoading: isUpdatingAvatar } = useUpdateAvatar()
  const { mutate: updateCoverImage, isLoading: isUpdatingCover } = useUpdateCoverImage()

  if (!user) {
    return <div className="p-8 text-center">Please sign in to view settings.</div>
  }

  // --- Handlers ---
  const handleAccountUpdate = (e) => {
    e.preventDefault()
    if (!fullName || !email) return
    updateAccount(
      { fullName, email },
      {
        onSuccess: () => toast.success('Profile updated', 'Your account details have been saved.'),
        onError: (err) => toast.error('Update failed', err.response?.data?.message || 'Failed to update account.')
      }
    )
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) return
    changePassword(
      { oldPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated', 'Your password has been changed successfully.')
          setOldPassword('')
          setNewPassword('')
        },
        onError: (err) => toast.error('Password change failed', err.response?.data?.message || 'Failed to change password.')
      }
    )
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    
    updateAvatar(formData, {
      onSuccess: () => toast.success('Avatar updated', 'Your profile picture has been updated.'),
      onError: (err) => toast.error('Avatar update failed', err.response?.data?.message || 'Failed to update avatar.')
    })
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('coverImage', file)
    
    updateCoverImage(formData, {
      onSuccess: () => toast.success('Cover updated', 'Your channel cover image has been updated.'),
      onError: (err) => toast.error('Cover update failed', err.response?.data?.message || 'Failed to update cover image.')
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 pb-20">
      <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">Settings</h1>

      {/* ── Visual Customization ── */}
      <section className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[hsl(var(--border))]">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Channel Customization</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Update your profile picture and cover banner.</p>
        </div>
        
        <div className="p-6 flex flex-col gap-8">
          
          {/* Cover Image */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Cover Banner</label>
            <div className="w-full h-32 sm:h-48 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] relative overflow-hidden group">
              {user.coverImage ? (
                <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                  No cover image
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverChange} className="hidden" />
                <button 
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUpdatingCover}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-semibold backdrop-blur-sm transition-colors disabled:opacity-50"
                >
                  {isUpdatingCover ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  Change Cover
                </button>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar src={user.avatar} alt={user.fullName} size="2xl" className="ring-4 ring-[hsl(var(--muted))]" />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUpdatingAvatar}
                    className="text-white disabled:opacity-50"
                  >
                    {isUpdatingAvatar ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Recommended: 800x800px or larger.</span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">PNG or JPG.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Basic Info ── */}
      <section className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[hsl(var(--border))]">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Account Details</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Update your personal information.</p>
        </div>
        
        <form onSubmit={handleAccountUpdate} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--red))]/50 transition-all max-w-md"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--red))]/50 transition-all max-w-md"
            />
          </div>

          <div>
            <button 
              type="submit"
              disabled={isUpdatingAccount || (fullName === user.fullName && email === user.email)}
              className="flex items-center gap-2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-6 py-2.5 rounded-full font-bold hover:bg-[hsl(var(--muted-foreground))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* ── Password ── */}
      <section className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[hsl(var(--border))]">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Change Password</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Ensure your account is using a long, random password to stay secure.</p>
        </div>
        
        <form onSubmit={handlePasswordChange} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--red))]/50 transition-all max-w-md"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[hsl(var(--foreground))]">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl px-4 py-3 text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--red))]/50 transition-all max-w-md"
            />
          </div>

          <div>
            <button 
              type="submit"
              disabled={isChangingPassword || !oldPassword || !newPassword}
              className="flex items-center gap-2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-6 py-2.5 rounded-full font-bold hover:bg-[hsl(var(--muted-foreground))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </form>
      </section>

    </div>
  )
}
