import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'
import { useTrip } from '../../context/TripContext'
import PlusCodeChip from '../../components/PlusCodeChip'

const RIDE_TYPES = [
  { id: 'Economy', label: 'Economy', desc: 'Affordable everyday rides', icon: '🚗' },
  { id: 'Comfort', label: 'Comfort', desc: 'Newer cars, more space', icon: '🚙' },
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
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-lg mx-auto p-4 pb-24 space-y-5">
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-lg font-semibold text-gray-800">Confirm your ride</h1>
        </div>

        {/* Pickup summary */}
        <div className="card space-y-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pickup location</p>
          <PlusCodeChip code={pickupLocation.plus_code} size="lg" />
          {pickupLocation.area_label && (
            <p className="text-sm text-gray-700 font-medium">{pickupLocation.area_label}</p>
          )}
          {pickupLocation.user_note && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              📝 {pickupLocation.user_note}
            </p>
          )}
          {pickupLocation.photo_base64 && (
            <img
              src={`data:image/jpeg;base64,${pickupLocation.photo_base64}`}
              alt="Pickup"
              className="w-full h-36 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Ride type */}
        <div className="card space-y-3">
          <p className="text-sm font-medium text-gray-700">Select ride type</p>
          <div className="grid grid-cols-2 gap-3">
            {RIDE_TYPES.map((rt) => (
              <button
                key={rt.id}
                onClick={() => setRideType(rt.id)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  rideType === rt.id
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{rt.icon}</div>
                <div className="font-semibold text-sm text-gray-800">{rt.label}</div>
                <div className="text-xs text-gray-500">{rt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        <button onClick={handleRequest} disabled={loading} className="btn-primary">
          {loading ? 'Finding a driver…' : '🚗 Request ride'}
        </button>
      </div>
    </div>
  )
}
