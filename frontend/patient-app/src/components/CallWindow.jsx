import React, { useState, useEffect, useRef } from 'react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMaximize2, FiMinimize2, FiMessageSquare } from 'react-icons/fi';
import './CallWindow.css';

// Language configurations
const LANGUAGES = {
  en: { name: 'English', code: 'en-US' },
  hi: { name: 'हिंदी', code: 'hi-IN' },
  mr: { name: 'मराठी', code: 'mr-IN' },
  gu: { name: 'ગુજરાતી', code: 'gu-IN' }
};

// Simple translation dictionary for common medical phrases
const TRANSLATIONS = {
  // Hindi to English
  'hi-en': {
    'नमस्ते': 'hello',
    'हाँ': 'yes',
    'नहीं': 'no',
    'बुखार': 'fever',
    'खांसी': 'cough',
    'सिरदर्द': 'headache',
    'पेट दर्द': 'stomach pain',
    'दर्द': 'pain',
    'धन्यवाद': 'thank you',
    'मदद': 'help',
    'चक्कर': 'dizziness',
    'उल्टी': 'vomiting',
    'दस्त': 'diarrhea',
    'कमजोरी': 'weakness',
    'सर्दी': 'cold',
    'गला खराब': 'sore throat',
    'पीठ दर्द': 'back pain',
    'छाती दर्द': 'chest pain',
    'सांस की तकलीफ': 'breathing difficulty'
  },
  // Marathi to English
  'mr-en': {
    'नमस्कार': 'hello',
    'होय': 'yes',
    'नाही': 'no',
    'ताप': 'fever',
    'खोकला': 'cough',
    'डोकेदुखी': 'headache',
    'पोटदुखी': 'stomach pain',
    'दुखणे': 'pain',
    'धन्यवाद': 'thank you',
    'मदत': 'help',
    'चक्कर': 'dizziness',
    'उलटी': 'vomiting'
  },
  // Gujarati to English
  'gu-en': {
    'નમસ્તે': 'hello',
    'હા': 'yes',
    'ના': 'no',
    'તાવ': 'fever',
    'ઉધરસ': 'cough',
    'માથાનો દુખાવો': 'headache',
    'પેટમાં દુખાવો': 'stomach pain',
    'દુખાવો': 'pain',
    'આભાર': 'thank you'
  },
  // English to Hindi (for doctor's translated text)
  'en-hi': {
    'hello': 'नमस्ते',
    'yes': 'हाँ',
    'no': 'नहीं',
    'fever': 'बुखार',
    'take medicine': 'दवा लें',
    'take rest': 'आराम करें',
    'drink water': 'पानी पिएं',
    'how are you feeling': 'आप कैसा महसूस कर रहे हैं'
  }
};

// Simple translate function
const translateText = (text, fromLang, toLang) => {
  if (fromLang === toLang) return text;
  
  const dictKey = `${fromLang}-${toLang}`;
  const dict = TRANSLATIONS[dictKey] || {};
  
  let translated = text.toLowerCase();
  
  // Try to find matching phrases
  Object.entries(dict).forEach(([key, value]) => {
    const regex = new RegExp(key, 'gi');
    translated = translated.replace(regex, value);
  });
  
  // If no translation found, return original with note
  if (translated === text.toLowerCase()) {
    return `${text} [${LANGUAGES[fromLang]?.name || fromLang}]`;
  }
  
  return translated;
};

const CallWindow = ({ 
  callId, 
  isIncoming, 
  remoteUserId, 
  remoteName, 
  callType, 
  peerConnection,
  localStream,
  onCallEnd,
  userLanguage = 'hi',
  remoteLanguage = 'en'
}) => {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'active' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Transcription states
  const [showTranscription, setShowTranscription] = useState(true);
  const [localTranscript, setLocalTranscript] = useState('');
  const [translatedTranscript, setTranslatedTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(userLanguage);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptContainerRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANGUAGES[selectedLanguage]?.code || 'hi-IN';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setLocalTranscript(prev => prev + finalTranscript);
        
        // Translate to English for the doctor
        const translated = translateText(finalTranscript, selectedLanguage, 'en');
        setTranslatedTranscript(prev => prev + translated + ' ');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening && !isMuted) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Error restarting recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage, isListening, isMuted]);

  // Start/stop listening based on call status
  useEffect(() => {
    if (callStatus === 'active' && !isMuted && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [callStatus, isMuted]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [localTranscript, translatedTranscript]);

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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (onCallEnd) {
      onCallEnd();
    }
  };

  const toggleTranscription = () => {
    setShowTranscription(!showTranscription);
  };

  const clearTranscript = () => {
    setLocalTranscript('');
    setTranslatedTranscript('');
  };

  return (
    <div className={`call-window ${isFullscreen ? 'fullscreen' : ''} ${showTranscription ? 'with-transcript' : ''}`}>
      <div className="call-header">
        <div className="caller-info">
          <h3>{remoteName}</h3>
          <span className={`call-status ${callStatus}`}>{callStatus}</span>
          {isListening && <span className="listening-indicator">🎤 Live</span>}
        </div>
        <div className="header-actions">
          <select 
            className="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            title="अपनी भाषा चुनें / Select your language"
          >
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <option key={code} value={code}>{lang.name}</option>
            ))}
          </select>
          <button className="btn-icon" onClick={toggleTranscription} title="Transcription">
            <FiMessageSquare size={20} />
          </button>
          <button className="btn-icon" onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
          </button>
        </div>
      </div>

      <div className="call-content">
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

        {/* Live Transcription Panel */}
        {showTranscription && (
          <div className="transcription-panel">
            <div className="transcription-header">
              <h4>🎤 लाइव ट्रांसक्रिप्शन</h4>
              <button className="btn-clear" onClick={clearTranscript} title="Clear">
                साफ करें
              </button>
            </div>
            
            <div className="transcription-content" ref={transcriptContainerRef}>
              {localTranscript && (
                <div className="transcript-section">
                  <div className="transcript-label">
                    <span className="speaker-badge you">आप ({LANGUAGES[selectedLanguage]?.name})</span>
                  </div>
                  <p className="transcript-text">{localTranscript}</p>
                </div>
              )}
              
              {translatedTranscript && (
                <div className="transcript-section translated">
                  <div className="transcript-label">
                    <span className="speaker-badge translated">
                      अनुवाद (English - डॉक्टर के लिए)
                    </span>
                  </div>
                  <p className="transcript-text">{translatedTranscript}</p>
                </div>
              )}
              
              {!localTranscript && !translatedTranscript && (
                <p className="no-transcript">
                  {callStatus === 'active' 
                    ? 'सुन रहे हैं... बोलना शुरू करें।'
                    : 'कॉल कनेक्ट होने पर ट्रांसक्रिप्शन शुरू होगा।'}
                </p>
              )}
            </div>
            
            <div className="transcription-footer">
              <span className="lang-info">
                बोल रहे हैं: {LANGUAGES[selectedLanguage]?.name} → डॉक्टर के लिए: English
              </span>
            </div>
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
          title={isVideoOn ? 'Video Off' : 'Video On'}
        >
          {isVideoOn ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
        </button>

        <button 
          className={`btn-control ${showTranscription ? 'active' : ''}`} 
          onClick={toggleTranscription}
          title="Transcription"
        >
          <FiMessageSquare size={24} />
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
