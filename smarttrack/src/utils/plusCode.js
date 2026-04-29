import { OpenLocationCode } from 'open-location-code'

const olc = new OpenLocationCode()

export function encodePlusCode(lat, lng) {
  return olc.encode(lat, lng, 10)
}

export function decodePlusCode(code) {
  const area = olc.decode(code)
  return { lat: area.latitudeCenter, lng: area.longitudeCenter }
}

export function isValidPlusCode(code) {
  return olc.isValid(code)
}
