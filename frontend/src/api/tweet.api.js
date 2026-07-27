import api from './axios'

export const getAllTweets = (params) => api.get('/tweets', { params })

export const getUserTweets = (userId, params) => api.get(`/tweets/user/${userId}`, { params })

export const getTweetReplies = (tweetId, params) => api.get(`/tweets/${tweetId}/replies`, { params })

export const polishTweet = async (content, tone) => {
    const response = await api.post(`/tweets/polish`, { content, tone });
    return response.data;
}

export const generateAnnouncements = async (videoId) => {
    const response = await api.get(`/tweets/generate-announcements/${videoId}`);
    return response.data;
}

export const createTweet = (data) => api.post('/tweets', data)

export const updateTweet = (tweetId, data) => api.patch(`/tweets/${tweetId}`, data)

export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`)
