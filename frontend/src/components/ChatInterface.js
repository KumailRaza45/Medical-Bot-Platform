import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, Lock, AlertTriangle, Loader2, User, HeartPulse,
  Video, Calendar, FileText, Share2, Download, 
  ThumbsUp, ThumbsDown, RefreshCw, Phone, Globe, Mic,
  Paperclip, X, Image as ImageIcon
} from 'lucide-react';
import { chatAPI, consultationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ChatInterface.css';

const welcomeMessages = {
  en: `What symptoms or health concerns would you like to discuss today?`,
  ur: `آج آپ کس علامات یا صحت کے مسائل پر بات کرنا چاہیں گے؟`,
  ar: `ما هي الأعراض أو المخاوف الصحية التي تود مناقشتها اليوم؟`,
  fr: `Quels symptômes ou préoccupations de santé aimeriez-vous discuter aujourd'hui?`,
  es: `¿Qué síntomas o preocupaciones de salud te gustaría discutir hoy?`,
  de: `Welche Symptome oder gesundheitlichen Bedenken möchten Sie heute besprechen?`,
  zh: `你今天想讨论什么症状或健康问题？`
};

const languageNames = {
  en: 'English',
  ur: 'اردو',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  zh: '中文'
};

const placeholderTexts = {
  en: 'Type your message...',
  ur: 'اپنا پیغام لکھیں...',
  ar: 'اكتب رسالتك...',
  fr: 'Tapez votre message...',
  es: 'Escribe tu mensaje...',
  de: 'Geben Sie Ihre Nachricht ein...',
  zh: '输入您的消息...'
};

const ChatInterface = ({ loadSessionId = null, onSessionChange = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('en'); // Supported: 'en', 'ur', 'ar', 'fr', 'es', 'de', 'zh'
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { isAuthenticated} = useAuth();
  const navigate = useNavigate();

  const initializeSession = useCallback(async () => {
    try {
      // Generate a unique session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      if (onSessionChange) {
        onSessionChange(newSessionId);
      }
      
      // Add welcome message in current language
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessages[language],
        timestamp: new Date().toISOString()
      }]);
      
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }, [language, onSessionChange]);

  const loadExistingSession = useCallback(async (existingSessionId) => {
    // Only authenticated users can load saved sessions
    if (!isAuthenticated) {
      console.log('User not authenticated, starting new session');
      initializeSession();
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await consultationsAPI.getAll();
      const consultation = response.consultations?.find(c => c.session_id === existingSessionId);
      
      if (consultation && consultation.messages) {
        setSessionId(existingSessionId);
        setLanguage(consultation.language || 'en');
        
        // Convert stored messages to chat format
        const chatMessages = consultation.messages.map((msg, index) => ({
          id: `msg_${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString()
        }));
        
        setMessages(chatMessages);
        
        if (onSessionChange) {
          onSessionChange(existingSessionId);
        }
      } else {
        // Session not found, start new session
        console.log('Session not found, starting new session');
        initializeSession();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      // If loading fails, start new session
      initializeSession();
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, onSessionChange, initializeSession]);

  useEffect(() => {
    // Auto-initialize session when component mounts
    if (!sessionId && !loadSessionId) {
      initializeSession();
    } else if (loadSessionId && loadSessionId !== sessionId) {
      loadExistingSession(loadSessionId);
    }
  }, [sessionId, initializeSession, loadSessionId, loadExistingSession]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    // Handle image upload with question
    if (selectedImage) {
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue.trim() || 'What can you tell me about this medical image?',
        timestamp: new Date().toISOString(),
        hasImage: true,
        imagePreview: imagePreview
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      const imageToSend = selectedImage;
      const questionToSend = userMessage.content;
      setSelectedImage(null);
      setImagePreview(null);
      setIsLoading(true);

      try {
        const response = await chatAPI.analyzeImage(imageToSend, questionToSend, language, sessionId);
        
        const assistantMessage = {
          id: Date.now().toString() + '_assistant',
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          saved: response.saved
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Failed to analyze image:', error);
        
        const errorMessage = {
          id: Date.now().toString() + '_error',
          role: 'assistant',
          content: error.response?.data?.error || "I apologize, but I'm having trouble analyzing the image. Please ensure it's a medical-related image and try again.",
          timestamp: new Date().toISOString(),
          isError: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular text message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare messages in OpenAI format
      const chatMessages = messages
        .filter(m => m.id !== 'welcome' && !m.hasImage)
        .map(m => ({ role: m.role, content: m.content }));
      chatMessages.push({ role: 'user', content: userMessage.content });

      const response = await chatAPI.sendMessage(chatMessages, language, sessionId);
      
      const assistantMessage = {
        id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        saved: response.saved
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Check for emergency keywords
      const emergencyKeywords = ['emergency', 'urgent', 'severe', 'critical', '911'];
      if (emergencyKeywords.some(keyword => userMessage.content.toLowerCase().includes(keyword))) {
        setIsEmergency(true);
      }

      // Show summary option after a few messages
      if (messages.length >= 4 && !showSummary) {
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. If this is a medical emergency, please call 911 immediately. Otherwise, please try again in a moment.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!sessionId) return;
    if (!isAuthenticated) {
      alert(language === 'en' 
        ? 'Please sign in to generate consultation summaries.'
        : 'خلاصہ بنانے کے لیے براہ کرم سائن ان کریں۔');
      return;
    }
    
    setIsLoading(true);
    try {
      // Generate summary from current messages
      const conversationText = messages
        .filter(m => m.id !== 'welcome')
        .map(m => `${m.role}: ${m.content}`)
        .join('\n\n');
      
      setSummary({
        symptoms: 'Based on conversation',
        recommendations: 'Please consult with your healthcare provider',
        followUp: 'Continue monitoring your symptoms'
      });
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConsult = () => {
    setMessages([]);
    setSessionId(null);
    setSummary(null);
    setShowSummary(false);
    setIsEmergency(false);
    initializeSession();
  };

  const toggleLanguage = async () => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  const selectLanguage = async (newLang) => {
    setLanguage(newLang);
    setShowLanguageMenu(false);
    setIsLoading(true);

    try {
      const translatedMessages = await Promise.all(
        messages.map(async (msg) => {
          // Skip translating welcome message, use pre-defined translation
          if (msg.id === 'welcome') {
            return {
              ...msg,
              content: welcomeMessages[newLang]
            };
          }

          // Translate other messages
          try {
            const messagesToTranslate = [{ role: msg.role, content: msg.content }];
            const result = await chatAPI.translate(messagesToTranslate, newLang);
            
            return {
              ...msg,
              content: result.translatedText
            };
          } catch (error) {
            console.error('Failed to translate message:', error);
            return msg; // Keep original if translation fails
          }
        })
      );

      setMessages(translatedMessages);
    } catch (error) {
      console.error('Translation error:', error);
      // If translation fails, at least update the welcome message
      if (messages.length > 0 && messages[0].id === 'welcome') {
        const updatedMessages = [...messages];
        updatedMessages[0] = {
          ...updatedMessages[0],
          content: welcomeMessages[newLang]
        };
        setMessages(updatedMessages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!recognition) {
      alert(language === 'en' 
        ? 'Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.'
        : 'آپ کے براؤزر میں آوازی انپٹ سپورٹ نہیں ہے۔ براہ کرم Chrome، Edge یا Safari استعمال کریں۔'
      );
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      // Set language for speech recognition
      const speechLangCodes = {
        en: 'en-US',
        ur: 'ur-PK',
        ar: 'ar-SA',
        fr: 'fr-FR',
        es: 'es-ES',
        de: 'de-DE',
        zh: 'zh-CN'
      };
      recognition.lang = speechLangCodes[language] || 'en-US';
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(language === 'en' 
          ? 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
          : 'براہ کرم ایک درست تصویری فائل منتخب کریں (JPEG، PNG، GIF، یا WebP)'
        );
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(language === 'en' 
          ? 'Image size must be less than 10MB'
          : 'تصویر کا سائز 10MB سے کم ہونا چاہیے'
        );
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar">
            <HeartPulse size={24} />
          </div>
          <div>
            <h3>{language === 'en' ? 'AI Medical Consult' : 'AI طبی مشاورت'}</h3>
            <div className="chat-status">
              <span className="status-dot"></span>
              <span>{language === 'en' ? 'Online 24/7' : 'آن لائن 24/7'}</span>
            </div>
          </div>
        </div>
        <div className="chat-header-right">
          <div className="language-selector">
            <button 
              className="language-toggle-btn"
              onClick={toggleLanguage}
              disabled={isLoading}
              title="Select Language"
            >
              <Globe size={16} />
              <span>{languageNames[language]}</span>
            </button>
            {showLanguageMenu && (
              <div className="language-menu">
                {Object.entries(languageNames).map(([code, name]) => (
                  <button
                    key={code}
                    className={`language-option ${language === code ? 'active' : ''}`}
                    onClick={() => selectLanguage(code)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hipaa-badge">
            <Lock size={14} />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>

      {/* Emergency Alert */}
      {isEmergency && (
        <div className="emergency-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>{language === 'en' ? 'This may be an emergency' : 'یہ ایمرجنسی ہو سکتی ہے'}</strong>
            <p>{language === 'en' ? "If you're experiencing a medical emergency, please call 911 immediately." : 'اگر آپ کو طبی ایمرجنسی کا سامنا ہے، تو فوری طور پر 911 پر کال کریں۔'}</p>
          </div>
          <a href="tel:911" className="btn btn-error">
            <Phone size={18} />
            {language === 'en' ? 'Call 911' : '911 کال کریں'}
          </a>
        </div>
      )}

      {/* Messages Container */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.role} ${message.isError ? 'error' : ''}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? (
                <User size={18} />
              ) : (
                <HeartPulse size={18} />
              )}
            </div>
            <div className="message-content">
              {message.hasImage && message.imagePreview && (
                <div className="message-image">
                  <img src={message.imagePreview} alt="Medical scan or report" />
                  <div className="image-indicator">
                    <ImageIcon size={14} />
                    <span>Medical Image</span>
                  </div>
                </div>
              )}
              <div className="message-text">
                {/* eslint-disable-next-line jsx-a11y/heading-has-content */}
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p style={{margin: '0.5em 0'}} {...props} />,
                    ul: ({node, ...props}) => <ul style={{marginLeft: '1.2em', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    ol: ({node, ...props}) => <ol style={{marginLeft: '1.2em', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    li: ({node, ...props}) => <li style={{marginBottom: '0.25em'}} {...props} />,
                    h1: ({node, ...props}) => <h1 style={{fontSize: '1.5em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    h2: ({node, ...props}) => <h2 style={{fontSize: '1.3em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    h3: ({node, ...props}) => <h3 style={{fontSize: '1.1em', fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em'}} {...props} />,
                    strong: ({node, ...props}) => <strong style={{fontWeight: '600'}} {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? 
                        <code style={{backgroundColor: 'var(--gray-100)', padding: '0.2em 0.4em', borderRadius: '3px', fontSize: '0.9em'}} {...props} /> : 
                        <code style={{display: 'block', backgroundColor: 'var(--gray-100)', padding: '1em', borderRadius: '6px', overflowX: 'auto', fontSize: '0.9em'}} {...props} />
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-avatar">
              <HeartPulse size={18} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Panel */}
      {summary && (
        <div className="summary-panel">
          <div className="summary-header">
            <FileText size={20} />
            <h4>AI Consult Summary</h4>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setSummary(null)}
            >
              Close
            </button>
          </div>
          <div className="summary-content">
            <pre>{summary}</pre>
          </div>
          <div className="summary-actions">
            <button className="btn btn-secondary btn-sm">
              <Download size={16} />
              Download PDF
            </button>
            <button className="btn btn-secondary btn-sm">
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      )}

      {/* Action Bar - Show after consultation */}
      {showSummary && !summary && messages.length > 3 && (
        <div className="action-bar">
          <button 
            className="action-btn primary"
            onClick={() => navigate('/appointments')}
          >
            <Video size={18} />
            <span>See a Doctor ($39)</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleGenerateSummary}
            disabled={isLoading}
          >
            <FileText size={18} />
            <span>Get Summary</span>
          </button>
          <button 
            className="action-btn"
            onClick={handleNewConsult}
          >
            <RefreshCw size={18} />
            <span>New Consult</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <div className="chat-input-wrapper">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
          />
          
          {/* Inline Image Preview Chip */}
          {imagePreview && (
            <div className="image-preview-chip">
              <img src={imagePreview} alt="Selected" className="preview-thumb" />
              <button
                type="button"
                className="remove-chip-btn"
                onClick={handleRemoveImage}
                title="Remove"
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          <button
            type="button"
            className="attach-btn"
            onClick={handleAttachClick}
            disabled={isLoading || !!selectedImage}
            title={language === 'en' ? 'Attach medical image' : 'طبی تصویر منسلک کریں'}
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button"
            className={`voice-btn ${isRecording ? 'recording' : ''}`}
            onClick={startVoiceInput}
            disabled={isLoading}
            title={language === 'en' ? (isRecording ? 'Click to stop recording' : 'Click to start voice input') : (isRecording ? 'ریکارڈنگ بند کرنے کے لیے کلک کریں' : 'آوازی انپٹ شروع کرنے کے لیے کلک کریں')}
          >
            <Mic size={20} className={isRecording ? 'recording-icon' : ''} />
            {isRecording && (
              <>
                <span className="recording-pulse"></span>
                <span className="recording-ring"></span>
              </>
            )}
          </button>
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder={
              selectedImage 
                ? (language === 'en' ? 'Ask about this medical image...' : 'اس طبی تصویر کے بارے میں پوچھیں...')
                : (placeholderTexts[language] || placeholderTexts.en)
            }
            className="chat-input"
            rows={1}
            disabled={isLoading}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={(!inputValue.trim() && !selectedImage) || isLoading}
          >
            {isLoading ? (
              <Loader2 size={20} className="spinner" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>

      {/* Feedback */}
      {messages.length > 2 && (
        <div className="chat-feedback">
          <span>{language === 'en' ? 'Was this helpful?' : 'کیا یہ مددگار تھا؟'}</span>
          <button className="feedback-btn">
            <ThumbsUp size={16} />
          </button>
          <button className="feedback-btn">
            <ThumbsDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
