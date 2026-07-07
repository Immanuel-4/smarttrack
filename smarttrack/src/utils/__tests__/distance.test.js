// Unit tests for distance.js utility functions
// Simple test cases for academic project - not exhaustive edge coverage
import { describe, it, expect } from 'vitest'
import { haversineKm, bearingDeg } from '../distance'

describe('haversineKm', () => {
  it('calculates distance between two points in kilometers', () => {
    // Test: Lagos coordinates (approximate)
    const lat1 = 6.5244
    const lng1 = 3.3792
    const lat2 = 6.6018
    const lng2 = 3.3515
    
    const distance = haversineKm(lat1, lng1, lat2, lng2)
    
    // Distance should be approximately 9-10 km
    expect(distance).toBeGreaterThan(8)
    expect(distance).toBeLessThan(12)
  })

  it('returns 0 for identical coordinates', () => {
    const lat = 6.5244
    const lng = 3.3792
    
    const distance = haversineKm(lat, lng, lat, lng)
    
    expect(distance).toBe(0)
  })

  it('calculates distance for short distances', () => {
    // Test: 1 km apart approximately
    const lat1 = 6.5244
    const lng1 = 3.3792
    const lat2 = 6.5334 // ~1 km north
    const lng2 = 3.3792
    
    const distance = haversineKm(lat1, lng1, lat2, lng2)
    
    expect(distance).toBeGreaterThan(0.9)
    expect(distance).toBeLessThan(1.2)
  })
})

describe('bearingDeg', () => {
  it('calculates bearing between two points in degrees', () => {
    // Test: Heading north
    const lat1 = 6.5244
    const lng1 = 3.3792
    const lat2 = 6.5344 // North
    const lng2 = 3.3792
    
    const bearing = bearingDeg(lat1, lng1, lat2, lng2)
    
    // Bearing should be approximately 0 degrees (north)
    expect(bearing).toBeGreaterThan(350)
    expect(bearing).toBeLessThan(10)
  })

  it('calculates bearing for east direction', () => {
    // Test: Heading east
    const lat1 = 6.5244
    const lng1 = 3.3792
    const lat2 = 6.5244
    const lng2 = 3.3892 // East
    
    const bearing = bearingDeg(lat1, lng1, lat2, lng2)
    
    // Bearing should be approximately 90 degrees (east)
    expect(bearing).toBeGreaterThan(80)
    expect(bearing).toBeLessThan(100)
  })

  it('returns bearing between 0 and 360', () => {
    const bearing = bearingDeg(6.5244, 3.3792, 6.5344, 3.3892)
    
    expect(bearing).toBeGreaterThanOrEqual(0)
    expect(bearing).toBeLessThanOrEqual(360)
  })
})
