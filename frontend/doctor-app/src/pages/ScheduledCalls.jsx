import { useState, useEffect } from 'react';
import { FiPhone, FiVideo, FiCalendar, FiClock, FiUser, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCall } from '../contexts/CallContext';
import API_BASE_URL from '../config';
import './ScheduledCalls.css';

function ScheduledCalls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { initiateCall } = useCall();

  useEffect(() => {
    fetchScheduledCalls();
  }, []);

  const fetchScheduledCalls = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/consultations/calls/scheduled`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCalls(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching scheduled calls:', error);
      toast.error('Failed to load scheduled calls');
    } finally {
      setLoading(false);
    }
  };

  const updateCallStatus = async (callId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/consultations/calls/${callId}/status`,
        { status, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Call marked as ${status}`);
        fetchScheduledCalls();
      }
    } catch (error) {
      console.error('Error updating call status:', error);
      toast.error('Failed to update call status');
    }
  };

  const joinCall = (call) => {
    const patientId = call.patient?._id || call.patient?.id;
    const patientName = call.patient?.name || 'Patient';
    const patientLanguage = call.patient?.language || 'en';
    
    if (!patientId) {
      toast.error('Patient information not available');
      return;
    }

    // Initiate WebRTC call
    initiateCall(
      patientId,
      patientName,
      call.callType || 'voice',
      patientLanguage
    );

    toast.success(`Calling ${patientName}...`);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isPastScheduledTime = (dateString) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="scheduled-calls-container">
        <div className="loading">Loading scheduled calls...</div>
      </div>
    );
  }

  return (
    <div className="scheduled-calls-container">
      <div className="page-header">
        <h1>Scheduled Calls</h1>
        <p>Manage your upcoming and pending video/audio consultations</p>
      </div>

      {calls.length === 0 ? (
        <div className="empty-state">
          <FiCalendar size={64} />
          <h3>No Scheduled Calls</h3>
          <p>You don't have any scheduled calls at the moment</p>
        </div>
      ) : (
        <div className="calls-grid">
          {calls.map((call) => {
            const { date, time } = formatDateTime(call.scheduledTime);
            const isPast = isPastScheduledTime(call.scheduledTime);
            
            return (
              <div key={call._id} className={`call-card ${call.status}`}>
                <div className="call-header">
                  <div className="call-icon">
                    {call.callType === 'video' ? <FiVideo size={24} /> : <FiPhone size={24} />}
                  </div>
                  <div className="call-type">
                    {call.callType === 'video' ? 'Video Call' : 'Audio Call'}
                  </div>
                  <span className={`status-badge ${call.status}`}>
                    {call.status === 'accepted' ? 'Confirmed' : 'Pending Approval'}
                  </span>
                </div>

                <div className="call-details">
                  <div className="patient-info">
                    <FiUser />
                    <div>
                      <div className="patient-name">{call.patient?.name || 'Patient'}</div>
                      <div className="patient-meta">
                        {call.patient?.age} years, {call.patient?.gender}
                      </div>
                    </div>
                  </div>

                  <div className="schedule-info">
                    <div className="info-row">
                      <FiCalendar />
                      <span>{date}</span>
                    </div>
                    <div className="info-row">
                      <FiClock />
                      <span>{time}</span>
                    </div>
                  </div>

                  {call.notes && (
                    <div className="call-notes">
                      <strong>Notes:</strong> {call.notes}
                    </div>
                  )}
                </div>

                <div className="call-actions">
                  {call.status === 'accepted' && (
                    <button 
                      className="btn-join"
                      onClick={() => joinCall(call)}
                    >
                      {isPast ? 'Rejoin Call' : 'Join Call'}
                    </button>
                  )}
                  
                  {isPast && call.status !== 'completed' && call.status !== 'missed' && (
                    <>
                      <button 
                        className="btn-mark-completed"
                        onClick={() => updateCallStatus(call._id, 'completed')}
                      >
                        <FiCheckCircle />
                        Mark Completed
                      </button>
                      <button 
                        className="btn-mark-missed"
                        onClick={() => updateCallStatus(call._id, 'missed')}
                      >
                        <FiXCircle />
                        Mark Missed
                      </button>
                    </>
                  )}

                  {!isPast && call.status === 'pending' && (
                    <div className="approval-status">
                      <p>Waiting for patient approval</p>
                      <small>{call.acceptedBy?.length || 0} of 2 parties accepted</small>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScheduledCalls;
