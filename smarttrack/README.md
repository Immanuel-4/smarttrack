# SmartTrack - Ride-Sharing Application

A modern ride-sharing platform built with React that connects riders with drivers for on-demand transportation. The application features real-time trip management, location-based services, and a user-friendly interface for both riders and drivers.

## Features

### For Riders
- **Location Selection**: Drop pins on an interactive map to set pickup and destination locations
- **Photo Attachment**: Add photos of pickup locations via camera or gallery
- **Landmark Notes**: Add descriptive notes to help drivers find pickup points
- **Trip Tracking**: Real-time tracking of driver location and arrival status
- **Dual-Phase Tracking**: Track driver approaching pickup and en route to destination
- **Fare Estimation**: View estimated fare before requesting a ride
- **Trip History**: View past trips and ratings
- **Trip Cancellation**: Cancel active trips while searching for driver or after driver acceptance
- **Driver Confirmation**: Confirm meeting with driver to complete trip
- **Trip Persistence**: Active trips survive page refresh — automatically recovered from Firestore

### For Drivers
- **Request Management**: View and accept incoming ride requests
- **Smart Matching**: Automatic driver matching based on distance and rating
- **Single-Trip Enforcement**: Drivers can only accept one trip at a time — automatically redirected to active navigation
- **Dual-Phase Navigation**: Navigate to pickup location, then to destination
- **Map Options**: Toggle between satellite imagery and street maps
- **Rider Communication**: View rider phone numbers and call riders directly
- **Arrival Confirmation**: Confirm arrival at pickup with call rider prompt
- **Trip Completion**: Trips completed when rider confirms meeting, or driver can manually complete
- **Driver Trip Completion**: Drivers can close a trip at any time with a "Complete Trip" button
- **Offline Navigation**: Cached trip data for offline navigation with connectivity indicator

### System Features
- **User Authentication**: Firebase-based authentication with email/password
- **Demo Mode**: Toggle between Rider and Driver views without changing auth role (via DemoBar)
- **Real-time Updates**: Firestore real-time database for live trip status
- **Offline Support**: Cached trip data for offline navigation with live/cache data source indicators
- **Phone Verification**: Required phone numbers for all users with dismissible prompt
- **Driver Matching**: Distance-based driver matching with rating tiebreaker
- **Fare Calculation**: Automatic fare estimation based on distance
- **Security Rules**: Firestore security rules for data access control
- **Responsive Design**: Mobile-first UI with desktop support
- **Draggable Bottom Sheets**: Google Maps-style draggable bottom sheets for trip details
- **Free-Pan Maps**: Interactive maps with manual panning and re-center capability
- **Tile Layer Toggle**: Switch between standard and satellite map views
- **Trip Completion Receipt**: Driver fare receipt screen when trip is completed
- **Reverse Geocoding**: Automatic area label resolution via Nominatim API
- **Plus Code Integration**: Open Location Code for precise location identification
- **Vercel Deployment**: Ready for deployment with Vercel configuration

## Technology Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **Vite 8**: Fast build tool and development server
- **React Router 7**: Client-side routing
- **TailwindCSS 3**: Utility-first CSS framework
- **Lucide React**: Icon library

### Maps & Location
- **Leaflet**: Open-source mapping library
- **OpenStreetMap**: Standard street map tiles
- **Esri World Imagery**: Satellite/aerial imagery tiles
- **Open Location Code**: Plus Codes for location identification
- **Nominatim API**: Reverse geocoding for area labels
- **OSRM API**: Road-following route visualization

### Backend Services
- **Firebase Authentication**: User authentication and authorization
- **Firebase Firestore**: NoSQL real-time database
- **Geolocation API**: Browser-based GPS positioning

### Testing & Quality
- **Vitest 4**: Unit testing framework
- **ESLint 10**: Code linting with React hooks plugin

## Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Firebase configuration credentials

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smarttrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Create a `.env.local` file in the project root with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

6. **Run tests**
   ```bash
   npm run test
   ```

### Vercel Deployment

The project includes a `vercel.json` configuration for easy deployment. Connect your GitHub repository to Vercel and add the Firebase environment variables in the Vercel dashboard.

## Project Structure

