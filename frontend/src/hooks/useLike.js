import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as likeApi from '@/api/like.api'
import { VIDEO_KEYS } from './useVideos'

export function useToggleVideoLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: likeApi.toggleVideoLike,
    onMutate: async (videoId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: VIDEO_KEYS.detail(videoId) })

      // Snapshot the previous value
      const previousVideo = queryClient.getQueryData(VIDEO_KEYS.detail(videoId))

      // Optimistically update to the new value
      if (previousVideo) {
        queryClient.setQueryData(VIDEO_KEYS.detail(videoId), {
          ...previousVideo,
          video: {
            ...previousVideo.video,
            isLiked: !previousVideo.video.isLiked,
            likesCount: previousVideo.video.isLiked
              ? previousVideo.video.likesCount - 1
              : previousVideo.video.likesCount + 1,
          },
        })
      }

      // Return a context object with the snapshotted value
      return { previousVideo }
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, videoId, context) => {
      if (context?.previousVideo) {
        queryClient.setQueryData(VIDEO_KEYS.detail(videoId), context.previousVideo)
      }
    },
    // Always refetch after error or success:
    onSettled: (data, error, videoId) => {
      queryClient.invalidateQueries({ queryKey: VIDEO_KEYS.detail(videoId) })
    },
  })
}

// ─── useToggleCommentLike ──────────────────────────────────────────────────
export function useToggleCommentLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId }) => likeApi.toggleCommentLike(commentId),
    onSuccess: (_, variables) => {
      // Invalidate the comments list for the associated video
      if (variables.videoId) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'video', variables.videoId] })
      }
    },
  })
}

// ─── useToggleTweetLike ────────────────────────────────────────────────────
export function useToggleTweetLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tweetId) => likeApi.toggleTweetLike(tweetId),
    onSuccess: () => {
      // Invalidate all tweet queries so feed and user pages update
      queryClient.invalidateQueries({ queryKey: ['tweets'] })
    },
  })
}
