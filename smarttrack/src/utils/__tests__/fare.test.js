// Unit tests for fare.js utility functions
// Simple test cases for academic project - not exhaustive edge coverage
import { describe, it, expect } from 'vitest'
import { calculateFare, getFareConfig } from '../fare'

describe('calculateFare', () => {
  it('calculates fare based on distance between pickup and destination', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    const destinationCoords = { lat: 6.5344, lng: 3.3792 } // ~1 km north
    
    const fare = calculateFare(pickupCoords, destinationCoords)
    
    // Base fare (500) + 1 km × 100 = 600
    expect(fare).toBeGreaterThan(590)
    expect(fare).toBeLessThan(610)
  })

  it('returns base fare when coordinates are missing', () => {
    const fare = calculateFare(null, null)
    
    expect(fare).toBe(500) // Base fare
  })

  it('calculates fare for longer distances', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    const destinationCoords = { lat: 6.6018, lng: 3.3515 } // ~10 km
    
    const fare = calculateFare(pickupCoords, destinationCoords)
    
    // Base fare (500) + 10 km × 100 = 1500
    expect(fare).toBeGreaterThan(1400)
    expect(fare).toBeLessThan(1600)
  })

  it('returns base fare for zero distance', () => {
    const coords = { lat: 6.5244, lng: 3.3792 }
    
    const fare = calculateFare(coords, coords)
    
    expect(fare).toBe(500) // Base fare only
  })

  it('returns rounded whole number', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    const destinationCoords = { lat: 6.5334, lng: 3.3892 } // Diagonal distance
    
    const fare = calculateFare(pickupCoords, destinationCoords)
    
    // Should be a whole number (no decimals)
    expect(fare).toBe(Math.round(fare))
  })
})

describe('getFareConfig', () => {
  it('returns fare configuration object', () => {
    const config = getFareConfig()
    
    expect(config).toHaveProperty('baseFare')
    expect(config).toHaveProperty('perKmRate')
    expect(typeof config.baseFare).toBe('number')
    expect(typeof config.perKmRate).toBe('number')
  })

  it('returns expected base fare value', () => {
    const config = getFareConfig()
    
    expect(config.baseFare).toBe(500)
  })

  it('returns expected per-km rate value', () => {
    const config = getFareConfig()
    
    expect(config.perKmRate).toBe(100)
  })
})
