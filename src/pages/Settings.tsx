import React, { useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Switch, FormControlLabel,
  Button, Divider, Alert, Grid, Chip, Paper,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/ToastProvider';
import { AppProgress } from '../types';
import { APP_DISPLAY_NAME } from '../constants/branding';

const Settings: React.FC = () => {
  const { theme, toggleTheme, progress, exportProgress, importProgress, resetProgress, curriculum } = useAppStore();
  const { showSuccess, showError, showWarning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data: AppProgress = JSON.parse(ev.target?.result as string);
        if (!data.completedDays || !Array.isArray(data.completedDays)) {
          showError('Invalid progress file format');
          return;
        }
        importProgress(data);
        showSuccess('Progress imported successfully!');
      } catch {
        showError('Failed to parse progress file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    resetProgress();
    setShowResetConfirm(false);
    showWarning('Progress has been reset');
  };

  const shortcuts = [
    { key: '← →', action: 'Navigate between days' },
    { key: 'M', action: 'Mark day complete' },
    { key: 'B', action: 'Toggle bookmark' },
    { key: 'Ctrl+K', action: 'Open search' },
    { key: 'Q', action: 'Open quiz (from lesson)' },
    { key: '1–8', action: 'Jump to section tab' },
  ];

  return (
    <Box className="fade-in">
      <Typography variant="h4" fontWeight={800} mb={0.5}>
        Settings
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Customize your learning experience
      </Typography>

      <Grid container spacing={3}>
        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Appearance
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                py={1}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  {theme === 'dark' ? (
                    <DarkModeIcon sx={{ color: 'primary.main' }} />
                  ) : (
                    <LightModeIcon sx={{ color: '#D29922' }} />
                  )}
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Currently using {theme} theme
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  color="primary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Progress Data
              </Typography>
              <Box display="flex" gap={1.5} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => { exportProgress(); showSuccess('Progress exported!'); }}
                  size="small"
                >
                  Export JSON
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  size="small"
                >
                  Import JSON
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              {showResetConfirm && (
                <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
                  This will delete ALL progress. Are you sure?
                </Alert>
              )}
              <Button
                variant={showResetConfirm ? 'contained' : 'outlined'}
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={handleReset}
                size="small"
                fullWidth
              >
                {showResetConfirm ? 'CONFIRM: Reset All Progress' : 'Reset Progress'}
              </Button>
              {showResetConfirm && (
                <Button
                  fullWidth
                  size="small"
                  onClick={() => setShowResetConfirm(false)}
                  sx={{ mt: 1 }}
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Keyboard Shortcuts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Keyboard Shortcuts
              </Typography>
              <Box>
                {shortcuts.map(({ key, action }) => (
                  <Box key={key} display="flex" justifyContent="space-between" py={0.75}>
                    <Typography variant="body2" color="text.secondary">
                      {action}
                    </Typography>
                    <Box
                      component="kbd"
                      sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        border: '1px solid',
                        borderColor: 'divider',
                        fontWeight: 600,
                      }}
                    >
                      {key}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Curriculum Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Curriculum Info
              </Typography>
              {curriculum && (
                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {curriculum.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                    {curriculum.subtitle}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.75}>
                    <Chip
                      label={`${curriculum.totalDays} Days`}
                      size="small"
                      sx={{ bgcolor: 'rgba(102,126,234,0.1)', color: 'primary.main', fontWeight: 600 }}
                    />
                    <Chip
                      label={`${curriculum.phases.length} Phases`}
                      size="small"
                      sx={{ bgcolor: 'rgba(63,185,80,0.1)', color: '#3FB950', fontWeight: 600 }}
                    />
                    <Chip
                      label={`${curriculum.hoursPerDay}h/day`}
                      size="small"
                      sx={{ bgcolor: 'rgba(88,166,255,0.1)', color: '#58A6FF', fontWeight: 600 }}
                    />
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  {curriculum.tracks.map((track) => (
                    <Box key={track.id} display="flex" justifyContent="space-between" py={0.5}>
                      <Typography variant="caption" fontWeight={600} sx={{ color: track.color }}>
                        {track.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Days {track.days}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Your Stats
              </Typography>
              {[
                { label: 'Days Completed', value: progress.completedDays.length },
                { label: 'Current Streak', value: `${progress.streak} days` },
                { label: 'Bookmarks', value: progress.bookmarks.length },
                { label: 'Days with Notes', value: Object.values(progress.notes).filter(Boolean).length },
                { label: 'Quiz Sessions', value: Object.keys(progress.quizScores).length },
                { label: 'Exercises Solved', value: progress.exercisesSolved.length },
              ].map(({ label, value }) => (
                <Box key={label} display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* About */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={900} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {APP_DISPLAY_NAME}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              90 Days · Fresher to Senior Engineer · Fully Offline SPA
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Built with React 18, TypeScript, Material UI v5, Zustand, Recharts
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
