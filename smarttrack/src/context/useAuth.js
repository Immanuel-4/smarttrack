// Hook for reading auth state (user, profile, loading, setProfile) in any component.
import { useContext } from 'react'
import AuthContext from './authContext'

export const useAuth = () => useContext(AuthContext)
