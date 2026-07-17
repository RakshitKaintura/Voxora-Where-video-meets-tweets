import { useQuery } from '@tanstack/react-query'
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
