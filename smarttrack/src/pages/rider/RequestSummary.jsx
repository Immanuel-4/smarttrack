import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/useAuth'
import { useTrip } from '../../context/useTrip'
import PlusCodeChip from '../../components/PlusCodeChip'
import { ArrowLeft, Car, FileText } from 'lucide-react'

const RIDE_TYPES = [
  { id: 'Economy', label: 'Economy', desc: 'Affordable everyday rides' },
  { id: 'Comfort', label: 'Comfort', desc: 'Newer cars, more space' },
]

export default function RequestSummary() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pickupLocation, rideType, setRideType, setActiveTrip } = useTrip()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!pickupLocation) { navigate('/rider'); return null }

  const handleRequest = async () => {
    setLoading(true)
    setError('')
    try {
      const ref = await addDoc(collection(db, 'trips'), {
        riderId: user.uid,
        driverId: null,
        status: 'PENDING',
        rideType,
        pickup_location: pickupLocation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setActiveTrip({ id: ref.id })
      navigate('/rider/active')
    } catch (err) {
      setError('Failed to create trip. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-50">
      <div className="max-w-lg mx-auto p-4 pb-24 space-y-4">
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </button>
          <h1 className="text-base font-medium text-zinc-900">Confirm your ride</h1>
        </div>

        {/* Pickup summary */}
        <div className="card space-y-3">
          <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Pickup location</p>
          <PlusCodeChip code={pickupLocation.plus_code} size="lg" />
          {pickupLocation.area_label && (
            <p className="text-sm text-zinc-700">{pickupLocation.area_label}</p>
          )}
          {pickupLocation.user_note && (
            <div className="border-l-2 border-zinc-300 pl-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <FileText size={12} strokeWidth={1.5} className="text-zinc-400" />
                <span className="text-xs text-zinc-400">Driver note</span>
              </div>
              <p className="text-sm text-zinc-600">{pickupLocation.user_note}</p>
            </div>
          )}
          {pickupLocation.photo_base64 && (
            <img
              src={`data:image/jpeg;base64,${pickupLocation.photo_base64}`}
              alt="Pickup"
              className="w-full h-36 object-cover rounded-md border border-zinc-200"
            />
          )}
        </div>

        {/* Ride type */}
        <div className="card space-y-3">
          <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Ride type</p>
          <div className="grid grid-cols-2 gap-2">
            {RIDE_TYPES.map((rt) => (
              <button
                key={rt.id}
                onClick={() => setRideType(rt.id)}
                className={`p-3 rounded-md border text-left transition-colors ${
                  rideType === rt.id
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <Car size={16} strokeWidth={1.5} className={`mb-1.5 ${rideType === rt.id ? 'text-white' : 'text-zinc-400'}`} />
                <div className={`font-medium text-sm ${rideType === rt.id ? 'text-white' : 'text-zinc-800'}`}>{rt.label}</div>
                <div className={`text-xs mt-0.5 ${rideType === rt.id ? 'text-zinc-300' : 'text-zinc-500'}`}>{rt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-md">{error}</div>
        )}

        <button onClick={handleRequest} disabled={loading} className="btn-primary">
          {loading ? 'Finding a driver…' : 'Request ride'}
        </button>
      </div>
    </div>
  )
}
