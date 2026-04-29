import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { encodePlusCode } from '../../utils/plusCode'
import { reverseGeocode } from '../../utils/geocode'
import { useTrip } from '../../context/TripContext'
import PlusCodeChip from '../../components/PlusCodeChip'

const DEFAULT_CENTER = [6.5244, 3.3792] // Lagos

export default function RiderHome() {
  const navigate = useNavigate()
  const { setPickupLocation } = useTrip()
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [plusCode, setPlusCode] = useState('')
  const [areaLabel, setAreaLabel] = useState('')
  const [pinLocked, setPinLocked] = useState(false)
  const geocodeTimer = useRef(null)

  const updateCode = useCallback((lat, lng) => {
    setPlusCode(encodePlusCode(lat, lng))
    clearTimeout(geocodeTimer.current)
    geocodeTimer.current = setTimeout(async () => {
      const label = await reverseGeocode(lat, lng)
      setAreaLabel(label)
    }, 800)
  }, [])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const map = L.map(mapContainer.current, { zoomControl: false }).setView(DEFAULT_CENTER, 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const marker = L.marker(DEFAULT_CENTER, { draggable: true }).addTo(map)
    markerRef.current = marker
    mapRef.current = map

    updateCode(DEFAULT_CENTER[0], DEFAULT_CENTER[1])

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      updateCode(lat, lng)
    })

    map.on('move', () => {
      if (!pinLocked) {
        const c = map.getCenter()
        marker.setLatLng(c)
        updateCode(c.lat, c.lng)
      }
    })

    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      const pos = [coords.latitude, coords.longitude]
      map.setView(pos, 16)
      marker.setLatLng(pos)
      updateCode(coords.latitude, coords.longitude)
    })

    return () => { map.remove(); mapRef.current = null }
  }, [])

  const recenter = () => {
    setPinLocked(false)
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      const pos = [coords.latitude, coords.longitude]
      mapRef.current?.setView(pos, 16)
      markerRef.current?.setLatLng(pos)
      updateCode(coords.latitude, coords.longitude)
    })
  }

  const handleDropPin = () => {
    const latlng = markerRef.current?.getLatLng()
    if (!latlng) return
    setPinLocked(true)
    setCenter([latlng.lat, latlng.lng])
    setPickupLocation({
      plus_code: plusCode,
      coordinates: { lat: latlng.lat, lng: latlng.lng },
      area_label: areaLabel,
      input_method: 'map',
    })
    navigate('/rider/annotate')
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none">
        <PlusCodeChip code={plusCode} />
        {areaLabel && (
          <span className="bg-white/90 backdrop-blur-sm text-xs text-gray-700 px-3 py-1 rounded-full shadow">
            {areaLabel}
          </span>
        )}
      </div>

      {/* Crosshair */}
      {!pinLocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
          <div className="w-0.5 h-8 bg-primary absolute" />
          <div className="h-0.5 w-8 bg-primary absolute" />
          <div className="w-3 h-3 border-2 border-primary rounded-full absolute bg-white" />
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000] flex flex-col gap-3">
        <button onClick={recenter} className="self-end bg-white shadow-lg border border-gray-200 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
          📍 My location
        </button>
        <button onClick={handleDropPin} className="btn-primary shadow-lg">
          Drop pin here
        </button>
      </div>
    </div>
  )
}
