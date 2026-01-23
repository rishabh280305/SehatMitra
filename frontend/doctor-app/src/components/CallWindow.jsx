import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMaximize2, FiMinimize2, FiMessageSquare } from 'react-icons/fi';
import './CallWindow.css';

// Language configurations
const LANGUAGES = {
  en: { name: 'English', code: 'en-US', translateTo: ['hi', 'mr', 'gu'] },
  hi: { name: 'Hindi', code: 'hi-IN', translateTo: ['en'] },
  mr: { name: 'Marathi', code: 'mr-IN', translateTo: ['en'] },
  gu: { name: 'Gujarati', code: 'gu-IN', translateTo: ['en'] }
};

// Simple translation dictionary for common medical phrases
const TRANSLATIONS = {
  // English to Hindi
  'en-hi': {
    'hello': 'नमस्ते',
    'how are you': 'आप कैसे हैं',
    'what is your problem': 'आपकी क्या समस्या है',
    'where does it hurt': 'दर्द कहाँ होता है',
    'take this medicine': 'यह दवा लें',
    'fever': 'बुखार',
    'cough': 'खांसी',
    'headache': 'सिरदर्द',
    'stomach pain': 'पेट दर्द',
    'thank you': 'धन्यवाद',
    'take rest': 'आराम करें',
    'drink water': 'पानी पिएं',
    'yes': 'हाँ',
    'no': 'नहीं'
  },
  // Hindi to English
  'hi-en': {
    'नमस्ते': 'hello',
    'आप कैसे हैं': 'how are you',
    'बुखार': 'fever',
    'खांसी': 'cough',
    'सिरदर्द': 'headache',
    'पेट दर्द': 'stomach pain',
    'धन्यवाद': 'thank you',
    'हाँ': 'yes',
    'नहीं': 'no',
    'दर्द': 'pain',
    'मदद': 'help'
  },
  // English to Marathi
  'en-mr': {
    'hello': 'नमस्कार',
    'how are you': 'तुम्ही कसे आहात',
    'what is your problem': 'तुमची समस्या काय आहे',
    'fever': 'ताप',
    'cough': 'खोकला',
    'headache': 'डोकेदुखी',
    'thank you': 'धन्यवाद',
    'yes': 'होय',
    'no': 'नाही'
  },
  // Marathi to English
  'mr-en': {
    'नमस्कार': 'hello',
    'ताप': 'fever',
    'खोकला': 'cough',
    'डोकेदुखी': 'headache',
    'धन्यवाद': 'thank you',
    'होय': 'yes',
    'नाही': 'no'
  },
  // English to Gujarati
  'en-gu': {
    'hello': 'નમસ્તે',
    'how are you': 'તમે કેમ છો',
    'fever': 'તાવ',
    'cough': 'ઉધરસ',
    'headache': 'માથાનો દુખાવો',
    'thank you': 'આભાર',
    'yes': 'હા',
    'no': 'ના'
  },
  // Gujarati to English
  'gu-en': {
    'નમસ્તે': 'hello',
    'તાવ': 'fever',
    'ઉધરસ': 'cough',
    'આભાર': 'thank you',
    'હા': 'yes',
    'ના': 'no'
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
  userLanguage = 'en',
  remoteLanguage = 'hi'
}) => {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'active' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Transcription states
  const [showTranscription, setShowTranscription] = useState(true);
  const [localTranscript, setLocalTranscript] = useState('');
  const [remoteTranscript, setRemoteTranscript] = useState('');
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
    recognition.lang = LANGUAGES[selectedLanguage]?.code || 'en-US';

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
        
        // Translate if needed (doctor speaks English, translate to patient's language)
        const targetLang = selectedLanguage === 'en' ? remoteLanguage : 'en';
        const translated = translateText(finalTranscript, selectedLanguage, targetLang);
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
  }, [selectedLanguage, remoteLanguage, isListening, isMuted]);

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
            title="Your speaking language"
          >
            {Object.entries(LANGUAGES).map(([code, lang]) => (
              <option key={code} value={code}>{lang.name}</option>
            ))}
          </select>
          <button className="btn-icon" onClick={toggleTranscription} title="Toggle transcription">
            <FiMessageSquare size={20} />
          </button>
          <button className="btn-icon" onClick={toggleFullscreen} title="Toggle fullscreen">
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
              <h4>🎤 Live Transcription</h4>
              <button className="btn-clear" onClick={clearTranscript} title="Clear transcript">
                Clear
              </button>
            </div>
            
            <div className="transcription-content" ref={transcriptContainerRef}>
              {localTranscript && (
                <div className="transcript-section">
                  <div className="transcript-label">
                    <span className="speaker-badge you">You ({LANGUAGES[selectedLanguage]?.name})</span>
                  </div>
                  <p className="transcript-text">{localTranscript}</p>
                </div>
              )}
              
              {translatedTranscript && (
                <div className="transcript-section translated">
                  <div className="transcript-label">
                    <span className="speaker-badge translated">
                      Translation ({selectedLanguage === 'en' ? LANGUAGES[remoteLanguage]?.name : 'English'})
                    </span>
                  </div>
                  <p className="transcript-text">{translatedTranscript}</p>
                </div>
              )}
              
              {!localTranscript && !translatedTranscript && (
                <p className="no-transcript">
                  {callStatus === 'active' 
                    ? 'Listening... Start speaking to see live transcription.'
                    : 'Transcription will begin when call connects.'}
                </p>
              )}
            </div>
            
            <div className="transcription-footer">
              <span className="lang-info">
                Speaking: {LANGUAGES[selectedLanguage]?.name} → Translating to: {selectedLanguage === 'en' ? LANGUAGES[remoteLanguage]?.name : 'English'}
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
          title={isVideoOn ? 'Turn off video' : 'Turn on video'}
        >
          {isVideoOn ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
        </button>

        <button 
          className={`btn-control ${showTranscription ? 'active' : ''}`} 
          onClick={toggleTranscription}
          title="Toggle transcription"
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
