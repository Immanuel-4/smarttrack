import { useEffect, useRef, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import L from 'leaflet'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/useAuth'
import { Radio, TrendingUp, Clock } from 'lucide-react'
import TileLayerToggle from '../../components/TileLayerToggle'

export default function DriverHome() {
  const { user, profile, setProfile } = useAuth()
  const [online, setOnline] = useState(profile?.online || false)
  const [earnings, setEarnings] = useState(0)
  const [recentTrips, setRecentTrips] = useState([])
  const [toggling, setToggling] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const driverMarkerRef = useRef(null)
  const isMapValidRef = useRef(true) // Track if map is still valid

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
      setEarnings(trips.length * 850)
    }
    fetchData()
  }, [user])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const map = L.map(mapContainer.current, { zoomControl: false }).setView([6.5244, 3.3792], 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map
    setMapInstance(map)

    const driverIcon = L.divIcon({
      className: '',
      html: '<div style="background:#18181b;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid white;font-size:16px">&#9650;</div>',
      iconSize: [36, 36], iconAnchor: [18, 18],
    })

    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      // Check if map is still valid before setting view (prevents race condition)
      if (!isMapValidRef.current || !mapRef.current) return
      
      try {
        const pos = [coords.latitude, coords.longitude]
        map.setView(pos, 15)
        const marker = L.marker(pos, { icon: driverIcon }).addTo(map)
        driverMarkerRef.current = marker
      } catch (err) {
        // Ignore errors from map operations after cleanup
        console.warn('Geolocation callback error (map may be removed):', err)
      }
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
      isMapValidRef.current = false
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

        {/* Tile layer toggle */}
        <div className="absolute top-4 left-4 z-[1000]">
          <TileLayerToggle map={mapInstance} />
        </div>

        {/* Online toggle overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button
            onClick={handleToggleOnline}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
              online
                ? 'bg-white border-green-200 text-green-700 hover:bg-green-50'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Radio
              size={14}
              strokeWidth={1.5}
              className={online ? 'text-green-600' : 'text-zinc-400'}
            />
            {toggling ? '…' : online ? 'Online' : 'Go online'}
          </button>
        </div>
      </div>

      {/* Stats panel */}
      <div className="md:w-80 bg-white border-t md:border-t-0 md:border-l border-zinc-200 overflow-y-auto p-4 pb-20 md:pb-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={14} strokeWidth={1.5} className="text-zinc-400" />
            </div>
            <p className="text-lg font-medium text-zinc-900">₦{earnings.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Today's earnings</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} strokeWidth={1.5} className="text-zinc-400" />
            </div>
            <p className="text-lg font-medium text-zinc-900">{recentTrips.length}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Completed trips</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Recent trips</p>
          {recentTrips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-400">No trips yet today</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentTrips.map(t => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-zinc-900">{t.pickup_location?.plus_code}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{t.pickup_location?.area_label}</p>
                  </div>
                  <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md">Done</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
