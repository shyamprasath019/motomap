'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useUser } from '@clerk/nextjs'
import { usersApi, type User } from './api'

interface AuthContextValue {
  backendUser: User | null
  backendToken: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  backendUser: null,
  backendToken: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const [backendUser, setBackendUser] = useState<User | null>(null)
  const [backendToken, setBackendToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const syncBackend = useCallback(async () => {
    if (!user) return

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) return

    // Clerk userId used as deterministic bridge password
    const password = user.id
    const display_name = user.fullName ?? email.split('@')[0]

    try {
      const res = await usersApi.register({ email, password, display_name })
      localStorage.setItem('motomap_token', res.data.access_token)
      setBackendToken(res.data.access_token)
      setBackendUser(res.data.user)
    } catch {
      try {
        const res = await usersApi.login({ email, password })
        localStorage.setItem('motomap_token', res.data.access_token)
        setBackendToken(res.data.access_token)
        setBackendUser(res.data.user)
      } catch (err) {
        console.error('Backend auth sync failed:', err)
      }
    }
  }, [user])

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      localStorage.removeItem('motomap_token')
      setBackendUser(null)
      setBackendToken(null)
      setLoading(false)
      return
    }

    const existingToken = localStorage.getItem('motomap_token')
    if (existingToken) {
      setBackendToken(existingToken)
      usersApi
        .me()
        .then((res) => {
          setBackendUser(res.data)
          setLoading(false)
        })
        .catch(() => {
          syncBackend().finally(() => setLoading(false))
        })
    } else {
      syncBackend().finally(() => setLoading(false))
    }
  }, [user, isLoaded, syncBackend])

  return (
    <AuthContext.Provider value={{ backendUser, backendToken, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useBackendAuth = () => useContext(AuthContext)
