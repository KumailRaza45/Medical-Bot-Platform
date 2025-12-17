import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { 
  MessageCircle, Calendar, FileText, Video, Clock, 
  ChevronRight, Activity, Pill, AlertCircle, Plus,
  TrendingUp, Heart, Stethoscope, Droplet
} from 'lucide-react';
import { consultationsAPI, healthRecordsAPI, healthMetricsAPI } from '../utils/api';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [healthRecord, setHealthRecord] = useState(null);
  const [vitals, setVitals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [consultsRes, healthRes, metricsRes] = await Promise.all([
          consultationsAPI.getAll().catch(() => ({ consultations: [] })),
          healthRecordsAPI.get().catch(() => null),
          healthMetricsAPI.getAll().catch(() => ({ metrics: [] }))
        ]);

        // Process consultations to extract titles
        const processedConsultations = (consultsRes.consultations || []).slice(0, 3).map(consult => {
          let title = 'AI Consultation';
          if (consult.messages && consult.messages.length > 0) {
            const firstUserMsg = consult.messages.find(m => m.role === 'user');
            if (firstUserMsg) {
              title = firstUserMsg.content.substring(0, 50);
              if (firstUserMsg.content.length > 50) title += '...';
            }
          }
          return { ...consult, title };
        });

        setConsultations(processedConsultations);
        setHealthRecord(healthRes);

        // Get latest vitals
        const latestVitals = {};
        ['blood_pressure', 'blood_glucose', 'weight'].forEach(type => {
          const typeMetrics = metricsRes.metrics?.filter(m => m.metric_type === type) || [];
          if (typeMetrics.length > 0) {
            const latest = typeMetrics.sort((a, b) => 
              new Date(b.recorded_at) - new Date(a.recorded_at)
            )[0];
            latestVitals[type] = latest;
          }
        });
        setVitals(latestVitals);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-page">
      <Header />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-content">
              <h1>{getGreeting()}, {user?.firstName}!</h1>
              <p>Here's an overview of your health dashboard.</p>
            </div>
            <Link to="/" className="btn btn-primary">
              <MessageCircle size={18} />
              Start AI Consult
            </Link>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions">
            <Link to="/" className="action-card">
              <div className="action-icon chat">
                <MessageCircle size={24} />
              </div>
              <div className="action-content">
                <h3>AI Consultation</h3>
                <p>Chat with Karetek about your symptoms</p>
              </div>
              <ChevronRight size={20} />
            </Link>

            <Link to="/health-metrics" className="action-card">
              <div className="action-icon video">
                <Heart size={24} />
              </div>
              <div className="action-content">
                <h3>Health Metrics</h3>
                <p>Track your vital health data</p>
              </div>
              <ChevronRight size={20} />
            </Link>

            <Link to="/health-records" className="action-card">
              <div className="action-icon records">
                <FileText size={24} />
              </div>
              <div className="action-content">
                <h3>Health Records</h3>
                <p>View and update your info</p>
              </div>
              <ChevronRight size={20} />
            </Link>

            <Link to="/consultations" className="action-card">
              <div className="action-icon history">
                <Clock size={24} />
              </div>
              <div className="action-content">
                <h3>Past Consults</h3>
                <p>Review previous consultations</p>
              </div>
              <ChevronRight size={20} />
            </Link>
          </section>

          {/* Main Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Health Overview */}
            <section className="dashboard-card health-overview">
              <div className="card-header">
                <h2>
                  <Heart size={20} />
                  Health Overview
                </h2>
                <Link to="/health-records" className="card-link">
                  View All <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="health-stats">
                <div className="health-stat">
                  <div className="stat-icon medications">
                    <Pill size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {healthRecord?.medications?.length || 0}
                    </span>
                    <span className="stat-label">Medications</span>
                  </div>
                </div>

                <div className="health-stat">
                  <div className="stat-icon conditions">
                    <Activity size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {healthRecord?.conditions?.length || 0}
                    </span>
                    <span className="stat-label">Conditions</span>
                  </div>
                </div>

                <div className="health-stat">
                  <div className="stat-icon allergies">
                    <AlertCircle size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {healthRecord?.allergies?.length || 0}
                    </span>
                    <span className="stat-label">Allergies</span>
                  </div>
                </div>

                <div className="health-stat">
                  <div className="stat-icon consultations">
                    <Stethoscope size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-value">
                      {consultations.length}
                    </span>
                    <span className="stat-label">Consultations</span>
                  </div>
                </div>
              </div>

              {healthRecord?.medications?.length === 0 && 
               healthRecord?.conditions?.length === 0 && 
               healthRecord?.allergies?.length === 0 && (
                <div className="empty-state">
                  <p>Complete your health profile to get personalized care.</p>
                  <Link to="/health-records" className="btn btn-secondary btn-sm">
                    <Plus size={16} />
                    Add Health Info
                  </Link>
                </div>
              )}
            </section>

            {/* Health Metrics Summary */}
            <section className="dashboard-card appointments-card">
              <div className="card-header">
                <h2>
                  <Heart size={20} />
                  Health Metrics Summary
                </h2>
                <Link to="/health-metrics" className="card-link">
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              <div className="health-metrics-summary">
                <div className="metric-summary-card">
                  <div className="metric-summary-icon" style={{ background: '#ef444415', color: '#ef4444' }}>
                    <Activity size={20} />
                  </div>
                  <div className="metric-summary-info">
                    <h4>Blood Pressure</h4>
                    <p className="metric-value">
                      {vitals.blood_pressure ? `${vitals.blood_pressure.value} ${vitals.blood_pressure.unit}` : '--'}
                    </p>
                  </div>
                </div>
                <div className="metric-summary-card">
                  <div className="metric-summary-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
                    <Droplet size={20} />
                  </div>
                  <div className="metric-summary-info">
                    <h4>Blood Sugar</h4>
                    <p className="metric-value">
                      {vitals.blood_glucose ? `${vitals.blood_glucose.value} ${vitals.blood_glucose.unit}` : '--'}
                    </p>
                  </div>
                </div>
                <div className="metric-summary-card">
                  <div className="metric-summary-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
                    <TrendingUp size={20} />
                  </div>
                  <div className="metric-summary-info">
                    <h4>Weight</h4>
                    <p className="metric-value">
                      {vitals.weight ? `${vitals.weight.value} ${vitals.weight.unit}` : '--'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="empty-state-cta">
                <Link to="/health-metrics" className="btn btn-primary btn-sm">
                  <Plus size={16} />
                  Add New Metric
                </Link>
              </div>
            </section>

            {/* Recent Consultations */}
            <section className="dashboard-card consultations-card">
              <div className="card-header">
                <h2>
                  <MessageCircle size={20} />
                  Recent AI Consultations
                </h2>
                <Link to="/consultations" className="card-link">
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                </div>
              ) : consultations.length > 0 ? (
                <div className="consultations-list">
                  {consultations.map(consult => (
                    <Link 
                      key={consult.id} 
                      to={`/?session=${consult.session_id}`}
                      className="consultation-item"
                    >
                      <div className="consultation-icon">
                        <Stethoscope size={18} />
                      </div>
                      <div className="consultation-info">
                        <h4>{consult.title || 'AI Consultation'}</h4>
                        <p className="consultation-preview">
                          {consult.title}
                        </p>
                        <span className="consultation-date">
                          {formatDate(consult.created_at)}
                        </span>
                      </div>
                      <ChevronRight size={18} className="consultation-arrow" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <MessageCircle size={40} />
                  <h4>No consultations yet</h4>
                  <p>Start your first AI consultation to get health guidance.</p>
                  <Link to="/" className="btn btn-primary btn-sm">
                    Start Consultation
                  </Link>
                </div>
              )}
            </section>

            {/* Health Tips */}
            <section className="dashboard-card tips-card">
              <div className="card-header">
                <h2>
                  <TrendingUp size={20} />
                  Health Tips
                </h2>
              </div>

              <div className="tips-list">
                <div className="tip-item">
                  <span className="tip-emoji">💧</span>
                  <div className="tip-content">
                    <h4>Stay Hydrated</h4>
                    <p>Drink at least 8 glasses of water daily for optimal health.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-emoji">🏃</span>
                  <div className="tip-content">
                    <h4>Stay Active</h4>
                    <p>Aim for 30 minutes of moderate exercise most days.</p>
                  </div>
                </div>
                <div className="tip-item">
                  <span className="tip-emoji">😴</span>
                  <div className="tip-content">
                    <h4>Quality Sleep</h4>
                    <p>Adults need 7-9 hours of sleep per night.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
