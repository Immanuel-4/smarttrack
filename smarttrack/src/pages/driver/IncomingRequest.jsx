import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, limit, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/useAuth'
import { useNavigate } from 'react-router-dom'
import PlusCodeChip from '../../components/PlusCodeChip'
import { Check, X, Radio, FileText, Phone } from 'lucide-react'
import { cacheTrip } from '../../utils/tripCache'

export default function IncomingRequest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [current, setCurrent] = useState(0)
  const [accepting, setAccepting] = useState(false)
  const [riderPhones, setRiderPhones] = useState({})

  useEffect(() => {
    const q = query(
      collection(db, 'trips'),
      where('status', '==', 'PENDING'),
      limit(10)
    )
    const unsub = onSnapshot(q, async snap => {
      const trips = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setRequests(trips)
      setCurrent(0)
      
      // Fetch rider phone numbers
      const phonePromises = trips.map(async (trip) => {
        if (trip.riderId) {
          const riderDoc = await getDoc(doc(db, 'users', trip.riderId))
          if (riderDoc.exists()) {
            return { tripId: trip.id, phone: riderDoc.data().phone }
          }
        }
        return { tripId: trip.id, phone: null }
      })
      
      const phoneResults = await Promise.all(phonePromises)
      const phoneMap = {}
      phoneResults.forEach(({ tripId, phone }) => {
        phoneMap[tripId] = phone
      })
      setRiderPhones(phoneMap)
    })
    return unsub
  }, [])

  const trip = requests[current]
  const riderPhone = riderPhones[trip?.id]

  const handleAccept = async () => {
    if (!trip || !user) return
    setAccepting(true)
    try {
      await updateDoc(doc(db, 'trips', trip.id), {
        status: 'ACCEPTED',
        driverId: user.uid,
        updatedAt: serverTimestamp(),
      })
      cacheTrip(trip)
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
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center p-8 max-w-sm">
          <Radio size={32} strokeWidth={1} className="text-zinc-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-900 mb-1">Waiting for requests</p>
          <p className="text-xs text-zinc-500">New trip requests will appear here in real-time</p>
        </div>
      </div>
    )
  }

  const loc = trip.pickup_location

  return (
    <div className="h-full overflow-y-auto bg-zinc-50">
      <div className="max-w-lg mx-auto p-4 pb-20 md:pb-4 space-y-4">
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-base font-medium text-zinc-900">New request</h1>
          <span className="text-xs text-zinc-400">{current + 1} / {requests.length}</span>
        </div>

        {/* Trip type badge */}
        <div className="flex items-center gap-2">
          <span className="bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-1 rounded-md">
            {trip.rideType || 'Economy'}
          </span>
        </div>

        {/* Location card */}
        <div className="card space-y-3">
          <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Pickup</p>
          <PlusCodeChip code={loc?.plus_code} size="lg" />
          {loc?.area_label && <p className="text-sm text-zinc-700">{loc.area_label}</p>}
          {riderPhone && (
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <Phone size={14} strokeWidth={1.5} className="text-zinc-500" />
              <span>{riderPhone}</span>
            </div>
          )}
          {loc?.user_note && (
            <div className="border-l-2 border-zinc-300 pl-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <FileText size={12} strokeWidth={1.5} className="text-zinc-400" />
                <span className="text-xs text-zinc-400">Landmark note</span>
              </div>
              <p className="text-sm text-zinc-600">{loc.user_note}</p>
            </div>
          )}
          {loc?.photo_base64 && (
            <div>
              <p className="text-xs text-zinc-400 mb-1.5">Pickup photo</p>
              <img
                src={`data:image/jpeg;base64,${loc.photo_base64}`}
                alt="Pickup"
                className="w-full h-40 object-cover rounded-md border border-zinc-200"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleDecline} className="btn-secondary flex items-center justify-center gap-1.5">
            <X size={14} strokeWidth={1.5} />
            Decline
          </button>
          <button onClick={handleAccept} disabled={accepting} className="btn-primary flex items-center justify-center gap-1.5">
            <Check size={14} strokeWidth={1.5} />
            {accepting ? 'Accepting…' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}
