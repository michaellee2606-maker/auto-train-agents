import { useState } from 'react'
import { AuthContext } from './AuthContext.js'

export default function AuthProvider({ children }) {
  const [hfToken, setHfToken] = useState('')

  const value = {
    hfToken,
    setHfToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
