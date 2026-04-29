import { useEffect, useRef, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import L from 'leaflet'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'

export default function DriverHome() {
  const { user, profile, setProfile } = useAuth()
  const [online, setOnline] = useState(profile?.online || false)
  const [earnings, setEarnings] = useState(0)
  const [recentTrips, setRecentTrips] = useState([])
  const [toggling, setToggling] = useState(false)
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const driverMarkerRef = useRef(null)

  // Fetch today's completed trips
  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const q = query(
        collection(db, 'trips'),
        where('driverId', '==', user.uid),
        where('status', '==', 'COMPLETED')
      )
      const snap = await getDocs(q)
      const trips = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setRecentTrips(trips.slice(0, 5))
      setEarnings(trips.length * 850) // mock ₦850 per trip
    }
    fetchData()
  }, [user])

  // Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const map = L.map(mapContainer.current, { zoomControl: false }).setView([6.5244, 3.3792], 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map

    const driverIcon = L.divIcon({
      className: '',
      html: '<div style="background:#1D9E75;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🚗</div>',
      iconSize: [36, 36], iconAnchor: [18, 18],
    })

    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      const pos = [coords.latitude, coords.longitude]
      map.setView(pos, 15)
      const marker = L.marker(pos, { icon: driverIcon }).addTo(map)
      driverMarkerRef.current = marker
    }, () => {
      const pos = [6.5244, 3.3792]
      const marker = L.marker(pos, { icon: driverIcon }).addTo(map)
      driverMarkerRef.current = marker
    })

    const watchId = navigator.geolocation?.watchPosition(({ coords }) => {
      const pos = [coords.latitude, coords.longitude]
      driverMarkerRef.current?.setLatLng(pos)
    })

    return () => {
      navigator.geolocation?.clearWatch(watchId)
      map.remove()
      mapRef.current = null
    }
  }, [])

  const handleToggleOnline = async () => {
    setToggling(true)
    const newVal = !online
    try {
      await updateDoc(doc(db, 'users', user.uid), { online: newVal })
      setOnline(newVal)
      setProfile(p => ({ ...p, online: newVal }))
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Map */}
      <div className="flex-1 relative min-h-48">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Online toggle overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={handleToggleOnline}
            disabled={toggling}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-colors ${
              online ? 'bg-primary text-white' : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {toggling ? '…' : online ? '🟢 Online' : '⚫ Go Online'}
          </button>
        </div>
      </div>

      {/* Stats panel */}
      <div className="md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-2xl font-bold text-primary">₦{earnings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Today's earnings</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-800">{recentTrips.length}</p>
            <p className="text-xs text-gray-500 mt-1">Completed trips</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Recent trips</p>
          {recentTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🚗</p>
              <p className="text-sm">No trips yet today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTrips.map(t => (
                <div key={t.id} className="card">
                  <p className="text-xs font-mono text-primary">{t.pickup_location?.plus_code}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.pickup_location?.area_label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
