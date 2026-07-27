import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUser, clearUser, setAuthLoading } from '@/store/slices/authSlice'
import { useToast } from '@/components/shared/Toast'
import * as authApi from '@/api/auth.api'

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const AUTH_KEYS = {
  currentUser: ['auth', 'currentUser'],
}

// ─── useCurrentUser ───────────────────────────────────────────────────────────
// Fetches the logged-in user on app load.
// On success  → dispatches setUser to Redux.
// On failure  → dispatches clearUser (not logged in).
export function useCurrentUser() {
  const dispatch = useDispatch()

  return useQuery({
    queryKey: AUTH_KEYS.currentUser,
    queryFn: async () => {
      try {
        dispatch(setAuthLoading(true))
        const res = await authApi.getCurrentUser()
        dispatch(setUser(res.data.data))
        return res.data.data
      } catch {
        dispatch(clearUser())
        return null
      }
    },
    staleTime: Infinity,      // Don't re-fetch automatically — we manage this manually
    retry: false,
  })
}

// ─── useLogin ─────────────────────────────────────────────────────────────────
export function useLogin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      const user = res.data.data.user
      dispatch(setUser(user))
      queryClient.setQueryData(AUTH_KEYS.currentUser, user)
      toast.success('Welcome back!', `Logged in as ${user.fullName}`)
      navigate('/')
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error('Login failed', message)
    },
  })
}

// ─── useRegister ──────────────────────────────────────────────────────────────
export function useRegister() {
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account created!', `You can now sign in to your account.`)
      navigate('/login')
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Registration failed.'
      toast.error('Registration failed', message)
    },
  })
}

// ─── useLogout ────────────────────────────────────────────────────────────────
export function useLogout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(clearUser())
      queryClient.clear()           // wipe all cached queries
      toast.info('Signed out', 'See you next time!')
      navigate('/login')
    },
    onError: () => {
      // Even if the API call fails, clear local state
      dispatch(clearUser())
      queryClient.clear()
      navigate('/login')
    },
  })
}

// ─── useChangePassword ────────────────────────────────────────────────────────
export function useChangePassword() {
  const toast = useToast()

  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password updated', 'Your password has been changed successfully.')
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to update password.'
      toast.error('Error', message)
    },
  })
}

// ─── useUpdateAccount ─────────────────────────────────────────────────────────
export function useUpdateAccount() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: authApi.updateAccount,
    onSuccess: (res) => {
      const user = res.data.data
      dispatch(setUser(user))
      queryClient.setQueryData(AUTH_KEYS.currentUser, user)
      toast.success('Profile updated', 'Your account details have been saved.')
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to update account.'
      toast.error('Error', message)
    },
  })
}

// ─── useUpdateAvatar ─────────────────────────────────────────────────────────
export function useUpdateAvatar() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: authApi.updateAvatar,
    onSuccess: (res) => {
      const user = res.data.data.user
      dispatch(setUser(user))
      queryClient.setQueryData(AUTH_KEYS.currentUser, user)
      toast.success('Avatar updated!')
    },
    onError: () => toast.error('Error', 'Failed to update avatar.'),
  })
}

// ─── useUpdateCoverImage ──────────────────────────────────────────────────────
export function useUpdateCoverImage() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: authApi.updateCoverImage,
    onSuccess: (res) => {
      const user = res.data.data.user
      dispatch(setUser(user))
      queryClient.setQueryData(AUTH_KEYS.currentUser, user)
      toast.success('Cover image updated!')
    },
    onError: () => toast.error('Error', 'Failed to update cover image.'),
  })
}
