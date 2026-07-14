import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true on initial app load while we check current-user
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
    },
    clearUser(state) {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
    },
    setAuthLoading(state, action) {
      state.isLoading = action.payload
    },
  },
})

export const { setUser, clearUser, setAuthLoading } = authSlice.actions
export default authSlice.reducer
