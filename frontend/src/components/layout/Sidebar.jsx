import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Home,
  TrendingUp,
  Users,
  MessageSquare,
  Library,
  LayoutDashboard,
  Settings,
  Clock,
  ThumbsUp,
  ListVideo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_SECTIONS = [
  {
    items: [
      { icon: Home, label: 'Home', to: '/' },
      { icon: TrendingUp, label: 'Trending', to: '/search?sort=popular' },
      { icon: Users, label: 'Subscriptions', to: '/subscriptions' },
    ],
  },
  {
    label: 'You',
    items: [
      { icon: Library, label: 'Library', to: '/library' },
      { icon: Clock, label: 'History', to: '/library?tab=history' },
      { icon: ListVideo, label: 'Playlists', to: '/library?tab=playlists' },
      { icon: ThumbsUp, label: 'Liked videos', to: '/library?tab=liked' },
    ],
  },
  {
    label: 'Create',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
      { icon: MessageSquare, label: 'Tweets', to: '/tweets' },
    ],
  },
  {
    items: [
      { icon: Settings, label: 'Settings', to: '/settings' },
    ],
  },
]

export default function Sidebar() {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen)

  return (
    <aside
      className={cn(
        'h-full overflow-y-auto shrink-0 transition-all duration-300 py-2',
        sidebarOpen ? 'w-56' : 'w-16'
      )}
      style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
    >
      {NAV_SECTIONS.map((section, sIdx) => (
        <div key={sIdx} className="mb-2">
          {/* Section label */}
          {section.label && sidebarOpen && (
            <p
              className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {section.label}
            </p>
          )}
          {section.label && sidebarOpen && (
            <div className="mx-3 mb-1 h-px" style={{ backgroundColor: 'hsl(var(--border))' }} />
          )}

          {/* Nav items */}
          {section.items.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 mx-2 rounded-xl text-sm font-medium transition-all duration-150',
                  sidebarOpen ? 'justify-start' : 'justify-center',
                  isActive
                    ? 'font-semibold'
                    : 'hover:opacity-100 opacity-70 hover:bg-white/8'
                )
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'hsl(var(--accent))' : 'transparent',
                color: 'hsl(var(--foreground))',
              })}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  )
}
