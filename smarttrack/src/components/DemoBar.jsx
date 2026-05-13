import { useDemo } from '../context/useDemo'
import { useAuth } from '../context/useAuth'
import { useNavigate } from 'react-router-dom'

export default function DemoBar() {
  const { demoView, setDemoView } = useDemo()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const effectiveView = demoView || profile?.userType?.toLowerCase()

  const switchTo = (view) => {
    setDemoView(view)
    navigate(view === 'rider' ? '/rider' : '/driver')
  }

  return (
    <div className="bg-white border-b border-zinc-200 px-4 py-2 flex items-center justify-between">
      <span className="text-xs font-medium text-zinc-900 tracking-wide">SmartTrack</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 mr-1">View as</span>
        <div className="flex rounded-md border border-zinc-200 overflow-hidden">
          <button
            onClick={() => switchTo('rider')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              effectiveView === 'rider'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            Rider
          </button>
          <button
            onClick={() => switchTo('driver')}
            className={`px-3 py-1 text-xs font-medium transition-colors border-l border-zinc-200 ${
              effectiveView === 'driver'
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            Driver
          </button>
        </div>
      </div>
    </div>
  )
}
