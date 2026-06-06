import React, { useEffect } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useAppStore } from '../store/useAppStore';
import Header from './Header';
import Sidebar from './Sidebar';
import SearchModal from '../components/SearchModal';
import { fetchCurriculum } from '../services/api';
import { AI_CURRICULUM_COMING_SOON } from '../config/comingSoon';

const DRAWER_WIDTH = 280;

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen, curriculum, activeCurriculum, setCurriculum, setActiveCurriculum } = useAppStore();
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

  useEffect(() => {
    if (AI_CURRICULUM_COMING_SOON && activeCurriculum === 'ai') {
      setActiveCurriculum('java');
    }
  }, [activeCurriculum, setActiveCurriculum]);

  useEffect(() => {
    if (curriculum) return;
    fetchCurriculum(activeCurriculum)
      .then((c) => setCurriculum(c))
      .catch(() => undefined);
  }, [curriculum, activeCurriculum, setCurriculum]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Skip navigation — visible only on keyboard focus */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
          zIndex: 9999,
          '&:focus': {
            position: 'fixed',
            top: 12,
            left: 12,
            width: 'auto',
            height: 'auto',
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            border: '2px solid',
            borderColor: 'primary.main',
            borderRadius: 1,
            fontWeight: 700,
            fontSize: '0.875rem',
            color: 'text.primary',
            textDecoration: 'none',
          },
        }}
      >
        Skip to main content
      </Box>

      <Header onMenuToggle={handleMenuToggle} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        component="main"
        id="main-content"
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
