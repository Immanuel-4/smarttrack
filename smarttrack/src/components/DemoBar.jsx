import { useDemo } from '../context/DemoContext'
import { useAuth } from '../context/AuthContext'
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
    <div className="bg-gray-900 text-white text-xs px-4 py-2 flex items-center justify-between">
      <span className="font-semibold text-primary">SmartTrack Demo</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">View as:</span>
        <button
          onClick={() => switchTo('rider')}
          className={`px-3 py-1 rounded-full transition-colors ${
            effectiveView === 'rider' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Rider
        </button>
        <button
          onClick={() => switchTo('driver')}
          className={`px-3 py-1 rounded-full transition-colors ${
            effectiveView === 'driver' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Driver
        </button>
      </div>
    </div>
  )
}