```
smarttrack/
├── public/                      # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── BottomNav.jsx        # Mobile bottom navigation bar
│   │   ├── BottomSheet.jsx      # Draggable bottom sheet component
│   │   ├── DemoBar.jsx          # Demo mode toggle bar (Rider/Driver view)
│   │   ├── DriverLayout.jsx     # Layout wrapper for /driver routes
│   │   ├── MapView.jsx          # Reusable map component
│   │   ├── PlusCodeChip.jsx     # Plus Code display chip
│   │   ├── RiderLayout.jsx      # Layout wrapper for /rider routes
│   │   ├── Sidebar.jsx          # Desktop sidebar navigation
│   │   └── TileLayerToggle.jsx  # Map tile layer toggle (standard/satellite)
│   ├── context/                 # React context providers
│   │   ├── authContext.js       # Raw AuthContext object
│   │   ├── AuthContext.jsx      # AuthProvider component
│   │   ├── useAuth.js           # useAuth() hook
│   │   ├── tripContext.js       # Raw TripContext object
│   │   ├── TripContext.jsx      # TripProvider component
│   │   ├── useTrip.js           # useTrip() hook
│   │   ├── demoContext.js       # Raw DemoContext object
│   │   ├── DemoContext.jsx      # DemoProvider component
│   │   └── useDemo.js           # useDemo() hook
│   ├── firebase/
│   │   └── config.js            # Firebase configuration
│   ├── hooks/                   # Custom React hooks
│   ├── pages/                   # Page components
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   ├── driver/              # Driver-specific pages
│   │   │   ├── DriverHome.jsx   # Driver home/map view
│   │   │   ├── IncomingRequest.jsx  # Incoming trip requests
│   │   │   └── Navigate.jsx     # Navigation with dual-phase routing
│   │   ├── rider/               # Rider-specific pages
│   │   │   ├── ActiveTrip.jsx   # Active trip tracking
│   │   │   ├── Annotate.jsx     # Pickup photo/notes
│   │   │   ├── DestinationSelect.jsx  # Destination pin selection
│   │   │   ├── PinAdjust.jsx    # Pickup pin adjustment
│   │   │   ├── RequestSummary.jsx     # Trip request summary
│   │   │   └── RiderHome.jsx    # Rider home/map view
│   │   └── shared/              # Shared pages
│   │       ├── Account.jsx      # User account/profile
│   │       └── TripHistory.jsx  # Trip history
│   ├── utils/                   # Utility functions
│   │   ├── __tests__/           # Unit tests
│   │   │   ├── distance.test.js
│   │   │   ├── fare.test.js
│   │   │   └── matchDriver.test.js
│   │   ├── distance.js          # Haversine distance calculation
│   │   ├── fare.js              # Fare calculation
│   │   ├── geocode.js           # Reverse geocoding (Nominatim API)
│   │   ├── matchDriver.js       # Driver matching algorithm
│   │   ├── photoCompress.js     # Photo compression utility
│   │   ├── plusCode.js          # Plus Code encode/decode utilities
│   │   └── tripCache.js         # Trip caching for offline support
│   ├── App.jsx                  # Root component with routing
│   ├── index.css                # Global styles / TailwindCSS
│   └── main.jsx                 # Application entry point
├── .gitignore
├── eslint.config.js             # ESLint configuration
├── firestore.rules              # Firestore security rules
├── index.html                   # HTML entry point
├── package.json
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # TailwindCSS configuration
├── vercel.json                  # Vercel deployment configuration
├── vite.config.js               # Vite configuration
└── vitest.config.js             # Vitest configuration
```

## Database Schema

### Users Collection
```javascript
{
  email: string,
  name: string,
  userType: 'Rider' | 'Driver',
  phone: string,
  rating: number,
  totalTrips: number,
  createdAt: timestamp
}
```

