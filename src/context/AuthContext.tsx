import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerCustomer, registerStaff, logoutUser } from '../services/mockApi'

export interface User {
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  role: 'customer' | 'staff'
  airlineName?: string
  token: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (data: any, type: 'customer' | 'staff') => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // Using mock API - replace with actual API call when backend is ready
      const data = await loginUser(username, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid credentials'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: any, type: 'customer' | 'staff') => {
    setIsLoading(true)
    setError(null)
    try {
      // Using mock API - replace with actual API call when backend is ready
      const result = type === 'customer' 
        ? await registerCustomer(data)
        : await registerStaff(data)
      
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result))
      setUser(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
