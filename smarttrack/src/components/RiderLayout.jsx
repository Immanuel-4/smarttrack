import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDemo } from '../context/DemoContext'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import DemoBar from './DemoBar'
import { useEffect } from 'react'

export default function RiderLayout() {
  const { user, profile, loading } = useAuth()
  const { demoView } = useDemo()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading])

  if (loading || !user) return null

  return (
    <div className="flex flex-col h-screen">
      <DemoBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar userType="rider" />
        </div>
        {/* Main content */}
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
      {/* Mobile bottom nav */}
      <BottomNav userType="rider" />
    </div>
  )
}
