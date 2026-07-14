import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Home, TrendingUp, Users, MessageSquare, Library,
  LayoutDashboard, Settings, Clock, ThumbsUp, ListVideo, X,
} from 'lucide-react'
import { setSidebarOpen } from '@/store/slices/uiSlice'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: TrendingUp, label: 'Trending', to: '/search?sort=popular' },
  { icon: Users, label: 'Subscriptions', to: '/subscriptions' },
  { icon: Library, label: 'Library', to: '/library' },
  { icon: Clock, label: 'History', to: '/library?tab=history' },
  { icon: ListVideo, label: 'Playlists', to: '/library?tab=playlists' },
  { icon: ThumbsUp, label: 'Liked videos', to: '/library?tab=liked' },
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: MessageSquare, label: 'Tweets', to: '/tweets' },
  { icon: Settings, label: 'Settings', to: '/settings' },
]

export default function MobileMenu() {
  const dispatch = useDispatch()
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen)
  const close = () => dispatch(setSidebarOpen(false))

  // Lock body scroll when open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'hsl(0 0% 0% / 0.6)' }}
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Slide-over panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col py-4 transition-transform duration-300 ease-in-out md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          width: '240px',
          backgroundColor: 'hsl(var(--sidebar-bg))',
          borderRight: '1px solid hsl(var(--border))',
        }}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 mb-4">
          <span className="font-bold text-lg" style={{ color: 'hsl(var(--foreground))' }}>
            Menu
          </span>
          <button
            onClick={close}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" style={{ color: 'hsl(var(--foreground))' }} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={close}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'font-semibold'
                    : 'opacity-70 hover:opacity-100 hover:bg-white/8'
                )
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'hsl(var(--accent))' : 'transparent',
                color: 'hsl(var(--foreground))',
              })}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
