import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import * as dashboardApi from '@/api/dashboard.api'

export const DASHBOARD_KEYS = {
  all: ['dashboard'],
  stats: () => [...DASHBOARD_KEYS.all, 'stats'],
  videos: () => [...DASHBOARD_KEYS.all, 'videos'],
}

export function useChannelStats() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.stats(),
    queryFn: async () => {
      const res = await dashboardApi.getChannelStats()
      return res.data.data.channelStats
    },
  })
}

export function useDashboardVideos() {
  return useInfiniteQuery({
    queryKey: DASHBOARD_KEYS.videos(),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await dashboardApi.getChannelVideos({ page: pageParam, limit: 10 })
      return res.data.data.videos
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasNextPage) return undefined
      return lastPage.nextPage
    },
  })
}
