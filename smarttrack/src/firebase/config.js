// Initialises Firebase and exports the Auth and Firestore instances used throughout the app.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAIfR2NLvpULLNVOmMaSDGihw9-eIFAOAo",
  authDomain: "smart-track-2868b.firebaseapp.com",
  databaseURL: "https://smart-track-2868b-default-rtdb.firebaseio.com",
  projectId: "smart-track-2868b",
  storageBucket: "smart-track-2868b.firebasestorage.app",
  messagingSenderId: "55958478980",
  appId: "1:55958478980:web:584bee338870f18f3062d1"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence failed: multiple tabs open')
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence not supported in this browser')
  }
})

export default app
