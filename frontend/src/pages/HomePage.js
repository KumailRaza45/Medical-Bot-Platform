import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatInterface from '../components/ChatInterface';
import { 
  Shield, Check, Video, FileText, 
  Clock, Users, Award, Stethoscope, Heart, 
  MessageCircle, Calendar, Globe, Phone,
  Activity, HeartPulse, Droplet, TrendingUp, Zap, Star, Lock
} from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const sessionToLoad = searchParams.get('session');
  
  const [stats] = useState({
    totalConsultations: 2847,
    activeUsers: 150000,
    healthMetricsTracked: 500000
  });

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K+';
    }
    return num.toLocaleString();
  };

  return (
    <div className="home-page">
      <Header />
      
      {/* Hero Section - Clean & Minimal */}
      <section className="hero-section">
        <div className="hero-container-centered">
          
          {/* AI Avatar */}
          <div className="ai-avatar">
            <HeartPulse size={48} strokeWidth={1.5} />
          </div>

          {/* Main Heading */}
          <h1 className="hero-title">
            Hi, I'm <span className="text-gradient">Karetek</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            I'm your private and personal AI doctor.
          </p>

          {/* Stats Text */}
          <p className="hero-stats-text">
            As an AI Doctor, my service is fast, free, and trusted by people worldwide.
          </p>

          {/* Note */}
          <p className="hero-note">
            What can I help you with today?
          </p>

          {/* Chat Interface */}
          <div className="hero-chat-primary">
            <ChatInterface loadSessionId={sessionToLoad} />
          </div>

          {/* Security Note */}
          <p className="hipaa-note">
            <Shield size={14} />
            Secure & Confidential
          </p>

        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-header">
            <h2>Your Complete Healthcare Solution</h2>
            <p>Everything you need to manage your health, all in one place.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <MessageCircle size={28} />
              </div>
              <h3>AI Health Consults</h3>
              <p>
                Chat with Karetek AI anytime, anywhere. Get instant answers to your 
                health questions with medically accurate information.
              </p>
              <ul className="feature-list">
                <li><Check size={16} /> Free 24/7 access</li>
                <li><Check size={16} /> Personalized advice</li>
                <li><Check size={16} /> Medical-grade AI</li>
              </ul>
            </div>

            <div className="feature-card highlighted">
              <div className="feature-badge">Most Popular</div>
              <div className="feature-icon">
                <Heart size={28} />
              </div>
              <h3>Health Metrics Tracking</h3>
              <p>
                Track your vital health measurements over time. Monitor blood pressure, 
                glucose, heart rate, weight, and more.
              </p>
              <ul className="feature-list">
                <li><Check size={16} /> Easy data entry</li>
                <li><Check size={16} /> Visual trends</li>
                <li><Check size={16} /> Health insights</li>
              </ul>
              <Link to="/health-metrics" className="btn btn-primary">
                Track Metrics
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FileText size={28} />
              </div>
              <h3>Health Records</h3>
              <p>
                Keep all your medical information in one secure place. Access your 
                history, medications, and test results anytime.
              </p>
              <ul className="feature-list">
                <li><Check size={16} /> HIPAA secure</li>
                <li><Check size={16} /> Easy sharing</li>
                <li><Check size={16} /> Complete history</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>How Karetek Works</h2>
            <p>Get the care you need in three simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <MessageCircle size={32} />
              </div>
              <h3>Chat With Karetek AI</h3>
              <p>
                Describe your symptoms or health concerns. Karetek AI will ask 
                follow-up questions and provide personalized guidance.
              </p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <FileText size={32} />
              </div>
              <h3>Get Your Assessment</h3>
              <p>
                Receive a comprehensive summary of possible conditions, recommended 
                actions, and personalized health guidance.
              </p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Heart size={32} />
              </div>
              <h3>Track Your Health</h3>
              <p>
                Monitor your vital signs and health metrics over time. Stay informed 
                about your health trends and progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Health Tracking Section */}
      <section className="health-tracking-section">
        <div className="container">
          <div className="health-tracking-content">
            <div className="health-tracking-text">
              <h2>Track Your Health Journey</h2>
              <p>
                Monitor your vital health metrics and stay informed about your wellness. 
                Our comprehensive tracking system helps you understand your health trends 
                and make informed decisions about your wellbeing.
              </p>
              
              <div className="health-features">
                <div className="health-feature">
                  <Heart size={20} />
                  <span>Blood Pressure & Heart Rate</span>
                </div>
                <div className="health-feature">
                  <Droplet size={20} />
                  <span>Blood Glucose Levels</span>
                </div>
                <div className="health-feature">
                  <Activity size={20} />
                  <span>Weight & BMI Tracking</span>
                </div>
                <div className="health-feature">
                  <Clock size={20} />
                  <span>Historical Data & Trends</span>
                </div>
              </div>

              <Link to="/health-metrics" className="btn btn-primary btn-lg">
                <Heart size={20} />
                Start Tracking Your Health
              </Link>
            </div>

            <div className="health-metrics-cards">
              <div className="metric-card">
                <div className="metric-avatar">❤️</div>
                <div className="metric-info">
                  <h4>Blood Pressure</h4>
                  <p>Monitor systolic & diastolic</p>
                  <div className="metric-label">
                    <Activity size={14} />
                    <span>Daily tracking</span>
                  </div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-avatar">🩸</div>
                <div className="metric-info">
                  <h4>Blood Glucose</h4>
                  <p>Track sugar levels</p>
                  <div className="metric-label">
                    <Droplet size={14} />
                    <span>Trend analysis</span>
                  </div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-avatar">⚖️</div>
                <div className="metric-info">
                  <h4>Weight & BMI</h4>
                  <p>Monitor body metrics</p>
                  <div className="metric-label">
                    <TrendingUp size={14} />
                    <span>Progress tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="privacy-section">
        <div className="container">
          <div className="privacy-card">
            <div className="privacy-icon">
              <Shield size={48} />
            </div>
            <h2>Your Privacy is Our Priority</h2>
            <p>
              Every conversation, diagnosis, and health detail is encrypted and stored 
              securely. We never use your chat data for AI training and only share data 
              with healthcare providers if you explicitly consent.
            </p>
            <div className="privacy-badges">
              <div className="privacy-badge">
                <Lock size={20} />
                <div>
                  <strong>End-to-End Encrypted</strong>
                  <span>Your data is always protected</span>
                </div>
              </div>
              <div className="privacy-badge">
                <Shield size={20} />
                <div>
                  <strong>HIPAA Compliant</strong>
                  <span>Healthcare industry standard</span>
                </div>
              </div>
              <div className="privacy-badge">
                <Award size={20} />
                <div>
                  <strong>SOC 2 Certified</strong>
                  <span>Enterprise-grade security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Patients Say</h2>
            <p>Join millions who trust Karetek for their healthcare needs</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p>
                "Karetek helped me understand my symptoms at 2 AM when I needed guidance. 
                The AI was thorough and tracking my health metrics keeps me informed."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">JM</div>
                <div>
                  <strong>Jessica M.</strong>
                  <span>Verified Patient</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p>
                "Finally, healthcare that fits my schedule. Got a prescription refill 
                in under an hour without leaving my house. Incredible service!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">RK</div>
                <div>
                  <strong>Robert K.</strong>
                  <span>Verified Patient</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p>
                "As someone without insurance, Karetek has been a lifesaver. The AI 
                health guidance is helpful and tracking my health metrics keeps me informed."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">AT</div>
                <div>
                  <strong>Amanda T.</strong>
                  <span>Verified Patient</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Take Control of Your Health?</h2>
            <p>
              Start a free AI consultation now or track your health metrics. 
              We're here 24/7 to support your wellness journey.
            </p>
            <div className="cta-buttons">
              <Link to="/" className="btn btn-primary btn-lg">
                <MessageCircle size={20} />
                Start Free Consult
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                <Users size={20} />
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
