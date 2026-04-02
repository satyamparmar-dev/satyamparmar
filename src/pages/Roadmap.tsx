import React, { useState } from 'react';
import {
  Box, Typography, Chip, Tooltip, Paper, Tabs, Tab, Button,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Track } from '../types';
import { getLevelColor, getTrackColor } from '../utils/formatters';
import LevelBadge from '../components/LevelBadge';
import PrintIcon from '@mui/icons-material/Print';

const trackOptions: (Track | 'All')[] = ['All', 'Fresher', 'Mid-Level', 'Senior'];

const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const { curriculum, loadedPhases, progress, activeTrack, setActiveTrack } = useAppStore();
  const [hovered, setHovered] = useState<number | null>(null);

  if (!curriculum) {
    return (
      <Box py={8} textAlign="center">
        <Typography>Loading roadmap...</Typography>
      </Box>
    );
  }

  const filteredPhases = curriculum.phases.filter(
    (p) => activeTrack === 'All' || p.track === activeTrack
  );

  return (
    <Box className="fade-in">
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>90-Day Roadmap</Typography>
          <Typography color="text.secondary">Visual journey from Fresher to Senior Engineer</Typography>
        </Box>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print
        </Button>
      </Box>

      {/* Legend */}
      <Box display="flex" gap={2} mb={2.5} flexWrap="wrap">
        {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((level) => (
          <Box key={level} display="flex" alignItems="center" gap={0.75}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getLevelColor(level) }} />
            <Typography variant="caption" color="text.secondary">{level}</Typography>
          </Box>
        ))}
        <Box display="flex" alignItems="center" gap={0.75}>
          <CheckCircleIcon sx={{ fontSize: 12, color: '#3FB950' }} />
          <Typography variant="caption" color="text.secondary">Completed</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.75}>
          <PlayCircleIcon sx={{ fontSize: 12, color: '#667eea' }} />
          <Typography variant="caption" color="text.secondary">Current</Typography>
        </Box>
      </Box>

      {/* Track Filter */}
      <Box mb={3}>
        <Tabs
          value={activeTrack}
          onChange={(_, v) => setActiveTrack(v)}
          sx={{
            '& .MuiTab-root': { fontSize: '0.8rem', minWidth: 80 },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        >
          {trackOptions.map((t) => (
            <Tab
              key={t}
              value={t}
              label={t}
              sx={{ color: t !== 'All' ? `${getTrackColor(t)} !important` : undefined }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Phase Sections */}
      {filteredPhases.map((phase) => {
        const [startDay, endDay] = phase.days.split('–').map(Number);
        const levelColor = getLevelColor(phase.level);
        const phaseData = loadedPhases[phase.id];

        return (
          <Box key={phase.id} mb={4}>
            {/* Phase Header */}
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              mb={2}
              pb={1}
              sx={{ borderBottom: `2px solid ${levelColor}30` }}
            >
              <Typography variant="h2" sx={{ fontSize: '2rem' }}>{phase.icon}</Typography>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="h6" fontWeight={800}>
                    Phase {phase.number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ·
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {phase.title.replace(/Phase \d+ · /, '')}
                  </Typography>
                  <LevelBadge level={phase.level} />
                  <Chip
                    label={phase.track}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: getTrackColor(phase.track),
                      bgcolor: `${getTrackColor(phase.track)}18`,
                      borderRadius: '4px',
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Days {phase.days} · {phase.totalTopics} topics
                </Typography>
              </Box>
            </Box>

            {/* Day Tiles */}
            <Box display="flex" flexWrap="wrap" gap={1}>
              {phaseData
                ? (phaseData.days ?? []).map((day) => {
                    const isComplete = progress.completedDays.includes(day.day);
                    const isCurrent = progress.currentDay === day.day;
                    const isHovered = hovered === day.day;
                    const dayLevelColor = getLevelColor(day.level);

                    return (
                      <Tooltip
                        key={day.day}
                        title={
                          <Box>
                            <Typography variant="caption" fontWeight={700} display="block">
                              Day {day.day}: {day.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {day.estimatedHours}h · {day.level}
                            </Typography>
                          </Box>
                        }
                        placement="top"
                        arrow
                      >
                        <Box
                          onClick={() => navigate(`/learn/${day.day}`)}
                          onMouseEnter={() => setHovered(day.day)}
                          onMouseLeave={() => setHovered(null)}
                          sx={{
                            width: { xs: 72, sm: 88 },
                            minHeight: 72,
                            p: 1,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: `1.5px solid`,
                            borderColor: isCurrent
                              ? 'primary.main'
                              : isComplete
                              ? `${dayLevelColor}60`
                              : 'divider',
                            bgcolor: isComplete
                              ? `${dayLevelColor}10`
                              : isCurrent
                              ? 'rgba(102,126,234,0.08)'
                              : isHovered
                              ? 'action.hover'
                              : 'background.paper',
                            transform: isHovered ? 'translateY(-2px)' : 'none',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            position: 'relative',
                          }}
                        >
                          {isComplete && (
                            <CheckCircleIcon
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                fontSize: 12,
                                color: '#3FB950',
                              }}
                            />
                          )}
                          {isCurrent && !isComplete && (
                            <PlayCircleIcon
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                fontSize: 12,
                                color: '#667eea',
                              }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            sx={{ color: dayLevelColor, display: 'block', lineHeight: 1 }}
                          >
                            {day.day}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.6rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mt: 0.25,
                              lineHeight: 1.3,
                            }}
                          >
                            {day.title.split(' ').slice(0, 3).join(' ')}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })
                : Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i).map((dayNum) => {
                    const isComplete = progress.completedDays.includes(dayNum);
                    return (
                      <Box
                        key={dayNum}
                        onClick={() => navigate(`/learn/${dayNum}`)}
                        sx={{
                          width: { xs: 72, sm: 88 },
                          minHeight: 72,
                          p: 1,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '1.5px solid',
                          borderColor: isComplete ? `${levelColor}60` : 'divider',
                          bgcolor: isComplete ? `${levelColor}10` : 'background.paper',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        {isComplete && (
                          <CheckCircleIcon sx={{ fontSize: 12, color: '#3FB950', mb: 0.5 }} />
                        )}
                        <Typography variant="caption" fontWeight={800} sx={{ color: levelColor }}>
                          {dayNum}
                        </Typography>
                      </Box>
                    );
                  })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default Roadmap;
