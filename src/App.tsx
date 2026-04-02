import React, { useMemo } from 'react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAppStore } from './store/useAppStore';
import { createAppTheme } from './theme/theme';
import { ToastProvider } from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes';
import AuthGuard from './auth/AuthGuard';

// Import atom-one-dark theme for highlight.js
import 'highlight.js/styles/atom-one-dark.css';

const App: React.FC = () => {
  const { theme } = useAppStore();
  const muiTheme = useMemo(() => createAppTheme(theme), [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ToastProvider>
        <ErrorBoundary>
          <AuthGuard>
            <HashRouter>
              <MainLayout>
                <AppRoutes />
              </MainLayout>
            </HashRouter>
          </AuthGuard>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
