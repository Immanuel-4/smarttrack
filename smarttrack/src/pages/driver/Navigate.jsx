import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import L from 'leaflet'
import { db } from '../../firebase/config'
import { bearingDeg, haversineKm } from '../../utils/distance'
import { cacheTrip, clearTripCache, loadCachedTrip } from '../../utils/tripCache'
import PlusCodeChip from '../../components/PlusCodeChip'
import { Navigation, Flag, FileText, Check, Wifi, WifiOff } from 'lucide-react'

export default function Navigate() {
  const location = useLocation()
  const navigate = useNavigate()
  const tripId = location.state?.tripId
  const [trip, setTrip] = useState(null)
  const [dataSource, setDataSource] = useState(null) // 'firestore' | 'cache'
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
    const loadTripData = async () => {
      try {
        const tripDoc = await getDoc(doc(db, 'trips', tripId))
        if (tripDoc.exists()) {
          const tripData = { id: tripDoc.id, ...tripDoc.data() }
          cacheTrip(tripData)
          setTrip(tripData)
          setDataSource('firestore')
          return
        }
      } catch (err) {
        console.warn('Firestore unavailable, loading from cache:', err)
      }
      const cached = loadCachedTrip()
      if (cached) {
        setTrip(cached)
        setDataSource('cache')
      }
    }
    loadTripData()
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
      html: `<div style="background:#18181b;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;transform:rotate(${b}deg)">&#9650;</div>`,
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
    clearTripCache()
    navigate('/driver')
  }

  const loc = trip?.pickup_location

  if (!tripId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <Navigation size={40} strokeWidth={1} className="text-zinc-300 mx-auto mb-4" />
          <p className="font-medium text-zinc-900 text-sm mb-1">No active navigation</p>
          <button onClick={() => navigate('/driver/requests')} className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">View requests</button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div ref={mapContainer} className="flex-1" />

      <div className="bg-white border-t border-zinc-200 p-4 space-y-3">
        {/* Distance + Plus Code */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0"
            style={{ transform: `rotate(${bearing}deg)`, transition: 'transform 0.5s ease' }}
          >
            <Navigation size={20} strokeWidth={1.5} className="text-zinc-700" />
          </div>
          <div>
            <p className="font-medium text-zinc-900 text-sm">
              {distKm != null
                ? distKm < 1
                  ? `${Math.round(distKm * 1000)}m to pickup`
                  : `${distKm.toFixed(1)}km to pickup`
                : 'Calculating…'}
            </p>
            <p className="text-xs text-zinc-500">Navigate to rider</p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-1">
            <PlusCodeChip code={loc?.plus_code} />
            {dataSource === 'firestore' && (
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <Wifi size={12} strokeWidth={1.5} />
                Live data
              </span>
            )}
            {dataSource === 'cache' && (
              <span className="flex items-center gap-1 text-xs text-zinc-400">
                <WifiOff size={12} strokeWidth={1.5} />
                Cached data · loaded offline
              </span>
            )}
          </div>
        </div>

        {loc?.user_note && (
          <div className="border-l-2 border-zinc-300 pl-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <FileText size={12} strokeWidth={1.5} className="text-zinc-400" />
              <span className="text-xs text-zinc-400">Landmark</span>
            </div>
            <p className="text-sm text-zinc-600">{loc.user_note}</p>
          </div>
        )}

        {loc?.photo_base64 && !arrived && (
          <img
            src={`data:image/jpeg;base64,${loc.photo_base64}`}
            alt="Pickup area"
            className="w-full h-32 object-cover rounded-md border border-zinc-200"
          />
        )}

        {!arrived ? (
          <button onClick={handleArrived} className="btn-primary flex items-center justify-center gap-1.5">
            <Flag size={14} strokeWidth={1.5} />
            I've arrived at pickup
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm px-3 py-2.5 rounded-md text-center flex items-center justify-center gap-1.5">
              <Check size={14} strokeWidth={1.5} className="text-green-600" />
              Waiting for rider — trip in progress
            </div>
            <button onClick={handleComplete} className="btn-primary">Mark trip as completed</button>
          </div>
        )}
      </div>
    </div>
  )
}
