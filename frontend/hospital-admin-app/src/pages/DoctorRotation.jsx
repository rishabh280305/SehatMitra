import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiClock, FiPhone } from 'react-icons/fi'
import './DoctorRotation.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

const SHIFTS = ['Morning', 'Afternoon', 'Night']
const DEPARTMENTS = ['General', 'ICU', 'Emergency', 'Pediatrics', 'Surgery', 'OPD']

export default function DoctorRotation() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [filterShift, setFilterShift] = useState('')
  const [filterDept, setFilterDept] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    department: 'General',
    shift: 'Morning',
    contact: '',
    status: 'on-duty'
  })
  
  useEffect(() => {
    fetchDoctors()
  }, [])
  
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/hospital/doctors`)
      if (response.data?.doctors) {
        setDoctors(response.data.doctors)
      } else {
        // Demo data
        setDoctors([
          { _id: '1', name: 'Dr. Amit Sharma', specialization: 'General Medicine', department: 'OPD', shift: 'Morning', contact: '9876543210', status: 'on-duty' },
          { _id: '2', name: 'Dr. Priya Singh', specialization: 'Pediatrics', department: 'Pediatrics', shift: 'Morning', contact: '9876543211', status: 'on-duty' },
          { _id: '3', name: 'Dr. Raj Kumar', specialization: 'Surgery', department: 'Surgery', shift: 'Afternoon', contact: '9876543212', status: 'on-duty' },
          { _id: '4', name: 'Dr. Meera Patel', specialization: 'Emergency Medicine', department: 'Emergency', shift: 'Night', contact: '9876543213', status: 'on-duty' },
          { _id: '5', name: 'Dr. Vikram Joshi', specialization: 'Critical Care', department: 'ICU', shift: 'Night', contact: '9876543214', status: 'on-leave' },
        ])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingDoctor) {
        await axios.put(`${API_URL}/hospital/doctors/${editingDoctor._id}`, formData)
        toast.success('Doctor updated successfully')
      } else {
        await axios.post(`${API_URL}/hospital/doctors`, formData)
        toast.success('Doctor added successfully')
      }
      fetchDoctors()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save doctor')
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this doctor?')) return
    try {
      await axios.delete(`${API_URL}/hospital/doctors/${id}`)
      toast.success('Doctor removed successfully')
      fetchDoctors()
    } catch (error) {
      toast.error('Failed to remove doctor')
    }
  }
  
  const openModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor)
      setFormData({
        name: doctor.name,
        specialization: doctor.specialization,
        department: doctor.department,
        shift: doctor.shift,
        contact: doctor.contact,
        status: doctor.status
      })
    } else {
      setEditingDoctor(null)
      setFormData({
        name: '',
        specialization: '',
        department: 'General',
        shift: 'Morning',
        contact: '',
        status: 'on-duty'
      })
    }
    setShowModal(true)
  }
  
  const closeModal = () => {
    setShowModal(false)
    setEditingDoctor(null)
    setFormData({
      name: '',
      specialization: '',
      department: 'General',
      shift: 'Morning',
      contact: '',
      status: 'on-duty'
    })
  }
  
  const filteredDoctors = doctors.filter(doc => {
    if (filterShift && doc.shift !== filterShift) return false
    if (filterDept && doc.department !== filterDept) return false
    return true
  })
  
  const getShiftColor = (shift) => {
    switch (shift) {
      case 'Morning': return 'shift-morning'
      case 'Afternoon': return 'shift-afternoon'
      case 'Night': return 'shift-night'
      default: return ''
    }
  }
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading doctors...</p>
      </div>
    )
  }
  
  const onDutyCount = doctors.filter(d => d.status === 'on-duty').length
  const onLeaveCount = doctors.filter(d => d.status === 'on-leave').length
  
  return (
    <div className="doctor-rotation-page">
      <div className="page-header">
        <div>
          <h1>Doctor Rotation</h1>
          <p>Manage doctor schedules and duty assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus /> Add Doctor
        </button>
      </div>
      
      {/* Stats */}
      <div className="doctor-stats">
        <div className="stat-card">
          <span className="stat-value">{doctors.length}</span>
          <span className="stat-label">Total Doctors</span>
        </div>
        <div className="stat-card on-duty">
          <span className="stat-value">{onDutyCount}</span>
          <span className="stat-label">On Duty</span>
        </div>
        <div className="stat-card on-leave">
          <span className="stat-value">{onLeaveCount}</span>
          <span className="stat-label">On Leave</span>
        </div>
      </div>
      
      {/* Filters */}
      <div className="filters-row">
        <select 
          value={filterShift} 
          onChange={(e) => setFilterShift(e.target.value)}
          className="filter-select"
        >
          <option value="">All Shifts</option>
          {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        
        <select 
          value={filterDept} 
          onChange={(e) => setFilterDept(e.target.value)}
          className="filter-select"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      
      {/* Doctor Grid */}
      <div className="doctor-grid">
        {filteredDoctors.map(doctor => (
          <div key={doctor._id} className={`doctor-card ${doctor.status}`}>
            <div className="doctor-avatar">
              <FiUser />
            </div>
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              <p className="specialization">{doctor.specialization}</p>
              
              <div className="doctor-meta">
                <span className="meta-item">
                  <FiClock /> {doctor.department}
                </span>
                <span className={`shift-badge ${getShiftColor(doctor.shift)}`}>
                  {doctor.shift}
                </span>
              </div>
              
              <div className="doctor-contact">
                <FiPhone /> {doctor.contact}
              </div>
              
              <div className={`status-badge ${doctor.status}`}>
                {doctor.status === 'on-duty' ? 'On Duty' : 'On Leave'}
              </div>
            </div>
            
            <div className="doctor-actions">
              <button className="action-btn edit" onClick={() => openModal(doctor)}>
                <FiEdit2 />
              </button>
              <button className="action-btn delete" onClick={() => handleDelete(doctor._id)}>
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDoctors.length === 0 && (
        <div className="empty-state">
          <p>No doctors found matching the filters</p>
        </div>
      )}
      
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Full Name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. General Medicine"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  >
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="9876543210"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="on-duty">On Duty</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
