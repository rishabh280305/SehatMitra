import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BedManagement from './pages/BedManagement'
import DoctorRotation from './pages/DoctorRotation'
import Inventory from './pages/Inventory'
import StockRequests from './pages/StockRequests'
import Layout from './components/Layout'
import './App.css'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="beds" element={<BedManagement />} />
        <Route path="doctors" element={<DoctorRotation />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="stock-requests" element={<StockRequests />} />
      </Route>
    </Routes>
  )
}

export default App
