import React from 'react';
import { Box, Typography, Button, Paper, alpha, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const accent = theme.palette.mode === 'dark' ? '#a5b4fc' : '#667eea';

  usePageTitle('404 — Page Not Found');

  return (
    <Box
      className="fade-in"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          maxWidth: 480,
          width: '100%',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(accent, 0.08)} 0%, transparent 100%)`
              : `linear-gradient(135deg, ${alpha(accent, 0.06)} 0%, transparent 100%)`,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: alpha(accent, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <SearchOffIcon sx={{ fontSize: 36, color: accent }} />
        </Box>

        <Typography
          variant="h1"
          fontWeight={900}
          sx={{
            fontSize: { xs: '4rem', sm: '5rem' },
            lineHeight: 1,
            color: accent,
            letterSpacing: '-0.04em',
            mb: 1,
          }}
        >
          404
        </Typography>

        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.01em' }}>
          Page not found
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mb: 4, lineHeight: 1.75, fontSize: '0.95rem' }}
        >
          The page you're looking for doesn't exist or may have been moved.
          Check the URL or head back to the dashboard.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{
              bgcolor: accent,
              '&:hover': { bgcolor: accent, filter: 'brightness(0.9)' },
              fontWeight: 600,
              px: 3,
            }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ fontWeight: 600, px: 3, borderColor: 'divider' }}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
