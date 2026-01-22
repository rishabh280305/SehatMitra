import { useState, useEffect } from 'react';
import { FiInfo, FiPhone, FiVideo, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';
import './FollowUpRequests.css';

function FollowUpRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowUpRequests();
  }, []);

  const fetchFollowUpRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const patientId = user?.id || user?.patientId;

      if (!patientId) {
        console.log('No follow-up requests yet');
        setRequests([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/consultations/follow-up/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching follow-up requests:', error);
      toast.error('Failed to load follow-up requests');
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/consultations/follow-up/${requestId}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Request ${status}`);
        fetchFollowUpRequests();
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Failed to respond to request');
    }
  };

  const getRequestIcon = (type) => {
    switch (type) {
      case 'audio_call':
        return <FiPhone size={24} />;
      case 'video_call':
        return <FiVideo size={24} />;
      default:
        return <FiInfo size={24} />;
    }
  };

  const getRequestTitle = (type) => {
    switch (type) {
      case 'audio_call':
        return 'Audio Call Request';
      case 'video_call':
        return 'Video Call Request';
      default:
        return 'Information Request';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="follow-up-requests-container">
        <div className="loading">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="follow-up-requests-container">
      <div className="page-header">
        <h2>Follow-up Requests</h2>
        <p>Requests from your doctor</p>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <FiInfo size={48} />
          <h3>No Follow-up Requests</h3>
          <p>You don't have any pending requests from your doctor</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request._id} className={`request-card ${request.status}`}>
              <div className="request-header">
                <div className="request-icon">
                  {getRequestIcon(request.requestType)}
                </div>
                <div className="request-title-section">
                  <h3>{getRequestTitle(request.requestType)}</h3>
                  <p className="doctor-name">Dr. {request.doctor?.name || 'Doctor'}</p>
                </div>
                <span className={`status-badge ${request.status}`}>
                  {request.status}
                </span>
              </div>

              <div className="request-body">
                <div className="request-description">
                  <strong>Details:</strong>
                  <p>{request.description}</p>
                </div>

                <div className="request-meta">
                  <div className="meta-item">
                    <FiClock />
                    <span>Requested on {formatDate(request.createdAt)}</span>
                  </div>
                  {request.respondedAt && (
                    <div className="meta-item">
                      <FiCheckCircle />
                      <span>Responded on {formatDate(request.respondedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="request-actions">
                  <button 
                    className="btn-accept"
                    onClick={() => respondToRequest(request._id, 'accepted')}
                  >
                    <FiCheckCircle />
                    Accept
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => respondToRequest(request._id, 'rejected')}
                  >
                    <FiXCircle />
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FollowUpRequests;