### Trips Collection
```javascript
{
  riderId: string,
  driverId: string,
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  cancelledBy: 'RIDER' | 'DRIVER', // Optional, tracks who cancelled the trip
  pickup_location: {
    coordinates: { lat, lng },
    plus_code: string,
    area_label: string,
    user_note: string,
    photo_base64: string
  },
  destination: {
    coordinates: { lat, lng },
    plus_code: string,
    area_label: string
  },
  rideType: string,
  estimatedFare: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Key Features Implementation

### Destination Selection
**How it works:**
1. After selecting pickup location on RiderHome, user confirms via PinAdjust
2. Navigation redirects to DestinationSelect page with interactive map
3. User drops a pin on the map to select destination location
4. Map displays real-time Plus Code as user moves the pin
5. On confirmation, destination data (coordinates, plus_code, area_label) is saved to TripContext
6. User proceeds to Annotate page for optional pickup photo/notes

**Technical Implementation:**
- Reuses pin-drop UI pattern from PinAdjust.jsx for consistency
- Simplified destination schema: only coordinates, plus_code, area_label (no photo/note)
- Uses Leaflet map with OpenStreetMap tiles
- Plus Code generation via encodePlusCode utility
- State managed through TripContext (destination, setDestination)
- Booking flow: RiderHome → PinAdjust → DestinationSelect → Annotate → RequestSummary

**Design Decision:**
Pin-drop selection instead of address search API to keep complexity manageable for academic scope while still providing precise location selection.

### Driver Matching Algorithm
**How it works:**
1. When rider requests trip, system queries all available drivers from Firestore
2. Each driver's distance to pickup location is calculated using Haversine formula
3. Drivers are ranked by distance (closest first)
4. If distances are equal, driver rating serves as tiebreaker (higher rating wins)
5. Best driver is assigned to the trip immediately
6. Trip document is created with driverId, status set to PENDING

**Technical Implementation:**
- Haversine distance calculation in `src/utils/distance.js`
- Driver ranking and selection in `src/utils/matchDriver.js`
- Functions: `rankDrivers(pickupCoords, drivers)` and `findBestDriver(pickupCoords, drivers)`
- Simple approach suitable for academic scope (no real-time driver location tracking)
- All drivers considered "available" for simplicity (production would filter by status)

**Algorithm:**
```
1. For each driver:
   - Calculate distance to pickup using Haversine formula
   - Store distance and rating
2. Sort drivers by distance (ascending)
3. For ties, sort by rating (descending)
4. Return top-ranked driver
```

### Dual-Phase Navigation
**How it works:**
1. Driver accepts trip → status changes to ACCEPTED, navigation phase set to 'toPickup'
2. Driver sees route from current location to pickup point
3. Upon arrival at pickup, driver taps "Arrived" button
4. Status changes to IN_PROGRESS, navigation phase switches to 'toDestination'
5. Driver sees route from pickup to destination for passenger transport
6. Upon reaching destination, driver completes trip

**Technical Implementation:**
- Navigate.jsx manages `navPhase` state ('toPickup' | 'toDestination')
- Target coordinates dynamically switch based on phase:
  - toPickup: `trip.pickup_location.coordinates`
  - toDestination: `trip.destination.coordinates`
- Phase transition triggered by driver action in handleArrived()
- Map markers and route refresh on phase change
- ActiveTrip.jsx displays phase-specific status labels:
  - ACCEPTED: "Driver approaching pickup"
  - IN_PROGRESS: "Driver has arrived - confirm meeting"

**Status Flow:**
```
PENDING → ACCEPTED (toPickup) → IN_PROGRESS (waiting for rider confirmation) → COMPLETED
```

### Trip Cancellation & Rider Confirmation Lifecycle

**How it works:**
1. **Rider Cancellation**: Riders can cancel active trips while searching for driver or after driver acceptance
2. **Driver Release**: When rider cancels, driver is released back to active pool (driverId set to null)
3. **Driver Arrival**: When driver arrives at pickup, a modal prompts them to call the rider
4. **Rider Confirmation**: Trip completes when rider confirms meeting with driver
5. **Driver Completion**: Driver can also complete the trip manually via "Complete Trip" button
6. **Real-time Sync**: All status changes sync instantly between rider and driver apps via Firestore

**Technical Implementation:**
- Cancellation in `ActiveTrip.jsx` with `cancelledBy: 'RIDER'` and `driverId: null`
- Driver arrival modal in `Navigate.jsx` with phone call functionality via `tel:` protocol
- Rider confirmation button in `ActiveTrip.jsx` for IN_PROGRESS status
- Driver "Complete Trip" button in `Navigate.jsx` for IN_PROGRESS status
- Real-time listener in `Navigate.jsx` auto-navigates driver home when trip completes
- Firestore real-time listeners ensure instant state synchronization

**Cancellation Flow:**
```
Rider clicks "Cancel trip" → Status: CANCELLED, cancelledBy: RIDER, driverId: null
→ Driver notified via real-time listener → Driver sees cancellation screen
→ Rider redirected to home map
```

**Arrival & Confirmation Flow:**
```
Driver clicks "I've arrived" → Modal appears with "Call Rider" button
→ Driver calls rider to confirm pickup location
→ Driver clicks "Confirm Pickup" → Status: IN_PROGRESS
→ Rider sees "Confirm Meeting Driver" button
→ Rider clicks "Confirm Meeting Driver" → Status: COMPLETED
→ Driver sees trip completion receipt with fare
→ Driver navigates to requests screen
```

**Driver Completion Flow (alternative):**
```
Driver clicks "Complete Trip" → Status: COMPLETED
→ Driver navigated to requests screen
→ Rider sees "Trip completed" status
```

### Single-Trip Enforcement

**How it works:**
1. When a driver navigates to the IncomingRequest page, the system checks Firestore for any existing ACCEPTED or IN_PROGRESS trip assigned to that driver
2. If an active trip exists, the driver is automatically redirected to the Navigate page
3. This prevents drivers from accepting multiple trips simultaneously
4. The check runs on mount and only shows the request list if no active trip is found

**Technical Implementation:**
- Firestore query in `IncomingRequest.jsx` with `where('driverId', '==', user.uid)` and `where('status', 'in', ['ACCEPTED', 'IN_PROGRESS'])`
- Redirect via `navigate('/driver/navigate', { state: { tripId } })`
- Loading state (`checkingActive`) shown while query is in progress
- Same query pattern used in `Navigate.jsx` for trip recovery on page refresh

### Trip Persistence (Page Refresh Recovery)

**How it works:**
1. Both rider and driver apps can recover active trips after page refresh
2. On mount, if no active trip ID is in context state, a Firestore query is executed
3. The query looks for trips matching the user's ID with active statuses
4. If found, the trip is restored to context and the UI resumes normally

**Technical Implementation:**
- Rider recovery in `ActiveTrip.jsx`: queries `riderId == user.uid` with status `['PENDING', 'ACCEPTED', 'IN_PROGRESS']`
- Driver recovery in `Navigate.jsx`: queries `driverId == user.uid` with status `['ACCEPTED', 'IN_PROGRESS']`
- Offline fallback: `loadCachedTrip()` from `tripCache.js` for drivers
- Loading states shown while recovery is in progress

### UI/UX Enhancements

**Draggable Bottom Sheet:**
- Google Maps-style draggable bottom sheet component for trip details
- Touch and mouse event listeners for smooth drag interactions
- Snap-to-position behavior (collapsed/expanded states)
- Configurable min/max heights
- Visual drag handle indicator with chevron icon

**Technical Implementation:**
- Component in `src/components/BottomSheet.jsx`
- Touch events: `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Mouse events: `onMouseDown`, `onMouseMove`, `onMouseUp`
- CSS transforms for smooth drag feedback
- TailwindCSS responsive design
- Pass-through props for child components

