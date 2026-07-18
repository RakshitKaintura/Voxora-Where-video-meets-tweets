import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as playlistApi from '@/api/playlist.api'

export const PLAYLIST_KEYS = {
  all: ['playlists'],
  user: (userId) => [...PLAYLIST_KEYS.all, 'user', userId],
  detail: (playlistId) => [...PLAYLIST_KEYS.all, 'detail', playlistId],
}

export function useUserPlaylists(userId) {
  return useQuery({
    queryKey: PLAYLIST_KEYS.user(userId),
    queryFn: async () => {
      const res = await playlistApi.getUserPlaylists(userId)
      return res.data.data
    },
    enabled: !!userId,
  })
}

export function usePlaylistDetail(playlistId) {
  return useQuery({
    queryKey: PLAYLIST_KEYS.detail(playlistId),
    queryFn: async () => {
      const res = await playlistApi.getPlaylistById(playlistId)
      return res.data.data
    },
    enabled: !!playlistId,
  })
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => playlistApi.createPlaylist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
    },
  })
}

export function useAddVideoToPlaylist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ videoId, playlistId }) => playlistApi.addVideoToPlaylist(videoId, playlistId),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.detail(playlistId) })
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
    },
  })
}

export function useRemoveVideoFromPlaylist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ videoId, playlistId }) => playlistApi.removeVideoFromPlaylist(videoId, playlistId),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.detail(playlistId) })
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
    },
  })
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (playlistId) => playlistApi.deletePlaylist(playlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYLIST_KEYS.all })
    },
  })
}
