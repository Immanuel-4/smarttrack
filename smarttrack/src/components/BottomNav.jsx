import { NavLink } from 'react-router-dom'
import { Home, Car, LayoutDashboard, Clock, Navigation } from 'lucide-react'

const riderLinks = [
  { to: '/rider', label: 'Home', Icon: Home },
  { to: '/rider/active', label: 'Trip', Icon: Car },
]

const driverLinks = [
  { to: '/driver', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/driver/requests', label: 'Requests', Icon: Clock },
  { to: '/driver/navigate', label: 'Navigate', Icon: Navigation },
]

export default function BottomNav({ userType }) {
  const links = userType === 'driver' ? driverLinks : riderLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex z-[3000] md:hidden">
      {links.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/rider' || to === '/driver'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
