import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore'
import L from 'leaflet'
import { db } from '../../firebase/config'
import { bearingDeg, haversineKm } from '../../utils/distance'
import PlusCodeChip from '../../components/PlusCodeChip'

export default function Navigate() {
  const location = useLocation()
  const navigate = useNavigate()
  const tripId = location.state?.tripId
  const [trip, setTrip] = useState(null)
  const [myPos, setMyPos] = useState(null)
  const [bearing, setBearing] = useState(0)
  const [distKm, setDistKm] = useState(null)
  const [arrived, setArrived] = useState(false)
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const myMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)

  useEffect(() => {
    if (!tripId) return
    return onSnapshot(doc(db, 'trips', tripId), snap => {
      if (snap.exists()) setTrip({ id: snap.id, ...snap.data() })
    })
  }, [tripId])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const center = trip?.pickup_location?.coordinates || { lat: 6.5244, lng: 3.3792 }
    const map = L.map(mapContainer.current, { zoomControl: false }).setView([center.lat, center.lng], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [!!trip])

  useEffect(() => {
    if (!mapRef.current || !trip?.pickup_location?.coordinates) return
    const pickup = trip.pickup_location.coordinates
    if (!destMarkerRef.current) {
      const pin = L.marker([pickup.lat, pickup.lng]).addTo(mapRef.current)
      pin.bindPopup('Pickup point').openPopup()
      destMarkerRef.current = pin
    }
  }, [trip?.pickup_location])

  useEffect(() => {
    const watchId = navigator.geolocation?.watchPosition(({ coords }) => {
      setMyPos({ lat: coords.latitude, lng: coords.longitude })
    })
    return () => navigator.geolocation?.clearWatch(watchId)
  }, [])

  useEffect(() => {
    if (!myPos || !trip?.pickup_location?.coordinates || !mapRef.current) return
    const pickup = trip.pickup_location.coordinates

    const b = bearingDeg(myPos.lat, myPos.lng, pickup.lat, pickup.lng)
    const km = haversineKm(myPos.lat, myPos.lng, pickup.lat, pickup.lng)
    setBearing(b)
    setDistKm(km)

    const driverIcon = L.divIcon({
      className: '',
      html: `<div style="background:#1D9E75;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;transform:rotate(${b}deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)">↑</div>`,
      iconSize: [32, 32], iconAnchor: [16, 16],
    })

    if (!myMarkerRef.current) {
      myMarkerRef.current = L.marker([myPos.lat, myPos.lng], { icon: driverIcon }).addTo(mapRef.current)
    } else {
      myMarkerRef.current.setLatLng([myPos.lat, myPos.lng])
      myMarkerRef.current.setIcon(driverIcon)
    }

    mapRef.current.setView([myPos.lat, myPos.lng])
  }, [myPos])

  const handleArrived = async () => {
    if (!tripId) return
    await updateDoc(doc(db, 'trips', tripId), {
      status: 'IN_PROGRESS',
      updatedAt: serverTimestamp(),
    })
    setArrived(true)
  }

  const handleComplete = async () => {
    if (!tripId) return
    await updateDoc(doc(db, 'trips', tripId), {
      status: 'COMPLETED',
      updatedAt: serverTimestamp(),
    })
    navigate('/driver')
  }

  const loc = trip?.pickup_location

  if (!tripId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center p-8">
          <p className="text-5xl mb-3">🧭</p>
          <p className="font-medium mb-2">No active navigation</p>
          <button onClick={() => navigate('/driver/requests')} className="text-primary hover:underline text-sm">View requests →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div ref={mapContainer} className="flex-1" />

      <div className="bg-white border-t border-gray-200 p-4 space-y-4">
        {/* Compass + distance */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center shrink-0"
            style={{ transform: `rotate(${bearing}deg)`, transition: 'transform 0.5s ease' }}
          >
            <span className="text-2xl">🧭</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {distKm != null ? `${distKm < 1 ? Math.round(distKm * 1000) + 'm' : distKm.toFixed(1) + 'km'}` : 'Calculating…'}
            </p>
            <p className="text-xs text-gray-500">to pickup</p>
          </div>
          <div className="ml-auto">
            <PlusCodeChip code={loc?.plus_code} />
          </div>
        </div>

        {loc?.user_note && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-700 font-medium mb-0.5">Landmark</p>
            <p className="text-sm text-amber-800">{loc.user_note}</p>
          </div>
        )}

        {loc?.photo_base64 && !arrived && (
          <img
            src={`data:image/jpeg;base64,${loc.photo_base64}`}
            alt="Pickup area"
            className="w-full h-32 object-cover rounded-lg"
          />
        )}

        {!arrived ? (
          <button onClick={handleArrived} className="btn-primary">I've arrived at pickup</button>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg text-center font-medium">
              ✅ Waiting for rider… trip in progress
            </div>
            <button onClick={handleComplete} className="btn-primary">Mark trip as completed</button>
          </div>
        )}
      </div>
    </div>
  )
}
