import { useState, useEffect, useRef } from 'react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVolume2, FiVolumeX, FiX } from 'react-icons/fi';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../components/VoiceCall.css';

const API_BASE_URL = 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.voip.blackberry.com:3478' }
  ]
};

function IncomingCall() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState(null); // null, ringing, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState([]);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    initializeSocket();

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

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected - listening for calls');
    });

    socketRef.current.on('call:incoming', handleIncomingCall);
    socketRef.current.on('call:ended', handleCallEnded);
    socketRef.current.on('call:ice-candidate', handleIceCandidate);
    socketRef.current.on('transcript:segment', handleTranscriptSegment);

    // Setup speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        const segment = { speaker: 'receiver', text, timestamp: new Date() };
        setTranscript(prev => [...prev, segment]);
        
        // Send to backend and caller
        saveTranscriptSegment(incomingCall?.callId, segment);
        socketRef.current?.emit('transcript:update', {
          callId: incomingCall?.callId,
          targetId: incomingCall?.callerId,
          speaker: 'receiver',
          text
        });
      };
    }
  };

  const handleIncomingCall = async ({ callId, callerId, offer }) => {
    console.log('Incoming call from:', callerId);
    
    // Get caller info
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/calls/${callId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIncomingCall({
        callId,
        callerId,
        callerName: response.data.data.caller.name,
        offer
      });
      setCallStatus('ringing');

      // Play ringtone (you can add an audio file)
      toast.info(`Incoming call from Dr. ${response.data.data.caller.name}`);
    } catch (error) {
      console.error('Error getting call info:', error);
    }
  };

  const acceptCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      localStreamRef.current = stream;

      // Create peer connection
      peerConnectionRef.current = new RTCPeerConnection(ICE_SERVERS);

      // Add local stream
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
            callId: incomingCall.callId,
            targetId: incomingCall.callerId,
            candidate: event.candidate
          });
        }
      };

      // Set remote description (offer)
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Create and send answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit('call:answer', {
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
        answer
      });

      setCallStatus('connected');
      callStartTimeRef.current = Date.now();
      toast.success('Call connected!');

      // Update call status in backend
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/calls/${incomingCall.callId}/status`,
        { status: 'ongoing', startTime: new Date() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Start transcription
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.log('Transcription not available');
        }
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call. Please check microphone permissions.');
    }
  };

  const rejectCall = () => {
    socketRef.current.emit('call:reject', {
      callId: incomingCall.callId,
      callerId: incomingCall.callerId
    });

    updateCallStatus('rejected');
    toast.info('Call rejected');
    setIncomingCall(null);
    setCallStatus(null);
  };

  const handleCallEnded = () => {
    toast.info('Call ended');
    endCall();
  };

  const handleIceCandidate = async ({ candidate }) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const handleTranscriptSegment = ({ speaker, text, timestamp }) => {
    setTranscript(prev => [...prev, { speaker, text, timestamp }]);
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

  const saveTranscriptSegment = async (callId, segment) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/calls/${callId}/transcript`,
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
        `${API_BASE_URL}/calls/${incomingCall.callId}/status`,
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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Recognition already stopped');
      }
    }

    // Notify caller
    if (callStatus === 'connected') {
      socketRef.current?.emit('call:end', {
        callId: incomingCall.callId,
        targetId: incomingCall.callerId
      });

      await updateCallStatus('completed');
    }

    setCallStatus('ended');
    cleanup();
    
    setTimeout(() => {
      setIncomingCall(null);
      setCallStatus(null);
      setTranscript([]);
    }, 1000);
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {}
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!incomingCall) return null;

  return (
    <div className="voice-call-overlay">
      <div className="voice-call-modal">
        <div className="call-header">
          <h2>
            {callStatus === 'ringing' && 'Incoming Call'}
            {callStatus === 'connected' && 'Voice Call'}
            {callStatus === 'ended' && 'Call Ended'}
          </h2>
        </div>

        <div className="call-body">
          <div className="call-avatar">
            <div className="avatar-circle">
              {incomingCall.callerName?.charAt(0).toUpperCase() || 'D'}
            </div>
          </div>

          <h3 className="caller-name">Dr. {incomingCall.callerName}</h3>
          
          <div className="call-status-text">
            {callStatus === 'ringing' && 'Incoming voice call...'}
            {callStatus === 'connected' && formatDuration(callDuration)}
            {callStatus === 'ended' && 'Call Ended'}
          </div>
        </div>

        {callStatus === 'ringing' && (
          <div className="call-actions">
            <button className="btn-accept" onClick={acceptCall}>
              <FiPhone size={24} />
              Accept
            </button>
            <button className="btn-reject" onClick={rejectCall}>
              <FiPhoneOff size={24} />
              Reject
            </button>
          </div>
        )}

        {callStatus === 'connected' && (
          <div className="call-controls">
            <button 
              className={`control-btn ${isMuted ? 'active' : ''}`}
              onClick={toggleMute}
            >
              {isMuted ? <FiMicOff size={24} /> : <FiMic size={24} />}
            </button>

            <button 
              className={`control-btn ${isSpeakerMuted ? 'active' : ''}`}
              onClick={toggleSpeaker}
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
        )}

        <audio id="remoteAudio" autoPlay />
      </div>
    </div>
  );
}

export default IncomingCall;
