import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AUTH_LOGIN_ENABLED, EMAIL_ALLOWLIST_GATE_ENABLED } from './authConfig';
import { useAuthStore } from './useAuthStore';
import LoginPage from '../pages/LoginPage';

interface Props {
  children: React.ReactNode;
}

/**
 * Legacy password/OTP gate only. Email allowlist uses {@link ContentAccessProvider}
 * + per-page preview; see `/login` for sign-in.
 */
const AuthGuard: React.FC<Props> = ({ children }) => {
  const { validateSession, isAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(() => AUTH_LOGIN_ENABLED);

  useEffect(() => {
    if (!AUTH_LOGIN_ENABLED || EMAIL_ALLOWLIST_GATE_ENABLED) return;

    let cancelled = false;
    const doneChecking = () => {
      if (!cancelled) setChecking(false);
    };

    const runValidate = () => {
      validateSession().finally(doneChecking);
    };

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

  if (EMAIL_ALLOWLIST_GATE_ENABLED || !AUTH_LOGIN_ENABLED) {
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
