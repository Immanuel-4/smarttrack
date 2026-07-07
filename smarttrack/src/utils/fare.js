// Fare calculation utility for academic project
// Simple formula: base fare + (distance in km × per-km rate)
// Keeps scope manageable - no surge pricing, time-based rates, or complex factors
import { haversineKm } from './distance'

// Fare configuration - simple constants for academic scope
const BASE_FARE = 500 // Base fare in local currency (e.g., NGN)
const PER_KM_RATE = 100 // Rate per kilometer in local currency

/**
 * Calculates fare between pickup and destination coordinates
 * @param {Object} pickupCoords - { lat, lng } pickup coordinates
 * @param {Object} destinationCoords - { lat, lng } destination coordinates
 * @returns {number} - Calculated fare in local currency
 */
export function calculateFare(pickupCoords, destinationCoords) {
  if (!pickupCoords || !destinationCoords) {
    return BASE_FARE // Return base fare if coordinates missing
  }

  const distanceKm = haversineKm(
    pickupCoords.lat,
    pickupCoords.lng,
    destinationCoords.lat,
    destinationCoords.lng
  )

  // Formula: base fare + (distance × per-km rate)
  const fare = BASE_FARE + (distanceKm * PER_KM_RATE)
  
  // Round to nearest whole number for cleaner display
  return Math.round(fare)
}

/**
 * Gets fare configuration details for display
 * @returns {Object} - Configuration object with base fare and per-km rate
 */
export function getFareConfig() {
  return {
    baseFare: BASE_FARE,
    perKmRate: PER_KM_RATE,
  }
}
