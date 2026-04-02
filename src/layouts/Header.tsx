import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../auth/useAuthStore';
import { APP_DISPLAY_NAME } from '../constants/branding';

const DRAWER_WIDTH = 280;

interface Props {
  onMenuToggle: () => void;
}

const Header: React.FC<Props> = ({ onMenuToggle }) => {
  const { theme, toggleTheme, setSearchOpen, progress, sidebarOpen } = useAppStore();
  const { currentUser, logout } = useAuthStore();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
        ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
        transition: 'width 0.3s ease, margin-left 0.3s ease',
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: '56px !important', px: { xs: 1.5, sm: 2 } }}>
        {/* Menu Toggle */}
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 1.5, color: 'text.secondary' }}
          size="small"
        >
          <MenuIcon />
        </IconButton>

        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1} mr={2}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.75rem' }}>
              S
            </Typography>
          </Box>
          {!isMobile && (
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
              {APP_DISPLAY_NAME}
            </Typography>
          )}
        </Box>

        <Box flex={1} />

        {/* Streak */}
        {progress.streak > 0 && (
          <Tooltip title={`${progress.streak} day streak!`}>
            <Box
              display="flex"
              alignItems="center"
              gap={0.5}
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: 'rgba(216,140,3,0.12)',
                borderRadius: '20px',
                mr: 1,
                cursor: 'default',
              }}
            >
              <LocalFireDepartmentIcon sx={{ fontSize: 16, color: '#D29922' }} />
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: '#D29922' }}
              >
                {progress.streak}
              </Typography>
            </Box>
          </Tooltip>
        )}

        {/* Search */}
        <Tooltip title="Search (Ctrl+K)">
          <IconButton
            size="small"
            onClick={() => setSearchOpen(true)}
            sx={{ color: 'text.secondary', mr: 0.5 }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          <IconButton
            size="small"
            onClick={toggleTheme}
            sx={{ color: 'text.secondary', mr: 0.5 }}
          >
            {theme === 'dark' ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* User Avatar + Menu */}
        {currentUser && (
          <>
            <Tooltip title={currentUser.displayName}>
              <Avatar
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  cursor: 'pointer',
                  ml: 0.5,
                  border: '2px solid transparent',
                  '&:hover': { borderColor: '#667eea' },
                  transition: 'border-color 0.2s',
                }}
              >
                {currentUser.displayName
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? '')
                  .join('')}
              </Avatar>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  elevation: 4,
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  {currentUser.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {currentUser.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => { setAnchorEl(null); }}
                dense
                sx={{ mt: 0.5 }}
              >
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => { setAnchorEl(null); logout(); }}
                dense
                sx={{ color: 'error.main', mb: 0.5 }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <Typography variant="body2">Sign Out</Typography>
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
