// Raw context object shared between DemoProvider and useDemo — keeps imports circular-free.
import { createContext } from 'react'

const DemoContext = createContext(null)

export default DemoContext
