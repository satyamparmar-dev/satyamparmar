import React, { useMemo, Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAppStore } from './store/useAppStore';
import { createAppTheme } from './theme/theme';
import { ToastProvider } from './components/ToastProvider';
import StorageDecryptToastListener from './components/StorageDecryptToastListener';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes';
import LoadingSpinner from './components/LoadingSpinner';
import AuthGuard from './auth/AuthGuard';
import { ContentAccessProvider } from './auth/ContentAccessContext';
import ContentProtection from './components/ContentProtection';

// Import atom-one-dark theme for highlight.js
import 'highlight.js/styles/atom-one-dark.css';

const App: React.FC = () => {
  const { theme } = useAppStore();
  const muiTheme = useMemo(() => createAppTheme(theme), [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ToastProvider>
        <StorageDecryptToastListener />
        <ErrorBoundary>
          <ContentProtection>
            <ContentAccessProvider>
              <AuthGuard>
                <HashRouter>
                  <MainLayout>
                    <Suspense fallback={<LoadingSpinner message="Loading…" />}>
                      <AppRoutes />
                    </Suspense>
                  </MainLayout>
                </HashRouter>
              </AuthGuard>
            </ContentAccessProvider>
          </ContentProtection>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
