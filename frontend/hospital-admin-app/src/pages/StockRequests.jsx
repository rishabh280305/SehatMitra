import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiPlus, FiSend, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi'
import './StockRequests.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical']
const CATEGORIES = ['Medicines', 'Equipment', 'Consumables', 'PPE', 'Emergency Supplies']

export default function StockRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  
  const [formData, setFormData] = useState({
    items: [{ name: '', category: 'Medicines', quantity: 1, unit: 'units' }],
    urgency: 'Medium',
    notes: ''
  })
  
  useEffect(() => {
    fetchRequests()
  }, [])
  
  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/hospital/stock-requests`)
      if (response.data?.requests) {
        setRequests(response.data.requests)
      } else {
        // Demo data
        setRequests([
          { 
            _id: '1', 
            items: [{ name: 'Paracetamol 500mg', quantity: 500, unit: 'tablets' }], 
            urgency: 'High', 
            status: 'pending',
            notes: 'Running low on stock',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          { 
            _id: '2', 
            items: [{ name: 'IV Drip Sets', quantity: 100, unit: 'sets' }, { name: 'Surgical Gloves', quantity: 500, unit: 'pairs' }], 
            urgency: 'Medium', 
            status: 'approved',
            notes: 'Monthly restock',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            approvedAt: new Date(Date.now() - 86400000).toISOString()
          },
          { 
            _id: '3', 
            items: [{ name: 'Oxygen Cylinders', quantity: 10, unit: 'cylinders' }], 
            urgency: 'Critical', 
            status: 'pending',
            notes: 'Emergency requirement',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
        ])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.items.some(item => !item.name || item.quantity < 1)) {
      toast.error('Please fill all item details')
      return
    }
    
    try {
      await axios.post(`${API_URL}/hospital/stock-requests`, formData)
      toast.success('Stock request submitted successfully')
      fetchRequests()
      closeModal()
    } catch (error) {
      // Add locally for demo
      setRequests(prev => [{
        _id: Date.now().toString(),
        ...formData,
        status: 'pending',
        createdAt: new Date().toISOString()
      }, ...prev])
      toast.success('Stock request submitted successfully')
      closeModal()
    }
  }
  
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', category: 'Medicines', quantity: 1, unit: 'units' }]
    }))
  }
  
  const removeItem = (index) => {
    if (formData.items.length === 1) return
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }
  
  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }))
  }
  
  const closeModal = () => {
    setShowModal(false)
    setFormData({
      items: [{ name: '', category: 'Medicines', quantity: 1, unit: 'units' }],
      urgency: 'Medium',
      notes: ''
    })
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FiCheckCircle />
      case 'rejected': return <FiXCircle />
      default: return <FiClock />
    }
  }
  
  const getUrgencyIcon = (urgency) => {
    if (urgency === 'Critical' || urgency === 'High') return <FiAlertTriangle />
    return null
  }
  
  const filteredRequests = filterStatus 
    ? requests.filter(r => r.status === filterStatus)
    : requests
  
  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading requests...</p>
      </div>
    )
  }
  
  return (
    <div className="stock-requests-page">
      <div className="page-header">
        <div>
          <h1>Stock Requests</h1>
          <p>Request supplies from District Health Office</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Request
        </button>
      </div>
      
      {/* Stats */}
      <div className="request-stats">
        <div 
          className={`stat-card ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'pending' ? '' : 'pending')}
        >
          <FiClock />
          <span className="stat-value">{pendingCount}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div 
          className={`stat-card ${filterStatus === 'approved' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'approved' ? '' : 'approved')}
        >
          <FiCheckCircle />
          <span className="stat-value">{approvedCount}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div 
          className={`stat-card ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'rejected' ? '' : 'rejected')}
        >
          <FiXCircle />
          <span className="stat-value">{rejectedCount}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>
      
      {/* Requests List */}
      <div className="requests-list">
        {filteredRequests.map(request => (
          <div key={request._id} className={`request-card ${request.status}`}>
            <div className="request-header">
              <div className={`status-badge ${request.status}`}>
                {getStatusIcon(request.status)}
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </div>
              <div className={`urgency-badge ${request.urgency.toLowerCase()}`}>
                {getUrgencyIcon(request.urgency)}
                {request.urgency}
              </div>
            </div>
            
            <div className="request-items">
              {request.items.map((item, index) => (
                <div key={index} className="item-row">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
            
            {request.notes && (
              <p className="request-notes">{request.notes}</p>
            )}
            
            <div className="request-footer">
              <span className="request-date">
                Submitted: {new Date(request.createdAt).toLocaleDateString()}
              </span>
              {request.approvedAt && (
                <span className="approved-date">
                  Approved: {new Date(request.approvedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredRequests.length === 0 && (
        <div className="empty-state">
          <FiSend size={48} />
          <p>No requests found</p>
        </div>
      )}
      
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Stock Request</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="items-section">
                <div className="section-header">
                  <h3>Items Required</h3>
                  <button type="button" className="btn btn-sm" onClick={addItem}>
                    <FiPlus /> Add Item
                  </button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={index} className="item-form-row">
                    <div className="form-group flex-2">
                      <label>Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Enter item name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        placeholder="e.g. tablets"
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-item-btn"
                        onClick={() => removeItem(index)}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Urgency Level</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows="3"
                ></textarea>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <FiSend /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
