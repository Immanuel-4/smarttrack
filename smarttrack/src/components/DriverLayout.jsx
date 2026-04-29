// Layout wrapper for all /driver routes. Redirects unauthenticated users to /login
// and composes the demo bar, desktop sidebar, and mobile bottom nav.
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import DemoBar from './DemoBar'
import { useEffect } from 'react'

export default function DriverLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect to login as soon as auth resolves and there is no signed-in user
  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  // Render nothing while Firebase auth state is still being determined
  if (loading || !user) return null

  return (
    <div className="flex flex-col h-screen">
      <DemoBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden md:flex">
          <Sidebar userType="driver" />
        </div>
        {/* Child route content renders here */}
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
      <BottomNav userType="driver" />
    </div>
  )
}
