import axios from 'axios'
import store from '@/store/store'
import { clearUser } from '@/store/slices/authSlice'

const axiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // send/receive cookies (accessToken, refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Nothing to add here — cookies are sent automatically via withCredentials.
// If we ever switch to Bearer tokens in headers, we'd attach them here.

// ─── Response Interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  // Success: just pass through
  (response) => response,

  // Error: handle 401 → try to refresh token, then retry original request
  async (error) => {
    const originalRequest = error.config

    // Avoid infinite loop if refresh itself fails
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/users/refresh-token'
    ) {
      originalRequest._retry = true

      try {
        // Attempt to refresh the access token using the refresh cookie
        await axiosInstance.post('/users/refresh-token')
        // Retry the original request — new accessToken cookie is now set
        return axiosInstance(originalRequest)
      } catch {
        // Refresh failed → user must re-login
        store.dispatch(clearUser())
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
