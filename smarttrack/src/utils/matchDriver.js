// Driver matching algorithm for academic project
// Simple distance-based matching with rating as tiebreaker
// Keeps scope manageable - no complex geospatial queries or real-time location tracking
import { haversineKm } from './distance'

/**
 * Ranks available drivers by distance to pickup location
 * Uses driver rating as tiebreaker when distances are equal
 * @param {Object} pickupCoords - { lat, lng } pickup coordinates
 * @param {Array} availableDrivers - Array of driver objects with { id, coordinates, rating }
 * @returns {Array} - Sorted array of drivers with added distance property
 */
export function rankDrivers(pickupCoords, availableDrivers) {
  if (!availableDrivers || availableDrivers.length === 0) {
    return []
  }

  // Calculate distance for each driver and add to object
  const driversWithDistance = availableDrivers.map(driver => {
    const distance = haversineKm(
      pickupCoords.lat,
      pickupCoords.lng,
      driver.coordinates?.lat || 0,
      driver.coordinates?.lng || 0
    )
    return {
      ...driver,
      distance
    }
  })

  // Sort by distance (ascending), then by rating (descending as tiebreaker)
  return driversWithDistance.sort((a, b) => {
    if (Math.abs(a.distance - b.distance) < 0.01) {
      // Distances are essentially equal, use rating as tiebreaker
      return (b.rating || 0) - (a.rating || 0)
    }
    return a.distance - b.distance
  })
}

/**
 * Finds the best driver for a pickup location
 * Returns the top-ranked driver or null if no drivers available
 * @param {Object} pickupCoords - { lat, lng } pickup coordinates
 * @param {Array} availableDrivers - Array of driver objects with { id, coordinates, rating }
 * @returns {Object|null} - Best driver match or null
 */
export function findBestDriver(pickupCoords, availableDrivers) {
  const rankedDrivers = rankDrivers(pickupCoords, availableDrivers)
  return rankedDrivers.length > 0 ? rankedDrivers[0] : null
}
