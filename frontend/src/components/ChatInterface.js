import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Lock, AlertTriangle, Loader2, User, Bot,
  Video, Calendar, FileText, Share2, Download, 
  ThumbsUp, ThumbsDown, RefreshCw, Phone, Globe, Mic
} from 'lucide-react';
import { chatAPI, consultationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ChatInterface.css';

const welcomeMessages = {
  en: `Hello! I'm Karetek, your AI medical assistant. I'm here to help you understand your health concerns and provide guidance.

**Important:** I'm an AI assistant, not a licensed doctor. Always discuss my suggestions with a healthcare provider before making medical decisions.

What symptoms or health concerns would you like to discuss today?`,
  ur: `السلام علیکم! میں کیریٹیک ہوں، آپ کا AI طبی معاون۔ میں آپ کی صحت کے خدشات کو سمجھنے اور رہنمائی فراہم کرنے میں مدد کے لیے حاضر ہوں۔

**اہم:** میں ایک AI معاون ہوں، لائسنس یافتہ ڈاکٹر نہیں۔ کوئی بھی طبی فیصلہ کرنے سے پہلے ہمیشہ کسی صحت کی دیکھ بھال فراہم کنندہ سے بات کریں۔

آج آپ کس علامات یا صحت کے مسائل پر بات کرنا چاہیں گے؟`
};

const ChatInterface = ({ loadSessionId = null, onSessionChange = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('en'); // 'en' or 'ur'
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  const inputRef = useRef(null);
  const { isAuthenticated } = useAuth();
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
  }, [sessionId, initializeSession, loadSessionId]);

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
    
    if (!inputValue.trim() || isLoading) return;

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
        .filter(m => m.id !== 'welcome')
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
    const newLang = language === 'en' ? 'ur' : 'en';
    setLanguage(newLang);
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
      recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';
      recognition.start();
      setIsRecording(true);
    }
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return `<li key="${i}">${line.substring(2)}</li>`;
        }
        return `<p key="${i}">${line}</p>`;
      })
      .join('');
  };

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar">
            <Bot size={24} />
          </div>
          <div>
            <h3>{language === 'en' ? 'Karetek AI Consult' : 'کیریٹیک AI مشاورت'}</h3>
            <div className="chat-status">
              <span className="status-dot"></span>
              <span>{language === 'en' ? 'Online 24/7' : 'آن لائن 24/7'}</span>
            </div>
          </div>
        </div>
        <div className="chat-header-right">
          <button 
            className="language-toggle-btn"
            onClick={toggleLanguage}
            disabled={isLoading}
            title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
          >
            {isLoading ? (
              <Loader2 size={16} className="spinner" />
            ) : (
              <Globe size={16} />
            )}
            <span>{language === 'en' ? 'اردو' : 'English'}</span>
          </button>
          <div className="hipaa-badge">
            <Lock size={14} />
            <span>HIPAA · Private</span>
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
                <Bot size={18} />
              )}
            </div>
            <div className="message-content">
              <div 
                className="message-text"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
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
              <Bot size={18} />
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
            placeholder={language === 'en' ? 'Describe your symptoms or health concern...' : 'اپنی علامات یا صحت کی تشویش بیان کریں...'}
            className="chat-input"
            rows={1}
            disabled={isLoading}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 size={20} className="spinner" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="chat-disclaimer">
          {language === 'en' 
            ? 'Karetek is an AI assistant, not a licensed doctor, and does not provide medical advice or care.'
            : 'کیریٹیک ایک AI معاون ہے، لائسنس یافتہ ڈاکٹر نہیں، اور طبی مشورہ یا دیکھ بھال فراہم نہیں کرتا۔'
          }
        </p>
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
