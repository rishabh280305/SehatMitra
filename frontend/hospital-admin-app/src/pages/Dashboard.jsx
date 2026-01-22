import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  FiUsers, FiPackage, FiTrendingUp, FiAlertTriangle
} from 'react-icons/fi'
import { BiBed } from 'react-icons/bi'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import './Dashboard.css'

ChartJS.register(ArcElement, Tooltip, Legend)

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export default function Dashboard() {
  const { user } = useAuth()
  const [hospitalData, setHospitalData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchHospitalData()
  }, [])
  
  const fetchHospitalData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/hospital/my-hospital`)
      setHospitalData(response.data)
    } catch (error) {
      console.error('Error fetching hospital data:', error)
      // Use default data if no hospital found
      setHospitalData({
        hospitalName: user?.name || 'Your Hospital',
        beds: { total: 100, occupied: 65, available: 35, icu: { total: 20, occupied: 15, available: 5 }, general: { total: 60, occupied: 40, available: 20 }, emergency: { total: 20, occupied: 10, available: 10 } },
        doctors: [],
        staff: { nurses: 50, technicians: 20, support: 30 }
      })
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
  
  const bedChartData = {
    labels: ['Occupied', 'Available'],
    datasets: [{
      data: [hospitalData?.beds?.occupied || 0, hospitalData?.beds?.available || 0],
      backgroundColor: ['#ef4444', '#10b981'],
      borderWidth: 0
    }]
  }
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    cutout: '70%'
  }
  
  const occupancyRate = hospitalData?.beds?.total > 0 
    ? Math.round((hospitalData.beds.occupied / hospitalData.beds.total) * 100)
    : 0
  
  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div className="welcome-content">
          <h2>Welcome, {user?.name || 'Administrator'}</h2>
          <p>Here's the current status of your hospital</p>
        </div>
        <div className="welcome-stats">
          <div className="quick-stat">
            <span className="quick-stat-value">{occupancyRate}%</span>
            <span className="quick-stat-label">Bed Occupancy</span>
          </div>
        </div>
      </div>
      
      {/* Alerts */}
      {occupancyRate > 85 && (
        <div className="alert alert-warning">
          <FiAlertTriangle />
          <div>
            <strong>High Occupancy Alert</strong>
            <p>Bed occupancy is above 85%. Consider requesting additional resources.</p>
          </div>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <BiBed />
          </div>
          <div className="stat-value">{hospitalData?.beds?.total || 0}</div>
          <div className="stat-label">Total Beds</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <BiBed />
          </div>
          <div className="stat-value">{hospitalData?.beds?.available || 0}</div>
          <div className="stat-label">Available Beds</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <FiUsers />
          </div>
          <div className="stat-value">
            {hospitalData?.doctors?.filter(d => d.currentlyOnDuty).length || 0}/
            {hospitalData?.doctors?.length || 0}
          </div>
          <div className="stat-label">Doctors On Duty</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">
            <FiPackage />
          </div>
          <div className="stat-value">{hospitalData?.staff?.nurses || 0}</div>
          <div className="stat-label">Nursing Staff</div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Bed Overview */}
        <div className="card">
          <div className="card-header">
            <h3><BiBed /> Bed Availability Overview</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Doughnut data={bedChartData} options={chartOptions} />
              <div className="chart-center">
                <span className="center-value">{hospitalData?.beds?.available || 0}</span>
                <span className="center-label">Available</span>
              </div>
            </div>
            
            <div className="bed-breakdown">
              <div className="bed-category">
                <div className="category-info">
                  <span className="category-name">ICU Beds</span>
                  <span className="category-count">
                    {hospitalData?.beds?.icu?.available || 0}/{hospitalData?.beds?.icu?.total || 0}
                  </span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ 
                      width: `${hospitalData?.beds?.icu?.total > 0 ? (hospitalData.beds.icu.occupied / hospitalData.beds.icu.total) * 100 : 0}%`,
                      background: hospitalData?.beds?.icu?.available < 3 ? 'var(--danger)' : 'var(--primary)'
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="bed-category">
                <div className="category-info">
                  <span className="category-name">General Beds</span>
                  <span className="category-count">
                    {hospitalData?.beds?.general?.available || 0}/{hospitalData?.beds?.general?.total || 0}
                  </span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ 
                      width: `${hospitalData?.beds?.general?.total > 0 ? (hospitalData.beds.general.occupied / hospitalData.beds.general.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="bed-category">
                <div className="category-info">
                  <span className="category-name">Emergency Beds</span>
                  <span className="category-count">
                    {hospitalData?.beds?.emergency?.available || 0}/{hospitalData?.beds?.emergency?.total || 0}
                  </span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-fill"
                    style={{ 
                      width: `${hospitalData?.beds?.emergency?.total > 0 ? (hospitalData.beds.emergency.occupied / hospitalData.beds.emergency.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Today's Doctors */}
        <div className="card">
          <div className="card-header">
            <h3><FiUsers /> Doctors On Duty Today</h3>
          </div>
          <div className="card-body">
            {hospitalData?.doctors?.filter(d => d.currentlyOnDuty).length === 0 ? (
              <div className="empty-state small">
                <p>No doctors currently on duty</p>
              </div>
            ) : (
              <div className="doctor-list">
                {hospitalData?.doctors?.filter(d => d.currentlyOnDuty).map((doctor, idx) => (
                  <div key={idx} className="doctor-item">
                    <div className="doctor-avatar">
                      {doctor.name?.charAt(0) || 'D'}
                    </div>
                    <div className="doctor-info">
                      <h4>{doctor.name}</h4>
                      <p>{doctor.specialization || 'General'}</p>
                    </div>
                    <span className="shift-badge">{doctor.shift}</span>
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