**Free-Pan Map with Re-center:**
- Eliminates aggressive auto-centering during user exploration
- Leaflet `movestart` event listener detects manual panning
- Floating "Re-center" button appears when user pans away
- Smooth `flyTo()` animation when re-centering
- Auto-center lock resets after re-center

**Technical Implementation:**
- `isPannedAway` state tracks manual panning
- `autoCenter` prop enables/disables auto-centering
- Conditional auto-centering based on user interaction
- Floating button with Navigation icon
- 1-second smooth animation with easing

**Tile Layer Toggle:**
- Switch between Standard (OpenStreetMap) and Satellite (Esri World Imagery)
- Floating toggle button with Layers icon
- Preserves all map overlays, markers, and polylines
- Works globally across all map instances
- Mobile-first responsive design

**Technical Implementation:**
- `tileType` state: 'standard' | 'satellite'
- Tile layer removal and replacement on toggle
- Ref-based tile layer management
- Dynamic attribution based on tile provider
- Floating button positioned top-left

**Trip Completion Receipt:**
- Driver sees clean receipt screen when trip is completed
- Displays calculated fare (₦500 base + ₦100/km)
- Non-mappable summary screen (map removed)
- "View New Requests" action button
- Celebratory UI with checkmark icon

**Technical Implementation:**
- `showCompletedScreen` state in Navigate.jsx
- Firestore `onSnapshot` detects COMPLETED status
- Conditional rendering replaces map with receipt
- Fare calculation from trip.estimatedFare
- Smooth transition from navigation to receipt

**Demo Mode:**
- Toggle between Rider and Driver views without changing Firebase auth role
- Useful for demonstrations and testing
- Persistent across navigation via DemoContext
- Visual toggle in the top DemoBar

**Technical Implementation:**
- `DemoContext` with `demoView` state ('rider' | 'driver' | null)
- `DemoBar` component with Rider/Driver toggle buttons
- `useDemo()` hook for consuming demo state
- Effective view determined by `demoView || profile?.userType`

