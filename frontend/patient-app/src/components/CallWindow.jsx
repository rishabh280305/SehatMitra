import React, { useState, useEffect, useRef } from 'react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import './CallWindow.css';

const CallWindow = ({ 
  callId, 
  isIncoming, 
  remoteUserId, 
  remoteName, 
  callType, 
  offer,
  onCallEnd,
  socket,
  userLanguage = 'en',
  remoteLanguage = 'en'
}) => {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const recognitionRef = useRef(null);

  // WebRTC Configuration
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    initializeCall();
    setupSpeechRecognition();

    return () => {
      cleanupCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get local media stream
      const constraints = {
        audio: true,
        video: callType === 'video' ? { width: 1280, height: 720 } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', {
            to: remoteUserId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setCallStatus('active');
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          handleCallEnd();
        }
      };

      if (isIncoming) {
        // Answer incoming call
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer-call', {
          to: remoteUserId,
          answer,
          callId
        });
        setCallStatus('active');
      } else {
        // Create offer for outgoing call
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('call-user', {
          to: remoteUserId,
          from: socket.userId,
          offer,
          callType
        });
      }

      // Listen for socket events
      socket.on('call-answered', async ({ answer }) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus('active');
      });

      socket.on('ice-candidate', async ({ candidate }) => {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      });

      socket.on('call-ended', () => {
        handleCallEnd();
      });

      socket.on('translated-speech', ({ translated }) => {
        setTranslatedText(translated);
        speakTranslatedText(translated);
      });

    } catch (error) {
      console.error('Error initializing call:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
      handleCallEnd();
    }
  };

  const setupSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = userLanguage === 'hi' ? 'hi-IN' : 
                       userLanguage === 'mr' ? 'mr-IN' : 
                       userLanguage === 'gu' ? 'gu-IN' : 'en-US';

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;

      if (event.results[last].isFinal) {
        // Send for translation
        socket.emit('translate-speech', {
          text: transcript,
          from: userLanguage,
          to: remoteLanguage,
          targetUserId: remoteUserId
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const speakTranslatedText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = userLanguage === 'hi' ? 'hi-IN' : 
                       userLanguage === 'mr' ? 'mr-IN' : 
                       userLanguage === 'gu' ? 'gu-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleTranslation = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCallEnd = () => {
    socket.emit('end-call', {
      callId,
      to: remoteUserId
    });
    cleanupCall();
    onCallEnd();
  };

  const cleanupCall = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const handleAnswer = () => {
    setCallStatus('connecting');
  };

  const handleReject = () => {
    socket.emit('reject-call', {
      callId,
      to: remoteUserId
    });
    cleanupCall();
    onCallEnd();
  };

  return (
    <div className={`call-window ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="call-header">
        <div className="caller-info">
          <h3>{remoteName}</h3>
          <span className="call-status">{callStatus}</span>
        </div>
        <button className="btn-icon" onClick={toggleFullscreen}>
          {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
        </button>
      </div>

      <div className="video-container">
        {callType === 'video' && (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="local-video"
            />
          </>
        )}
        
        {callType === 'voice' && (
          <div className="voice-call-display">
            <div className="avatar-large">{remoteName.charAt(0).toUpperCase()}</div>
            <h2>{remoteName}</h2>
          </div>
        )}

        {translatedText && (
          <div className="translation-overlay">
            <p>{translatedText}</p>
          </div>
        )}
      </div>

      {callStatus === 'incoming' && (
        <div className="call-actions incoming">
          <button className="btn-call-answer" onClick={handleAnswer}>
            <FiPhone size={24} />
            <span>Answer</span>
          </button>
          <button className="btn-call-reject" onClick={handleReject}>
            <FiPhoneOff size={24} />
            <span>Reject</span>
          </button>
        </div>
      )}

      {(callStatus === 'active' || callStatus === 'connecting') && (
        <div className="call-controls">
          <button 
            className={`btn-control ${isMuted ? 'active' : ''}`} 
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
          </button>

          {callType === 'video' && (
            <button 
              className={`btn-control ${!isVideoOn ? 'active' : ''}`} 
              onClick={toggleVideo}
              title={isVideoOn ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoOn ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
            </button>
          )}

          <button 
            className={`btn-control ${isListening ? 'active listening' : ''}`} 
            onClick={toggleTranslation}
            title={isListening ? 'Stop translation' : 'Start translation'}
          >
            <span>🌐</span>
          </button>

          <button 
            className="btn-call-end" 
            onClick={handleCallEnd}
            title="End call"
          >
            <FiPhoneOff size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CallWindow;
