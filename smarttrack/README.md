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

### For Drivers
- **Request Management**: View and accept incoming ride requests
- **Smart Matching**: Automatic driver matching based on distance and rating
- **Dual-Phase Navigation**: Navigate to pickup location, then to destination
- **Map Options**: Toggle between satellite imagery and street maps
- **Rider Communication**: View rider phone numbers and call riders directly
- **Trip Completion**: Mark trips as completed when finished

### System Features
- **User Authentication**: Firebase-based authentication with email/password
- **Real-time Updates**: Firestore real-time database for live trip status
- **Offline Support**: Cached trip data for offline navigation
- **Phone Verification**: Required phone numbers for all users
- **Driver Matching**: Distance-based driver matching with rating tiebreaker
- **Fare Calculation**: Automatic fare estimation based on distance
- **Security Rules**: Firestore security rules for data access control
- **Responsive Design**: Mobile-first UI with desktop support

## Technology Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Maps & Location
- **Leaflet**: Open-source mapping library
- **OpenStreetMap**: Standard street map tiles
- **Esri World Imagery**: Satellite/aerial imagery tiles
- **Open Location Code**: Plus Codes for location identification

### Backend Services
- **Firebase Authentication**: User authentication and authorization
- **Firebase Firestore**: NoSQL real-time database
- **Geolocation API**: Browser-based GPS positioning

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

## Project Structure

```
smarttrack/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BottomNav.jsx
│   │   ├── DemoBar.jsx
│   │   ├── MapView.jsx
│   │   ├── PlusCodeChip.jsx
│   │   └── Sidebar.jsx
│   ├── context/             # React context providers
│   │   ├── AuthContext.jsx
│   │   ├── authContext.jsx
│   │   └── useAuth.js
│   ├── pages/               # Page components
│   │   ├── driver/          # Driver-specific pages
│   │   │   ├── DriverHome.jsx
│   │   │   ├── IncomingRequest.jsx
│   │   │   └── Navigate.jsx
│   │   ├── rider/           # Rider-specific pages
│   │   │   ├── ActiveTrip.jsx
│   │   │   ├── Annotate.jsx
│   │   │   ├── DestinationSelect.jsx
│   │   │   ├── PinAdjust.jsx
│   │   │   ├── RequestSummary.jsx
│   │   │   └── RiderHome.jsx
│   │   ├── shared/          # Shared pages
│   │   │   ├── Account.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── Landing.jsx
│   ├── utils/               # Utility functions
│   │   ├── __tests__/       # Unit tests
│   │   │   ├── distance.test.js
│   │   │   ├── fare.test.js
│   │   │   └── matchDriver.test.js
│   │   ├── distance.js
│   │   ├── fare.js
│   │   ├── matchDriver.js
│   │   ├── photoCompress.js
│   │   └── tripCache.js
│   ├── firebase/            # Firebase configuration
│   │   └── config.js
│   ├── App.jsx              # Root component with routing
│   └── main.jsx             # Application entry point
├── public/                  # Static assets
├── package.json
├── tailwind.config.js
└── vite.config.js
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
- Reuses existing pin-drop UI for destination selection (DestinationSelect.jsx)
- Simplified schema: coordinates, plus_code, area_label (no photo/note for destination)
- Booking flow: RiderHome → PinAdjust → DestinationSelect → Annotate → RequestSummary
- Intentional scoping decision: Pin-drop instead of address search to keep complexity manageable

### Driver Matching Algorithm
- Distance-based matching using Haversine formula (matchDriver.js)
- Driver rating as tiebreaker when distances are equal
- Queries all drivers and assigns best match at trip creation
- Simple approach suitable for academic scope (no real-time location tracking)

### Dual-Phase Navigation
- Navigate.jsx supports two phases: 'toPickup' and 'toDestination'
- Phase transition: ACCEPTED → IN_PROGRESS when driver arrives at pickup
- Target coordinates switch from pickup to destination after phase change
- ActiveTrip.jsx shows phase-specific status labels and ETA

### Fare Calculation
- Simple formula: base fare (₦500) + distance (km) × per-km rate (₦100)
- Calculated at trip creation using Haversine distance
- Stored as estimatedFare in trip document
- Displayed to rider before trip confirmation

### Photo Upload System
- Supports both camera capture and gallery selection
- Automatic photo compression for efficient storage
- Base64 encoding for Firestore compatibility

### Map Integration
- Dual map layers: OpenStreetMap (street) and Esri (satellite)
- Real-time driver location tracking
- Route visualization between driver and target points
- Plus Code integration for precise location identification

### Real-time Communication
- Firestore listeners for instant trip status updates
- Offline caching for continued operation without internet
- Automatic reconnection when connectivity restored

### User Experience
- Phone number validation (10-15 digits)
- Dismissible prompts for missing profile information
- Responsive design for mobile and desktop
- Loading states and error handling throughout

## Development Notes

### Environment Variables
- `VITE_DEV_BYPASS`: Set to 'true' to bypass Firebase authentication for development
- All Firebase credentials should be stored in `.env.local` (not committed to git)

### Security Notes
- **DEV BYPASS Protection**: The application includes a build-time safety check that prevents VITE_DEV_BYPASS from functioning in production builds. If DEV_BYPASS is enabled during a production build, a console error is logged and the bypass is automatically disabled to prevent authentication bypass in production environments.
- **Firestore Security Rules**: The application uses Firestore security rules to enforce data access control. Users can only read/write their own documents, trip updates are restricted to assigned rider/driver, and rider phone numbers are protected until trip acceptance. See `firestore.rules` for detailed rule definitions.

### Map Configuration
- Default center coordinates: Lagos, Nigeria (6.5244, 3.3792)
- Maximum zoom level: 19
- Tile servers can be customized in individual map components

### Performance Considerations
- Photo compression reduces payload size before upload
- Trip caching minimizes Firestore reads
- Lazy loading of map components for faster initial render

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
