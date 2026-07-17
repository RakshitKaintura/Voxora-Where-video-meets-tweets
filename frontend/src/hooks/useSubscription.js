import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as subApi from '@/api/subscription.api'
import { VIDEO_KEYS } from './useVideos'
import { USER_KEYS } from './useUser'

export const SUB_KEYS = {
  all: ['subscriptions'],
  subscribedChannels: (userId) => [...SUB_KEYS.all, 'subscribed', userId],
}

export function useSubscribedChannels(userId) {
  return useQuery({
    queryKey: SUB_KEYS.subscribedChannels(userId),
    queryFn: async () => {
      const res = await subApi.getSubscribedChannels(userId)
      return res.data.data.channels
    },
    enabled: !!userId,
  })
}

export function useToggleSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (channelId) => subApi.toggleSubscription(channelId),
    onSuccess: (data, channelId) => {
      // Invalidate channel profile
      queryClient.invalidateQueries({ queryKey: ['channel'] })
      // Invalidate video details (which might show subscribe status)
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      // Invalidate subscription list
      queryClient.invalidateQueries({ queryKey: SUB_KEYS.all })
    },
  })
}
