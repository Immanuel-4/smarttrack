// Raw context object shared between TripProvider and useTrip — keeps imports circular-free.
import { createContext } from 'react'

const TripContext = createContext(null)

export default TripContext
