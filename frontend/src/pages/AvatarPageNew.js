import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Volume2, VolumeX, Send, Loader2, Home, StopCircle
} from 'lucide-react';
import { chatAPI } from '../utils/api';
import Header from '../components/Header';
import './AvatarPageNew.css';

const AvatarPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [language, setLanguage] = useState('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Video avatar state - TWO VIDEOS (idle + speaking)
  const [idleVideoUrl] = useState('https://haunnayjbvmuajiatrgi.supabase.co/storage/v1/object/public/avatar-videos/avatar-idle.mov'); // Calm, still video
  const [speakingVideoUrl] = useState('https://haunnayjbvmuajiatrgi.supabase.co/storage/v1/object/public/avatar-videos/avatar-speaking.mov'); // Generic talking video
  const [audioCache] = useState(new Map()); // Cache generated audio
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load speech synthesis voices first
    if ('speechSynthesis' in window) {
      // Force load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
      };
      
      loadVoices();
      
      // Voices load asynchronously in some browsers
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
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
        console.error('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    // Don't auto-speak on page load - let user initiate conversation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update welcome message when language changes
  useEffect(() => {
    const welcomeMessages = {
      en: "Hello! I'm Karetek, your AI medical assistant. How can I help you today?",
      ur: "السلام علیکم! میں Karetek ہوں، آپ کی AI طبی معاون۔ میں آپ کی کیسے مدد کر سکتی ہوں؟",
      ar: "مرحباً! أنا Karetek، مساعدتك الطبية الذكية. كيف يمكنني مساعدتك اليوم؟",
      fr: "Bonjour! Je suis Karetek, votre assistante médicale IA. Comment puis-je vous aider aujourd'hui?",
      es: "¡Hola! Soy Karetek, tu asistente médica IA. ¿Cómo puedo ayudarte hoy?",
      de: "Hallo! Ich bin Karetek, Ihre KI-Medizinassistentin. Wie kann ich Ihnen heute helfen?",
      zh: "你好！我是 Karetek，你的人工智能医疗助手。今天我能帮你什么？"
    };
    setCurrentResponse(welcomeMessages[language] || welcomeMessages.en);
  }, [language]);

  // Handle video switching between idle and speaking
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const newSource = isSpeaking ? speakingVideoUrl : idleVideoUrl;

    // Only switch if source is different
    if (video.src !== newSource) {
      video.src = newSource;
      video.load();
      
      // Both videos loop continuously
      video.loop = true;
      
      // Play video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Video autoplay prevented:', error);
        });
      }
    }
  }, [isSpeaking, speakingVideoUrl, idleVideoUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const speakMessage = async (text) => {
    if (!voiceEnabled) return;

    const plainText = text.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();
    if (!plainText) return;

    // Detect language
    const hasUrduUnicode = /[\u0600-\u06FF]/.test(plainText);
    const detectedLang = hasUrduUnicode ? 'ur' : language;

    // Skip Roman Urdu
    if (language === 'ur' && !hasUrduUnicode) {
      console.log('ℹ Roman Urdu detected - text display only');
      return;
    }

    // Check cache first
    const cacheKey = `${plainText}-${detectedLang}`;
    if (audioCache.has(cacheKey)) {
      const cachedAudioUrl = audioCache.get(cacheKey);
      playAudio(cachedAudioUrl);
      return;
    }

    try {
      // Call backend API to generate speech audio only
      const response = await fetch('/api/avatar/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: plainText, language: detectedLang })
      });

      const data = await response.json();

      if (!data.success) {
        if (data.textOnly) {
          console.log('Text-only response (Roman Urdu)');
          return;
        }
        throw new Error(data.error || 'Failed to generate speech');
      }

      // Cache audio URL and play
      audioCache.set(cacheKey, data.audioUrl);
      playAudio(data.audioUrl);

    } catch (error) {
      console.error('Speech generation error:', error);
    }
  };

  const playAudio = (audioUrl) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = audioUrl;
    
    // Only switch to speaking video when audio actually starts playing
    audioRef.current.onloadeddata = () => {
      setIsSpeaking(true);
    };
    
    audioRef.current.play().catch(error => {
      console.error('Audio play error:', error);
      setIsSpeaking(false); // Reset if audio fails to play
    });

    audioRef.current.onended = () => {
      setIsSpeaking(false);
    };
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
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
      const speechLangCodes = {
        en: 'en-US',
        ur: 'ur-PK',
        ar: 'ar-SA',
        fr: 'fr-FR',
        es: 'es-ES',
        de: 'de-DE',
        zh: 'zh-CN'
      };
      recognitionRef.current.lang = speechLangCodes[language] || 'en-US';
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = async (voiceInput = null) => {
    const query = voiceInput || inputValue.trim();
    if (!query || isLoading) return;

    // Stop any ongoing speech
    stopSpeaking();
    
    setIsLoading(true);
    setInputValue('');
    setCurrentResponse('');
    
    // Add user message to conversation
    const newConversation = [...conversation, { role: 'user', content: query }];
    setConversation(newConversation);

    try {
      // Send proper conversation format
      const response = await chatAPI.sendMessage(
        newConversation.map(msg => ({ role: msg.role, content: msg.content })),
        language
      );

      setCurrentResponse(response.message);
      setConversation([...newConversation, { role: 'assistant', content: response.message }]);

      // Start audio generation immediately (no delay)
      if (voiceEnabled) {
        speakMessage(response.message);
      }
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessages = {
        en: "I apologize, but I'm having trouble processing your request. Please try again.",
        ur: "معذرت، میں آپ کی درخواست پر کارروائی نہیں کر سکا۔",
        ar: "أعتذر، لكنني أواجه صعوبة في معالجة طلبك. يرجى المحاولة مرة أخرى.",
        fr: "Je m'excuse, mais j'ai du mal à traiter votre demande. Veuillez réessayer.",
        es: "Lo siento, pero tengo problemas para procesar tu solicitud. Por favor, inténtalo de nuevo.",
        de: "Entschuldigung, aber ich habe Schwierigkeiten, Ihre Anfrage zu verarbeiten. Bitte versuchen Sie es erneut.",
        zh: "抱歉，我在处理您的请求时遇到问题。请重试。"
      };
      const errorMsg = errorMessages[language] || errorMessages.en;
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

  const toggleLanguage = () => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  const selectLanguage = (newLang) => {
    setLanguage(newLang);
    setShowLanguageMenu(false);
    stopSpeaking();
  };

  const languageNames = {
    en: '🇺🇸 English',
    ur: '🇵🇰 اردو',
    ar: '🇸🇦 العربية',
    fr: '🇫🇷 Français',
    es: '🇪🇸 Español',
    de: '🇩🇪 Deutsch',
    zh: '🇨🇳 中文'
  };

  return (
    <div className="avatar-page-new">
      <Header />
      
      <div className="avatar-content">
        {/* Control Panel */}
        <div className="control-panel">
          <button 
            className="control-btn"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <Home size={18} />
          </button>
          <button 
            className={`control-btn ${voiceEnabled ? 'active' : ''}`}
            onClick={toggleVoice}
            title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <div className="language-selector-control">
            <button 
              className="control-btn"
              onClick={toggleLanguage}
              title="Select Language"
            >
              {language === 'en' ? '🇺🇸' : language === 'ur' ? '🇵🇰' : language === 'ar' ? '🇸🇦' : language === 'fr' ? '🇫🇷' : language === 'es' ? '🇪🇸' : language === 'de' ? '🇩🇪' : '🇨🇳'}
            </button>
            {showLanguageMenu && (
              <div className="language-dropdown-menu">
                {Object.entries(languageNames).map(([code, name]) => (
                  <button
                    key={code}
                    className={`language-dropdown-option ${language === code ? 'active' : ''}`}
                    onClick={() => selectLanguage(code)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Video-like Avatar Container */}
        <div className="video-avatar-section">
          <div className={`video-frame ${isSpeaking ? 'speaking' : ''} ${isLoading ? 'processing' : ''}`}>
            {/* Video container */}
            <div className="video-container">
              <video
                ref={videoRef}
                className="avatar-video"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onError={(e) => console.error('Video load error:', e)}
              >
                <source src={idleVideoUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
              {/* Video effects overlay */}
              <div className="video-grain"></div>
              <div className="video-vignette"></div>
              
              {/* Animated waveform when speaking */}
              {isSpeaking && (
                <div className="waveform-overlay">
                  {[...Array(50)].map((_, i) => (
                    <div key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.03}s` }}></div>
                  ))}
                </div>
              )}
              
              {/* Pulse rings */}
              {isSpeaking && (
                <div className="pulse-effect">
                  <div className="pulse-ring"></div>
                  <div className="pulse-ring delay-1"></div>
                  <div className="pulse-ring delay-2"></div>
                </div>
              )}
            </div>
            
            {/* Status bar like video player */}
            <div className="video-status-bar">
              <div className="status-left-side">
                <div className={`status-indicator ${isSpeaking || isLoading ? 'active' : ''}`}>
                  <span className="status-dot"></span>
                  <span className="status-label">
                    {isLoading ? 'Processing...' : isSpeaking ? 'Speaking' : 'Ready'}
                  </span>
                </div>
                <div className="lang-display">
                  {languageNames[language]}
                </div>
              </div>
              <div className="status-right-side">
                {isSpeaking && (
                  <button 
                    className="stop-speaking-btn" 
                    onClick={stopSpeaking}
                    title="Stop Speaking"
                  >
                    <StopCircle size={16} />
                    <span>Stop</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Professional visualizer */}
          {isSpeaking && (
            <div className="audio-visualizer">
              <div className="visualizer-container">
                {[...Array(64)].map((_, i) => (
                  <div key={i} className="visualizer-bar" style={{ animationDelay: `${i * 0.02}s` }}></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Response Display */}
        {currentResponse && (
          <div className="response-area">
            <div className="response-card">
              <p>{currentResponse}</p>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="input-section">
          <form onSubmit={handleFormSubmit} className="input-form">
            <button
              type="button"
              className={`voice-btn ${isRecording ? 'recording' : ''}`}
              onClick={startVoiceInput}
              disabled={isLoading}
              title="Voice Input"
            >
              {isRecording ? (
                <>
                  <div className="recording-pulse"></div>
                  <Mic size={20} />
                </>
              ) : (
                <Mic size={20} />
              )}
            </button>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                language === 'ur' ? 'اپنا سوال یہاں لکھیں...' :
                language === 'ar' ? 'اكتب سؤالك الطبي هنا...' :
                language === 'fr' ? 'Tapez votre question médicale...' :
                language === 'es' ? 'Escribe tu pregunta médica...' :
                language === 'de' ? 'Geben Sie Ihre medizinische Frage ein...' :
                language === 'zh' ? '输入您的医疗问题...' :
                'Type your medical question...'
              }
              disabled={isLoading}
              className="message-input"
            />
            
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading || !inputValue.trim()}
              title="Send"
            >
              {isLoading ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
            </button>
          </form>
          <p className="input-hint">
            {language === 'ur' ? 'اپنے طبی سوالات پوچھیں - ہم متعدد زبانوں میں جواب دیتے ہیں' :
             language === 'ar' ? 'اسأل أسئلتك الطبية - نحن نرد بلغات متعددة' :
             language === 'fr' ? 'Posez vos questions médicales - Nous répondons en plusieurs langues' :
             language === 'es' ? 'Haga sus preguntas médicas - Respondemos en múltiples idiomas' :
             language === 'de' ? 'Stellen Sie Ihre medizinischen Fragen - Wir antworten in mehreren Sprachen' :
             language === 'zh' ? '提出您的医疗问题 - 我们用多种语言回答' :
             'Ask your medical questions - We respond in multiple languages'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;
