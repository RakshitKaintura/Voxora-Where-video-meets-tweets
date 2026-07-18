import api from './axios'

export const getChannelStats = () => api.get('/dashboard/stats')

export const getChannelVideos = (params) =>
  api.get('/dashboard/videos', { params })
