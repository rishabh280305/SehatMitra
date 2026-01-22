import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  FiSearch, FiMapPin, FiPhone, FiMail, 
  FiUsers, FiChevronRight, FiRefreshCw
} from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { BiBed } from 'react-icons/bi'
import './Hospitals.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export default function Hospitals() {
  const { user } = useAuth()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const district = user?.district || 'Mumbai'
  
  useEffect(() => {
    fetchHospitals()
  }, [district])
  
  const fetchHospitals = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/dho/hospitals/${district}`)
      setHospitals(response.data || [])
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      toast.error('Failed to fetch hospitals')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredHospitals = hospitals.filter(h => 
    h.hospitalName?.toLowerCase().includes(search.toLowerCase())
  )
  
  const getBedStatus = (available, total) => {
    if (total === 0) return 'unknown'
    const percent = (available / total) * 100
    if (percent < 20) return 'critical'
    if (percent < 50) return 'warning'
    return 'good'
  }
  
  // Calculate district-wide stats
  const districtStats = {
    totalHospitals: hospitals.length,
    totalBeds: hospitals.reduce((sum, h) => sum + (h.beds?.total || 0), 0),
    availableBeds: hospitals.reduce((sum, h) => sum + (h.beds?.available || 0), 0),
    totalDoctors: hospitals.reduce((sum, h) => sum + (h.doctors?.length || 0), 0),
    onDutyDoctors: hospitals.reduce((sum, h) => 
      sum + (h.doctors?.filter(d => d.currentlyOnDuty).length || 0), 0)
  }
  
  return (
    <div className="hospitals-page">
      <div className="page-header">
        <div>
          <h1>Hospitals in {district}</h1>
          <p>Monitor hospital infrastructure and resources across your district</p>
        </div>
        <button className="btn btn-outline" onClick={fetchHospitals}>
          <FiRefreshCw /> Refresh
        </button>
      </div>
      
      {/* District Overview */}
      <div className="district-overview">
        <div className="overview-card">
          <HiOutlineBuildingOffice2 className="overview-icon" />
          <div className="overview-info">
            <span className="overview-value">{districtStats.totalHospitals}</span>
            <span className="overview-label">Total Hospitals</span>
          </div>
        </div>
        
        <div className="overview-card">
          <BiBed className="overview-icon beds" />
          <div className="overview-info">
            <span className="overview-value">{districtStats.availableBeds}/{districtStats.totalBeds}</span>
            <span className="overview-label">Available Beds</span>
          </div>
          <div className="overview-progress">
            <div 
              className={`progress-fill ${getBedStatus(districtStats.availableBeds, districtStats.totalBeds)}`}
              style={{ width: `${districtStats.totalBeds > 0 ? (districtStats.availableBeds / districtStats.totalBeds) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="overview-card">
          <FiUsers className="overview-icon doctors" />
          <div className="overview-info">
            <span className="overview-value">{districtStats.onDutyDoctors}/{districtStats.totalDoctors}</span>
            <span className="overview-label">Doctors On Duty</span>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="search-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search hospitals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
        </div>
      </div>
      
      {/* Hospitals Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading hospitals...</p>
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="empty-state">
          <HiOutlineBuildingOffice2 />
          <h3>No Hospitals Found</h3>
          <p>No hospitals registered in {district} yet</p>
        </div>
      ) : (
        <div className="hospitals-grid">
          {filteredHospitals.map(hospital => (
            <Link 
              key={hospital._id} 
              to={`/hospitals/${hospital.hospital}`}
              className="hospital-card"
            >
              <div className="hospital-header">
                <div className="hospital-icon">
                  <HiOutlineBuildingOffice2 />
                </div>
                <div className="hospital-info">
                  <h3>{hospital.hospitalName}</h3>
                  <p><FiMapPin /> {hospital.district}</p>
                </div>
              </div>
              
              <div className="hospital-stats">
                <div className="hospital-stat">
                  <BiBed className="stat-icon" />
                  <div className="stat-details">
                    <span className="stat-value">{hospital.beds?.available || 0}/{hospital.beds?.total || 0}</span>
                    <span className="stat-label">Beds Available</span>
                  </div>
                  <div className={`status-indicator ${getBedStatus(hospital.beds?.available, hospital.beds?.total)}`}></div>
                </div>
                
                <div className="hospital-stat">
                  <FiUsers className="stat-icon" />
                  <div className="stat-details">
                    <span className="stat-value">{hospital.doctors?.length || 0}</span>
                    <span className="stat-label">Doctors</span>
                  </div>
                </div>
              </div>
              
              {/* Bed Breakdown */}
              <div className="bed-breakdown">
                <div className="bed-type">
                  <span className="bed-type-label">ICU</span>
                  <span className="bed-type-value">
                    {hospital.beds?.icu?.available || 0}/{hospital.beds?.icu?.total || 0}
                  </span>
                </div>
                <div className="bed-type">
                  <span className="bed-type-label">General</span>
                  <span className="bed-type-value">
                    {hospital.beds?.general?.available || 0}/{hospital.beds?.general?.total || 0}
                  </span>
                </div>
                <div className="bed-type">
                  <span className="bed-type-label">Emergency</span>
                  <span className="bed-type-value">
                    {hospital.beds?.emergency?.available || 0}/{hospital.beds?.emergency?.total || 0}
                  </span>
                </div>
              </div>
              
              <div className="hospital-footer">
                <span className="view-details">View Details <FiChevronRight /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
