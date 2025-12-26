import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import AvatarPage from './pages/AvatarPageNew';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HealthRecordsPage from './pages/HealthRecordsPage';
import ConsultationsPage from './pages/ConsultationsPage';
import HealthMetricsPage from './pages/HealthMetricsPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner spinner-lg"></div>
          <h3>Loading...</h3>
          <p>Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner spinner-lg"></div>
          <h3>Loading...</h3>
          <p>Please wait</p>
        </div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/avatar" element={<AvatarPage />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/health-records" 
        element={
          <ProtectedRoute>
            <HealthRecordsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/health-metrics" 
        element={
          <ProtectedRoute>
            <HealthMetricsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/consultations" 
        element={
          <ProtectedRoute>
            <ConsultationsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
