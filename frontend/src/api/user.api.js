import api from './axios'

export const getUserChannelProfile = (username) =>
  api.get(`/users/c/${username}`)
