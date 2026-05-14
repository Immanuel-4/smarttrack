const KEY = 'smarttrack_active_trip'

export const cacheTrip = (trip) => {
  const cached = {
    tripId: trip.id,
    plusCode: trip.pickup_location?.plus_code,
    coordinates: trip.pickup_location?.coordinates,
    userNote: trip.pickup_location?.user_note,
    photoBase64: trip.pickup_location?.photo_base64,
    cachedAt: new Date().toISOString(),
  }
  localStorage.setItem(KEY, JSON.stringify(cached))
}

export const clearTripCache = () => {
  localStorage.removeItem(KEY)
}

export const loadCachedTrip = () => {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  const parsed = JSON.parse(raw)
  return {
    id: parsed.tripId,
    pickup_location: {
      plus_code: parsed.plusCode,
      coordinates: parsed.coordinates,
      user_note: parsed.userNote,
      photo_base64: parsed.photoBase64,
    },
  }
}
