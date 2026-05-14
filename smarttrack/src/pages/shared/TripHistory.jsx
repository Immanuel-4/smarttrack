import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/useAuth'
import { Clock } from 'lucide-react'

const STATUS_CONFIG = {
  COMPLETED:   { label: 'Completed',   className: 'bg-zinc-100 text-zinc-500' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-red-50 text-red-600 border border-red-100' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-zinc-900 text-white' },
  ACCEPTED:    { label: 'Accepted',    className: 'bg-zinc-100 text-zinc-500' },
  PENDING:     { label: 'Pending',     className: 'bg-zinc-100 text-zinc-500' },
}

function formatDateTime(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const date = d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${time}`
}

function SkeletonCard() {
  return (
    <div className="border border-zinc-200 rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-3 bg-zinc-100 rounded w-32" />
        <div className="h-5 bg-zinc-100 rounded w-20" />
      </div>
      <div className="h-4 bg-zinc-100 rounded w-40 mb-2" />
      <div className="h-3 bg-zinc-100 rounded w-56" />
    </div>
  )
}

export default function TripHistory() {
  const { user, profile } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const isDriver = profile?.userType === 'Driver'
    const fetchTrips = async () => {
      try {
        const field = isDriver ? 'driverId' : 'riderId'
        const snap = await getDocs(
          query(collection(db, 'trips'), where(field, '==', user.uid))
        )
        const data = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
          .slice(0, 20)
        setTrips(data)
      } finally {
        setLoading(false)
      }
    }
    fetchTrips()
  }, [user, profile?.userType])

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <h1 className="text-lg font-medium text-zinc-900 mb-0.5">Trip history</h1>
        <p className="text-sm text-zinc-500 mb-5">Your recent trips</p>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Clock size={32} strokeWidth={1} className="text-zinc-300" />
            <p className="text-sm text-zinc-500">No trips yet</p>
            <p className="text-xs text-zinc-400">Your trip history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map(trip => {
              const sc = STATUS_CONFIG[trip.status] ?? { label: trip.status, className: 'bg-zinc-100 text-zinc-500' }
              return (
                <div key={trip.id} className="border border-zinc-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs text-zinc-400">{formatDateTime(trip.createdAt)}</span>
                    <span className={`text-xs rounded-md px-2 py-0.5 shrink-0 ${sc.className}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-zinc-900 leading-tight">
                    {trip.pickup_location?.plus_code ?? '—'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {trip.pickup_location?.area_label}
                  </p>
                  {trip.pickup_location?.user_note ? (
                    <p className="text-xs text-zinc-400 mt-1 truncate">
                      {trip.pickup_location.user_note}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
