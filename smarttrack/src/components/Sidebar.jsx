import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuth } from '../context/useAuth'
import { Home, LayoutDashboard, Clock, Navigation, User } from 'lucide-react'

const riderLinks = [
  { to: '/rider', label: 'Home', Icon: Home },
  { to: '/rider/active', label: 'Active Trip', Icon: Navigation },
  { to: '/rider/trips', label: 'Trip History', Icon: Clock },
  { to: '/rider/account', label: 'Account', Icon: User },
]

const driverLinks = [
  { to: '/driver', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/driver/requests', label: 'Requests', Icon: Clock },
  { to: '/driver/navigate', label: 'Navigate', Icon: Navigation },
  { to: '/driver/trips', label: 'Trip History', Icon: Clock },
  { to: '/driver/account', label: 'Account', Icon: User },
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
    <aside className="w-60 bg-white border-r border-zinc-200 flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-zinc-100">
        <div className="text-zinc-900 font-medium text-base">SmartTrack</div>
        <div className="text-xs text-zinc-400 mt-0.5 capitalize">{userType} dashboard</div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/rider' || to === '/driver'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-100 text-zinc-900 font-medium'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <div className="text-sm font-medium text-zinc-900 mb-0.5">{profile?.name}</div>
        <div className="text-xs text-zinc-400 mb-3">{profile?.email}</div>
        <button
          onClick={handleLogout}
          className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
