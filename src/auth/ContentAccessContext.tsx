import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { AUTH_LOGIN_ENABLED, EMAIL_ALLOWLIST_GATE_ENABLED } from './authConfig';
import { useAuthStore } from './useAuthStore';
import { useAllowlistGateStore } from './useAllowlistGateStore';
import { decryptAllowlistEmails, fetchAllowlistBundle } from './allowlistCrypto';

export interface ContentAccessValue {
  /** Signed in (legacy auth) or allowlisted email gate satisfied */
  hasFullAccess: boolean;
  /** Allowlist fetch+decrypt finished successfully (only meaningful when email gate is on) */
  allowlistReady: boolean;
  allowlistError: string | null;
  retryAllowlist: () => void;
  /** Emails permitted to sign in (for /login page); empty if list failed to load */
  allowlistEmails: Set<string>;
}

const ContentAccessContext = createContext<ContentAccessValue | null>(null);

const SESSION_CACHE_KEY = 'satyverse-allowlist-cache';

export const ContentAccessProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const gateEmail = useAllowlistGateStore((s) => s.gateEmail);
  const clearGate = useAllowlistGateStore((s) => s.clearGate);

  const [allowlistSet, setAllowlistSet] = useState<Set<string>>(() => new Set());
  const [allowlistError, setAllowlistError] = useState<string | null>(null);
  const [allowlistLoadOk, setAllowlistLoadOk] = useState(!EMAIL_ALLOWLIST_GATE_ENABLED);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!EMAIL_ALLOWLIST_GATE_ENABLED) {
      setAllowlistSet(new Set());
      setAllowlistLoadOk(true);
      setAllowlistError(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setAllowlistError(null);
      // Only drop "ready" on explicit retry — avoids a brief !ready window if this
      // effect re-runs (e.g. Strict Mode) after logout, which would feel like preview broke.
      if (retryTick > 0) {
        setAllowlistLoadOk(false);
      }

      await new Promise<void>((resolve) => {
        if (useAllowlistGateStore.persist.hasHydrated()) {
          resolve();
          return;
        }
        const unsub = useAllowlistGateStore.persist.onFinishHydration(() => {
          unsub();
          resolve();
        });
      });

      if (cancelled) return;

      try {
        const bundle = await fetchAllowlistBundle(import.meta.env.BASE_URL);
        const emails = await decryptAllowlistEmails(bundle);
        if (cancelled) return;
        setAllowlistSet(new Set(emails));
        setAllowlistLoadOk(true);
        try {
          sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(emails));
        } catch {
          /* storage full — ignore */
        }
      } catch (e) {
        if (cancelled) return;
        console.error('[ContentAccess] allowlist load failed:', e);
        const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
        if (cached) {
          console.warn('[ContentAccess] Using cached allowlist from sessionStorage');
          try {
            const cachedEmails: string[] = JSON.parse(cached);
            setAllowlistSet(new Set(cachedEmails));
            setAllowlistLoadOk(true);
            setAllowlistError(null);
            return;
          } catch {
            /* invalid cache — fall through */
          }
        }
        setAllowlistSet(new Set());
        setAllowlistLoadOk(true);
        setAllowlistError(
          e instanceof Error ? e.message : 'Could not load the access list.'
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  useEffect(() => {
    if (!EMAIL_ALLOWLIST_GATE_ENABLED || !allowlistLoadOk || !gateEmail) return;
    if (!allowlistSet.has(gateEmail)) clearGate();
  }, [allowlistLoadOk, allowlistSet, gateEmail, clearGate]);

  const hasFullAccess = useMemo(() => {
    if (AUTH_LOGIN_ENABLED) return isAuthenticated;
    if (EMAIL_ALLOWLIST_GATE_ENABLED) {
      return !!(allowlistLoadOk && gateEmail && allowlistSet.has(gateEmail));
    }
    return true;
  }, [
    AUTH_LOGIN_ENABLED,
    EMAIL_ALLOWLIST_GATE_ENABLED,
    isAuthenticated,
    allowlistLoadOk,
    gateEmail,
    allowlistSet,
  ]);

  const retryAllowlist = useCallback(() => setRetryTick((t) => t + 1), []);

  const value = useMemo<ContentAccessValue>(
    () => ({
      hasFullAccess,
      allowlistReady: !EMAIL_ALLOWLIST_GATE_ENABLED || allowlistLoadOk,
      allowlistError,
      retryAllowlist,
      allowlistEmails: allowlistSet,
    }),
    [
      hasFullAccess,
      allowlistError,
      retryAllowlist,
      allowlistSet,
      allowlistLoadOk,
    ]
  );

  return (
    <ContentAccessContext.Provider value={value}>{children}</ContentAccessContext.Provider>
  );
};

export function useContentAccess(): ContentAccessValue {
  const ctx = useContext(ContentAccessContext);
  if (!ctx) {
    throw new Error('useContentAccess must be used within ContentAccessProvider');
  }
  return ctx;
}
