import { useState, useEffect, useRef } from 'react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import './VoiceCall.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';

// Production-ready STUN/TURN servers (free public servers + Google's)
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.voip.blackberry.com:3478' }
  ]
};

function VoiceCall({ receiverId, receiverType, receiverName, patientId, consultationId, onClose }) {
  const [callStatus, setCallStatus] = useState('initiating'); // initiating, ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState([]);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callIdRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    initializeCall();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (callStatus === 'connected' && callStartTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const initializeCall = async () => {
    try {
      // Connect to Socket.IO
      const token = localStorage.getItem('token');
      socketRef.current = io(SOCKET_URL, {
        auth: { token }
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        startCall();
      });

      socketRef.current.on('call:answered', handleCallAnswered);
      socketRef.current.on('call:rejected', handleCallRejected);
      socketRef.current.on('call:ended', handleCallEnded);
      socketRef.current.on('call:ice-candidate', handleIceCandidate);

      // Setup speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event) => {
          const text = event.results[event.results.length - 1][0].transcript;
          const segment = { speaker: 'caller', text, timestamp: new Date() };
          setTranscript(prev => [...prev, segment]);
          
          // Send to backend and receiver
          saveTranscriptSegment(segment);
          socketRef.current?.emit('transcript:update', {
            callId: callIdRef.current,
            targetId: receiverId,
            speaker: 'caller',
            text
          });
        };
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to initialize call');
      onClose();
    }
  };

  const startCall = async () => {
    try {
      // Get user media (audio only)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      localStreamRef.current = stream;

      // Create call session in backend
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/calls/initiate`,
        {
          receiverId,
          receiverType,
          patientId,
          consultationId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      callIdRef.current = response.data.data.callId;

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        const audioElement = document.getElementById('remoteAudio');
        if (audioElement) {
          audioElement.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('call:ice-candidate', {
            callId: callIdRef.current,
            targetId: receiverId,
            candidate: event.candidate
          });
        }
      };

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit('call:offer', {
        callId: callIdRef.current,
        receiverId,
        offer
      });

      setCallStatus('ringing');
      toast.info(`Calling ${receiverName}...`);
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call. Please check microphone permissions.');
      onClose();
    }
  };

  const handleCallAnswered = async ({ answer }) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      setCallStatus('connected');
      callStartTimeRef.current = Date.now();
      toast.success('Call connected!');

      // Update call status in backend
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/calls/${callIdRef.current}/status`,
        { status: 'ongoing', startTime: new Date() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Start transcription
      startTranscription();
    } catch (error) {
      console.error('Error handling call answer:', error);
    }
  };

  const handleCallRejected = () => {
    toast.error('Call was rejected');
    updateCallStatus('rejected');
    onClose();
  };

  const handleCallEnded = () => {
    toast.info('Call ended by receiver');
    endCall();
  };

  const handleIceCandidate = async ({ candidate }) => {
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleSpeaker = () => {
    const audioElement = document.getElementById('remoteAudio');
    if (audioElement) {
      audioElement.muted = !audioElement.muted;
      setIsSpeakerMuted(audioElement.muted);
    }
  };

  const startTranscription = () => {
    if (recognitionRef.current && !isTranscribing) {
      try {
        recognitionRef.current.start();
        setIsTranscribing(true);
        toast.info('Call transcription started');
      } catch (error) {
        console.log('Transcription not available:', error);
      }
    }
  };

  const saveTranscriptSegment = async (segment) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/calls/${callIdRef.current}/transcript`,
        segment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving transcript:', error);
    }
  };

  const updateCallStatus = async (status) => {
    try {
      const token = localStorage.getItem('token');
      const duration = callStartTimeRef.current 
        ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        : 0;

      await axios.put(
        `${API_BASE_URL}/calls/${callIdRef.current}/status`,
        { 
          status, 
          endTime: new Date(),
          duration
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  };

  const endCall = async () => {
    // Stop transcription
    if (recognitionRef.current && isTranscribing) {
      recognitionRef.current.stop();
      setIsTranscribing(false);
    }

    // Notify receiver
    socketRef.current?.emit('call:end', {
      callId: callIdRef.current,
      targetId: receiverId
    });

    // Update call status
    await updateCallStatus('completed');

    setCallStatus('ended');
    cleanup();
    onClose();
  };

  const cleanup = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Stop recognition
    if (recognitionRef.current && isTranscribing) {
      recognitionRef.current.stop();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-call-overlay">
      <div className="voice-call-modal">
        <div className="call-header">
          <h2>Voice Call</h2>
        </div>

        <div className="call-body">
          <div className="call-avatar">
            <div className="avatar-circle">
              {receiverName.charAt(0).toUpperCase()}
            </div>
          </div>

          <h3 className="caller-name">{receiverName}</h3>
          
          <div className="call-status-text">
            {callStatus === 'initiating' && 'Initializing...'}
            {callStatus === 'ringing' && 'Ringing...'}
            {callStatus === 'connected' && formatDuration(callDuration)}
            {callStatus === 'ended' && 'Call Ended'}
          </div>

          {callStatus === 'connected' && (
            <div className="call-info">
              <div className="info-badge">
                <span className={`status-dot ${isTranscribing ? 'active' : ''}`}></span>
                {isTranscribing ? 'Transcribing' : 'Live'}
              </div>
            </div>
          )}
        </div>

        <div className="call-controls">
          <button 
            className={`control-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            disabled={callStatus !== 'connected'}
          >
            {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
          </button>

          <button 
            className={`control-btn ${isSpeakerMuted ? 'active' : ''}`}
            onClick={toggleSpeaker}
            disabled={callStatus !== 'connected'}
          >
            {isSpeakerMuted ? <FiVolumeX size={24} /> : <FiVolume2 size={24} />}
          </button>

          <button 
            className="control-btn end-call"
            onClick={endCall}
          >
            <FiPhoneOff size={24} />
          </button>
        </div>

        <audio id="remoteAudio" autoPlay />
      </div>
    </div>
  );
}

export default VoiceCall;
