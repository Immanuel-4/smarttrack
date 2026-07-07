import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import L from 'leaflet'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/useAuth'
import { bearingDeg, haversineKm } from '../../utils/distance'
import { cacheTrip, clearTripCache, loadCachedTrip } from '../../utils/tripCache'
import PlusCodeChip from '../../components/PlusCodeChip'
import { Navigation, Flag, FileText, Check, Wifi, WifiOff, XCircle, X } from 'lucide-react'

export default function Navigate() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  // tripId may arrive via route state (fast path from Accept). If not, we resolve it.
  const [tripId, setTripId] = useState(location.state?.tripId ?? null)
  const [resolving, setResolving] = useState(!location.state?.tripId)
  const [trip, setTrip] = useState(null)
  const [dataSource, setDataSource] = useState(null) // 'firestore' | 'cache'
  const [myPos, setMyPos] = useState(null)
  const [bearing, setBearing] = useState(0)
  const [distKm, setDistKm] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  
  // Navigation phase: 'toPickup' (driver going to pickup) or 'toDestination' (driver going to destination)
  const [navPhase, setNavPhase] = useState('toPickup')

  // Derive UI state from the trip — never from ephemeral local flags.
  const loc = navPhase === 'toPickup' ? trip?.pickup_location : trip?.destination
  const status = trip?.status
  const arrived = status === 'IN_PROGRESS'
  const cancelled = status === 'CANCELLED'
  const targetCoords = navPhase === 'toPickup'
    ? trip?.pickup_location?.coordinates
    : trip?.destination?.coordinates

  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const myMarkerRef = useRef(null)
  const destMarkerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const lastRouteFetchRef = useRef(0)
  const pickupCenteredRef = useRef(false)

  // --- 1. Resolve the active trip when we didn't arrive here from Accept ---
  // Source of truth: this driver's ACCEPTED / IN_PROGRESS trip in Firestore.
  // Offline fallback: the cached active trip id.
  useEffect(() => {
    if (tripId || !user) return
    let cancelled = false

    const resolveActiveTrip = async () => {
      try {
        const q = query(
          collection(db, 'trips'),
          where('driverId', '==', user.uid),
          where('status', 'in', ['ACCEPTED', 'IN_PROGRESS']),
          limit(1),
        )
        const snap = await getDocs(q)
        if (cancelled) return
        if (!snap.empty) {
          setTripId(snap.docs[0].id)
          setResolving(false)
          return
        }
      } catch (err) {
        console.warn('Active-trip lookup failed, falling back to cache:', err)
      }

      // Offline / query failed — recover the id from the cache.
      const cached = loadCachedTrip()
      if (cancelled) return
      if (cached?.id) setTripId(cached.id)
      setResolving(false)
    }

    resolveActiveTrip()
    return () => {
      cancelled = true
    }
  }, [user, tripId])

  // --- 2. Live subscription to the trip document ---
  // Keeps status (arrived / cancelled / completed) always in sync and re-caches.
  useEffect(() => {
    if (!tripId) return
    const ref = doc(db, 'trips', tripId)
    const unsub = onSnapshot(
      ref,
      snap => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() }
          setTrip(data)
          setDataSource('firestore')
          cacheTrip(data)
        }
      },
      err => {
        console.warn('Trip listener unavailable, loading from cache:', err)
        const cached = loadCachedTrip()
        if (cached) {
          setTrip(cached)
          setDataSource('cache')
        }
      },
    )
    return unsub
  }, [tripId])

  // --- Map setup ---
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const map = L.map(mapContainer.current, { zoomControl: false }).setView([6.5244, 3.3792], 15)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      routeLayerRef.current = null
      lastRouteFetchRef.current = 0
    }
  }, [tripId])

  // Centre on target location once trip data arrives, but only before GPS has fired.
  useEffect(() => {
    const coords = targetCoords
    if (!mapRef.current || !coords || pickupCenteredRef.current) return
    mapRef.current.setView([coords.lat, coords.lng], 15)
    pickupCenteredRef.current = true
  }, [targetCoords])

  // Update destination marker when target coordinates change
  useEffect(() => {
    if (!mapRef.current || !targetCoords) return
    if (destMarkerRef.current) {
      destMarkerRef.current.remove()
      destMarkerRef.current = null
    }
    const pin = L.marker([targetCoords.lat, targetCoords.lng]).addTo(mapRef.current)
    const label = navPhase === 'toPickup' ? 'Pickup point' : 'Destination'
    pin.bindPopup(label).openPopup()
    destMarkerRef.current = pin
  }, [targetCoords, navPhase])

  useEffect(() => {
    const watchId = navigator.geolocation?.watchPosition(
      ({ coords }) => setMyPos({ lat: coords.latitude, lng: coords.longitude }),
      err => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true },
    )
    return () => navigator.geolocation?.clearWatch(watchId)
  }, [])

  useEffect(() => {
    if (!myPos || !targetCoords || !mapRef.current) return

    const b = bearingDeg(myPos.lat, myPos.lng, targetCoords.lat, targetCoords.lng)
    const km = haversineKm(myPos.lat, myPos.lng, targetCoords.lat, targetCoords.lng)
    setBearing(b)
    setDistKm(km)

    const driverIcon = L.divIcon({
      className: '',
      html: `<div style="width:44px;height:44px;transform:rotate(${b}deg);transform-origin:center center">
        <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="20" fill="#1a73e8" stroke="white" stroke-width="2.5"/>
          <path d="M22 7 L30 34 L22 29 L14 34 Z" fill="white"/>
        </svg>
      </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    })

    if (!myMarkerRef.current) {
      myMarkerRef.current = L.marker([myPos.lat, myPos.lng], { icon: driverIcon }).addTo(mapRef.current)
    } else {
      myMarkerRef.current.setLatLng([myPos.lat, myPos.lng])
      myMarkerRef.current.setIcon(driverIcon)
    }

    mapRef.current.setView([myPos.lat, myPos.lng])

    // Fetch road-following route from OSRM (throttled to once every 30 s)
    const now = Date.now()
    if (now - lastRouteFetchRef.current > 30_000) {
      lastRouteFetchRef.current = now
      const url = `https://router.project-osrm.org/route/v1/driving/${myPos.lng},${myPos.lat};${targetCoords.lng},${targetCoords.lat}?overview=full&geometries=geojson`
      fetch(url)
        .then(r => r.json())
        .then(data => {
          if (!mapRef.current || !data.routes?.[0]) return
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
          if (routeLayerRef.current) routeLayerRef.current.remove()
          routeLayerRef.current = L.polyline(coords, {
            color: '#1a73e8',
            weight: 5,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(mapRef.current)
          myMarkerRef.current?.bringToFront()
        })
        .catch(err => console.warn('Route fetch failed:', err))
    }
  }, [myPos, targetCoords])

  // --- Status transitions (driven by Firestore, reflected live via the listener) ---
  const handleArrived = async () => {
    if (!tripId) return
    // When arriving at pickup, switch to destination phase
    await updateDoc(doc(db, 'trips', tripId), {
      status: 'IN_PROGRESS',
      updatedAt: serverTimestamp(),
    })
    setNavPhase('toDestination')
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

  const handleCancel = async () => {
    if (!tripId) return
    setCancelling(true)
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        status: 'CANCELLED',
        cancelledBy: 'DRIVER',
        updatedAt: serverTimestamp(),
      })
      clearTripCache()
      navigate('/driver/requests')
    } finally {
      setCancelling(false)
    }
  }

  // Still resolving which trip is active
  if (resolving && !tripId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <Navigation size={40} strokeWidth={1} className="text-zinc-300 mx-auto mb-4 animate-pulse" />
          <p className="font-medium text-zinc-900 text-sm">Loading your active trip…</p>
        </div>
      </div>
    )
  }

  // No active trip exists for this driver
  if (!tripId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <Navigation size={40} strokeWidth={1} className="text-zinc-300 mx-auto mb-4" />
          <p className="font-medium text-zinc-900 text-sm mb-1">No active navigation</p>
          <button
            onClick={() => navigate('/driver/requests')}
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            View requests
          </button>
        </div>
      </div>
    )
  }

  // The ride was cancelled (by the rider or the driver) — react live
  if (cancelled) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 max-w-sm">
          <XCircle size={40} strokeWidth={1} className="text-zinc-300 mx-auto mb-4" />
          <p className="font-medium text-zinc-900 text-sm mb-1">This ride was cancelled</p>
          <p className="text-xs text-zinc-500 mb-4">
            {trip?.cancelledBy === 'RIDER' ? 'The rider cancelled this trip.' : 'This trip was cancelled.'}
          </p>
          <button
            onClick={() => {
              clearTripCache()
              navigate('/driver/requests')
            }}
            className="btn-secondary text-xs"
          >
            Back to requests
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div ref={mapContainer} className="flex-1" />

      <div className="bg-white border-t border-zinc-200 md:border-t-0 md:border-l p-4 space-y-3 overflow-y-auto pb-20 md:w-80 md:pb-6">
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
          <div className="space-y-2">
            <button onClick={handleArrived} className="btn-primary flex items-center justify-center gap-1.5">
              <Flag size={14} strokeWidth={1.5} />
              I've arrived at pickup
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn-secondary w-full flex items-center justify-center gap-1.5 text-zinc-500"
            >
              <X size={14} strokeWidth={1.5} />
              {cancelling ? 'Cancelling…' : 'Cancel trip'}
            </button>
          </div>
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