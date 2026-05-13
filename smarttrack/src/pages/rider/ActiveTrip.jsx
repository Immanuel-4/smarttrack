import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import L from 'leaflet'
import { db } from '../../firebase/config'
import { useTrip } from '../../context/useTrip'
import { haversineKm } from '../../utils/distance'
import PlusCodeChip from '../../components/PlusCodeChip'
import { Car, User, X } from 'lucide-react'

const STATUS_CONFIG = {
  PENDING:     { label: 'Finding a driver…',  cls: 'bg-zinc-100 text-zinc-600' },
  ACCEPTED:    { label: 'Driver on the way',   cls: 'bg-zinc-900 text-white' },
  IN_PROGRESS: { label: 'Ride in progress',    cls: 'bg-zinc-900 text-white' },
  COMPLETED:   { label: 'Trip completed',      cls: 'bg-zinc-100 text-zinc-500' },
  CANCELLED:   { label: 'Trip cancelled',      cls: 'bg-red-50 text-red-600 border border-red-100' },
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

  useEffect(() => {
    if (trip?.driverId && !driverProfile) {
      getDoc(doc(db, 'users', trip.driverId)).then(snap => {
        if (snap.exists()) setDriverProfile(snap.data())
      })
    }
  }, [trip?.driverId])

  useEffect(() => {
    if (trip?.status !== 'ACCEPTED') {
      clearInterval(mockIntervalRef.current)
      return
    }
    const pickup = trip.pickup_location?.coordinates
    if (!pickup) return

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

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const coords = pickupLocation?.coordinates || { lat: 6.5244, lng: 3.3792 }
    const map = L.map(mapContainer.current, { zoomControl: false })
      .setView([coords.lat, coords.lng], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    mapRef.current = map

    const pin = L.marker([coords.lat, coords.lng]).addTo(map)
    pin.bindPopup('Your pickup').openPopup()
    pickupMarkerRef.current = pin

    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !driverPos) return
    const driverIcon = L.divIcon({
      className: '',
      html: '<div style="background:#18181b;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid white;font-size:14px">&#9650;</div>',
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
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

  if (!activeTrip?.id) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <Car size={40} strokeWidth={1} className="text-zinc-300 mx-auto mb-4" />
          <p className="font-medium text-zinc-900 mb-1 text-sm">No active trip</p>
          <button onClick={() => navigate('/rider')} className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Book a ride</button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full flex flex-col">
      <div ref={mapContainer} className="flex-1" />

      {/* Info panel */}
      <div className="bg-white border-t border-zinc-200 p-4 space-y-3 z-10">
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
          {eta && status === 'ACCEPTED' && (
            <span className="text-xs text-zinc-500">ETA ~{eta} min</span>
          )}
        </div>

        {pickupLocation && (
          <div className="flex items-center gap-2">
            <PlusCodeChip code={pickupLocation.plus_code} />
            {pickupLocation.area_label && (
              <span className="text-xs text-zinc-500">{pickupLocation.area_label}</span>
            )}
          </div>
        )}

        {driverProfile && status === 'ACCEPTED' && (
          <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">
              <User size={14} strokeWidth={1.5} className="text-zinc-600" />
            </div>
            <div>
              <p className="font-medium text-sm text-zinc-900">{driverProfile.name}</p>
              <p className="text-xs text-zinc-500">{driverProfile.rating?.toFixed(1)} · Driver</p>
            </div>
          </div>
        )}

        {(status === 'PENDING' || status === 'ACCEPTED') && (
          <button onClick={handleCancel} className="btn-danger">
            <span className="flex items-center justify-center gap-1.5">
              <X size={14} strokeWidth={1.5} />
              Cancel trip
            </span>
          </button>
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
