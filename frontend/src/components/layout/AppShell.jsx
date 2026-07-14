import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import MobileMenu from './MobileMenu'

export default function AppShell() {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen)

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Top navigation bar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile slide-over sidebar */}
        <MobileMenu />

        {/* Main scrollable content area */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

