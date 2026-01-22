import React, { useState, useEffect, useRef } from 'react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import './CallWindow.css';

const CallWindow = ({ 
  callId, 
  isIncoming, 
  remoteUserId, 
  remoteName, 
  callType, 
  peerConnection,
  localStream,
  onCallEnd
}) => {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'active' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!peerConnection || !localStream) return;

    // Set local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📹 Received remote track');
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setCallStatus('active');
      }
    };

    // Handle connection state
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'connected') {
        setCallStatus('active');
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed' ||
                 peerConnection.connectionState === 'closed') {
        handleCallEnd();
      }
    };

    // Handle ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    return () => {
      // Cleanup handled by CallContext
    };
  }, [peerConnection, localStream]);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCallEnd = () => {
    if (onCallEnd) {
      onCallEnd();
    }
  };

  return (
    <div className={`call-window ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="call-header">
        <div className="caller-info">
          <h3>{remoteName}</h3>
          <span className={`call-status ${callStatus}`}>{callStatus}</span>
        </div>
        <button className="btn-icon" onClick={toggleFullscreen} title="Toggle fullscreen">
          {isFullscreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
        </button>
      </div>

      <div className="video-container">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="remote-video"
          style={{ display: callStatus === 'active' ? 'block' : 'none' }}
        />
        
        {/* Local video (picture-in-picture) */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="local-video"
          style={{ display: isVideoOn ? 'block' : 'none' }}
        />
        
        {/* Connecting status */}
        {callStatus === 'connecting' && (
          <div className="voice-call-display">
            <div className="avatar-large">{remoteName.charAt(0).toUpperCase()}</div>
            <h2>{remoteName}</h2>
            <p className="call-status-text">Connecting...</p>
            <div className="connecting-spinner"></div>
          </div>
        )}

        {/* Voice call display (when video is off) */}
        {!isVideoOn && callStatus === 'active' && (
          <div className="voice-call-display">
            <div className="avatar-large">{remoteName.charAt(0).toUpperCase()}</div>
            <h2>{remoteName}</h2>
            <p className="call-status-text">Video Off</p>
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="call-controls">
        <button 
          className={`btn-control ${isMuted ? 'active' : ''}`} 
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
        </button>

        <button 
          className={`btn-control ${!isVideoOn ? 'active' : ''}`} 
          onClick={toggleVideo}
          title={isVideoOn ? 'Turn off video' : 'Turn on video'}
        >
          {isVideoOn ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
        </button>

        <button 
          className="btn-call-end" 
          onClick={handleCallEnd}
          title="End call"
        >
          <FiPhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default CallWindow;
