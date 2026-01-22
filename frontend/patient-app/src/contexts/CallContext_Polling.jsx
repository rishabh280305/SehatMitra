import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CallWindow from '../components/CallWindow';
import './CallNotification.css';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'https://sehatmitra-backend.vercel.app/api/v1';

export const CallProvider = ({ children, user }) => {
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const pollingIntervalRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Poll for incoming calls
  useEffect(() => {
    if (!user) return;

    const pollForCalls = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/calls/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.calls.length > 0) {
          const call = response.data.calls[0];
          
          // Only set if we don't already have this call
          if (!incomingCall || incomingCall.callId !== call.callId) {
            console.log('📞 Incoming call:', call);
            setIncomingCall({
              callId: call.callId,
              from: call.caller,
              remoteName: call.callerName,
              callType: call.callType || 'video',
              offer: call.offer,
              remoteUserId: call.caller
            });
          }
        }
      } catch (error) {
        console.error('Error polling for calls:', error);
      }
    };

    // Poll every 2 seconds
    pollForCalls();
    pollingIntervalRef.current = setInterval(pollForCalls, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user, incomingCall]);

  const initiateCall = async (remoteUserId, remoteName, callType = 'video', remoteLanguage = 'en') => {
    if (!user) {
      console.error('❌ Cannot initiate call - user not available');
      return;
    }

    try {
      console.log('📞 Initiating call to:', remoteName, remoteUserId);

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      localStreamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send call request to backend
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/calls/initiate`,
        {
          receiver: remoteUserId,
          receiverName: remoteName,
          callType,
          offer: offer
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const callData = {
          callId: response.data.call.callId,
          remoteUserId,
          remoteName,
          callType,
          isIncoming: false,
          userLanguage: user.language || 'en',
          remoteLanguage,
          peerConnection,
          localStream: stream
        };

        setActiveCall(callData);

        // Start polling for answer
        pollForAnswer(response.data.call.callId, peerConnection);
      }
    } catch (error) {
      console.error('❌ Error initiating call:', error);
      alert('Failed to initiate call. Please check your camera/microphone permissions.');
      cleanupMedia();
    }
  };

  const pollForAnswer = (callId, peerConnection) => {
    const checkAnswer = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/calls/status/${callId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const call = response.data.call;
          
          if (call.status === 'answered' && call.answer) {
            console.log('✅ Call answered');
            await peerConnection.setRemoteDescription(new RTCSessionDescription(call.answer));
            // Continue polling for ICE candidates and status
            pollForCallUpdates(callId, peerConnection);
          } else if (call.status === 'rejected' || call.status === 'ended') {
            console.log('❌ Call ended');
            endCall();
          } else {
            // Continue polling
            setTimeout(() => checkAnswer(), 1000);
          }
        }
      } catch (error) {
        console.error('Error checking for answer:', error);
      }
    };
    
    checkAnswer();
  };

  const pollForCallUpdates = (callId, peerConnection) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/calls/status/${callId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const call = response.data.call;
          
          // Handle ICE candidates
          if (call.iceCandidates && call.iceCandidates.length > 0) {
            for (const candidate of call.iceCandidates) {
              if (!candidate.processed) {
                try {
                  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate.candidate));
                  candidate.processed = true;
                } catch (err) {
                  console.error('Error adding ICE candidate:', err);
                }
              }
            }
          }

          // Check if call ended
          if (call.status === 'ended') {
            clearInterval(interval);
            endCall();
          }
        }
      } catch (error) {
        console.error('Error polling call updates:', error);
      }
    }, 1000);

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  };

  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      console.log('📞 Answering call:', incomingCall.callId);

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      localStreamRef.current = stream;

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Set remote description (offer from caller)
      if (incomingCall.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      }

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send answer to backend
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/calls/answer`,
        {
          callId: incomingCall.callId,
          answer: answer
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Set active call
      setActiveCall({
        ...incomingCall,
        isIncoming: true,
        userLanguage: user.language || 'en',
        peerConnection,
        localStream: stream
      });
      
      setIncomingCall(null);

      // Poll for call updates
      pollForCallUpdates(incomingCall.callId, peerConnection);
    } catch (error) {
      console.error('❌ Error answering call:', error);
      alert('Failed to answer call. Please check your camera/microphone permissions.');
      rejectCall();
    }
  };

  const rejectCall = async () => {
    if (!incomingCall) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/calls/reject`,
        { callId: incomingCall.callId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error rejecting call:', error);
    }

    setIncomingCall(null);
  };

  const endCall = async () => {
    if (activeCall) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_URL}/calls/end`,
          { callId: activeCall.callId },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }

    cleanupMedia();
    setActiveCall(null);
    setIncomingCall(null);
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const value = {
    activeCall,
    incomingCall,
    initiateCall,
    answerCall,
    rejectCall,
    endCall
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      
      {/* Render active call window */}
      {activeCall && (
        <CallWindow
          {...activeCall}
          onCallEnd={endCall}
        />
      )}

      {/* Incoming call notification */}
      {incomingCall && !activeCall && (
        <div className="incoming-call-notification">
          <div className="ringing-animation"></div>
          <div className="notification-content">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
            <h3>Incoming {incomingCall.callType || 'video'} call</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0.5rem 0' }}>
              {incomingCall.remoteName || 'Unknown'}
            </p>
            <div className="notification-actions">
              <button className="btn-answer" onClick={answerCall}>
                📞 Answer
              </button>
              <button className="btn-reject" onClick={rejectCall}>
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
};

export default CallContext;
