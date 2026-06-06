import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { EMAIL_ALLOWLIST_GATE_ENABLED, AUTH_LOGIN_ENABLED } from '../auth/authConfig';

interface Props {
  /** Short line under the title */
  message?: string;
  sx?: object;
}

/**
 * Shown when full lesson content, solutions, or answers require sign-in.
 */
const SignInToContinueCallout: React.FC<Props> = ({
  message = 'Sign in with your authorized email to view the full article, solutions, and detailed answers.',
  sx = {},
}) => {
  const navigate = useNavigate();
  const loc = useLocation();

  if (!EMAIL_ALLOWLIST_GATE_ENABLED && !AUTH_LOGIN_ENABLED) {
    return null;
  }

  const go = () => {
    navigate('/login', {
      state: { from: `${loc.pathname}${loc.search}` || '/' },
    });
  };

  const label =
    EMAIL_ALLOWLIST_GATE_ENABLED ? 'Sign in to continue' : 'Sign in / Register';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'primary.main',
        bgcolor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(102,126,234,0.08)' : 'rgba(102,126,234,0.06)',
        ...sx,
      }}
    >
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} gap={2}>
        <LockOutlinedIcon color="primary" sx={{ fontSize: 28, flexShrink: 0 }} />
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Full content is available to signed-in learners
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
            {message}
          </Typography>
        </Box>
        <Button variant="contained" onClick={go} sx={{ flexShrink: 0, fontWeight: 700 }}>
          {label}
        </Button>
      </Box>
    </Paper>
  );
};

export default SignInToContinueCallout;
