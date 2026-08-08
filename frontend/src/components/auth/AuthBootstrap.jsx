import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUser, clearUser, setAuthLoading } from '@/store/slices/authSlice'
import { getCurrentUser } from '@/api/auth.api'

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
