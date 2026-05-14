// Layout wrapper for all /driver routes. Redirects unauthenticated users to /login
// and composes the demo bar, desktop sidebar, and mobile bottom nav.
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import DemoBar from './DemoBar'
import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function DriverLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Redirect to login as soon as auth resolves and there is no signed-in user
  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Render nothing while Firebase auth state is still being determined
  if (loading || !user) return null

  return (
    <div className="flex flex-col h-screen">
      <DemoBar />
      {!isOnline && (
        <div className="bg-zinc-900 text-white text-xs py-1.5 text-center flex items-center justify-center gap-1.5">
          <WifiOff size={12} strokeWidth={1.5} />
          You are offline — navigation data loaded from cache
        </div>
      )}
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
