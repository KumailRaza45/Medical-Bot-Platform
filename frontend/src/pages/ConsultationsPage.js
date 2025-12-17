import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Stethoscope, Calendar, Clock, FileText, Download, 
  Share2, ChevronRight, MessageCircle, Search
} from 'lucide-react';
import { consultationsAPI } from '../utils/api';
import './ConsultationsPage.css';

const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsult, setSelectedConsult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await consultationsAPI.getAll();
      const consultationsList = response.consultations || [];
      
      // Process consultations to extract title and summary from messages
      const processed = consultationsList.map(consult => {
        let title = 'AI Consultation';
        let summary = 'Consultation';
        
        if (consult.messages && consult.messages.length > 0) {
          // Find first user message for title
          const firstUserMsg = consult.messages.find(m => m.role === 'user');
          if (firstUserMsg) {
            // Use first 50 chars of first user message as title
            title = firstUserMsg.content.substring(0, 50);
            if (firstUserMsg.content.length > 50) title += '...';
          }
          
          // Use first user message for preview too
          summary = firstUserMsg ? firstUserMsg.content : 'Consultation';
        }
        
        return {
          ...consult,
          title,
          summary
        };
      });
      
      setConsultations(processed);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedConsult) return;
    
    // Create formatted text content
    let content = `KARETEK AI CONSULTATION\n\n`;
    content += `Date: ${formatDate(selectedConsult.created_at)}\n`;
    content += `Time: ${formatTime(selectedConsult.created_at)}\n`;
    content += `Language: ${selectedConsult.language === 'ur' ? 'Urdu' : 'English'}\n\n`;
    content += `=`.repeat(50) + '\n\n';
    
    if (selectedConsult.messages) {
      selectedConsult.messages.forEach((msg, index) => {
        content += `${msg.role === 'user' ? 'You' : 'Karetek AI'}:\n`;
        content += `${msg.content}\n\n`;
      });
    }
    
    content += `\n` + `=`.repeat(50) + '\n';
    content += `\nDisclaimer: This AI consultation is for informational purposes only and does not constitute medical advice.\n`;
    content += `Always consult with qualified healthcare professionals for medical decisions.\n`;
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-${formatDate(selectedConsult.created_at).replace(/\s/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!selectedConsult) return;
    
    const shareText = `Karetek AI Consultation from ${formatDate(selectedConsult.created_at)}\n\nCheck out Karetek for AI-powered health guidance!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Karetek Consultation',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Consultation link copied to clipboard!');
      } catch (error) {
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredConsultations = consultations.filter(consult => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return consult.summary?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="consultations-page">
      <Header />

      <main className="consultations-main">
        <div className="consultations-container">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1>
                <Stethoscope size={28} />
                My Consultations
              </h1>
              <p>View and manage your AI doctor consultation history</p>
            </div>
            <Link to="/" className="btn btn-primary">
              <MessageCircle size={18} />
              New Consultation
            </Link>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search consultations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Main Content */}
          <div className="consultations-layout">
            {/* Consultations List */}
            <div className="consultations-list-panel">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading consultations...</p>
                </div>
              ) : filteredConsultations.length > 0 ? (
                <div className="consultations-list">
                  {filteredConsultations.map(consult => (
                    <div
                      key={consult.id}
                      className={`consultation-item ${selectedConsult?.id === consult.id ? 'selected' : ''}`}
                      onClick={() => setSelectedConsult(consult)}
                    >
                      <div className="consultation-icon">
                        <Stethoscope size={20} />
                      </div>
                      <div className="consultation-info">
                        <h3>{consult.title || 'AI Consultation'}</h3>
                        <p className="consultation-preview">
                          {consult.summary?.substring(0, 100) || 'No preview available'}...
                        </p>
                        <div className="consultation-meta">
                          <span>
                            <Calendar size={14} />
                            {formatDate(consult.created_at)}
                          </span>
                          <span>
                            <Clock size={14} />
                            {formatTime(consult.created_at)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="chevron" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Stethoscope size={48} />
                  <h3>No consultations yet</h3>
                  <p>Start your first AI consultation to get health guidance.</p>
                  <Link to="/" className="btn btn-primary">
                    <MessageCircle size={18} />
                    Start Consultation
                  </Link>
                </div>
              )}
            </div>

            {/* Consultation Detail */}
            <div className="consultation-detail-panel">
              {selectedConsult ? (
                <div className="consultation-detail">
                  <div className="detail-header">
                    <h2>Consultation Summary</h2>
                    <div className="detail-actions">
                      <Link 
                        to={`/?session=${selectedConsult.session_id}`}
                        className="btn btn-primary btn-sm"
                        title="Resume this conversation on the homepage"
                      >
                        <MessageCircle size={16} />
                        Continue Chat
                      </Link>
                      <button className="btn btn-secondary btn-sm" onClick={handleDownloadPDF}>
                        <Download size={16} />
                        Download PDF
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleShare}>
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="detail-meta">
                    <span>
                      <Calendar size={16} />
                      {formatDate(selectedConsult.created_at)}
                    </span>
                    <span>
                      <Clock size={16} />
                      {formatTime(selectedConsult.created_at)}
                    </span>
                    <span style={{color: '#3CB043', fontWeight: 600}}>
                      {selectedConsult.messages?.length || 0} messages
                    </span>
                  </div>

                  <div className="detail-content">
                    <div className="messages-section">
                      <h3>
                        <MessageCircle size={18} />
                        Conversation History
                      </h3>
                      <div className="messages-list">
                        {selectedConsult.messages && selectedConsult.messages.length > 0 ? (
                          selectedConsult.messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                              <div className="message-header">
                                <span className="message-role">
                                  {msg.role === 'user' ? 'You' : 'Karetek AI'}
                                </span>
                              </div>
                              <div className="message-content">
                                {msg.content}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>No messages available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="detail-footer">
                    <div className="disclaimer">
                      <strong>Disclaimer:</strong> This AI consultation is for informational 
                      purposes only and does not constitute medical advice. Always consult 
                      with a licensed healthcare provider for proper diagnosis and treatment.
                    </div>
                    <Link to="/health-metrics" className="btn btn-primary">
                      Track Your Health Metrics
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <FileText size={48} />
                  <h3>Select a consultation</h3>
                  <p>Choose a consultation from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConsultationsPage;
