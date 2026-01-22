import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StockRequests from './pages/StockRequests'
import Hospitals from './pages/Hospitals'
import HospitalDetails from './pages/HospitalDetails'
import AIPredictions from './pages/AIPredictions'
import Analytics from './pages/Analytics'
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
        <Route path="stock-requests" element={<StockRequests />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="hospitals/:hospitalId" element={<HospitalDetails />} />
        <Route path="ai-predictions" element={<AIPredictions />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}

export default App
