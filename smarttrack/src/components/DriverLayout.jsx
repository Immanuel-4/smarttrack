import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import DemoBar from './DemoBar'
import { useEffect } from 'react'

export default function DriverLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading])

  if (loading || !user) return null

  return (
    <div className="flex flex-col h-screen">
      <DemoBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <Sidebar userType="driver" />
        </div>
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
      <BottomNav userType="driver" />
    </div>
  )
}