**Offline Detection:**
- Driver layout monitors online/offline status
- Shows offline banner when connectivity is lost
- Navigation data loaded from cache when offline
- Live/cache data source indicators in Navigate.jsx

**Technical Implementation:**
- `navigator.onLine` and `online`/`offline` event listeners in DriverLayout.jsx
- `dataSource` state ('firestore' | 'cache') in Navigate.jsx
- Wifi/WifiOff icons with status labels
- `tripCache.js` for localStorage caching

**Phone Number Prompt:**
- Dismissible banner when user profile is missing a phone number
- Shown on both Rider and Driver layouts
- Dismissal persisted in sessionStorage
- Encourages users to add contact information

### Fare Calculation
**How it works:**
1. Rider selects pickup and destination locations
2. System calculates distance between coordinates using Haversine formula
3. Fare is computed: base fare + (distance × per-km rate)
4. Estimated fare displayed to rider on RequestSummary page
5. Fare stored in trip document as estimatedFare
6. Rider can review fare before confirming trip request

**Technical Implementation:**
- Fare calculation in `src/utils/fare.js`
- Formula: `baseFare (₦500) + distanceKm × perKmRate (₦100)`
- Example: 5km trip = ₦500 + (5 × ₦100) = ₦1,000
- Functions: `calculateFare(pickupCoords, destCoords)` and `getFareConfig()`
- Distance calculated using Haversine formula from distance.js
- Fare displayed in RequestSummary component before trip creation

**Configuration:**
```javascript
{
  baseFare: 500,      // ₦500 minimum fare
  perKmRate: 100,     // ₦100 per kilometer
  currency: '₦'
}
```

### Photo Upload System
**How it works:**
1. On Annotate page, rider can optionally add pickup location photo
2. User taps "Add photo" button to open dialog
3. Chooses between camera capture or gallery selection
4. Selected photo is automatically compressed to reduce file size
5. Compressed photo converted to Base64 string
6. Photo stored in trip document's pickup_location.photo_base64 field
7. Driver can view photo to help locate rider

**Technical Implementation:**
- Photo compression in `src/utils/photoCompress.js`
- Supports both camera capture and file gallery selection
- Compression reduces image quality/size for efficient Firestore storage
- Base64 encoding for Firestore document compatibility
- Optional feature - rider can skip and continue without photo
- Photo displayed in RequestSummary and ActiveTrip for driver reference

### Reverse Geocoding
**How it works:**
1. When a rider drops a pin on the map, the system fetches a human-readable area label
2. The Nominatim API is called with the GPS coordinates
3. The response is parsed to extract the most specific location name
4. The area label is stored in the trip document for display

**Technical Implementation:**
- Function in `src/utils/geocode.js`
- Priority order: suburb → neighbourhood → city_district → town → city → county → display_name
- Error handling returns 'Unknown area' on failure
- Used in PinAdjust.jsx and DestinationSelect.jsx

### Plus Code Integration
**How it works:**
1. When a location is selected, a 10-digit Plus Code is generated from the GPS coordinates
2. The Plus Code provides a human-readable location identifier
3. Plus Codes are displayed in chips throughout the app
4. Codes can be decoded back to coordinates if needed

**Technical Implementation:**
- Wrapper functions in `src/utils/plusCode.js`
- Uses `open-location-code` library
- Functions: `encodePlusCode(lat, lng)`, `decodePlusCode(code)`, `isValidPlusCode(code)`
- PlusCodeChip component for consistent display

### Map Integration
**How it works:**
1. Interactive Leaflet maps throughout the application
2. Riders use maps for pickup/destination selection
3. Drivers use maps for navigation and route visualization
4. Real-time driver location tracking with marker updates
5. Route lines drawn between driver and target points
6. Plus Code chips display precise location identifiers

**Technical Implementation:**
- Leaflet.js for interactive mapping
- Dual tile layers:
  - OpenStreetMap: Standard street maps (default)
  - Esri World Imagery: Satellite/aerial imagery (toggleable)
- Real-time location tracking via Geolocation API
- Route visualization using OSRM API with Leaflet polylines
- Plus Code integration via Open Location Code library
- Default center: Lagos, Nigeria (6.5244, 3.3792)
- Maximum zoom level: 19 for precise location selection

**Map Components:**
- RiderHome: Pin-drop for pickup selection
- PinAdjust: Fine-tune pickup location
- DestinationSelect: Pin-drop for destination selection
- DriverHome: Driver current location display
- Navigate: Route navigation with dual phases
- ActiveTrip: Real-time driver tracking

