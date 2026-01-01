import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const provider = searchParams.get('provider');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate(`/login?error=${error}`);
        return;
      }

      if (!token) {
        navigate('/login?error=no_token');
        return;
      }

      try {
        await loginWithToken(token);
        navigate('/dashboard');
      } catch (err) {
        console.error('Token login failed:', err);
        navigate('/login?error=authentication_failed');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '1rem'
    }}>
      <Loader2 size={48} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
      <h2>Signing you in...</h2>
      <p>Please wait while we complete your authentication</p>
    </div>
  );
};

export default OAuthCallbackPage;
