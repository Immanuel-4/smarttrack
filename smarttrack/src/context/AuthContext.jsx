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
  
  const [user, setUser] = useState(DEV_BYPASS ? { uid: 'dev-user' } : null)
  const [profile, setProfile] = useState(DEV_BYPASS ? {
    email: 'kola@gmail.com',
    name: 'bola lanre',
    rating: 5,
    totalTrips: 0,
    userType: 'Rider',
    createdAt: new Date(),
  } : null)
  const [loading, setLoading] = useState(DEV_BYPASS ? false : true)

  useEffect(() => {
    if (DEV_BYPASS) return // skip Firebase entirely

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
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}