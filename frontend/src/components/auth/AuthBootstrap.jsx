import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUser, clearUser, setAuthLoading } from '@/store/slices/authSlice'
import { getCurrentUser } from '@/api/auth.api'

// Silently checks the current session on app boot.
// Renders nothing — purely side-effect based.
//
// Place this inside <Providers> but outside the router outlet
// so it runs exactly once when the app mounts.
export default function AuthBootstrap() {
  const dispatch = useDispatch()

  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      dispatch(setAuthLoading(true))
      try {
        const res = await getCurrentUser()
        if (!cancelled) dispatch(setUser(res.data.data))
      } catch {
        if (!cancelled) dispatch(clearUser())
      }
    }

    checkAuth()
    return () => { cancelled = true }
  }, [dispatch])

  return null
}
