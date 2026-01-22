import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    
    if (result.success) {
      toast.success('Login successful')
      navigate('/')
    } else {
      toast.error(result.message)
    }
  }
  
  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <HiOutlineBuildingOffice2 />
            </div>
            <h1>District Health Officer Portal</h1>
            <p>SehatMitra Administrative Access</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter your official email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <FiShield />
                  Sign In to Portal
                </>
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Authorized personnel only. All activities are logged.</p>
          </div>
        </div>
        
        <div className="login-info">
          <h2>District Health Management System</h2>
          <ul>
            <li>Approve stock supply requests from hospitals</li>
            <li>Monitor hospital bed availability in real-time</li>
            <li>Track doctor rotations and staffing</li>
            <li>AI-powered supply predictions</li>
            <li>Comprehensive district health analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
