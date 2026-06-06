/**
 * ⚠️  LEGACY AUTH — Currently disabled (AUTH_LOGIN_ENABLED = false in authConfig.ts)
 * This file is kept for potential future re-enablement.
 * To re-activate: set AUTH_LOGIN_ENABLED = true and PBKDF2-upgrade the password hashing.
 * Do NOT remove without also removing: LoginPage.tsx, emailService.ts, useAuthStore.ts
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useAuthStore } from '../auth/useAuthStore';
import { mergePermanentUsers } from '../auth/ensurePermanentUsers';
import { APP_DISPLAY_NAME } from '../constants/branding';
import AccessEnquiryNotice from '../components/AccessEnquiryNotice';
import { checkRateLimit, getRemainingAttempts } from '../auth/authUtils';
import {
  isAllowedProvider,
  getProviderName,
  createOTP,
  checkOTP,
  sendOTPEmail,
  OTP_EXPIRY_MS,
  OTP_MAX_ATTEMPTS,
  RESEND_COOLDOWN_MS,
  PendingOTP,
} from '../auth/emailService';

// ─── Password Strength ────────────────────────────────────────────────────────

function calcStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score += 20;
  if (pw.length >= 12) score += 15;
  if (/[A-Z]/.test(pw)) score += 20;
  if (/[0-9]/.test(pw)) score += 20;
  if (/[^A-Za-z0-9]/.test(pw)) score += 25;
  if (score < 40) return { score, label: 'Weak', color: '#F85149' };
  if (score < 65) return { score, label: 'Fair', color: '#D29922' };
  if (score < 85) return { score, label: 'Good', color: '#58A6FF' };
  return { score, label: 'Strong', color: '#3FB950' };
}

// ─── OTP Input Component ──────────────────────────────────────────────────────


// ─── Countdown Timer ──────────────────────────────────────────────────────────

function useCountdown(targetMs: number | null) {
  const [remaining, setRemaining] = useState<number>(() =>
    targetMs ? Math.max(0, targetMs - Date.now()) : 0
  );

  useEffect(() => {
    if (!targetMs) { setRemaining(0); return; }
    const tick = () => setRemaining(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [targetMs]);

  return remaining;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  onSuccess: () => void;
}

type RegStep = 'form' | 'otp';

const LoginPage: React.FC<Props> = ({ onSuccess }) => {
  const { login, preRegister, markEmailVerified } = useAuthStore();
  const [tab, setTab] = useState<0 | 1>(0); // 0=Login, 1=Register

  useEffect(() => {
    useAuthStore.setState((s) => ({ users: mergePermanentUsers(s.users) }));
  }, []);
  const [regStep, setRegStep] = useState<RegStep>('form');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  // Register fields
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // OTP step state
  const [otpValue, setOtpValue] = useState('');
  const [pendingOTP, setPendingOTP] = useState<PendingOTP | null>(null);
  const [otpError, setOtpError] = useState('');
  const [otpDemoCode, setOtpDemoCode] = useState<string | null>(null); // shown when EmailJS not configured
  const [resendTarget, setResendTarget] = useState<number | null>(null);
  const [otpExpiryTarget, setOtpExpiryTarget] = useState<number | null>(null);
  const resendRemaining = useCountdown(resendTarget);
  const expiryRemaining = useCountdown(otpExpiryTarget);

  const [loading, setLoading] = useState(false);

  const strength = calcStrength(regPw);

  useEffect(() => {
    if (loginEmail && tab === 0) {
      setRemainingAttempts(getRemainingAttempts(loginEmail));
    }
  }, [loginEmail, tab]);

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setTab(v as 0 | 1);
    setLoginError('');
    setRegError('');
    setRegSuccess('');
    setRegStep('form');
    setOtpValue('');
    setOtpDemoCode(null);
  };

  // ── Login Submit ────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const { allowed, remainingMs } = checkRateLimit(loginEmail);
    if (!allowed) {
      const mins = Math.ceil(remainingMs / 60000);
      setLoginError(`Too many attempts. Try again in ${mins} min.`);
      return;
    }

    setLoading(true);
    const result = await login(loginEmail, loginPw);
    setLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setLoginError(result.error ?? 'Login failed.');
      setRemainingAttempts(getRemainingAttempts(loginEmail));
    }
  };

  // ── Send OTP ────────────────────────────────────────────────────────────────
  const sendCode = useCallback(async (email: string, name: string) => {
    const { pending, raw } = await createOTP(email);
    const sendResult = await sendOTPEmail(email, name, raw);

    if (!sendResult.success) {
      return { success: false, error: sendResult.error };
    }

    setPendingOTP(pending);
    setResendTarget(Date.now() + RESEND_COOLDOWN_MS);
    setOtpExpiryTarget(pending.expiresAt);
    setOtpDemoCode(sendResult.isDemoMode ? raw : null);
    setOtpValue('');
    setOtpError('');
    return { success: true };
  }, []);

  // ── Register Form Submit → trigger OTP send ─────────────────────────────────
  const handleRegisterForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!isAllowedProvider(regEmail)) {
      setRegError(
        'Please use an email from a supported provider: Gmail, Outlook, Yahoo, iCloud, Proton Mail, etc.'
      );
      return;
    }

    if (regPw !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }

    setLoading(true);

    // Pre-register stores the hashed credentials but doesn't authenticate
    const preResult = await preRegister(regEmail, regName, regPw);
    if (!preResult.success) {
      setLoading(false);
      setRegError(preResult.error ?? 'Registration failed.');
      return;
    }

    const sendResult = await sendCode(regEmail, regName);
    setLoading(false);

    if (!sendResult.success) {
      setRegError(sendResult.error ?? 'Failed to send verification code.');
      return;
    }

    setRegStep('otp');
  };

  // ── OTP Verify Submit ───────────────────────────────────────────────────────
  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingOTP || otpValue.length < 6) return;
    setOtpError('');
    setLoading(true);

    const { result, updatedPending } = await checkOTP(otpValue, pendingOTP);
    setPendingOTP(updatedPending);

    if (result.valid) {
      const verifyResult = await markEmailVerified(regEmail);
      setLoading(false);
      if (verifyResult.success) {
        onSuccess();
      } else {
        setOtpError(verifyResult.error ?? 'Verification failed.');
      }
    } else {
      setLoading(false);
      if (result.reason === 'expired') {
        setOtpError('Code expired. Please request a new one.');
      } else if (result.reason === 'max_attempts') {
        setOtpError(`Too many incorrect attempts. Please request a new code.`);
      } else {
        const left = OTP_MAX_ATTEMPTS - updatedPending.attempts;
        setOtpError(`Incorrect code. ${left} attempt${left !== 1 ? 's' : ''} remaining.`);
      }
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendRemaining > 0) return;
    setLoading(true);
    const sendResult = await sendCode(regEmail, regName);
    setLoading(false);
    if (!sendResult.success) {
      setOtpError(sendResult.error ?? 'Failed to resend code.');
    }
  };

  const passwordRules = [
    { label: 'At least 8 characters', ok: regPw.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(regPw) },
    { label: 'One number', ok: /[0-9]/.test(regPw) },
  ];

  const expiryMins = Math.floor(expiryRemaining / 60000);
  const expirySecs = Math.floor((expiryRemaining % 60000) / 1000);
  const otpAttemptsLeft = pendingOTP ? OTP_MAX_ATTEMPTS - pendingOTP.attempts : OTP_MAX_ATTEMPTS;
  const otpExpired = expiryRemaining === 0 && pendingOTP !== null;

  // ─── UI ─────────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'radial-gradient(ellipse at 20% 20%, rgba(102,126,234,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(118,75,162,0.12) 0%, transparent 60%), #0D1117'
            : 'radial-gradient(ellipse at 20% 20%, rgba(102,126,234,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(118,75,162,0.08) 0%, transparent 60%), #F6F8FA',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Brand */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 8px 32px rgba(102,126,234,0.35)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
            {APP_DISPLAY_NAME}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            90-day journey · Fresher to Senior Engineer
          </Typography>
        </Box>

        {/* Card */}
        <Paper
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
        >
          {loading && <LinearProgress sx={{ height: 2 }} />}

          {/* ── OTP Verification Step ─────────────────────────────────────────── */}
          {tab === 1 && regStep === 'otp' ? (
            <Box sx={{ p: 3 }}>
              {/* Back button */}
              <Button
                startIcon={<ArrowBackIcon />}
                size="small"
                onClick={() => { setRegStep('form'); setOtpError(''); setOtpValue(''); setOtpDemoCode(null); }}
                sx={{ mb: 2, color: 'text.secondary', pl: 0 }}
              >
                Back
              </Button>

              {/* Header */}
              <Box textAlign="center" mb={3}>
                <Avatar
                  sx={{
                    width: 56, height: 56,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mx: 'auto', mb: 1.5,
                  }}
                >
                  <MarkEmailReadIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={700}>
                  Check your inbox
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  We sent a 6-digit code to
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5,
                    px: 1.5, py: 0.5, borderRadius: 2,
                    bgcolor: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)',
                  }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 14, color: '#667eea' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#667eea' }}>
                    {regEmail}
                  </Typography>
                </Box>
                <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                  via {getProviderName(regEmail)}
                </Typography>
              </Box>

              {/* Demo mode banner */}
              {otpDemoCode && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="caption" display="block" fontWeight={700}>
                    Demo Mode — EmailJS not configured yet
                  </Typography>
                  <Typography variant="caption" display="block" mt={0.5}>
                    Your verification code is:{' '}
                    <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1rem', letterSpacing: 4 }}>
                      {otpDemoCode}
                    </Box>
                  </Typography>
                  <Typography variant="caption" display="block" mt={0.5} color="text.secondary">
                    Set up EmailJS in <code>src/auth/emailConfig.ts</code> to send real emails.
                  </Typography>
                </Alert>
              )}

              {/* Error */}
              {otpError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{otpError}</Alert>
              )}

              {/* Expiry timer */}
              {!otpExpired && expiryRemaining > 0 && (
                <Box textAlign="center" mb={2}>
                  <Typography variant="caption" color="text.secondary">
                    Code expires in{' '}
                    <Box component="span" sx={{ color: expiryMins === 0 && expirySecs <= 30 ? '#F85149' : 'text.primary', fontWeight: 700 }}>
                      {expiryMins}:{String(expirySecs).padStart(2, '0')}
                    </Box>
                  </Typography>
                </Box>
              )}

              {otpExpired && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  Code expired. Please request a new one.
                </Alert>
              )}

              {/* OTP input */}
              <Box component="form" onSubmit={handleOTPVerify}>
                <TextField
                  fullWidth
                  label="6-digit verification code"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading || otpExpired || otpAttemptsLeft <= 0}
                  inputProps={{ maxLength: 6, inputMode: 'numeric', style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, letterSpacing: 12, fontFamily: '"JetBrains Mono", monospace' } }}
                  placeholder="──────"
                  autoFocus
                  sx={{ mb: 3 }}
                />

                {/* Attempts remaining */}
                {otpAttemptsLeft < OTP_MAX_ATTEMPTS && otpAttemptsLeft > 0 && !otpExpired && (
                  <Box textAlign="center" mb={2}>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {Array.from({ length: OTP_MAX_ATTEMPTS }).map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: i < otpAttemptsLeft ? '#667eea' : 'action.disabled',
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                      {otpAttemptsLeft} attempt{otpAttemptsLeft !== 1 ? 's' : ''} remaining
                    </Typography>
                  </Box>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || otpValue.length < 6 || otpExpired || otpAttemptsLeft <= 0}
                  sx={{
                    py: 1.25, fontWeight: 700, mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #5a70d8 0%, #673f92 100%)' },
                  }}
                >
                  {loading ? 'Verifying…' : 'Verify & Create Account'}
                </Button>

                {/* Resend */}
                <Box textAlign="center">
                  <Typography variant="caption" color="text.secondary">
                    Didn't receive it?{' '}
                  </Typography>
                  {resendRemaining > 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      Resend in {Math.ceil(resendRemaining / 1000)}s
                    </Typography>
                  ) : (
                    <Button
                      size="small"
                      startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                      onClick={handleResend}
                      disabled={loading}
                      sx={{ fontSize: '0.75rem', p: 0, minWidth: 0, verticalAlign: 'baseline' }}
                    >
                      Resend code
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            /* ── Login / Register Form ─────────────────────────────────────────── */
            <>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: '1px solid', borderColor: 'divider',
                  '& .MuiTab-root': { py: 2, fontWeight: 600 },
                }}
              >
                <Tab icon={<LockOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Sign In" />
                <Tab icon={<PersonAddOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Create Account" />
              </Tabs>

              {/* ── LOGIN ────────────────────────────────────────────────────────── */}
              {tab === 0 && (
                <Box component="form" onSubmit={handleLogin} sx={{ p: 3 }}>
                  {loginError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {loginError}
                      {remainingAttempts < 5 && remainingAttempts > 0 && (
                        <Typography variant="caption" display="block" mt={0.5}>
                          {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout.
                        </Typography>
                      )}
                    </Alert>
                  )}

                  <TextField
                    fullWidth label="Email Address" type="email"
                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    required size="small" autoComplete="email"
                    sx={{ mb: 2 }} inputProps={{ maxLength: 120 }}
                  />

                  <TextField
                    fullWidth label="Password"
                    type={showLoginPw ? 'text' : 'password'}
                    value={loginPw} onChange={(e) => setLoginPw(e.target.value)}
                    required size="small" autoComplete="current-password"
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowLoginPw((p) => !p)} edge="end" tabIndex={-1}>
                            {showLoginPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit" fullWidth variant="contained" disabled={loading}
                    sx={{
                      py: 1.25, fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #5a70d8 0%, #673f92 100%)' },
                    }}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </Box>
              )}

              {/* ── REGISTER ─────────────────────────────────────────────────────── */}
              {tab === 1 && (
                <Box component="form" onSubmit={handleRegisterForm} sx={{ p: 3 }}>
                  {regError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{regError}</Alert>
                  )}
                  {regSuccess && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{regSuccess}</Alert>
                  )}

                  {/* Step indicator */}
                  <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                    <Box sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: '#667eea' }} />
                    <Box sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: 'action.hover' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      Step 1 of 2
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth label="Full Name"
                    value={regName} onChange={(e) => setRegName(e.target.value)}
                    required size="small" autoComplete="name"
                    sx={{ mb: 2 }} inputProps={{ maxLength: 60 }}
                  />

                  <TextField
                    fullWidth label="Email Address" type="email"
                    value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    required size="small" autoComplete="email"
                    sx={{ mb: 0.5 }} inputProps={{ maxLength: 120 }}
                    helperText={
                      regEmail && !isAllowedProvider(regEmail)
                        ? 'Use Gmail, Outlook, Yahoo, iCloud, Proton Mail, etc.'
                        : regEmail && isAllowedProvider(regEmail)
                        ? `✓ ${getProviderName(regEmail)} accepted`
                        : ''
                    }
                    FormHelperTextProps={{
                      sx: {
                        color: regEmail && !isAllowedProvider(regEmail)
                          ? 'error.main'
                          : '#3FB950',
                      },
                    }}
                  />

                  <Box mb={2} />

                  <TextField
                    fullWidth label="Password"
                    type={showRegPw ? 'text' : 'password'}
                    value={regPw} onChange={(e) => setRegPw(e.target.value)}
                    required size="small" autoComplete="new-password"
                    sx={{ mb: regPw ? 1 : 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowRegPw((p) => !p)} edge="end" tabIndex={-1}>
                            {showRegPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Strength meter */}
                  {regPw && (
                    <Box mb={2}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">Strength</Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: strength.color }}>
                          {strength.label}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate" value={strength.score}
                        sx={{
                          height: 4, borderRadius: 2, bgcolor: 'action.hover', mb: 1,
                          '& .MuiLinearProgress-bar': { bgcolor: strength.color },
                        }}
                      />
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {passwordRules.map((r) => (
                          <Chip
                            key={r.label} label={r.label} size="small"
                            icon={r.ok ? <CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                            sx={{
                              fontSize: '0.65rem', height: 20,
                              bgcolor: r.ok ? 'rgba(63,185,80,0.12)' : 'action.hover',
                              color: r.ok ? '#3FB950' : 'text.secondary',
                              border: '1px solid', borderColor: r.ok ? 'rgba(63,185,80,0.3)' : 'transparent',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <TextField
                    fullWidth label="Confirm Password"
                    type={showRegConfirm ? 'text' : 'password'}
                    value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                    required size="small" autoComplete="new-password"
                    sx={{ mb: 2.5 }}
                    error={!!regConfirm && regConfirm !== regPw}
                    helperText={regConfirm && regConfirm !== regPw ? 'Passwords do not match' : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowRegConfirm((p) => !p)} edge="end" tabIndex={-1}>
                            {showRegConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit" fullWidth variant="contained" disabled={loading}
                    startIcon={<EmailOutlinedIcon />}
                    sx={{
                      py: 1.25, fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #5a70d8 0%, #673f92 100%)' },
                    }}
                  >
                    {loading ? 'Sending code…' : 'Send Verification Code'}
                  </Button>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">Supported providers</Typography>
                  </Divider>

                  <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent="center">
                    {['Gmail', 'Outlook', 'Yahoo', 'iCloud', 'Proton Mail', 'Hotmail', 'AOL', 'Zoho'].map((p) => (
                      <Chip
                        key={p} label={p} size="small"
                        sx={{ fontSize: '0.65rem', height: 20, bgcolor: 'action.hover' }}
                      />
                    ))}
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1.5}>
                    Passwords stored as SHA-256 hashes. No data sent to any server except for OTP delivery.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <AccessEnquiryNotice embedded={false} />
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
