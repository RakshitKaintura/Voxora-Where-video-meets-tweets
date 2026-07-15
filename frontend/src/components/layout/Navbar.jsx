import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Menu, Upload, Bell, LogOut, Settings, User, LayoutDashboard } from 'lucide-react'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { useState, useRef, useEffect } from 'react'
import Avatar from '@/components/shared/Avatar'
import { useLogout } from '@/hooks/useAuth'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const logoutMutation = useLogout()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 flex h-14 items-center justify-between gap-4 px-4 border-b"
      style={{
        backgroundColor: 'hsl(var(--background) / 0.95)',
        borderColor: 'hsl(var(--border))',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
        </button>

        <Link to="/" className="flex items-center gap-1.5 font-bold text-xl tracking-tight">
          <span
            className="px-1.5 py-0.5 rounded text-sm font-black"
            style={{ backgroundColor: 'hsl(var(--red))', color: 'white' }}
          >
            YT
          </span>
          <span style={{ color: 'hsl(var(--foreground))' }}>Verse</span>
        </Link>
      </div>

      {/* Center: Search bar */}
      <form onSubmit={handleSearch} className="flex flex-1 max-w-xl items-center">
        <div className="relative flex w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, tweets, channels..."
            className="w-full h-9 rounded-l-full border pl-4 pr-3 text-sm outline-none focus:ring-1"
            style={{
              backgroundColor: 'hsl(var(--input))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          />
          <button
            type="submit"
            className="flex h-9 w-14 items-center justify-center rounded-r-full border-y border-r transition-colors hover:bg-white/10"
            style={{ borderColor: 'hsl(var(--border))', backgroundColor: 'hsl(var(--secondary))' }}
            aria-label="Search"
          >
            <Search className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
        </div>
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {isAuthenticated ? (
          <>
            {/* Upload button */}
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-full text-sm font-medium transition-colors hover:bg-white/10"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </Link>

            {/* Notifications */}
            <button
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
            </button>

            {/* User avatar dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="rounded-full ring-2 ring-transparent hover:ring-white/30 transition-all"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <Avatar src={user?.avatar} alt={user?.fullName} size="sm" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-11 w-52 rounded-xl border py-1.5 shadow-2xl z-50"
                  style={{
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                  }}
                >
                  {/* User info header */}
                  <div className="px-4 py-2 border-b mb-1" style={{ borderColor: 'hsl(var(--border))' }}>
                    <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>
                      {user?.fullName}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      @{user?.username}
                    </p>
                  </div>

                  {[
                    { icon: User, label: 'Your channel', to: `/c/${user?.username}` },
                    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                    { icon: Settings, label: 'Settings', to: '/settings' },
                  ].map(({ icon: Icon, label, to }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/8"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      <Icon className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} />
                      {label}
                    </Link>
                  ))}

                  <div className="my-1 border-t" style={{ borderColor: 'hsl(var(--border))' }} />

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      logoutMutation.mutate()
                    }}
                    disabled={logoutMutation.isPending}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-white/8 disabled:opacity-50"
                    style={{ color: 'hsl(var(--destructive))' }}
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Guest state */
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 h-9 flex items-center rounded-full text-sm font-medium border transition-colors hover:bg-white/8"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 h-9 flex items-center rounded-full text-sm font-medium"
              style={{ backgroundColor: 'hsl(var(--red))', color: 'white' }}
            >
              Join
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
