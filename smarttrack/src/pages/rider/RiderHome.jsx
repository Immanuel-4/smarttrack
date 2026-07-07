import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { encodePlusCode } from '../../utils/plusCode'
import { reverseGeocode } from '../../utils/geocode'
import { compressPhoto } from '../../utils/photoCompress'
import { useTrip } from '../../context/useTrip'
import PlusCodeChip from '../../components/PlusCodeChip'
import { Locate, Camera, X, Image as ImageIcon } from 'lucide-react'

const DEFAULT_CENTER = [6.5244, 3.3792] // Lagos

// Black teardrop SVG pin with white inner circle
const BLACK_PIN_HTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 7.583 12 24 12 24S24 19.583 24 12C24 5.373 18.627 0 12 0z" fill="#18181b"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>
`

export default function RiderHome() {
  const navigate = useNavigate()
  const { setPickupLocation } = useTrip()

  // Map refs
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const isMapValidRef = useRef(true) // Track if map is still valid
  // Use a ref for pin-locked state so the Leaflet 'move' closure always reads the current value
  const pinLockedRef = useRef(false)

  // UI state
  const [plusCode, setPlusCode] = useState('')
  const [areaLabel, setAreaLabel] = useState('')
  const [pinLocked, setPinLocked] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Form state (shared between desktop panel and mobile sheet)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoInfo, setPhotoInfo] = useState(null)
  const [compressing, setCompressing] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)

  const geocodeTimer = useRef(null)
  const desktopFileRef = useRef(null)
  const desktopGalleryFileRef = useRef(null)
  const mobileFileRef = useRef(null)
  const mobileGalleryFileRef = useRef(null)

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
    // Zoom controls at top-right so they don't clash with the drop-pin button
    L.control.zoom({ position: 'topright' }).addTo(map)

    const blackPinIcon = L.divIcon({
      className: '',
      html: BLACK_PIN_HTML,
      iconSize: [24, 36],
      iconAnchor: [12, 36],
    })

    const marker = L.marker(DEFAULT_CENTER, { icon: blackPinIcon }).addTo(map)
    markerRef.current = marker
    mapRef.current = map

    updateCode(DEFAULT_CENTER[0], DEFAULT_CENTER[1])

    map.on('move', () => {
      if (!pinLockedRef.current) {
        const c = map.getCenter()
        marker.setLatLng(c)
        updateCode(c.lat, c.lng)
      }
    })

    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      // Check if map is still valid before setting view (prevents race condition)
      if (!isMapValidRef.current || !mapRef.current) return
      
      try {
        const pos = [coords.latitude, coords.longitude]
        map.setView(pos, 16)
        marker.setLatLng(pos)
        updateCode(coords.latitude, coords.longitude)
      } catch (err) {
        // Ignore errors from map operations after cleanup
        console.warn('Geolocation callback error (map may be removed):', err)
      }
    })

    return () => { 
      isMapValidRef.current = false
      map.remove(); 
      mapRef.current = null 
    }
  }, [])

  const recenter = () => {
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      const pos = [coords.latitude, coords.longitude]
      mapRef.current?.setView(pos, 16)
    })
  }

  // Mobile: lock pin and open bottom sheet
  const handleDropPin = () => {
    pinLockedRef.current = true
    setPinLocked(true)
    setSheetOpen(true)
  }

  // Mobile: unlock pin and close sheet
  const handleReposition = () => {
    pinLockedRef.current = false
    setPinLocked(false)
    setSheetOpen(false)
  }

// Submit: save to TripContext and navigate to destination selection
const handleRequest = () => {
  const latlng = markerRef.current?.getLatLng() ?? mapRef.current?.getCenter()
  if (!latlng) return
  setPickupLocation({
    plus_code: plusCode,
    coordinates: { lat: latlng.lat, lng: latlng.lng },
    area_label: areaLabel,
    input_method: 'map',
    user_note: note,
    photo_base64: photoInfo?.base64 ?? null,
  })
  navigate('/rider/destination')  
}

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCompressing(true)
    setShowPhotoDialog(false)
    try {
      const { dataUrl, base64, sizeKB } = await compressPhoto(file)
      setPhoto(dataUrl)
      setPhotoInfo({ sizeKB, base64 })
    } finally {
      setCompressing(false)
    }
  }

  const handlePhotoOptionClick = (option) => {
    if (option === 'camera') {
      desktopFileRef.current?.click()
      mobileFileRef.current?.click()
    } else {
      desktopGalleryFileRef.current?.click()
      mobileGalleryFileRef.current?.click()
    }
  }

  const clearPhoto = () => { setPhoto(null); setPhotoInfo(null) }

  // Shared JSX for the photo upload section (used in both panel and sheet)
  const photoSection = (fileRef, galleryFileRef) => (
    <>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
      <input ref={galleryFileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      {!photo ? (
        <button
          onClick={() => setShowPhotoDialog(true)}
          disabled={compressing}
          className="w-full border border-dashed border-zinc-300 rounded-md bg-zinc-50 py-6 flex flex-col items-center gap-2 hover:bg-zinc-100 transition-colors"
        >
          <Camera size={20} strokeWidth={1.5} className="text-zinc-400" />
          <span className="text-xs text-zinc-400">{compressing ? 'Compressing…' : 'Add a photo'}</span>
        </button>
      ) : (
        <div className="relative">
          <img src={photo} alt="pickup" className="w-full h-36 object-cover rounded-md border border-zinc-200" />
          {photoInfo && (
            <span className="absolute bottom-2 left-2 bg-zinc-900/70 text-white text-xs px-2 py-0.5 rounded-md">
              {photoInfo.sizeKB}KB
            </span>
          )}
          <button
            onClick={clearPhoto}
            className="absolute top-2 right-2 bg-white border border-zinc-200 rounded-md p-1 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </>
  )

  return (
    <div className="flex h-full">

      {/* ── Map column ── */}
      <div className="relative flex-1 min-w-0">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Crosshair — hidden when mobile sheet is open (pin is locked, map doesn't update) */}
        {!sheetOpen && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
            <div className="w-px h-8 bg-zinc-900 absolute opacity-60" />
            <div className="h-px w-8 bg-zinc-900 absolute opacity-60" />
            <div className="w-2.5 h-2.5 border-2 border-zinc-900 rounded-full absolute bg-white" />
          </div>
        )}

        {/* Recenter — sits below zoom controls at top-right */}
        <button
          onClick={recenter}
          className="absolute top-28 right-2.5 z-[1000] bg-white border border-zinc-200 text-zinc-700 rounded-md p-2 hover:bg-zinc-50 transition-colors"
          title="My location"
        >
          <Locate size={16} strokeWidth={1.5} />
        </button>

        {/* Drop-pin button — mobile only, fixed to viewport so it clears the tab bar */}
        {!sheetOpen && (
          <div
            className="md:hidden fixed z-[1000]"
            style={{ bottom: '88px', left: '50%', transform: 'translateX(-50%)' }}
          >
            <button
              onClick={handleDropPin}
              className="bg-zinc-900 text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              Drop pin here
            </button>
          </div>
        )}
      </div>

      {/* ── Right panel — desktop only (md+) ── */}
      <div className="hidden md:flex flex-col w-80 bg-white border-l border-zinc-200 shrink-0">

        {/* Plus Code + area label */}
        <div className="p-4 border-b border-zinc-100">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Pickup location</p>
          <div className="border border-zinc-200 rounded-md p-2 font-mono">
            <PlusCodeChip code={plusCode} size="lg" />
          </div>
          {areaLabel && (
            <p className="text-sm text-zinc-500 mt-2">{areaLabel}</p>
          )}
          {!areaLabel && (
            <p className="text-sm text-zinc-400 mt-2 italic">Pan the map to set your pickup</p>
          )}
        </div>

        {/* Divider + form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
              Landmark note for driver
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="e.g. Blue gate opposite Eko Hospital, under mango tree"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
              Pickup photo
            </label>
            {photoSection(desktopFileRef, desktopGalleryFileRef)}
          </div>
        </div>

        {/* Request ride CTA */}
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={handleRequest}
            disabled={!plusCode}
            className="w-full bg-zinc-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Request ride
          </button>
        </div>
      </div>

      {/* ── Mobile bottom sheet — slides up after pin is dropped ── */}
      {/*
        Positioned at bottom-16 (64px = approx tab bar height) so the tab bar
        stays visible above the sheet. translate-y-full slides it off-screen downward.
      */}
      <div
        className={`md:hidden fixed inset-x-0 rounded-t-2xl bg-white border-t border-zinc-200 z-[2000] transition-transform duration-300 ease-out overflow-y-auto ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ bottom: '64px', maxHeight: '65vh' }}
      >
        <div>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-zinc-200 rounded-full" />
          </div>

          {/* Sheet header */}
          <div className="px-4 py-3 border-b border-zinc-100">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Pickup location</p>
              <button
                onClick={handleReposition}
                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
              >
                Reposition
              </button>
            </div>
            <PlusCodeChip code={plusCode} size="lg" />
            {areaLabel && <p className="text-sm text-zinc-500 mt-1.5">{areaLabel}</p>}
          </div>

          {/* Sheet form */}
          <div className="p-4 pb-8 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
                Landmark note for driver
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="e.g. Blue gate opposite Eko Hospital, under mango tree"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">
                Pickup photo
              </label>
              {photoSection(mobileFileRef, mobileGalleryFileRef)}
            </div>

            <button
              onClick={handleRequest}
              className="w-full bg-zinc-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              Request ride
            </button>
          </div>
        </div>
      </div>

      {/* Photo source dialog */}
      {showPhotoDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-4" onClick={() => setShowPhotoDialog(false)}>
          <div className="bg-white rounded-lg p-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-medium text-zinc-900 mb-3">Add photo</h3>
            <div className="space-y-2">
              <button
                onClick={() => handlePhotoOptionClick('camera')}
                className="w-full flex items-center gap-3 p-3 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors text-left"
              >
                <Camera size={18} strokeWidth={1.5} className="text-zinc-600" />
                <span className="text-sm text-zinc-700">Take photo</span>
              </button>
              <button
                onClick={() => handlePhotoOptionClick('gallery')}
                className="w-full flex items-center gap-3 p-3 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors text-left"
              >
                <ImageIcon size={18} strokeWidth={1.5} className="text-zinc-600" />
                <span className="text-sm text-zinc-700">Choose from gallery</span>
              </button>
            </div>
            <button
              onClick={() => setShowPhotoDialog(false)}
              className="w-full mt-3 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
