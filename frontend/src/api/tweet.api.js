import api from './axios'

export const getAllTweets = (params) => api.get('/tweets', { params })

export const getUserTweets = (userId, params) => api.get(`/tweets/user/${userId}`, { params })

export const createTweet = (content) => api.post('/tweets', { content })

export const updateTweet = (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content })

export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`)
