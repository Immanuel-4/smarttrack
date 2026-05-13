import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { encodePlusCode } from '../../utils/plusCode'
import { useTrip } from '../../context/useTrip'
import PlusCodeChip from '../../components/PlusCodeChip'
import { ArrowLeft } from 'lucide-react'

export default function PinAdjust() {
  const navigate = useNavigate()
  const { pickupLocation, setPickupLocation } = useTrip()
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [plusCode, setPlusCode] = useState(pickupLocation?.plus_code || '')

  const initCoords = pickupLocation?.coordinates
    ? [pickupLocation.coordinates.lat, pickupLocation.coordinates.lng]
    : [6.5244, 3.3792]

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const map = L.map(mapContainer.current, { zoomControl: false }).setView(initCoords, 17)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    mapRef.current = map

    map.on('move', () => {
      const c = map.getCenter()
      setPlusCode(encodePlusCode(c.lat, c.lng))
    })

    return () => { map.remove(); mapRef.current = null }
  }, [])

  const handleConfirm = () => {
    const c = mapRef.current?.getCenter()
    if (!c) return
    setPickupLocation(prev => ({
      ...prev,
      plus_code: plusCode,
      coordinates: { lat: c.lat, lng: c.lng },
    }))
    navigate('/rider/annotate')
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Plus code chip */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <PlusCodeChip code={plusCode} size="lg" />
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
        <div className="w-px h-10 bg-zinc-900 absolute opacity-70" />
        <div className="h-px w-10 bg-zinc-900 absolute opacity-70" />
        <div className="w-4 h-4 border-2 border-zinc-900 rounded-full absolute bg-white" />
      </div>

      {/* Confirm button */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000]">
        <button onClick={handleConfirm} className="btn-primary">
          Confirm this location
        </button>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-[1000] bg-white border border-zinc-200 text-zinc-700 rounded-md p-2 hover:bg-zinc-50 transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
