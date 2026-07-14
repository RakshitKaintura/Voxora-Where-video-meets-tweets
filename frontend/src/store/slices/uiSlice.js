import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: true,   // collapsed sidebar on mobile/tablet
  theme: 'dark',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload
    },
  },
})

export const { toggleSidebar, setSidebarOpen } = uiSlice.actions
export default uiSlice.reducer
