import api from './axios'

export const getUserChannelProfile = (username) =>
  api.get(`/users/c/${username}`)

export const changePassword = (data) =>
  api.post('/users/change-password', data)

export const updateAccountDetails = (data) =>
  api.patch('/users/update-account', data)

export const updateAvatar = (formData) =>
  api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateCoverImage = (formData) =>
  api.patch('/users/cover-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
