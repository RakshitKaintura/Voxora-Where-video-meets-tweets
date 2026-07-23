import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import store from '@/store/store'
import { ToastProvider } from '@/components/shared/Toast'
import AuthBootstrap from '@/components/auth/AuthBootstrap'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,    // 2 minutes before data is considered stale
      retry: 1,                      // Retry failed requests once
      refetchOnWindowFocus: false,   // Don't refetch when user switches tabs
    },
    mutations: {
      retry: 0,
    },
  },
})

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AuthBootstrap />
            {children}
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  )
}
