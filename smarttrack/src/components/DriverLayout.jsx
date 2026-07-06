// Layout wrapper for all /driver routes. Redirects unauthenticated users to /login
// and composes the demo bar, desktop sidebar, and mobile bottom nav.
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import DemoBar from './DemoBar'
import { useEffect, useState } from 'react'
import { WifiOff, Phone, X } from 'lucide-react'

function PhoneMissingPrompt({ onDismiss }) {
  return (
    <div className="fixed top-16 left-0 right-0 md:left-64 md:right-0 z-[2500] bg-amber-50 border-b border-amber-200 p-3">
      <div className="max-w-7xl mx-auto flex items-start gap-3">
        <Phone size={16} strokeWidth={1.5} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-900 font-medium">Add your phone number</p>
          <p className="text-xs text-amber-700 mt-0.5">Please add your phone number in your profile for better service.</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-amber-500 hover:text-amber-900 transition-colors shrink-0"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

export default function DriverLayout() {
  const { user, loading, profile } = useAuth()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showPhonePrompt, setShowPhonePrompt] = useState(false)

  // Redirect to login as soon as auth resolves and there is no signed-in user
  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  // Check for missing phone number
  useEffect(() => {
    if (profile && !profile.phone) {
      const dismissed = sessionStorage.getItem('phonePromptDismissed')
      if (!dismissed) {
        setShowPhonePrompt(true)
      }
    }
  }, [profile])

  const handleDismissPhonePrompt = () => {
    setShowPhonePrompt(false)
    sessionStorage.setItem('phonePromptDismissed', 'true')
  }

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
      {showPhonePrompt && <PhoneMissingPrompt onDismiss={handleDismissPhonePrompt} />}
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
