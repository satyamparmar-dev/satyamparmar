import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AUTH_LOGIN_ENABLED, EMAIL_ALLOWLIST_GATE_ENABLED } from './authConfig';
import { useAuthStore } from './useAuthStore';

interface Props {
  children: React.ReactNode;
}

/**
 * Validates persisted sessions on load. Login / registration is available via `/login`
 * and the header sign-in button — the app remains browsable without signing in.
 */
const AuthGuard: React.FC<Props> = ({ children }) => {
  const [checking, setChecking] = useState(() => AUTH_LOGIN_ENABLED && !EMAIL_ALLOWLIST_GATE_ENABLED);

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

  return <>{children}</>;
};

export default AuthGuard;
