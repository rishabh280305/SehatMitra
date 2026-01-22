import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  FiPackage, FiCheck, FiX, FiFilter, FiSearch, 
  FiChevronDown, FiAlertTriangle, FiInfo
} from 'react-icons/fi'
import './StockRequests.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://sehat-mitra-backend.vercel.app/api/v1'

export default function StockRequests() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(searchParams.get('status') || 'all')
  const [search, setSearch] = useState('')
  const [expandedRequest, setExpandedRequest] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  
  const district = user?.district || 'Mumbai'
  
  useEffect(() => {
    fetchRequests()
  }, [district, filter])
  
  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const response = await axios.get(`${API_URL}/dho/requests/${district}${params}`)
      setRequests(response.data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }
  
  const handleApprove = async (requestId) => {
    try {
      setActionLoading(requestId)
      await axios.put(`${API_URL}/dho/requests/${requestId}/approve`)
      toast.success('Request approved successfully')
      fetchRequests()
    } catch (error) {
      toast.error('Failed to approve request')
    } finally {
      setActionLoading(null)
    }
  }
  
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    
    try {
      setActionLoading(rejectModal)
      await axios.put(`${API_URL}/dho/requests/${rejectModal}/reject`, {
        rejectionReason: rejectReason
      })
      toast.success('Request rejected')
      setRejectModal(null)
      setRejectReason('')
      fetchRequests()
    } catch (error) {
      toast.error('Failed to reject request')
    } finally {
      setActionLoading(null)
    }
  }
  
  const filteredRequests = requests.filter(req => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      req.requestedBy?.name?.toLowerCase().includes(searchLower) ||
      req.items?.some(item => item.itemName.toLowerCase().includes(searchLower))
    )
  })
  
  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'critical': return 'danger'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      default: return 'success'
    }
  }
  
  return (
    <div className="stock-requests-page">
      <div className="page-header">
        <div>
          <h1>Stock Supply Requests</h1>
          <p>Review and approve supply requests from hospitals and ASHA workers</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
        </div>
        
        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select 
            value={filter} 
            onChange={(e) => {
              setFilter(e.target.value)
              setSearchParams(e.target.value !== 'all' ? { status: e.target.value } : {})
            }}
            className="form-control"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>
      
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-pill">
          <span className="stat-dot pending"></span>
          {requests.filter(r => r.status === 'pending').length} Pending
        </div>
        <div className="stat-pill">
          <span className="stat-dot approved"></span>
          {requests.filter(r => r.status === 'approved').length} Approved
        </div>
        <div className="stat-pill">
          <span className="stat-dot rejected"></span>
          {requests.filter(r => r.status === 'rejected').length} Rejected
        </div>
      </div>
      
      {/* Requests List */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <FiPackage />
          <h3>No Requests Found</h3>
          <p>{filter !== 'all' ? `No ${filter} requests at the moment` : 'No stock requests have been made yet'}</p>
        </div>
      ) : (
        <div className="requests-list">
          {filteredRequests.map(request => (
            <div key={request._id} className={`request-card ${request.status}`}>
              <div 
                className="request-header"
                onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
              >
                <div className="request-main-info">
                  <div className="requester-avatar">
                    {request.requestedBy?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="request-details">
                    <h3>{request.requestedBy?.name || 'Unknown Requester'}</h3>
                    <p className="requester-type">
                      {request.requesterType === 'hospital' ? 'Hospital' : 'ASHA Worker'}
                    </p>
                    <p className="request-date">
                      {new Date(request.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="request-meta">
                  <div className="items-count">
                    <FiPackage />
                    <span>{request.items?.length || 0} items</span>
                  </div>
                  <span className={`badge badge-${request.status}`}>
                    {request.status}
                  </span>
                  <FiChevronDown className={`expand-icon ${expandedRequest === request._id ? 'expanded' : ''}`} />
                </div>
              </div>
              
              {/* AI Recommendation */}
              {request.aiRecommendation?.recommended && (
                <div className="ai-recommendation">
                  <FiInfo />
                  <span>AI Recommended: {request.aiRecommendation.reasoning}</span>
                  <span className="confidence">
                    {Math.round(request.aiRecommendation.confidence)}% confidence
                  </span>
                </div>
              )}
              
              {/* Expanded Content */}
              {expandedRequest === request._id && (
                <div className="request-expanded">
                  <div className="items-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Type</th>
                          <th>Quantity</th>
                          <th>Urgency</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {request.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="item-name">{item.itemName}</td>
                            <td>
                              <span className="item-type">{item.itemType || 'General'}</span>
                            </td>
                            <td>
                              {item.requestedQuantity} {item.unit || 'units'}
                            </td>
                            <td>
                              <span className={`urgency-badge ${getUrgencyColor(item.urgency)}`}>
                                {item.urgency === 'critical' && <FiAlertTriangle />}
                                {item.urgency}
                              </span>
                            </td>
                            <td className="item-reason">{item.reason || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {request.notes && (
                    <div className="request-notes">
                      <strong>Notes:</strong> {request.notes}
                    </div>
                  )}
                  
                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>Rejection Reason:</strong> {request.rejectionReason}
                    </div>
                  )}
                  
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(request._id)}
                        disabled={actionLoading === request._id}
                      >
                        {actionLoading === request._id ? (
                          <span className="spinner-small"></span>
                        ) : (
                          <FiCheck />
                        )}
                        Approve Request
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => setRejectModal(request._id)}
                        disabled={actionLoading === request._id}
                      >
                        <FiX />
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Reject Request</h3>
            <p>Please provide a reason for rejecting this request:</p>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setRejectModal(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
              >
                {actionLoading === rejectModal ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
