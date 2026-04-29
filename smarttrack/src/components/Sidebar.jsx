// Desktop sidebar shown on md+ screens inside both rider and driver layouts.
// Displays the app brand, role-specific nav links, user info, and a sign-out button.
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuth } from '../context/useAuth'

const riderLinks = [
  { to: '/rider', label: 'Home', icon: '🏠' },
  { to: '/rider/active', label: 'Active Trip', icon: '🚗' },
]

const driverLinks = [
  { to: '/driver', label: 'Dashboard', icon: '📊' },
  { to: '/driver/requests', label: 'Requests', icon: '📋' },
  { to: '/driver/navigate', label: 'Navigate', icon: '🧭' },
]

export default function Sidebar({ userType }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const links = userType === 'driver' ? driverLinks : riderLinks

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-gray-100">
        <div className="text-primary font-bold text-xl">SmartTrack</div>
        <div className="text-xs text-gray-500 mt-1 capitalize">{userType} dashboard</div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/rider' || to === '/driver'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-1">{profile?.name}</div>
        <div className="text-xs text-gray-400 mb-3">{profile?.email}</div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-600 font-medium"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
