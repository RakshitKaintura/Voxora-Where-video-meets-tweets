import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as commentApi from '@/api/comment.api'

export const COMMENT_KEYS = {
  all: ['comments'],
  video: (videoId) => [...COMMENT_KEYS.all, 'video', videoId],
}

export function useVideoComments(videoId) {
  return useInfiniteQuery({
    queryKey: COMMENT_KEYS.video(videoId),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await commentApi.getVideoComments(videoId, { page: pageParam, limit: 10 })
      return res.data.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasNextPage) return undefined
      return lastPage.nextPage
    },
    enabled: !!videoId,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ videoId, content }) => commentApi.addComment(videoId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.video(variables.videoId) })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId }) => commentApi.deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.video(variables.videoId) })
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, content }) => commentApi.updateComment(commentId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.video(variables.videoId) })
    },
  })
}
