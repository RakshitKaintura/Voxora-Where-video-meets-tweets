import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Layout
import AppShell from '@/components/layout/AppShell'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Eagerly loaded
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Lazy-loaded pages
const WatchPage         = lazy(() => import('@/pages/WatchPage'))
const TweetsPage        = lazy(() => import('@/pages/TweetsPage'))
const ChannelPage       = lazy(() => import('@/pages/ChannelPage'))
const PlaylistPage      = lazy(() => import('@/pages/PlaylistPage'))
const LibraryPage       = lazy(() => import('@/pages/LibraryPage'))
const DashboardPage     = lazy(() => import('@/pages/DashboardPage'))
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage'))
const SettingsPage      = lazy(() => import('@/pages/SettingsPage'))
const SubscriptionsPage = lazy(() => import('@/pages/SubscriptionsPage'))

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center min-h-[60vh]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: 'hsl(var(--red))', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

/** Redirects to home if already authenticated (for login/register pages) */
function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useSelector((s) => s.auth)
  if (isLoading) return null
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

/** Wraps a lazy page with Suspense */
function Lazy({ component: Component }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      {/* ── Guest-only routes (redirect home if logged in) ── */}
      <Route
        path="/login"
        element={<GuestRoute><LoginPage /></GuestRoute>}
      />
      <Route
        path="/register"
        element={<GuestRoute><RegisterPage /></GuestRoute>}
      />

      {/* ── Main app shell ── */}
      <Route element={<AppShell />}>

        {/* Public */}
        <Route index element={<HomePage />} />
        <Route path="search" element={<Lazy component={SearchResultsPage} />} />
        <Route path="c/:username" element={<Lazy component={ChannelPage} />} />

        {/* Protected */}
        <Route path="watch/:videoId" element={
          <ProtectedRoute><Lazy component={WatchPage} /></ProtectedRoute>
        } />
        <Route path="tweets" element={
          <ProtectedRoute><Lazy component={TweetsPage} /></ProtectedRoute>
        } />
        <Route path="playlist/:playlistId" element={
          <ProtectedRoute><Lazy component={PlaylistPage} /></ProtectedRoute>
        } />
        <Route path="library" element={
          <ProtectedRoute><Lazy component={LibraryPage} /></ProtectedRoute>
        } />
        <Route path="dashboard" element={
          <ProtectedRoute><Lazy component={DashboardPage} /></ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute><Lazy component={SettingsPage} /></ProtectedRoute>
        } />
        <Route path="subscriptions" element={
          <ProtectedRoute><Lazy component={SubscriptionsPage} /></ProtectedRoute>
        } />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

