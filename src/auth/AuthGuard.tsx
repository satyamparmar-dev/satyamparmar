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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [checking, setChecking] = useState(() => AUTH_LOGIN_ENABLED);

  useEffect(() => {
    if (!AUTH_LOGIN_ENABLED || EMAIL_ALLOWLIST_GATE_ENABLED) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    const doneChecking = () => {
      if (!cancelled) setChecking(false);
    };

    const runValidate = () => {
      void useAuthStore.getState().validateSession().finally(doneChecking);
    };

    // Safety net if persist hydration never fires (e.g. Strict Mode race)
    const safetyTimer = window.setTimeout(doneChecking, 8000);

    if (useAuthStore.persist.hasHydrated()) {
      runValidate();
      return () => {
        cancelled = true;
        window.clearTimeout(safetyTimer);
      };
    }

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      runValidate();
    });

    return () => {
      cancelled = true;
      unsub();
      window.clearTimeout(safetyTimer);
    };
  }, []);

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
    return (
      <LoginPage
        onSuccess={() => {
          void useAuthStore.getState().validateSession();
        }}
      />
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
