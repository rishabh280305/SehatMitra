import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
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

export const CallProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Connect to socket server using Vercel-compatible endpoint
    const API_URL = import.meta.env.VITE_API_URL || 'https://sehatmitra-backend.vercel.app';
    const baseUrl = API_URL.replace('/api/v1', '');
    
    const newSocket = io(baseUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      console.log('📝 Registering user:', user._id || user.id);
      newSocket.emit('register-user', user._id || user.id);
    });

    newSocket.on('incoming-call', (data) => {
      console.log('📞 Incoming call received:', data);
      // Map the data to our format
      const incomingCallData = {
        callId: data.callId,
        from: data.from,
        remoteName: data.fromName || 'Doctor',
        callType: data.callType || 'voice',
        offer: data.offer,
        remoteUserId: data.from
      };
      setIncomingCall(incomingCallData);
    });

    newSocket.on('call-answered', () => {
      console.log('✅ Call answered');
    });

    newSocket.on('call-rejected', () => {
      console.log('❌ Call rejected');
      setActiveCall(null);
      setIncomingCall(null);
    });

    newSocket.on('call-ended', () => {
      console.log('📴 Call ended');
      setActiveCall(null);
      setIncomingCall(null);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  const initiateCall = (remoteUserId, remoteName, callType = 'voice', remoteLanguage = 'en') => {
    if (!socket || !user) {
      console.error('❌ Cannot initiate call - socket or user not available');
      return;
    }

    console.log('📞 Initiating call to:', remoteName, remoteUserId);

    const callData = {
      callId: `${user._id || user.id}-${remoteUserId}-${Date.now()}`,
      remoteUserId,
      remoteName,
      callType,
      isIncoming: false,
      userLanguage: user.language || 'en',
      remoteLanguage
    };

    // Emit the call to the remote user via socket
    socket.emit('call-user', {
      to: remoteUserId,
      from: user._id || user.id,
      fromName: user.fullName || user.name || 'Patient',
      offer: null, // Will be created by CallWindow component
      callType,
      remoteName
    });

    setActiveCall(callData);
  };

  const answerCall = () => {
    if (!incomingCall) return;

    setActiveCall({
      ...incomingCall,
      isIncoming: true,
      userLanguage: user.language || 'en'
    });
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!socket || !incomingCall) return;

    socket.emit('reject-call', {
      callId: incomingCall.callId,
      to: incomingCall.from
    });

    setIncomingCall(null);
  };

  const endCall = () => {
    setActiveCall(null);
    setIncomingCall(null);
  };

  const value = {
    socket,
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
          socket={socket}
          onCallEnd={endCall}
        />
      )}

      {/* Incoming call notification */}
      {incomingCall && !activeCall && (
        <div className="incoming-call-notification">
          <div className="ringing-animation"></div>
          <div className="notification-content">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
            <h3>Incoming {incomingCall.callType || 'voice'} call</h3>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0.5rem 0' }}>
              {incomingCall.remoteName || 'Doctor'}
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
