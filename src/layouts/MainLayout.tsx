import React, { useEffect } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useAppStore } from '../store/useAppStore';
import Header from './Header';
import Sidebar from './Sidebar';
import SearchModal from '../components/SearchModal';

const DRAWER_WIDTH = 280;

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        useAppStore.getState().setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onMenuToggle={handleMenuToggle} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          },
          transition: 'margin-left 0.3s ease, width 0.3s ease',
          ml: {
            md: sidebarOpen ? 0 : 0,
          },
          minWidth: 0,
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }} />
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: 1400,
            mx: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>

      <SearchModal />
    </Box>
  );
};

export default MainLayout;
