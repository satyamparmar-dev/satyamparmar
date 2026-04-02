import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { AUTH_LOGIN_ENABLED, EMAIL_ALLOWLIST_GATE_ENABLED } from './authConfig';
import { useAuthStore } from './useAuthStore';
import { useAllowlistGateStore } from './useAllowlistGateStore';
import LoginPage from '../pages/LoginPage';
import EmailGatePage from '../pages/EmailGatePage';
import { decryptAllowlistEmails, fetchAllowlistBundle } from './allowlistCrypto';

interface Props {
  children: React.ReactNode;
}

const AuthGuard: React.FC<Props> = ({ children }) => {
  const { validateSession, isAuthenticated } = useAuthStore();
  const gateEmail = useAllowlistGateStore((s) => s.gateEmail);
  const clearGate = useAllowlistGateStore((s) => s.clearGate);

  const [checking, setChecking] = useState(
    () => AUTH_LOGIN_ENABLED || EMAIL_ALLOWLIST_GATE_ENABLED
  );
  const [allowlistSet, setAllowlistSet] = useState<Set<string> | null>(null);
  const [allowlistError, setAllowlistError] = useState<string | null>(null);
  /** Only true after a successful decrypt — avoids clearing gate session on network errors. */
  const [allowlistLoadOk, setAllowlistLoadOk] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  // Legacy password / OTP login
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

  // Email allowlist gate
  useEffect(() => {
    if (!EMAIL_ALLOWLIST_GATE_ENABLED) return;

    let cancelled = false;

    const run = async () => {
      setAllowlistError(null);
      setAllowlistLoadOk(false);

      const finishHydration = (): Promise<void> =>
        new Promise((resolve) => {
          if (useAllowlistGateStore.persist.hasHydrated()) {
            resolve();
            return;
          }
          const unsub = useAllowlistGateStore.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
        });

      await finishHydration();
      if (cancelled) return;

      try {
        const bundle = await fetchAllowlistBundle(import.meta.env.BASE_URL);
        if (cancelled) return;
        const emails = await decryptAllowlistEmails(bundle);
        if (cancelled) return;
        setAllowlistSet(new Set(emails));
        setAllowlistLoadOk(true);
      } catch (e) {
        if (cancelled) return;
        setAllowlistSet(new Set());
        setAllowlistLoadOk(false);
        setAllowlistError(
          e instanceof Error ? e.message : 'Could not load the access list.'
        );
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    setChecking(true);
    run();

    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  // Drop stale persisted email if no longer on the list (after a successful load)
  useEffect(() => {
    if (!EMAIL_ALLOWLIST_GATE_ENABLED || !allowlistLoadOk || !allowlistSet || !gateEmail) {
      return;
    }
    if (!allowlistSet.has(gateEmail)) {
      clearGate();
    }
  }, [
    EMAIL_ALLOWLIST_GATE_ENABLED,
    allowlistLoadOk,
    allowlistSet,
    gateEmail,
    clearGate,
  ]);

  if (!AUTH_LOGIN_ENABLED && !EMAIL_ALLOWLIST_GATE_ENABLED) {
    return <>{children}</>;
  }

  if (EMAIL_ALLOWLIST_GATE_ENABLED) {
    if (checking || allowlistSet === null) {
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

    if (gateEmail && allowlistSet.has(gateEmail)) {
      return <>{children}</>;
    }

    return (
      <EmailGatePage
        allowedSet={allowlistSet}
        loadError={allowlistError}
        onRetry={() => setRetryTick((t) => t + 1)}
      />
    );
  }

  if (AUTH_LOGIN_ENABLED) {
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
  }

  return <>{children}</>;
};

export default AuthGuard;
