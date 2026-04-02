import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  InputAdornment,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SchoolIcon from '@mui/icons-material/School';
import { APP_DISPLAY_NAME } from '../constants/branding';
import {
  checkRateLimit,
  getRemainingAttempts,
  recordFailedAttempt,
  clearFailedAttempts,
} from '../auth/authUtils';
import { useAllowlistGateStore } from '../auth/useAllowlistGateStore';

interface Props {
  allowedSet: Set<string>;
  loadError: string | null;
  onRetry: () => void;
}

const EmailGatePage: React.FC<Props> = ({ allowedSet, loadError, onRetry }) => {
  const setGateEmail = useAllowlistGateStore((s) => s.setGateEmail);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  useEffect(() => {
    if (email) setRemainingAttempts(getRemainingAttempts(email));
  }, [email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loadError) {
      setError('Access list is unavailable. Use Retry or try again later.');
      return;
    }

    const key = email.trim().toLowerCase();
    if (!key) {
      setError('Enter your email address.');
      return;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(key)) {
      setError('Enter a valid email address.');
      return;
    }

    const { allowed, remainingMs } = checkRateLimit(key);
    if (!allowed) {
      const mins = Math.ceil(remainingMs / 60000);
      setError(`Too many attempts. Try again in ${mins} min.`);
      return;
    }

    if (!allowedSet.has(key)) {
      recordFailedAttempt(key);
      setRemainingAttempts(getRemainingAttempts(key));
      setError('This email is not authorized to access the app.');
      return;
    }

    clearFailedAttempts(key);
    setGateEmail(key);
  };

  const blockSubmit = !!loadError;

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
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box textAlign="center" mb={3}>
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
            Enter your authorized email to continue
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {loadError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={onRetry}>
                  Retry
                </Button>
              }
            >
              {loadError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={blockSubmit}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={blockSubmit}
              sx={{
                py: 1.25,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                },
              }}
            >
              Continue
            </Button>

            {email && remainingAttempts < 5 && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                textAlign="center"
                mt={1}
              >
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default EmailGatePage;
