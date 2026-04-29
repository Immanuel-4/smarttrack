import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import L from 'leaflet'
import { db } from '../../firebase/config'
import { useTrip } from '../../context/TripContext'
import { haversineKm } from '../../utils/distance'
import PlusCodeChip from '../../components/PlusCodeChip'

const STATUS_LABELS = {
  PENDING: { label: 'Finding a driver…', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Driver on the way', color: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: 'Ride in progress', color: 'bg-green-100 text-green-800' },
  COMPLETED: { label: 'Trip completed', color: 'bg-gray-100 text-gray-700' },
  CANCELLED: { label: 'Trip cancelled', color: 'bg-red-100 text-red-700' },
}

export default function ActiveTrip() {
  const navigate = useNavigate()
  const { activeTrip, setActiveTrip, pickupLocation } = useTrip()
  const [trip, setTrip] = useState(null)
  const [driverProfile, setDriverProfile] = useState(null)
  const [driverPos, setDriverPos] = useState(null)
  const [eta, setEta] = useState(null)
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const pickupMarkerRef = useRef(null)
  const mockIntervalRef = useRef(null)

  useEffect(() => {
    if (!activeTrip?.id) return
    const unsub = onSnapshot(doc(db, 'trips', activeTrip.id), (snap) => {
      if (snap.exists()) setTrip({ id: snap.id, ...snap.data() })
    })
    return unsub
  }, [activeTrip?.id])

  // Fetch driver profile when accepted
  useEffect(() => {
    if (trip?.driverId && !driverProfile) {
      getDoc(doc(db, 'users', trip.driverId)).then(snap => {
        if (snap.exists()) setDriverProfile(snap.data())
      })
    }
  }, [trip?.driverId])

  // Mock driver movement
  useEffect(() => {
    if (trip?.status !== 'ACCEPTED') {
      clearInterval(mockIntervalRef.current)
      return
    }
    const pickup = trip.pickup_location?.coordinates
    if (!pickup) return

    // Start driver ~1km away
    const startLat = pickup.lat + (Math.random() - 0.5) * 0.01
    const startLng = pickup.lng + (Math.random() - 0.5) * 0.01
    const pos = { lat: startLat, lng: startLng }
    setDriverPos({ ...pos })

    mockIntervalRef.current = setInterval(() => {
      pos.lat += (pickup.lat - pos.lat) * 0.15
      pos.lng += (pickup.lng - pos.lng) * 0.15
      setDriverPos({ lat: pos.lat, lng: pos.lng })
      const km = haversineKm(pos.lat, pos.lng, pickup.lat, pickup.lng)
      setEta(Math.max(1, Math.round((km / 30) * 60)))
    }, 3000)

    return () => clearInterval(mockIntervalRef.current)
  }, [trip?.status])

  // Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const coords = pickupLocation?.coordinates || { lat: 6.5244, lng: 3.3792 }
    const map = L.map(mapContainer.current, { zoomControl: false })
      .setView([coords.lat, coords.lng], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    mapRef.current = map

    // Pickup marker
    const pin = L.marker([coords.lat, coords.lng]).addTo(map)
    pin.bindPopup('Your pickup').openPopup()
    pickupMarkerRef.current = pin

    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Driver marker
  useEffect(() => {
    if (!mapRef.current || !driverPos) return
    const driverIcon = L.divIcon({
      className: '',
      html: '<div style="background:#1D9E75;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚗</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker([driverPos.lat, driverPos.lng], { icon: driverIcon }).addTo(mapRef.current)
    } else {
      driverMarkerRef.current.setLatLng([driverPos.lat, driverPos.lng])
    }
  }, [driverPos])

  const handleCancel = async () => {
    if (!activeTrip?.id) return
    await updateDoc(doc(db, 'trips', activeTrip.id), {
      status: 'CANCELLED', updatedAt: serverTimestamp(),
    })
    setActiveTrip(null)
    navigate('/rider')
  }

  const status = trip?.status || 'PENDING'
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.PENDING

  if (!activeTrip?.id) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center p-8">
          <div className="text-5xl mb-4">🚗</div>
          <p className="font-medium mb-2">No active trip</p>
          <button onClick={() => navigate('/rider')} className="text-primary hover:underline text-sm">Book a ride →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full flex flex-col">
      <div ref={mapContainer} className="flex-1" />

      {/* Info panel */}
      <div className="bg-white border-t border-gray-200 p-4 space-y-4 z-10">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {eta && status === 'ACCEPTED' && (
            <span className="text-sm text-gray-600 font-medium">ETA ~{eta} min</span>
          )}
        </div>

        {pickupLocation && (
          <div className="flex items-center gap-3">
            <PlusCodeChip code={pickupLocation.plus_code} />
            {pickupLocation.area_label && (
              <span className="text-sm text-gray-600">{pickupLocation.area_label}</span>
            )}
          </div>
        )}

        {driverProfile && status === 'ACCEPTED' && (
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {driverProfile.name?.[0]}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-800">{driverProfile.name}</p>
              <p className="text-xs text-gray-500">⭐ {driverProfile.rating?.toFixed(1)} · Driver</p>
            </div>
          </div>
        )}

        {(status === 'PENDING' || status === 'ACCEPTED') && (
          <button onClick={handleCancel} className="btn-danger">Cancel trip</button>
        )}

        {(status === 'COMPLETED' || status === 'CANCELLED') && (
          <button onClick={() => { setActiveTrip(null); navigate('/rider') }} className="btn-primary">
            Book another ride
          </button>
        )}
      </div>
    </div>
  )
}
