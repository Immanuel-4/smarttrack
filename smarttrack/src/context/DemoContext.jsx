// DemoProvider lets any component switch between 'rider' and 'driver' view
// without changing the user's real Firebase auth role — useful for demos.
import { useState } from 'react'
import DemoContext from './demoContext'

export function DemoProvider({ children }) {
  // null = use the real auth role; 'rider'|'driver' overrides the visible view
  const [demoView, setDemoView] = useState(null)

  return (
    <DemoContext.Provider value={{ demoView, setDemoView }}>
      {children}
    </DemoContext.Provider>
  )
}
