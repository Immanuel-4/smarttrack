// Raw context object shared between AuthProvider and useAuth — keeps imports circular-free.
import { createContext } from 'react'

const AuthContext = createContext(null)

export default AuthContext
