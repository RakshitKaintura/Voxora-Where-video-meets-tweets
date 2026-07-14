import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layout
import AppShell from '@/components/layout/AppShell'

// Eagerly loaded (no lazy — these are tiny and hit on every cold load)
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Lazy-loaded pages (code-split — only downloaded when visited)
const WatchPage = lazy(() => import('@/pages/WatchPage'))
const TweetsPage = lazy(() => import('@/pages/TweetsPage'))
const ChannelPage = lazy(() => import('@/pages/ChannelPage'))
const PlaylistPage = lazy(() => import('@/pages/PlaylistPage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const SubscriptionsPage = lazy(() => import('@/pages/SubscriptionsPage'))

// Simple loading fallback while lazy page chunks load
function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center min-h-[60vh]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full bg-white/30 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Auth routes — no shell */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main app routes — wrapped in AppShell (Navbar + Sidebar) */}
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />

        <Route
          path="watch/:videoId"
          element={
            <Suspense fallback={<PageLoader />}>
              <WatchPage />
            </Suspense>
          }
        />

        <Route
          path="tweets"
          element={
            <Suspense fallback={<PageLoader />}>
              <TweetsPage />
            </Suspense>
          }
        />

        <Route
          path="c/:username"
          element={
            <Suspense fallback={<PageLoader />}>
              <ChannelPage />
            </Suspense>
          }
        />

        <Route
          path="playlist/:playlistId"
          element={
            <Suspense fallback={<PageLoader />}>
              <PlaylistPage />
            </Suspense>
          }
        />

        <Route
          path="library"
          element={
            <Suspense fallback={<PageLoader />}>
              <LibraryPage />
            </Suspense>
          }
        />

        <Route
          path="dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          }
        />

        <Route
          path="search"
          element={
            <Suspense fallback={<PageLoader />}>
              <SearchResultsPage />
            </Suspense>
          }
        />

        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          }
        />

        <Route
          path="subscriptions"
          element={
            <Suspense fallback={<PageLoader />}>
              <SubscriptionsPage />
            </Suspense>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
