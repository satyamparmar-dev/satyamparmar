import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight={300}
          p={3}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 480,
              border: '1px solid',
              borderColor: 'error.main',
              borderRadius: 3,
            }}
          >
            <ErrorOutlineIcon
              sx={{ fontSize: 56, color: 'error.main', mb: 2 }}
            />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Something went wrong
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, fontFamily: 'monospace', fontSize: '0.8rem' }}
            >
              {this.state.error?.message ?? 'Unknown error'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
