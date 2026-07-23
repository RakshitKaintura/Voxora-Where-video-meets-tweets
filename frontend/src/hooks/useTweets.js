import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as tweetApi from '@/api/tweet.api'

export const TWEET_KEYS = {
  all: ['tweets'],
  feed: () => [...TWEET_KEYS.all, 'feed'],
  user: (userId) => [...TWEET_KEYS.all, 'user', userId],
}

// ─── useAllTweets ─────────────────────────────────────────────────────────────
export function useAllTweets() {
  return useInfiniteQuery({
    queryKey: TWEET_KEYS.feed(),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await tweetApi.getAllTweets({ page: pageParam, limit: 10 })
      return res.data.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasNextPage) return undefined
      return lastPage.nextPage
    },
  })
}

// ─── useUserTweets ────────────────────────────────────────────────────────────
export function useUserTweets(userId) {
  return useInfiniteQuery({
    queryKey: TWEET_KEYS.user(userId),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await tweetApi.getUserTweets(userId, { page: pageParam, limit: 10 })
      return res.data.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasNextPage) return undefined
      return lastPage.nextPage
    },
    enabled: !!userId,
  })
}

export function useTweetReplies(tweetId) {
  return useInfiniteQuery({
    queryKey: [...TWEET_KEYS.all, 'replies', tweetId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await tweetApi.getTweetReplies(tweetId, { page: pageParam, limit: 10 })
      return res.data.data
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasNextPage) return undefined
      return lastPage.nextPage
    },
    enabled: !!tweetId,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────
export function useCreateTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => tweetApi.createTweet(data),
    onSuccess: (_, variables) => {
      if (variables instanceof FormData) {
          const parentTweet = variables.get('parentTweet');
          if (parentTweet) {
            queryClient.invalidateQueries({ queryKey: [...TWEET_KEYS.all, 'replies', parentTweet] })
          }
      } else if (variables.parentTweet) {
        queryClient.invalidateQueries({ queryKey: [...TWEET_KEYS.all, 'replies', variables.parentTweet] })
      }
      queryClient.invalidateQueries({ queryKey: TWEET_KEYS.feed() })
    },
  })
}

export function useDeleteTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tweetId) => tweetApi.deleteTweet(tweetId),
    onSuccess: () => {
      // Invalidate both feed and user tweets
      queryClient.invalidateQueries({ queryKey: TWEET_KEYS.all })
    },
  })
}

export function useUpdateTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tweetId, data }) => tweetApi.updateTweet(tweetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TWEET_KEYS.all })
    },
  })
}
