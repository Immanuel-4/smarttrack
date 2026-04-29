// TripProvider holds in-memory booking state shared across the full rider booking flow:
// RiderHome → PinAdjust → Annotate → RequestSummary → ActiveTrip.
import { useState } from 'react'
import TripContext from './tripContext'

export function TripProvider({ children }) {
  // pickupLocation shape: { plus_code, coordinates: {lat, lng}, user_note, photo_base64, input_method, area_label }
  const [pickupLocation, setPickupLocation] = useState(null)
  const [rideType, setRideType] = useState('Economy')
  // activeTrip holds { id } once the Firestore trip document has been created
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
