// PinAdjust shows a full-screen map where the rider can drag or pan to fine-tune
// the pickup pin. The Plus Code updates live as the map center moves.
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { encodePlusCode } from '../../utils/plusCode'
import { useTrip } from '../../context/useTrip'
import PlusCodeChip from '../../components/PlusCodeChip'

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
        <div className="w-0.5 h-10 bg-primary absolute" />
        <div className="h-0.5 w-10 bg-primary absolute" />
        <div className="w-4 h-4 border-2 border-primary rounded-full absolute bg-white" />
      </div>

      {/* Confirm button */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000]">
        <button onClick={handleConfirm} className="btn-primary shadow-lg">
          Confirm this location
        </button>
      </div>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-[1000] bg-white shadow border border-gray-200 text-sm font-medium text-gray-700 px-3 py-2 rounded-lg"
      >
        ← Back
      </button>
    </div>
  )
}
