// Destination selection screen - reuses pin-drop UI from PinAdjust.jsx
// Simplified version: no photo/note, just coordinates, plus_code, area_label
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { encodePlusCode } from '../../utils/plusCode'
import { useTrip } from '../../context/useTrip'
import PlusCodeChip from '../../components/PlusCodeChip'
import TileLayerToggle from '../../components/TileLayerToggle'
import { ArrowLeft } from 'lucide-react'

export default function DestinationSelect() {
  const navigate = useNavigate()
  const { destination, setDestination } = useTrip()
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const isMapValidRef = useRef(true)
  const [plusCode, setPlusCode] = useState('')
  const [userLocation, setUserLocation] = useState(null)

  const DEFAULT_CENTER = [6.5244, 3.3792] // Lagos fallback

  const initCoords = useMemo(() => {
    return destination?.coordinates
      ? [destination.coordinates.lat, destination.coordinates.lng]
      : userLocation || DEFAULT_CENTER
  }, [destination?.coordinates?.lat, destination?.coordinates?.lng, userLocation])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = L.map(mapContainer.current, { zoomControl: false }).setView(initCoords, 17)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map
    setMapInstance(map)

    const initialCode = encodePlusCode(initCoords[0], initCoords[1])
    setPlusCode(initialCode)

    requestAnimationFrame(() => {
      if (isMapValidRef.current) map.invalidateSize()
    })
    const resizeTimer = setTimeout(() => {
      if (isMapValidRef.current) map.invalidateSize()
    }, 250)

    map.on('move', () => {
      if (!isMapValidRef.current) return
      const c = map.getCenter()
      setPlusCode(encodePlusCode(c.lat, c.lng))
    })

    return () => {
      isMapValidRef.current = false
      clearTimeout(resizeTimer)
      map.remove()
      mapRef.current = null
    }
  }, [initCoords])

  const handleConfirm = () => {
    const c = mapRef.current?.getCenter()
    if (!c) return

    const destData = {
      plus_code: encodePlusCode(c.lat, c.lng),
      coordinates: { lat: c.lat, lng: c.lng },
      area_label: 'Destination',
    }

    setDestination(destData)
    navigate('/rider/annotate', { state: { destination: destData } })
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="relative flex-1 min-w-0">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
          <div className="w-px h-10 bg-zinc-900 absolute opacity-70" />
          <div className="h-px w-10 bg-zinc-900 absolute opacity-70" />
          <div className="w-4 h-4 border-2 border-zinc-900 rounded-full absolute bg-white" />
        </div>
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="absolute top-4 left-4 z-[1000] bg-white border border-zinc-200 text-zinc-700 rounded-md p-2.5 hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="absolute top-4 right-4 z-[1000]">
          <TileLayerToggle map={mapInstance} />
        </div>
      </div>

      <div className="hidden md:flex flex-col w-80 lg:w-96 bg-white border-l border-zinc-200 shrink-0">
        <div className="p-5 border-b border-zinc-100">
          <h1 className="text-lg font-medium text-zinc-900 mb-1">Select destination</h1>
          <p className="text-sm text-zinc-600">Pan the map to set where you&apos;re going</p>
        </div>
        <div className="p-5 border-b border-zinc-100">
          <p className="text-sm font-medium text-zinc-600 uppercase tracking-wide mb-2">Location code</p>
          <PlusCodeChip code={plusCode} size="lg" />
        </div>
        <div className="mt-auto p-5 border-t border-zinc-100">
          <button onClick={handleConfirm} className="btn-primary">
            Confirm destination
          </button>
        </div>
      </div>

      <div
        className="md:hidden fixed inset-x-0 z-[1000] bg-white border-t border-zinc-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
        style={{ bottom: '64px' }}
      >
        <div className="px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <h1 className="text-base font-medium text-zinc-900 mb-0.5">Select destination</h1>
          <p className="text-sm text-zinc-600 mb-3">Pan the map to set where you&apos;re going</p>
          <div className="mb-3">
            <PlusCodeChip code={plusCode} size="lg" />
          </div>
          <button onClick={handleConfirm} className="btn-primary">
            Confirm destination
          </button>
        </div>
      </div>
    </div>
  )
}