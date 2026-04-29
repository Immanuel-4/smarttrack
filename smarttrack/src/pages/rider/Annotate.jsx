// Annotate lets the rider attach a landmark note and a compressed photo to their
// pickup location before proceeding to the booking summary screen.
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../../context/useTrip'
import { compressPhoto } from '../../utils/photoCompress'
import PlusCodeChip from '../../components/PlusCodeChip'

export default function Annotate() {
  const navigate = useNavigate()
  const { pickupLocation, setPickupLocation } = useTrip()
  const [note, setNote] = useState(pickupLocation?.user_note || '')
  const [photo, setPhoto] = useState(pickupLocation?.photo_base64 ? `data:image/jpeg;base64,${pickupLocation.photo_base64}` : null)
  const [photoInfo, setPhotoInfo] = useState(null)
  const [compressing, setCompressing] = useState(false)
  const fileRef = useRef(null)

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCompressing(true)
    try {
      const { dataUrl, base64, sizeKB } = await compressPhoto(file)
      setPhoto(dataUrl)
      setPhotoInfo({ sizeKB, base64 })
    } finally {
      setCompressing(false)
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
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-lg mx-auto p-4 pb-24 space-y-5">
        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">←</button>
          <h1 className="text-lg font-semibold text-gray-800">Add pickup details</h1>
        </div>

        {/* Plus code */}
        <div className="card">
          <p className="text-xs text-gray-500 mb-2">Confirmed pickup location</p>
          <PlusCodeChip code={pickupLocation.plus_code} size="lg" />
          {pickupLocation.area_label && (
            <p className="text-sm text-gray-600 mt-2">{pickupLocation.area_label}</p>
          )}
          <button
            onClick={() => navigate('/rider/pin')}
            className="text-xs text-primary mt-2 hover:underline block"
          >
            Adjust pin →
          </button>
        </div>

        {/* Landmark note */}
        <div className="card space-y-2">
          <label className="text-sm font-medium text-gray-700">Landmark / note for driver</label>
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
              <p className="text-sm font-medium text-gray-700">Pickup photo</p>
              <p className="text-xs text-gray-500 mt-0.5">📸 Face outward toward the street so the driver can spot you</p>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={compressing}
              className="text-primary text-sm font-medium hover:underline shrink-0"
            >
              {compressing ? 'Compressing…' : photo ? 'Change' : 'Add photo'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />

          {photo && (
            <div className="relative">
              <img src={photo} alt="pickup" className="w-full h-48 object-cover rounded-lg" />
              {photoInfo && (
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {photoInfo.sizeKB}KB · compressed
                </span>
              )}
              <button onClick={() => { setPhoto(null); setPhotoInfo(null) }} className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-gray-600 hover:bg-white">✕</button>
            </div>
          )}
        </div>

        <button onClick={handleContinue} className="btn-primary">
          Continue to summary →
        </button>
      </div>
    </div>
  )
}
