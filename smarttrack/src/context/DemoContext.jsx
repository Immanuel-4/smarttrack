import { createContext, useContext, useState } from 'react'

const DemoContext = createContext(null)

export function DemoProvider({ children }) {
  const [demoView, setDemoView] = useState(null) // 'rider' | 'driver' | null

  return (
    <DemoContext.Provider value={{ demoView, setDemoView }}>
      {children}
    </DemoContext.Provider>
  )
}

export const useDemo = () => useContext(DemoContext)
