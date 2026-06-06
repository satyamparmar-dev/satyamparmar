import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuthStore } from '../auth/useAuthStore';
import { AUTH_LOGIN_ENABLED } from '../auth/authConfig';

/**
 * Standalone login / registration page (password + email OTP flow).
 */
const LoginRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    if (!AUTH_LOGIN_ENABLED) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from.startsWith('/') ? from : `/${from}`, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  if (!AUTH_LOGIN_ENABLED || isAuthenticated) {
    return null;
  }

  return (
    <LoginPage
      onSuccess={() => {
        void useAuthStore.getState().validateSession();
        navigate(from.startsWith('/') ? from : `/${from}`, { replace: true });
      }}
    />
  );
};

export default LoginRoute;
