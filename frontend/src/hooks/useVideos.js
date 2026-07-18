import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as videoApi from '@/api/video.api'

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const VIDEO_KEYS = {
  all: ['videos'],
  list: (filters) => [...VIDEO_KEYS.all, 'list', filters],
  detail: (id) => [...VIDEO_KEYS.all, 'detail', id],
}

// ─── useVideos (Infinite Scroll) ──────────────────────────────────────────────
export function useVideos(filters = {}) {
  return useInfiniteQuery({
    queryKey: VIDEO_KEYS.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await videoApi.getAllVideos({ ...filters, page: pageParam, limit: 12 })
      return res.data.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasNextPage) return undefined
      return lastPage.nextPage
    },
    // Keep previous data while fetching next page to avoid layout shift
    keepPreviousData: true,
  })
}

// ─── useVideoDetail ──────────────────────────────────────────────────────────
export function useVideoDetail(videoId) {
  return useQuery({
    queryKey: VIDEO_KEYS.detail(videoId),
    queryFn: async () => {
      const res = await videoApi.getVideoById(videoId)
      return res.data.data
    },
    enabled: !!videoId,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────
export function useUploadVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (formData) => videoApi.publishVideo(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] })
    },
  })
}

export function useUpdateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ videoId, formData }) => videoApi.updateVideo(videoId, formData),
    onSuccess: (_, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.detail(videoId) })
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] })
    },
  })
}

export function useDeleteVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (videoId) => videoApi.deleteVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] })
    },
  })
}

export function useTogglePublishStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (videoId) => videoApi.togglePublishStatus(videoId),
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.detail(videoId) })
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] })
    },
  })
}