### Real-time Communication
**How it works:**
1. Firestore real-time listeners monitor trip status changes
2. When driver accepts trip, rider sees immediate status update
3. Driver location updates in real-time during navigation
4. Trip status changes trigger UI updates on both rider and driver apps
5. Offline caching ensures continued operation without internet
6. Automatic reconnection when connectivity restored

**Technical Implementation:**
- Firestore onSnapshot() listeners for real-time updates
- Trip status monitoring in ActiveTrip.jsx and Navigate.jsx
- Offline caching via tripCache.js for navigation without internet
- Automatic reconnection handling by Firestore SDK
- Status changes trigger immediate UI refresh
- Rider sees driver approaching, driver sees trip requests instantly

**Status Updates:**
- PENDING: Trip created, awaiting driver acceptance
- ACCEPTED: Driver assigned, approaching pickup
- IN_PROGRESS: Driver has arrived, waiting for rider to confirm meeting
- COMPLETED: Trip finished (confirmed by rider or driver)
- CANCELLED: Trip cancelled by rider or driver

### User Experience
**How it works:**
1. Phone number validation (10-15 digits) during registration
2. Dismissible prompts for missing profile information
3. Responsive design adapts to mobile and desktop screens
4. Loading states during async operations (trip creation, driver matching)
5. Error handling with user-friendly messages
6. Intuitive booking flow with clear step progression
7. Visual feedback for user actions (button presses, form submissions)

**Technical Implementation:**
- Form validation with regex patterns
- Toast notifications and inline error messages
- Loading spinners and skeleton screens
- Mobile-first responsive design with TailwindCSS
- Consistent UI patterns across rider/driver interfaces
- Clear visual hierarchy and affordance
- Accessibility considerations (contrast, touch targets)

## Development Notes

### Environment Variables
- `VITE_DEV_BYPASS`: Set to 'true' to bypass Firebase authentication for development
- All Firebase credentials should be stored in `.env.local` (not committed to git)

### Demo Mode
The application includes a **Demo Mode** feature that allows toggling between Rider and Driver views without changing the user's Firebase auth role. This is useful for:
- Demonstrating the app to stakeholders
- Testing both rider and driver flows with a single account
- Development and debugging

**How to use:**
1. Log in with any account
2. Use the "View as" toggle in the top DemoBar to switch between Rider and Driver views
3. The toggle persists across navigation within the session

### Security Notes
- **DEV BYPASS Protection**: The application includes a build-time safety check that prevents VITE_DEV_BYPASS from functioning in production builds. If DEV_BYPASS is enabled during a production build, a console error is logged and the bypass is automatically disabled to prevent authentication bypass in production environments.
- **Firestore Security Rules**: The application uses Firestore security rules to enforce data access control. Users can only read/write their own documents, trip updates are restricted to assigned rider/driver, and rider phone numbers are protected until trip acceptance. See `firestore.rules` for detailed rule definitions.

### Context Architecture
The app uses a three-file pattern for each context:
1. **Raw context object** (e.g., `authContext.js`) — creates and exports the React context
2. **Provider component** (e.g., `AuthContext.jsx`) — provides state management logic
3. **Hook** (e.g., `useAuth.js`) — convenience hook for consuming the context

This pattern keeps imports circular-free and separates concerns cleanly.

### Map Configuration
- Default center coordinates: Lagos, Nigeria (6.5244, 3.3792)
- Maximum zoom level: 19
- Tile servers can be customized in individual map components

### Performance Considerations
- Photo compression reduces payload size before upload
- Trip caching minimizes Firestore reads
- Lazy loading of map components for faster initial render
- Route fetch throttled to once every 30 seconds

## Testing

The project uses Vitest for unit testing. Tests are located in `src/utils/__tests__/`.

### Running Tests
```bash
npm run test
```

### Test Coverage
- **distance.test.js**: Tests for Haversine distance calculation and bearing functions
- **matchDriver.test.js**: Tests for driver ranking and best driver selection
- **fare.test.js**: Tests for fare calculation and configuration

Tests are intentionally simple and focused on core functionality rather than exhaustive edge coverage, keeping scope appropriate for an academic project.

## Future Enhancements

- Payment integration
- Driver rating system
- Trip history with detailed receipts
- Push notifications for trip updates
- Multi-language support
- Advanced route optimization
- Driver earnings dashboard

## License

This project is developed for academic purposes.

## Contact

For questions or support regarding this project, please contact the development team.