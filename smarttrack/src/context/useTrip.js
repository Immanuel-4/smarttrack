// Hook for accessing trip booking state (pickupLocation, rideType, activeTrip).
import { useContext } from 'react'
import TripContext from './tripContext'

export const useTrip = () => useContext(TripContext)
