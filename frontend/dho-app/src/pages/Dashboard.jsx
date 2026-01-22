import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  FiPackage, FiCheckCircle, FiClock, FiAlertCircle,
  FiTrendingUp, FiActivity, FiArrowRight
} from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { BiBed } from 'react-icons/bi'
import './Dashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalHospitals: 0,
    totalBeds: 0,
    availableBeds: 0
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  
  const district = user?.district || 'Mumbai'
  
  useEffect(() => {
    fetchDashboardData()
  }, [district])
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stock requests
      const requestsRes = await axios.get(`${API_URL}/dho/requests/${district}`)
      const requests = requestsRes.data || []
      
      // Calculate stats
      const pending = requests.filter(r => r.status === 'pending')
      const approved = requests.filter(r => r.status === 'approved')
      const rejected = requests.filter(r => r.status === 'rejected')
      
      // Fetch hospitals
      const hospitalsRes = await axios.get(`${API_URL}/dho/hospitals/${district}`)
      const hospitals = hospitalsRes.data || []
      
      // Calculate bed stats
      let totalBeds = 0
      let availableBeds = 0
      hospitals.forEach(h => {
        totalBeds += h.beds?.total || 0
        availableBeds += h.beds?.available || 0
      })
      
      setStats({
        totalRequests: requests.length,
        pendingRequests: pending.length,
        approvedRequests: approved.length,
        rejectedRequests: rejected.length,
        totalHospitals: hospitals.length,
        totalBeds,
        availableBeds
      })
      
      setRecentRequests(pending.slice(0, 5))
      
      // Fetch AI predictions
      const predictionsRes = await axios.get(`${API_URL}/dho/ai-predictions/${district}`)
      setPredictions(predictionsRes.data?.slice(0, 5) || [])
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }
  
  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome back, {user?.name || 'Officer'}</h2>
          <p>Here's an overview of your district's health infrastructure</p>
        </div>
        <div className="welcome-stats">
          <div className="quick-stat">
            <span className="quick-stat-value">{stats.pendingRequests}</span>
            <span className="quick-stat-label">Pending Approvals</span>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon warning">
            <FiClock />
          </div>
          <div className="stat-value">{stats.pendingRequests}</div>
          <div className="stat-label">Pending Requests</div>
          <Link to="/stock-requests?status=pending" className="stat-link">
            View all <FiArrowRight />
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <FiCheckCircle />
          </div>
          <div className="stat-value">{stats.approvedRequests}</div>
          <div className="stat-label">Approved This Month</div>
          <Link to="/stock-requests?status=approved" className="stat-link">
            View all <FiArrowRight />
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon primary">
            <HiOutlineBuildingOffice2 />
          </div>
          <div className="stat-value">{stats.totalHospitals}</div>
          <div className="stat-label">Hospitals in District</div>
          <Link to="/hospitals" className="stat-link">
            View all <FiArrowRight />
          </Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">
            <BiBed />
          </div>
          <div className="stat-value">{stats.availableBeds}/{stats.totalBeds}</div>
          <div className="stat-label">Available Beds</div>
          <div className="progress-bar" style={{ marginTop: '12px' }}>
            <div 
              className={`progress ${stats.totalBeds > 0 && (stats.availableBeds / stats.totalBeds) < 0.2 ? 'danger' : 'success'}`}
              style={{ width: `${stats.totalBeds > 0 ? (stats.availableBeds / stats.totalBeds) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Pending Requests */}
        <div className="card">
          <div className="card-header">
            <h3>
              <FiPackage /> Pending Requests
            </h3>
            <Link to="/stock-requests" className="btn btn-sm btn-outline">
              View All
            </Link>
          </div>
          <div className="card-body">
            {recentRequests.length === 0 ? (
              <div className="empty-state">
                <FiCheckCircle />
                <h3>All Caught Up</h3>
                <p>No pending requests at the moment</p>
              </div>
            ) : (
              <div className="request-list">
                {recentRequests.map(request => (
                  <div key={request._id} className="request-item">
                    <div className="request-info">
                      <h4>{request.requestedBy?.name || 'Unknown'}</h4>
                      <p>{request.items?.length || 0} items requested</p>
                      <span className="request-date">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="request-urgency">
                      {request.items?.some(i => i.urgency === 'critical') && (
                        <span className="badge badge-critical">Critical</span>
                      )}
                      {request.items?.some(i => i.urgency === 'high') && !request.items?.some(i => i.urgency === 'critical') && (
                        <span className="badge badge-pending">High</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* AI Predictions */}
        <div className="card">
          <div className="card-header">
            <h3>
              <FiActivity /> AI Supply Predictions
            </h3>
            <Link to="/ai-predictions" className="btn btn-sm btn-outline">
              View All
            </Link>
          </div>
          <div className="card-body">
            {predictions.length === 0 ? (
              <div className="empty-state">
                <FiTrendingUp />
                <h3>No Predictions Yet</h3>
                <p>AI predictions will appear here based on usage data</p>
              </div>
            ) : (
              <div className="prediction-list">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="prediction-item">
                    <div className="prediction-info">
                      <h4>{pred.itemName}</h4>
                      <p>Predicted need: {pred.predictedNeed} units</p>
                    </div>
                    <div className="prediction-confidence">
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ width: `${pred.confidence}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(pred.confidence)}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
