import api from './axios'

/**
 * Fetch all videos with pagination and optional filters
 * @param {Object} params - { page, limit, query, sortBy, sortType, userId }
 */
export const getAllVideos = (params) =>
  api.get('/videos', { params })

/**
 * Publish a new video
 * @param {FormData} formData - Contains videoFile, thumbnail, title, description
 */
export const publishVideo = (formData) =>
  api.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

/**
 * Get video details by ID
 */
export const getVideoById = (videoId) =>
  api.get(`/videos/${videoId}`)

/**
 * Update video details (title, description, thumbnail)
 */
export const updateVideo = (videoId, formData) =>
  api.patch(`/videos/${videoId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

/**
 * Delete a video
 */
export const deleteVideo = (videoId) =>
  api.delete(`/videos/${videoId}`)

/**
 * Toggle video publish status
 */
export const togglePublishStatus = (videoId) =>
  api.patch(`/videos/toggle/publish/${videoId}`)
