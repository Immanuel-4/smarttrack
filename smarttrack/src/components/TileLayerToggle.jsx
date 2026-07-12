import { useRef, useState, useEffect } from 'react'
import { Layers } from 'lucide-react'
import L from 'leaflet'

export default function TileLayerToggle({ map, className = '' }) {
  const [tileType, setTileType] = useState('satellite') // 'standard' | 'satellite'
  const tileLayerRef = useRef(null)

  useEffect(() => {
    if (!map) return

    // Add initial tile layer
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

    return () => {
      if (tileLayerRef.current) {
        tileLayerRef.current.remove()
        tileLayerRef.current = null
      }
    }
  }, [map])

  const handleToggle = () => {
    if (!map || !tileLayerRef.current) return
    
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
    ).addTo(map)
    
    tileLayerRef.current = newTileLayer
  }

  return (
    <button
      onClick={handleToggle}
      className={`bg-white rounded-full shadow-lg p-3 hover:bg-zinc-50 transition-colors z-10 ${className}`}
      title={tileType === 'satellite' ? 'Switch to standard map' : 'Switch to satellite view'}
    >
      <Layers size={20} className="text-zinc-700" />
    </button>
  )
}
