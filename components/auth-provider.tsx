'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check auth status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('swift-cargo-auth')
    const userData = localStorage.getItem('swift-cargo-user')
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  // Route protection - redirect unauthorized users
  useEffect(() => {
    const publicPaths = ['/', '/tracking', '/login']
    const isPublic = publicPaths.includes(pathname)
    
    if (!isAuthenticated && !isPublic) {
      router.push('/login')
    }
  }, [isAuthenticated, pathname, router])

  const login = () => {
    const mockUser = { name: 'Admin User', role: 'manager', email: 'admin@swiftcargo.com' }
    localStorage.setItem('swift-cargo-auth', 'true')
    localStorage.setItem('swift-cargo-user', JSON.stringify(mockUser))
    setIsAuthenticated(true)
    setUser(mockUser)
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('swift-cargo-auth')
    localStorage.removeItem('swift-cargo-user')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}