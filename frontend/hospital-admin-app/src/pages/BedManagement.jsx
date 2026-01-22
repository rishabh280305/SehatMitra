import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiPlus, FiMinus, FiSave, FiRefreshCw } from 'react-icons/fi'
import { BiBed } from 'react-icons/bi'
import './BedManagement.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export default function BedManagement() {
  const [beds, setBeds] = useState({
    total: 100,
    occupied: 65,
    available: 35,
    icu: { total: 20, occupied: 15, available: 5 },
    general: { total: 60, occupied: 40, available: 20 },
    emergency: { total: 20, occupied: 10, available: 10 }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    fetchBedData()
  }, [])
  
  const fetchBedData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/hospital/my-hospital`)
      if (response.data?.beds) {
        setBeds(response.data.beds)
      }
    } catch (error) {
      console.error('Error fetching bed data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const updateOccupied = (category, delta) => {
    setBeds(prev => {
      const newBeds = { ...prev }
      if (category === 'total') {
        const newOccupied = Math.max(0, Math.min(prev.total, prev.occupied + delta))
        newBeds.occupied = newOccupied
        newBeds.available = prev.total - newOccupied
      } else {
        const cat = newBeds[category]
        const newOccupied = Math.max(0, Math.min(cat.total, cat.occupied + delta))
        newBeds[category] = {
          ...cat,
          occupied: newOccupied,
          available: cat.total - newOccupied
        }
        // Recalculate totals
        newBeds.occupied = newBeds.icu.occupied + newBeds.general.occupied + newBeds.emergency.occupied
        newBeds.available = newBeds.total - newBeds.occupied
      }
      return newBeds
    })
  }
  
  const saveBedData = async () => {
    try {
      setSaving(true)
      await axios.put(`${API_URL}/hospital/update-beds`, { beds })
      toast.success('Bed data updated successfully')
    } catch (error) {
      toast.error('Failed to update bed data')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading bed data...</p>
      </div>
    )
  }
  
  const occupancyRate = beds.total > 0 ? Math.round((beds.occupied / beds.total) * 100) : 0
  
  return (
    <div className="bed-management-page">
      <div className="page-header">
        <div>
          <h1>Bed Management</h1>
          <p>Monitor and update bed availability in real-time</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchBedData}>
            <FiRefreshCw /> Refresh
          </button>
          <button className="btn btn-primary" onClick={saveBedData} disabled={saving}>
            {saving ? <span className="spinner-small"></span> : <FiSave />}
            Save Changes
          </button>
        </div>
      </div>
      
      {/* Overall Stats */}
      <div className="overview-card">
        <div className="overview-header">
          <h2><BiBed /> Hospital Bed Overview</h2>
          <div className={`occupancy-badge ${occupancyRate > 85 ? 'critical' : occupancyRate > 70 ? 'warning' : 'good'}`}>
            {occupancyRate}% Occupied
          </div>
        </div>
        
        <div className="overview-stats">
          <div className="overview-stat">
            <span className="stat-value">{beds.total}</span>
            <span className="stat-label">Total Beds</span>
          </div>
          <div className="overview-stat occupied">
            <span className="stat-value">{beds.occupied}</span>
            <span className="stat-label">Occupied</span>
          </div>
          <div className="overview-stat available">
            <span className="stat-value">{beds.available}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
        
        <div className="occupancy-bar">
          <div 
            className={`occupancy-fill ${occupancyRate > 85 ? 'critical' : occupancyRate > 70 ? 'warning' : 'good'}`}
            style={{ width: `${occupancyRate}%` }}
          ></div>
        </div>
      </div>
      
      {/* Category Cards */}
      <div className="category-grid">
        {/* ICU */}
        <div className="category-card icu">
          <div className="category-header">
            <h3>ICU Beds</h3>
            <span className={`status-badge ${beds.icu.available < 3 ? 'critical' : 'good'}`}>
              {beds.icu.available} available
            </span>
          </div>
          
          <div className="category-stats">
            <div className="stat-row">
              <span>Total</span>
              <span className="value">{beds.icu.total}</span>
            </div>
            <div className="stat-row">
              <span>Occupied</span>
              <span className="value">{beds.icu.occupied}</span>
            </div>
          </div>
          
          <div className="occupancy-controls">
            <span>Update Occupied:</span>
            <div className="control-buttons">
              <button 
                className="control-btn minus"
                onClick={() => updateOccupied('icu', -1)}
                disabled={beds.icu.occupied <= 0}
              >
                <FiMinus />
              </button>
              <span className="count">{beds.icu.occupied}</span>
              <button 
                className="control-btn plus"
                onClick={() => updateOccupied('icu', 1)}
                disabled={beds.icu.occupied >= beds.icu.total}
              >
                <FiPlus />
              </button>
            </div>
          </div>
        </div>
        
        {/* General */}
        <div className="category-card general">
          <div className="category-header">
            <h3>General Beds</h3>
            <span className={`status-badge ${beds.general.available < 5 ? 'critical' : 'good'}`}>
              {beds.general.available} available
            </span>
          </div>
          
          <div className="category-stats">
            <div className="stat-row">
              <span>Total</span>
              <span className="value">{beds.general.total}</span>
            </div>
            <div className="stat-row">
              <span>Occupied</span>
              <span className="value">{beds.general.occupied}</span>
            </div>
          </div>
          
          <div className="occupancy-controls">
            <span>Update Occupied:</span>
            <div className="control-buttons">
              <button 
                className="control-btn minus"
                onClick={() => updateOccupied('general', -1)}
                disabled={beds.general.occupied <= 0}
              >
                <FiMinus />
              </button>
              <span className="count">{beds.general.occupied}</span>
              <button 
                className="control-btn plus"
                onClick={() => updateOccupied('general', 1)}
                disabled={beds.general.occupied >= beds.general.total}
              >
                <FiPlus />
              </button>
            </div>
          </div>
        </div>
        
        {/* Emergency */}
        <div className="category-card emergency">
          <div className="category-header">
            <h3>Emergency Beds</h3>
            <span className={`status-badge ${beds.emergency.available < 3 ? 'critical' : 'good'}`}>
              {beds.emergency.available} available
            </span>
          </div>
          
          <div className="category-stats">
            <div className="stat-row">
              <span>Total</span>
              <span className="value">{beds.emergency.total}</span>
            </div>
            <div className="stat-row">
              <span>Occupied</span>
              <span className="value">{beds.emergency.occupied}</span>
            </div>
          </div>
          
          <div className="occupancy-controls">
            <span>Update Occupied:</span>
            <div className="control-buttons">
              <button 
                className="control-btn minus"
                onClick={() => updateOccupied('emergency', -1)}
                disabled={beds.emergency.occupied <= 0}
              >
                <FiMinus />
              </button>
              <span className="count">{beds.emergency.occupied}</span>
              <button 
                className="control-btn plus"
                onClick={() => updateOccupied('emergency', 1)}
                disabled={beds.emergency.occupied >= beds.emergency.total}
              >
                <FiPlus />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
