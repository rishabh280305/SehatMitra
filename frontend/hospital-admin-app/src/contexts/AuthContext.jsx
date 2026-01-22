import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('hospital_admin_token')
    const userData = localStorage.getItem('hospital_admin_user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])
  
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      })
      
      const { token, user: userData } = response.data
      
      if (userData.role !== 'hospital' && userData.role !== 'hospital_admin') {
        throw new Error('Access denied. Only Hospital Administrators can access this portal.')
      }
      
      localStorage.setItem('hospital_admin_token', token)
      localStorage.setItem('hospital_admin_user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      }
    }
  }
  
  const logout = () => {
    localStorage.removeItem('hospital_admin_token')
    localStorage.removeItem('hospital_admin_user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }
  
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
