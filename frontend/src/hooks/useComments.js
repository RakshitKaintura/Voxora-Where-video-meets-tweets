import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
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

export function useCommentReplies(commentId) {
  return useInfiniteQuery({
    queryKey: [...COMMENT_KEYS.all, 'replies', commentId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await commentApi.getCommentReplies(commentId, { page: pageParam, limit: 10 })
      return res.data.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasNextPage) return undefined
      return lastPage.nextPage
    },
    enabled: !!commentId,
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ videoId, content, parentComment }) => commentApi.addComment(videoId, content, parentComment),
    onSuccess: (_, variables) => {
      if (variables.parentComment) {
        queryClient.invalidateQueries({ queryKey: [...COMMENT_KEYS.all, 'replies', variables.parentComment] })
      }
      if (variables.videoId) {
        queryClient.invalidateQueries({ queryKey: COMMENT_KEYS.video(variables.videoId) })
      }
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
export function useCommentSentiment(videoId) {
  return useQuery({
    queryKey: [...COMMENT_KEYS.video(videoId), 'sentiment'],
    queryFn: async () => {
      const res = await commentApi.getCommentSentiment(videoId);
      return res.data;
    },
    enabled: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent hitting AI too often
  })
}
