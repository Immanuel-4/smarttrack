// Reusable Leaflet map wrapper with free-pan, re-center, and tile layer toggle
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Navigation, Layers } from 'lucide-react'

// Vite's bundler strips the internal path resolution Leaflet uses to find its default
// marker images, so we point it at the CDN copies instead.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapView({ center, zoom = 16, onMapReady, className = '', autoCenter = true }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const tileLayerRef = useRef(null)
  const [isPannedAway, setIsPannedAway] = useState(false)
  const [tileType, setTileType] = useState('satellite') // 'standard' | 'satellite'

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: false }).setView(center, zoom)
    
    // Initial tile layer
    const tileLayer = L.tileLayer(
      tileType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: tileType === 'satellite'
          ? 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          : '© OpenStreetMap contributors',
        maxZoom: 19,
      }
    ).addTo(map)
    
    tileLayerRef.current = tileLayer
    mapRef.current = map
    onMapReady?.(map)

    // Track manual panning
    map.on('movestart', () => {
      setIsPannedAway(true)
    })

    return () => {
      map.remove()
      mapRef.current = null
      tileLayerRef.current = null
    }
  }, [])

  // Auto-center only when enabled and user hasn't manually panned
  useEffect(() => {
    if (mapRef.current && autoCenter && !isPannedAway) {
      mapRef.current.setView(center, zoom)
    }
  }, [center[0], center[1], zoom, autoCenter, isPannedAway])

  // Handle re-center button click
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, zoom, {
        duration: 1,
        easeLinearity: 0.25,
      })
      setIsPannedAway(false)
    }
  }

  // Handle tile layer toggle
  const handleTileToggle = () => {
    if (!mapRef.current || !tileLayerRef.current) return
    
    const newTileType = tileType === 'satellite' ? 'standard' : 'satellite'
    setTileType(newTileType)
    
    // Remove old tile layer and add new one
    tileLayerRef.current.remove()
    const newTileLayer = L.tileLayer(
      newTileType === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: newTileType === 'satellite'
          ? 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          : '© OpenStreetMap contributors',
        maxZoom: 19,
      }
    ).addTo(mapRef.current)
    
    tileLayerRef.current = newTileLayer
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Re-center button */}
      {isPannedAway && (
        <button
          onClick={handleRecenter}
          className="absolute top-4 right-4 bg-white rounded-full shadow-lg p-3 hover:bg-zinc-50 transition-colors z-10"
          title="Re-center map"
        >
          <Navigation size={20} className="text-zinc-700" />
        </button>
      )}
      
      {/* Tile layer toggle */}
      <button
        onClick={handleTileToggle}
        className="absolute top-4 left-4 bg-white rounded-full shadow-lg p-3 hover:bg-zinc-50 transition-colors z-10"
        title={tileType === 'satellite' ? 'Switch to standard map' : 'Switch to satellite view'}
      >
        <Layers size={20} className="text-zinc-700" />
      </button>
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="bg-white rounded-full shadow-lg p-3 hover:bg-zinc-50 transition-colors"
          title="Zoom in"
        >
          <span className="text-zinc-700 font-bold text-lg">+</span>
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="bg-white rounded-full shadow-lg p-3 hover:bg-zinc-50 transition-colors"
          title="Zoom out"
        >
          <span className="text-zinc-700 font-bold text-lg">−</span>
        </button>
      </div>
    </div>
  )
}
