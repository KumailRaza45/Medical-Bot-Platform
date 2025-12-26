import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Volume2, VolumeX, Send, Loader2, X, Home
} from 'lucide-react';
import { chatAPI } from '../utils/api';
import Header from '../components/Header';
import './AvatarPage.css';

const AvatarPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [language, setLanguage] = useState('en');
  // You can replace this with actual avatar image URL
  const [avatarImage] = useState('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop');
  
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load speech synthesis voices
    if ('speechSynthesis' in window) {
      // Load voices
      window.speechSynthesis.getVoices();
      // Voices may load asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);
        // Auto-submit after voice input
        setTimeout(() => handleSubmit(transcript), 500);
      };

      recognition.onerror = (e) => {
        console.error('Recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    // Welcome message
    const welcomeMsg = "Hello! I'm Karetek, your AI medical assistant. How can I help you today?";
    setCurrentResponse(welcomeMsg);
    if (voiceEnabled) {
      setTimeout(() => speakMessage(welcomeMsg), 1500);
    }
  }, []);

  const speakMessage = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const plainText = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    
    // Set language based on current selection
    if (language === 'ur') {
      utterance.lang = 'ur-PK';
      // Try to find Urdu voice
      const voices = window.speechSynthesis.getVoices();
      const urduVoice = voices.find(v => v.lang.startsWith('ur'));
      if (urduVoice) utterance.voice = urduVoice;
    } else {
      utterance.lang = 'en-US';
      // Try to find English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };

    speechSynthesisRef.current = utterance;
    
    // Small delay to ensure voices are loaded
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoice = () => {
    if (voiceEnabled && isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = language === 'ur' ? 'ur-PK' : 'en-US';
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async (voiceInput = null) => {
    const query = voiceInput || inputValue.trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setInputValue('');
    
    // Add user message to conversation
    const newConversation = [...conversation, { role: 'user', content: query }];
    setConversation(newConversation);

    try {
      const response = await chatAPI.sendMessage(
        newConversation.map(msg => ({ role: msg.role, content: msg.content })),
        language
      );

      setCurrentResponse(response.message);
      setConversation([...newConversation, { role: 'assistant', content: response.message }]);

      if (voiceEnabled) {
        setTimeout(() => speakMessage(response.message), 300);
      }
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMsg = "I apologize, but I'm having trouble processing your request right now.";
      setCurrentResponse(errorMsg);
      if (voiceEnabled) {
        speakMessage(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div className="avatar-page">
      <Header />
      
      <div className="avatar-container">
        {/* Control Panel */}
        <div className="avatar-controls">
          <button 
            className="btn-icon"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <Home size={20} />
          </button>
          <button 
            className={`btn-icon ${voiceEnabled ? 'active' : ''}`}
            onClick={toggleVoice}
            title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button 
            className="btn-icon language-toggle"
            onClick={() => {
              const newLang = language === 'en' ? 'ur' : 'en';
              setLanguage(newLang);
              if (recognitionRef.current) {
                recognitionRef.current.lang = newLang === 'ur' ? 'ur-PK' : 'en-US';
              }
            }}
            title={`Switch to ${language === 'en' ? 'Urdu' : 'English'}`}
          >
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {language === 'en' ? 'EN' : 'اردو'}
            </span>
          </button>
        </div>

        {/* Avatar Display */}
        <div className="avatar-display">
          <div className={`avatar-container-realistic ${isSpeaking ? 'speaking' : ''} ${isLoading ? 'thinking' : ''}`}>
            <div className="avatar-frame">
              <div className="avatar-image-wrapper">
                <img 
                  src={avatarImage} 
                  alt="AI Medical Assistant" 
                  className="avatar-photo"
                />
                <div className="avatar-overlay"></div>
                
                {/* Animated rings when speaking */}
                {isSpeaking && (
                  <div className="speaking-rings">
                    <span className="ring ring-1"></span>
                    <span className="ring ring-2"></span>
                    <span className="ring ring-3"></span>
                  </div>
                )}
                
                {/* Mouth indicator */}
                <div className={`mouth-indicator ${isSpeaking ? 'active' : ''}`}>
                  <div className="mouth-bar"></div>
                  <div className="mouth-bar"></div>
                  <div className="mouth-bar"></div>
                  <div className="mouth-bar"></div>
                  <div className="mouth-bar"></div>
                </div>
              </div>
              
              {/* Status badge */}
              <div className="status-badge">
                {isLoading ? (
                  <>
                    <span className="status-icon thinking"></span>
                    <span className="status-text">Thinking...</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <span className="status-icon speaking"></span>
                    <span className="status-text">Speaking</span>
                    <button 
                      className="stop-btn-small"
                      onClick={stopSpeaking}
                      title="Stop Speaking"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="status-icon online"></span>
                    <span className="status-text">Ready</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Sound visualization */}
            {isSpeaking && (
              <div className="sound-visualizer">
                <div className="sound-bar"></div>
                <div className="sound-bar"></div>
                <div className="sound-bar"></div>
                <div className="sound-bar"></div>
                <div className="sound-bar"></div>
                <div className="sound-bar"></div>
                <div className="sound-bar"></div>
              </div>
            )}
          </div>

          {/* Response Display */}
          <div className="response-display">
            {currentResponse && (
              <div className="response-bubble">
                <p>{currentResponse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="avatar-input-section">
          <form onSubmit={handleFormSubmit} className="avatar-input-form">
            <button
              type="button"
              className={`voice-input-btn ${isRecording ? 'recording' : ''}`}
              onClick={startVoiceInput}
              disabled={isLoading}
            >
              <Mic size={24} />
              {isRecording && <span className="recording-pulse"></span>}
            </button>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about your health concerns..."
              className="avatar-input"
              disabled={isLoading}
            />
            
            <button
              type="submit"
              className="send-btn"
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? <Loader2 size={24} className="spinner" /> : <Send size={24} />}
            </button>
          </form>
          
          <p className="avatar-hint">
            {isRecording ? 'Listening...' : 'Click the microphone or type your question'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;
