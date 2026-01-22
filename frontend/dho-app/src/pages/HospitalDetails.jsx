import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  FiArrowLeft, FiPhone, FiMail, FiMapPin, 
  FiClock, FiUser, FiRefreshCw
} from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { BiBed } from 'react-icons/bi'
import './HospitalDetails.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export default function HospitalDetails() {
  const { hospitalId } = useParams()
  const [hospital, setHospital] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchHospitalDetails()
  }, [hospitalId])
  
  const fetchHospitalDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/dho/hospitals/details/${hospitalId}`)
      setHospital(response.data)
    } catch (error) {
      console.error('Error fetching hospital details:', error)
      toast.error('Failed to fetch hospital details')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading hospital details...</p>
      </div>
    )
  }
  
  if (!hospital) {
    return (
      <div className="empty-state">
        <HiOutlineBuildingOffice2 />
        <h3>Hospital Not Found</h3>
        <p>The requested hospital could not be found</p>
        <Link to="/hospitals" className="btn btn-primary">
          Back to Hospitals
        </Link>
      </div>
    )
  }
  
  const getBedStatusClass = (available, total) => {
    if (total === 0) return 'unknown'
    const percent = (available / total) * 100
    if (percent < 20) return 'critical'
    if (percent < 50) return 'warning'
    return 'good'
  }
  
  return (
    <div className="hospital-details-page">
      <Link to="/hospitals" className="back-link">
        <FiArrowLeft /> Back to Hospitals
      </Link>
      
      {/* Hospital Header */}
      <div className="hospital-header-card">
        <div className="hospital-main-info">
          <div className="hospital-avatar">
            <HiOutlineBuildingOffice2 />
          </div>
          <div className="hospital-title">
            <h1>{hospital.hospitalName}</h1>
            <p className="hospital-location">
              <FiMapPin /> {hospital.district}
            </p>
            <p className="hospital-hours">
              <FiClock /> {hospital.operatingHours}
            </p>
          </div>
        </div>
        
        <div className="hospital-contact">
          {hospital.emergencyContact?.phone && (
            <a href={`tel:${hospital.emergencyContact.phone}`} className="contact-item">
              <FiPhone /> {hospital.emergencyContact.phone}
            </a>
          )}
          {hospital.emergencyContact?.email && (
            <a href={`mailto:${hospital.emergencyContact.email}`} className="contact-item">
              <FiMail /> {hospital.emergencyContact.email}
            </a>
          )}
        </div>
        
        <button className="btn btn-outline refresh-btn" onClick={fetchHospitalDetails}>
          <FiRefreshCw /> Refresh Data
        </button>
      </div>
      
      {/* Bed Statistics */}
      <div className="section-card">
        <div className="section-header">
          <h2><BiBed /> Bed Availability</h2>
          <span className={`status-badge ${getBedStatusClass(hospital.beds?.available, hospital.beds?.total)}`}>
            {hospital.beds?.available || 0} Available
          </span>
        </div>
        
        <div className="bed-stats-grid">
          <div className="bed-stat-card total">
            <div className="bed-stat-value">{hospital.beds?.total || 0}</div>
            <div className="bed-stat-label">Total Beds</div>
            <div className="bed-progress">
              <div 
                className="bed-progress-fill"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
          
          <div className="bed-stat-card occupied">
            <div className="bed-stat-value">{hospital.beds?.occupied || 0}</div>
            <div className="bed-stat-label">Occupied</div>
            <div className="bed-progress">
              <div 
                className="bed-progress-fill danger"
                style={{ width: `${hospital.beds?.total > 0 ? (hospital.beds.occupied / hospital.beds.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bed-stat-card available">
            <div className="bed-stat-value">{hospital.beds?.available || 0}</div>
            <div className="bed-stat-label">Available</div>
            <div className="bed-progress">
              <div 
                className="bed-progress-fill success"
                style={{ width: `${hospital.beds?.total > 0 ? (hospital.beds.available / hospital.beds.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Bed Categories */}
        <div className="bed-categories">
          <h3>By Category</h3>
          <div className="category-grid">
            <div className="category-card">
              <div className="category-header">
                <span className="category-name">ICU</span>
                <span className={`category-status ${getBedStatusClass(hospital.beds?.icu?.available, hospital.beds?.icu?.total)}`}>
                  {hospital.beds?.icu?.available || 0} available
                </span>
              </div>
              <div className="category-stats">
                <span>Total: {hospital.beds?.icu?.total || 0}</span>
                <span>Occupied: {hospital.beds?.icu?.occupied || 0}</span>
              </div>
            </div>
            
            <div className="category-card">
              <div className="category-header">
                <span className="category-name">General</span>
                <span className={`category-status ${getBedStatusClass(hospital.beds?.general?.available, hospital.beds?.general?.total)}`}>
                  {hospital.beds?.general?.available || 0} available
                </span>
              </div>
              <div className="category-stats">
                <span>Total: {hospital.beds?.general?.total || 0}</span>
                <span>Occupied: {hospital.beds?.general?.occupied || 0}</span>
              </div>
            </div>
            
            <div className="category-card">
              <div className="category-header">
                <span className="category-name">Emergency</span>
                <span className={`category-status ${getBedStatusClass(hospital.beds?.emergency?.available, hospital.beds?.emergency?.total)}`}>
                  {hospital.beds?.emergency?.available || 0} available
                </span>
              </div>
              <div className="category-stats">
                <span>Total: {hospital.beds?.emergency?.total || 0}</span>
                <span>Occupied: {hospital.beds?.emergency?.occupied || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Doctor Rotation */}
      <div className="section-card">
        <div className="section-header">
          <h2><FiUser /> Doctor Rotation</h2>
          <span className="doctor-count">
            {hospital.doctors?.filter(d => d.currentlyOnDuty).length || 0} on duty
          </span>
        </div>
        
        {hospital.doctors?.length === 0 ? (
          <div className="empty-state small">
            <p>No doctors registered for this hospital</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {hospital.doctors?.map((doctor, idx) => (
              <div key={idx} className={`doctor-card ${doctor.currentlyOnDuty ? 'on-duty' : ''}`}>
                <div className="doctor-avatar">
                  {doctor.name?.charAt(0) || 'D'}
                </div>
                <div className="doctor-info">
                  <h4>{doctor.name}</h4>
                  <p className="doctor-specialization">{doctor.specialization || 'General'}</p>
                  <div className="doctor-schedule">
                    <span className={`shift-badge ${doctor.shift}`}>
                      {doctor.shift} shift
                    </span>
                    {doctor.currentlyOnDuty && (
                      <span className="on-duty-badge">On Duty</span>
                    )}
                  </div>
                  {doctor.daysAvailable?.length > 0 && (
                    <div className="days-available">
                      {doctor.daysAvailable.map(day => (
                        <span key={day} className="day-tag">{day.slice(0, 3)}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Staff & Facilities */}
      <div className="info-grid">
        <div className="section-card">
          <h2>Staff Count</h2>
          <div className="staff-list">
            <div className="staff-item">
              <span className="staff-label">Nurses</span>
              <span className="staff-value">{hospital.staff?.nurses || 0}</span>
            </div>
            <div className="staff-item">
              <span className="staff-label">Technicians</span>
              <span className="staff-value">{hospital.staff?.technicians || 0}</span>
            </div>
            <div className="staff-item">
              <span className="staff-label">Support Staff</span>
              <span className="staff-value">{hospital.staff?.support || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="section-card">
          <h2>Facilities</h2>
          {hospital.facilities?.length === 0 ? (
            <p className="no-data">No facilities listed</p>
          ) : (
            <div className="facilities-list">
              {hospital.facilities?.map((facility, idx) => (
                <div key={idx} className={`facility-item ${facility.available ? 'available' : 'unavailable'}`}>
                  <span className="facility-name">{facility.facilityName}</span>
                  <span className={`facility-status ${facility.available ? 'available' : 'unavailable'}`}>
                    {facility.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="last-updated">
        Last updated: {hospital.lastUpdated ? new Date(hospital.lastUpdated).toLocaleString() : 'Unknown'}
      </div>
    </div>
  )
}
