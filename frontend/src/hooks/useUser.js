import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as userApi from '@/api/user.api'

export const USER_KEYS = {
  all: ['users'],
  channel: (username) => [...USER_KEYS.all, 'channel', username],
}

export function useChannelProfile(username) {
  return useQuery({
    queryKey: USER_KEYS.channel(username),
    queryFn: async () => {
      const res = await userApi.getUserChannelProfile(username)
      return res.data.data
    },
    enabled: !!username,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────
export function useUpdateAccountDetails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => userApi.updateAccountDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => userApi.changePassword(data),
  })
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData) => userApi.updateAvatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
    },
  })
}

export function useUpdateCoverImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData) => userApi.updateCoverImage(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
    },
  })
}
