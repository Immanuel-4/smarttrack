// Mobile-only bottom navigation bar. Renders rider or driver links depending on userType,
// and highlights the active route. Hidden on md+ screens where the Sidebar is used instead.
import { NavLink } from 'react-router-dom'

const riderLinks = [
  { to: '/rider', label: 'Home', icon: '🏠' },
  { to: '/rider/active', label: 'Trip', icon: '🚗' },
]

const driverLinks = [
  { to: '/driver', label: 'Dashboard', icon: '📊' },
  { to: '/driver/requests', label: 'Requests', icon: '📋' },
  { to: '/driver/navigate', label: 'Navigate', icon: '🧭' },
]

export default function BottomNav({ userType }) {
  const links = userType === 'driver' ? driverLinks : riderLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 md:hidden">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/rider' || to === '/driver'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500'
            }`
          }
        >
          <span className="text-xl mb-0.5">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
