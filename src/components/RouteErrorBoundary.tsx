import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[RouteErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {this.props.fallbackMessage || 'This page failed to load'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message}
          </Typography>
          <Button variant="outlined" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
          <Button variant="text" onClick={() => window.location.reload()} sx={{ ml: 1 }}>
            Reload page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
