import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AUTH_LOGIN_ENABLED } from './authConfig';
import { useAuthStore } from './useAuthStore';
import LoginPage from '../pages/LoginPage';

interface Props {
  children: React.ReactNode;
}

const AuthGuard: React.FC<Props> = ({ children }) => {
  const { validateSession, isAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(() => AUTH_LOGIN_ENABLED);

  useEffect(() => {
    if (!AUTH_LOGIN_ENABLED) return;

    let cancelled = false;
    const doneChecking = () => {
      if (!cancelled) setChecking(false);
    };

    const runValidate = () => {
      validateSession().finally(doneChecking);
    };

    // Persist rehydrates localStorage async; validating before hydration looks like
    // "no session" and leaves isAuthenticated false even when a token exists.
    if (useAuthStore.persist.hasHydrated()) {
      runValidate();
      return () => {
        cancelled = true;
      };
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      runValidate();
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [validateSession]);

  if (!AUTH_LOGIN_ENABLED) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={32} sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => validateSession()} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
