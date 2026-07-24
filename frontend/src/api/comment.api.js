import api from './axios'

export const getVideoComments = (videoId, params) =>
  api.get(`/comments/${videoId}`, { params })

export const getCommentReplies = (commentId, params) =>
  api.get(`/comments/c/${commentId}/replies`, { params })

export const addComment = (videoId, content, parentComment = null) =>
  api.post(`/comments/${videoId}`, { content, parentComment })

export const updateComment = (commentId, content) =>
  api.patch(`/comments/c/${commentId}`, { content })

export const deleteComment = (commentId) =>
  api.delete(`/comments/c/${commentId}`)

export const getCommentSentiment = async (videoId) => {
  const response = await api.get(`/comments/${videoId}/sentiment`)
  return response.data
}
