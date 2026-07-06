import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../context/useTrip'
import { compressPhoto } from '../../utils/photoCompress'
import PlusCodeChip from '../../components/PlusCodeChip'
import { Camera, X, ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default function Annotate() {
  const navigate = useNavigate()
  const { pickupLocation, setPickupLocation } = useTrip()
  const [note, setNote] = useState(pickupLocation?.user_note || '')
  const [photo, setPhoto] = useState(pickupLocation?.photo_base64 ? `data:image/jpeg;base64,${pickupLocation.photo_base64}` : null)
  const [photoInfo, setPhotoInfo] = useState(null)
  const [compressing, setCompressing] = useState(false)
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const fileRef = useRef(null)
  const galleryFileRef = useRef(null)

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
      fileRef.current?.click()
    } else {
      galleryFileRef.current?.click()
    }
  }

  const handleContinue = () => {
    setPickupLocation(prev => ({
      ...prev,
      user_note: note,
      photo_base64: photoInfo?.base64 || prev?.photo_base64 || null,
    }))
    navigate('/rider/summary')
  }

  if (!pickupLocation) {
    navigate('/rider')
    return null
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-50">
      <div className="max-w-lg mx-auto p-4 pb-24 space-y-4">
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={16} strokeWidth={1.5} />
          </button>
          <h1 className="text-base font-medium text-zinc-900">Add pickup details</h1>
        </div>

        {/* Plus code */}
        <div className="card">
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">Confirmed location</p>
          <PlusCodeChip code={pickupLocation.plus_code} size="lg" />
          {pickupLocation.area_label && (
            <p className="text-sm text-zinc-600 mt-2">{pickupLocation.area_label}</p>
          )}
          <button
            onClick={() => navigate('/rider/pin')}
            className="text-xs text-zinc-500 mt-2 hover:text-zinc-900 transition-colors block"
          >
            Adjust pin
          </button>
        </div>

        {/* Landmark note */}
        <div className="card space-y-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Landmark note for driver</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="e.g. Blue gate opposite Eko Hospital, under mango tree"
          />
        </div>

        {/* Photo */}
        <div className="card space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Pickup photo</p>
              <p className="text-xs text-zinc-400 mt-1">Face outward toward the street so the driver can spot you</p>
            </div>
            <button
              onClick={() => setShowPhotoDialog(true)}
              disabled={compressing}
              className="text-xs font-medium text-zinc-700 hover:text-zinc-900 transition-colors shrink-0"
            >
              {compressing ? 'Compressing…' : photo ? 'Change' : 'Add photo'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          <input ref={galleryFileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

          {!photo && (
            <button
              onClick={() => setShowPhotoDialog(true)}
              disabled={compressing}
              className="w-full border border-dashed border-zinc-300 rounded-lg bg-zinc-50 py-8 flex flex-col items-center gap-2 hover:bg-zinc-100 transition-colors"
            >
              <Camera size={20} strokeWidth={1.5} className="text-zinc-400" />
              <span className="text-xs text-zinc-400">Tap to add a photo</span>
            </button>
          )}

          {photo && (
            <div className="relative">
              <img src={photo} alt="pickup" className="w-full h-48 object-cover rounded-md border border-zinc-200" />
              {photoInfo && (
                <span className="absolute bottom-2 right-2 bg-zinc-900/70 text-white text-xs px-2 py-0.5 rounded-md">
                  {photoInfo.sizeKB}KB
                </span>
              )}
              <button
                onClick={() => { setPhoto(null); setPhotoInfo(null) }}
                className="absolute top-2 right-2 bg-white border border-zinc-200 rounded-md p-1 text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        <button onClick={handleContinue} className="btn-primary">
          Continue to summary
        </button>
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
