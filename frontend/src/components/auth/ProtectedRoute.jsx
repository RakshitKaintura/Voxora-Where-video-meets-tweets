import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Wraps a route element and redirects to /login if the user
// is not authenticated. Preserves the original location so
// we can redirect back after login.
//
// Usage in App.jsx:
//   <Route element={<ProtectedRoute><SomePage /></ProtectedRoute>} />
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth)
  const location = useLocation()

  // While we're checking auth (initial app load), show nothing
  // to avoid a flash of the login page for authenticated users.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-2.5 h-2.5 rounded-full animate-bounce"
              style={{
                backgroundColor: 'hsl(var(--red))',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login, saving current location for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
