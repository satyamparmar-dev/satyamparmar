import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  LinearProgress,
  Collapse,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import QuizIcon from '@mui/icons-material/Quiz';
import MapIcon from '@mui/icons-material/Map';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SettingsIcon from '@mui/icons-material/Settings';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore, selectCompletionRate } from '../store/useAppStore';
import { getLevelColor } from '../utils/formatters';
import { APP_DISPLAY_NAME } from '../constants/branding';

const DRAWER_WIDTH = 280;

const navItems = [
  { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
  { path: '/progress', icon: <BarChartIcon />, label: 'Progress' },
  { path: '/scenarios', icon: <RecordVoiceOverIcon />, label: 'Scenarios' },
  { path: '/llm', icon: <AutoAwesomeIcon />, label: 'LLM & GenAI' },
  { path: '/blog', icon: <MenuBookIcon />, label: 'Topics & blog' },
  { path: '/roadmap', icon: <MapIcon />, label: 'Roadmap' },
  { path: '/quiz', icon: <QuizIcon />, label: 'Quiz' },
  { path: '/bookmarks', icon: <BookmarkIcon />, label: 'Bookmarks' },
  { path: '/settings', icon: <SettingsIcon />, label: 'Settings' },
];

const proNavItem = { path: '/pro', icon: <WorkspacePremiumIcon />, label: 'Pro Track' };

interface Props {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const { curriculum, loadedPhases, progress } = useAppStore();
  const completionRate = useAppStore(selectCompletionRate);

  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const drawerContent = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Typography variant="h6" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.02em' }}>
          {APP_DISPLAY_NAME}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Java · Fresher to Senior
        </Typography>
        <Box mt={1.5}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Overall Progress
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ color: '#fff' }}>
              {completionRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.25)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#fff',
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, display: 'block' }}>
            {progress.completedDays.length} / {curriculum?.totalDays ?? 90} days
          </Typography>
        </Box>
      </Box>

      {/* Nav Items */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        <List disablePadding dense>
          {navItems.map((item) => {
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <ListItem disablePadding key={item.path} sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => handleNav(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 0.75,
                    px: 1.5,
                    bgcolor: active ? 'rgba(102,126,234,0.12)' : 'transparent',
                    color: active ? 'primary.main' : 'text.secondary',
                    '&:hover': {
                      bgcolor: active
                        ? 'rgba(102,126,234,0.18)'
                        : 'action.hover',
                      color: active ? 'primary.main' : 'text.primary',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: 'inherit',
                      '& svg': { fontSize: 20 },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: active ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 1.5, my: 0.5 }} />
      <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
        <Typography
          variant="overline"
          sx={{
            color: '#6366f1',
            px: 1,
            display: 'block',
            mb: 0.5,
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}
        >
          Pro Track — AI/ML
        </Typography>
        <List disablePadding>
          {(() => {
            const isActive = location.pathname.startsWith(proNavItem.path);
            return (
              <ListItem disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => handleNav(proNavItem.path)}
                  sx={{
                    borderRadius: 2,
                    py: 0.75,
                    px: 1.5,
                    bgcolor: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: isActive ? '#6366f1' : 'text.secondary',
                    '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& svg': { fontSize: 20 } }}>
                    <WorkspacePremiumIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Pro Track"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 700 : 500 }}
                  />
                  <Chip
                    label="NEW"
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.55rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      color: '#6366f1',
                      bgcolor: 'rgba(99,102,241,0.15)',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })()}
        </List>
      </Box>

      <Divider />

      {/* Phase List */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, py: 1 }}>
        <Typography
          variant="overline"
          color="text.disabled"
          sx={{ px: 1, display: 'block', mb: 0.5 }}
        >
          Phases
        </Typography>
        <List disablePadding dense>
          {curriculum?.phases?.map((phase) => {
            const [startDay, endDay] = phase.days.split('–').map(Number);
            const phaseDays = endDay - startDay + 1;
            const phaseComplete = (progress.completedDays ?? []).filter(
              (d) => d >= startDay && d <= endDay
            ).length;
            const pct = Math.round((phaseComplete / phaseDays) * 100);
            const levelColor = getLevelColor(phase.level);
            const isExpanded = expandedPhase === phase.id;

            const phaseData = loadedPhases[phase.id];

            return (
              <React.Fragment key={phase.id}>
                <ListItem disablePadding sx={{ mb: 0.25 }}>
                  <ListItemButton
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                    sx={{ borderRadius: 2, py: 0.75, px: 1 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: levelColor,
                        mr: 1.5,
                        flexShrink: 0,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={0.75}>
                          <Typography variant="caption" fontWeight={600} color="text.primary">
                            P{phase.number}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 140,
                            }}
                          >
                            {phase.title.replace(/Phase \d+ · /, '')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 3,
                            mt: 0.5,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { bgcolor: levelColor },
                          }}
                        />
                      }
                    />
                    <Chip
                      label={`${pct}%`}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        ml: 0.5,
                        color: levelColor,
                        bgcolor: `${levelColor}18`,
                        borderRadius: '4px',
                      }}
                    />
                    {isExpanded ? (
                      <ExpandLessIcon sx={{ fontSize: 14, ml: 0.5, color: 'text.disabled' }} />
                    ) : (
                      <ExpandMoreIcon sx={{ fontSize: 14, ml: 0.5, color: 'text.disabled' }} />
                    )}
                  </ListItemButton>
                </ListItem>

                <Collapse in={isExpanded && !!phaseData}>
                  <List disablePadding>
                    {phaseData?.days?.map((day) => {
                      const isComplete = (progress.completedDays ?? []).includes(day.day);
                      const isCurrent = progress.currentDay === day.day;
                      return (
                        <ListItem key={day.day} disablePadding>
                          <ListItemButton
                            onClick={() => { navigate(`/learn/${day.day}`); if (isMobile) onClose(); }}
                            sx={{
                              py: 0.5,
                              pl: 4,
                              borderRadius: 1.5,
                              bgcolor: isCurrent ? 'rgba(102,126,234,0.08)' : 'transparent',
                            }}
                          >
                            {isComplete ? (
                              <CheckCircleIcon
                                sx={{ fontSize: 14, color: '#3FB950', mr: 1 }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  border: '1.5px solid',
                                  borderColor: isCurrent ? 'primary.main' : 'text.disabled',
                                  mr: 1,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <Typography
                              variant="caption"
                              color={isCurrent ? 'primary.main' : isComplete ? 'text.secondary' : 'text.secondary'}
                              fontWeight={isCurrent ? 700 : 400}
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Day {day.day}: {day.title}
                            </Typography>
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.disabled" display="block" textAlign="center">
          {APP_DISPLAY_NAME} v1.0 · 90 Days to Senior
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open && isMobile}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
          width: open ? DRAWER_WIDTH : 0,
          transition: 'width 0.3s ease',
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
