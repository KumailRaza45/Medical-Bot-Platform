import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, Shield, MessageCircle, FileText, Activity } from 'lucide-react';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await login(email, password);
      setSuccess('Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <Link to="/" className="auth-logo">
            <img 
              src="/karetek-logo.png" 
              alt="Karetek" 
              className="logo-image"
            />
          </Link>
          
          <div className="auth-branding-content">
            <h1>Welcome Back</h1>
            <p>
              Continue your healthcare journey with Karetek. Access your health records, 
              past consultations, and track your personal health metrics.
            </p>
            
            <div className="auth-features">
              <div className="auth-feature">
                <div className="feature-icon">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4>AI Doctor Consults</h4>
                  <p>Get instant medical guidance 24/7</p>
                </div>
              </div>
              <div className="auth-feature">
                <div className="feature-icon">
                  <FileText size={24} />
                </div>
                <div>
                  <h4>Health Records</h4>
                  <p>All your medical info in one place</p>
                </div>
              </div>
              <div className="auth-feature">
                <div className="feature-icon">
                  <Heart size={24} />
                </div>
                <div>
                  <h4>Health Metrics</h4>
                  <p>Track your vital health data</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-trust">
            <Shield size={16} />
            <span>HIPAA Compliant · Your data is private and secure</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg auth-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-social">
              <button 
                type="button"
                className="social-btn google"
                onClick={() => window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/google`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button 
                type="button"
                className="social-btn facebook"
                onClick={() => window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/facebook`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>

            <p className="auth-switch">
              Don't have an account?{' '}
              <Link to="/register">Create one for free</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="auth-loading-overlay">
          <div className="auth-loading-content">
            <Loader2 size={48} className="spinner-large" />
            <h3>Signing you in...</h3>
            <p>Please wait while we verify your credentials</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
