// Hook for reading/setting the demo view override ('rider' | 'driver' | null).
import { useContext } from 'react'
import DemoContext from './demoContext'

export const useDemo = () => useContext(DemoContext)
