// Returns a human-readable area label for a GPS coordinate using the Nominatim API.
// Tries suburb → neighbourhood → city_district → town → city → county → first word of display_name.
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    const addr = data.address || {}
    return (
      addr.suburb ||
      addr.neighbourhood ||
      addr.city_district ||
      addr.town ||
      addr.city ||
      addr.county ||
      data.display_name?.split(',')[0] ||
      'Unknown area'
    )
  } catch {
    return 'Unknown area'
  }
}
