// IncomingRequest subscribes in real-time to PENDING trips and lets the driver
// cycle through them, accept one (writing their UID to the trip doc), or decline.
import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, limit } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/useAuth'
import { useNavigate } from 'react-router-dom'
import PlusCodeChip from '../../components/PlusCodeChip'

export default function IncomingRequest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [current, setCurrent] = useState(0)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'trips'),
      where('status', '==', 'PENDING'),
      limit(10)
    )
    const unsub = onSnapshot(q, snap => {
      const trips = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setRequests(trips)
      setCurrent(0)
    })
    return unsub
  }, [])

  const trip = requests[current]

  const handleAccept = async () => {
    if (!trip || !user) return
    setAccepting(true)
    try {
      await updateDoc(doc(db, 'trips', trip.id), {
        status: 'ACCEPTED',
        driverId: user.uid,
        updatedAt: serverTimestamp(),
      })
      navigate('/driver/navigate', { state: { tripId: trip.id } })
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = () => {
    setCurrent(i => (i + 1 < requests.length ? i + 1 : 0))
  }

  if (requests.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-sm">
          <div className="text-6xl mb-4 animate-pulse">📡</div>
          <p className="text-lg font-semibold text-gray-800 mb-2">Waiting for requests…</p>
          <p className="text-sm text-gray-500">You'll see new trip requests here in real-time</p>
        </div>
      </div>
    )
  }

  const loc = trip.pickup_location

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-lg font-semibold text-gray-800">New request</h1>
          <span className="text-sm text-gray-500">{current + 1}/{requests.length}</span>
        </div>

        {/* Trip type badge */}
        <div className="flex items-center gap-2">
          <span className="bg-primary-light text-primary text-sm font-medium px-3 py-1 rounded-full">
            {trip.rideType || 'Economy'}
          </span>
          <span className="text-xs text-gray-500">Rider trip</span>
        </div>

        {/* Location card */}
        <div className="card space-y-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pickup</p>
          <PlusCodeChip code={loc?.plus_code} size="lg" />
          {loc?.area_label && <p className="text-sm font-medium text-gray-700">{loc.area_label}</p>}
          {loc?.user_note && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-medium mb-1">📝 Landmark note</p>
              <p className="text-sm text-amber-800">{loc.user_note}</p>
            </div>
          )}
          {loc?.photo_base64 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Pickup photo</p>
              <img
                src={`data:image/jpeg;base64,${loc.photo_base64}`}
                alt="Pickup"
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleDecline} className="btn-secondary">
            Decline
          </button>
          <button onClick={handleAccept} disabled={accepting} className="btn-primary" style={{ width: 'auto' }}>
            {accepting ? 'Accepting…' : '✓ Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}
