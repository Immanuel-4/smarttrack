// AuthProvider listens for Firebase auth state changes, fetches the matching

// Firestore user document on sign-in, and clears state on sign-out.
// State is consumed via the useAuth() hook (see useAuth.js).
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import AuthContext from './authContext'

export function AuthProvider({ children }) {
  const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS === 'true'
    console.log('DEV_BYPASS:', DEV_BYPASS) 
  
  // SECURITY CHECK: Warn if DEV_BYPASS is enabled in production build
  // This prevents accidental deployment with development bypass active
  if (DEV_BYPASS && import.meta.env.PROD) {
    console.error(
      '🚨 SECURITY WARNING: VITE_DEV_BYPASS is enabled in PRODUCTION build! ' +
      'This bypasses authentication and should NEVER be deployed. ' +
      'Set VITE_DEV_BYPASS=false or remove the environment variable.'
    )
    // In production, force disable the bypass even if env var is set
    // This is a safety net to prevent authentication bypass in production
  }
  
  const isDevMode = DEV_BYPASS && !import.meta.env.PROD
  
  const [user, setUser] = useState(isDevMode ? { uid: 'dev-user' } : null)
  const [profile, setProfile] = useState(isDevMode ? {
    email: 'kola@gmail.com',
    name: 'bola lanre',
    rating: 5,
    totalTrips: 0,
    userType: 'Rider',
    createdAt: new Date(),
    phone: '+2348000000000',
  } : null)
  const [loading, setLoading] = useState(isDevMode ? false : true)

  useEffect(() => {
    if (isDevMode) return // skip Firebase entirely in dev mode

    return onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        setProfile(snap.exists() ? snap.data() : null)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [isDevMode])

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}