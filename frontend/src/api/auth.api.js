import api from './axios'

// Register a new user.
// Expects FormData (multipart) with:
//  - fullName, email, username, password
//  - avatar (file, required)
//  - coverImage (file, optional)
export const register = (formData) =>
  api.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// Login with email/username + password.
// Backend sets httpOnly cookies on success.
export const login = ({ email, username, password }) =>
  api.post('/users/login', { email, username, password })

// Logout — clears cookies server-side.
export const logout = () => api.post('/users/logout')

// Get the currently logged-in user from the cookie session.
export const getCurrentUser = () => api.get('/users/current-user')

// Refresh the access token using the refresh cookie.
// (Called automatically by the Axios interceptor on 401.)
export const refreshToken = () => api.post('/users/refresh-token')

// Change password (requires auth).
export const changePassword = ({ oldPassword, newPassword }) =>
  api.post('/users/change-password', { oldPassword, newPassword })

// Update fullName and/or email.
export const updateAccount = ({ fullName, email }) =>
  api.patch('/users/update-account', { fullName, email })

// Update avatar (multipart single file).
export const updateAvatar = (formData) =>
  api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// Update cover image (multipart single file).
export const updateCoverImage = (formData) =>
  api.patch('/users/cover-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

// Get a channel profile by username.
export const getChannelProfile = (username) =>
  api.get(`/users/c/${username}`)

// Get the logged-in user's watch history.
export const getWatchHistory = () => api.get('/users/history')
