import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TripProvider } from './context/TripContext'
import { DemoProvider } from './context/DemoContext'

import Login from './pages/Login'
import Register from './pages/Register'

import RiderLayout from './components/RiderLayout'
import RiderHome from './pages/rider/RiderHome'
import PinAdjust from './pages/rider/PinAdjust'
import Annotate from './pages/rider/Annotate'
import RequestSummary from './pages/rider/RequestSummary'
import ActiveTrip from './pages/rider/ActiveTrip'

import DriverLayout from './components/DriverLayout'
import DriverHome from './pages/driver/DriverHome'
import IncomingRequest from './pages/driver/IncomingRequest'
import Navigate_ from './pages/driver/Navigate'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoProvider>
          <TripProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/rider" element={<RiderLayout />}>
                <Route index element={<RiderHome />} />
                <Route path="pin" element={<PinAdjust />} />
                <Route path="annotate" element={<Annotate />} />
                <Route path="summary" element={<RequestSummary />} />
                <Route path="active" element={<ActiveTrip />} />
              </Route>

              <Route path="/driver" element={<DriverLayout />}>
                <Route index element={<DriverHome />} />
                <Route path="requests" element={<IncomingRequest />} />
                <Route path="navigate" element={<Navigate_ />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </TripProvider>
        </DemoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
