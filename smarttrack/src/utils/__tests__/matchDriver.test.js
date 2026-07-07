// Unit tests for matchDriver.js utility functions
// Simple test cases for academic project - not exhaustive edge coverage
import { describe, it, expect } from 'vitest'
import { rankDrivers, findBestDriver } from '../matchDriver'

describe('rankDrivers', () => {
  it('ranks drivers by distance from pickup location', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    
    const drivers = [
      { id: 'driver1', coordinates: { lat: 6.5344, lng: 3.3792 }, rating: 4.5 }, // ~1 km north
      { id: 'driver2', coordinates: { lat: 6.5444, lng: 3.3792 }, rating: 5.0 }, // ~2 km north
      { id: 'driver3', coordinates: { lat: 6.5244, lng: 3.3892 }, rating: 4.0 }, // ~1 km east
    ]
    
    const ranked = rankDrivers(pickupCoords, drivers)
    
    // First driver should be closest (1 km)
    expect(ranked[0].id).toBe('driver1')
    expect(ranked[0].distance).toBeGreaterThan(0.9)
    expect(ranked[0].distance).toBeLessThan(1.2)
    
    // All drivers should have distance property
    ranked.forEach(driver => {
      expect(driver).toHaveProperty('distance')
      expect(driver.distance).toBeGreaterThan(0)
    })
  })

  it('uses rating as tiebreaker when distances are equal', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    
    const drivers = [
      { id: 'driver1', coordinates: { lat: 6.5344, lng: 3.3792 }, rating: 4.0 },
      { id: 'driver2', coordinates: { lat: 6.5344, lng: 3.3792 }, rating: 5.0 }, // Same location, higher rating
    ]
    
    const ranked = rankDrivers(pickupCoords, drivers)
    
    // Driver with higher rating should be first
    expect(ranked[0].id).toBe('driver2')
    expect(ranked[0].rating).toBe(5.0)
  })

  it('returns empty array when no drivers available', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    
    const ranked = rankDrivers(pickupCoords, [])
    
    expect(ranked).toEqual([])
  })

  it('handles drivers without coordinates', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    
    const drivers = [
      { id: 'driver1', rating: 4.5 }, // No coordinates
      { id: 'driver2', coordinates: { lat: 6.5344, lng: 3.3792 }, rating: 5.0 },
    ]
    
    const ranked = rankDrivers(pickupCoords, drivers)
    
    // Should still return ranked array
    expect(ranked.length).toBe(2)
    // Driver with coordinates should be ranked first
    expect(ranked[0].id).toBe('driver2')
  })
})

describe('findBestDriver', () => {
  it('returns the best driver for a pickup location', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    
    const drivers = [
      { id: 'driver1', coordinates: { lat: 6.5344, lng: 3.3792 }, rating: 4.5 },
      { id: 'driver2', coordinates: { lat: 6.5444, lng: 3.3792 }, rating: 5.0 },
    ]
    
    const best = findBestDriver(pickupCoords, drivers)
    
    expect(best).not.toBeNull()
    expect(best.id).toBe('driver1') // Closer driver
  })

  it('returns null when no drivers available', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    
    const best = findBestDriver(pickupCoords, [])
    
    expect(best).toBeNull()
  })

  it('returns null when drivers array is null', () => {
    const pickupCoords = { lat: 6.5244, lng: 3.3792 }
    
    const best = findBestDriver(pickupCoords, null)
    
    expect(best).toBeNull()
  })
})
