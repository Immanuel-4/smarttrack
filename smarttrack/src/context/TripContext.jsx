import { createContext, useContext, useState } from 'react'

const TripContext = createContext(null)

export function TripProvider({ children }) {
  const [pickupLocation, setPickupLocation] = useState(null)
  // { plus_code, coordinates: {lat, lng}, user_note, photo_base64, input_method, area_label }
  const [rideType, setRideType] = useState('Economy')
  const [activeTrip, setActiveTrip] = useState(null)

  return (
    <TripContext.Provider value={{
      pickupLocation, setPickupLocation,
      rideType, setRideType,
      activeTrip, setActiveTrip,
    }}>
      {children}
    </TripContext.Provider>
  )
}

export const useTrip = () => useContext(TripContext)
