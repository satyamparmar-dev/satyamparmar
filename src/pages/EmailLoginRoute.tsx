import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmailGatePage from './EmailGatePage';
import { useContentAccess } from '../auth/ContentAccessContext';
import { useAllowlistGateStore } from '../auth/useAllowlistGateStore';
import LoadingSpinner from '../components/LoadingSpinner';
import { EMAIL_ALLOWLIST_GATE_ENABLED } from '../auth/authConfig';

/**
 * Standalone sign-in page for email allowlist (full content gate).
 */
const EmailLoginRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gateEmail = useAllowlistGateStore((s) => s.gateEmail);
  const { allowlistEmails, allowlistError, retryAllowlist, allowlistReady, hasFullAccess } =
    useContentAccess();

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  useEffect(() => {
    if (!EMAIL_ALLOWLIST_GATE_ENABLED) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (hasFullAccess && gateEmail) {
      navigate(from.startsWith('/') ? from : `/${from}`, { replace: true });
    }
  }, [hasFullAccess, gateEmail, from, navigate]);

  if (EMAIL_ALLOWLIST_GATE_ENABLED && !allowlistReady && !allowlistError) {
    return <LoadingSpinner message="Loading…" fullPage />;
  }

  return (
    <EmailGatePage
      allowedSet={allowlistEmails}
      loadError={allowlistError}
      onRetry={retryAllowlist}
    />
  );
};

export default EmailLoginRoute;
