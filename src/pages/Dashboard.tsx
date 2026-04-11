import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, CardActionArea,
  Button, Chip, LinearProgress, Tabs, Tab, Avatar, Paper,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { useAppStore, selectCompletionRate } from '../store/useAppStore';
import { fetchCurriculum, fetchPhaseWithCache } from '../services/api';
import { Track } from '../types';
import { getGreeting, getStreakMessage, getLevelColor, getTrackColor, formatHours } from '../utils/formatters';
import KPICard from '../components/KPICard';
import LevelBadge from '../components/LevelBadge';
import TrackBanner from '../components/TrackBanner';
import LoadingSpinner from '../components/LoadingSpinner';

const trackOptions: (Track | 'All')[] = ['All', 'Fresher', 'Mid-Level', 'Senior'];

// Build last 4 weeks study chart data
const buildChartData = (completedDays: number[]) => {
  return Array.from({ length: 28 }, (_, i) => {
    const date = subDays(new Date(), 27 - i);
    const label = format(date, 'MMM d');
    // Simulate study activity based on completedDays count
    const activity = completedDays.length > i ? Math.floor(Math.random() * 3) + 1 : 0;
    return { label, days: activity };
  });
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    curriculum, setCurriculum, loadPhase, loadedPhases,
    progress, activeTrack, setActiveTrack, theme,
  } = useAppStore();
  const completionRate = useAppStore(selectCompletionRate);
  const [loading, setLoading] = useState(!curriculum);
  const [chartData] = useState(() => buildChartData(progress.completedDays));

  // Load curriculum
  useEffect(() => {
    if (curriculum) { setLoading(false); return; }
    fetchCurriculum()
      .then((c) => {
        setCurriculum(c);
        setLoading(false);
        // Preload first few phases
        c.phases.slice(0, 3).forEach((p) =>
          fetchPhaseWithCache(p.file).then((d) => loadPhase(p.id, d))
        );
      })
      .catch(() => setLoading(false));
  }, []);

  // Load visible phases
  useEffect(() => {
    if (!curriculum) return;
    curriculum.phases.forEach((p) => {
      if (!loadedPhases[p.id]) {
        fetchPhaseWithCache(p.file).then((d) => loadPhase(p.id, d));
      }
    });
  }, [curriculum]);

  if (loading) return <LoadingSpinner message="Loading curriculum..." fullPage />;
  if (!curriculum) return null;

  const filteredPhases = curriculum.phases.filter(
    (p) => activeTrack === 'All' || p.track === activeTrack
  );

  const currentPhase = curriculum.phases.find((p) => {
    const [start, end] = p.days.split('–').map(Number);
    return progress.currentDay >= start && progress.currentDay <= end;
  });

  const nextDays = Array.from({ length: 3 }, (_, i) => progress.currentDay + i)
    .filter((d) => d <= curriculum.totalDays);

  const kpis = [
    {
      id: 'completed', label: 'Days Completed', value: progress.completedDays.length,
      change: 3, trend: 'up' as const, icon: '✅', color: '#3FB950',
    },
    {
      id: 'streak', label: 'Current Streak', value: `${progress.streak} 🔥`,
      change: progress.streak > 0 ? 1 : 0, trend: progress.streak > 0 ? 'up' as const : 'neutral' as const,
      icon: '🔥', color: '#D29922',
    },
    {
      id: 'hours', label: 'Hours Invested', value: formatHours(progress.totalHours),
      change: 2, trend: 'up' as const, icon: '⏱️', color: '#58A6FF',
    },
    {
      id: 'progress', label: 'Overall Progress', value: `${completionRate}%`,
      change: completionRate, trend: completionRate > 50 ? 'up' as const : 'neutral' as const,
      icon: '📈', color: '#764ba2',
    },
  ];

  const recentActivity = (progress.completedDays ?? [])
    .slice(-5)
    .reverse()
    .map((day) => {
      const phaseData = Object.values(loadedPhases).find((p) =>
        p?.days?.some((d) => d.day === day)
      );
      const dayData = phaseData?.days?.find((d) => d.day === day);
      return { day, title: dayData?.title ?? `Day ${day}` };
    });

  return (
    <Box className="fade-in">
      {/* Greeting */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {getGreeting()}, learner! 👋
        </Typography>
        <Typography color="text.secondary">
          {getStreakMessage(progress.streak)} · Day {progress.currentDay} of {curriculum.totalDays}
        </Typography>
      </Box>

      {/* Track Selector */}
      <Box mb={3}>
        <Tabs
          value={activeTrack}
          onChange={(_, v) => setActiveTrack(v)}
          sx={{
            '& .MuiTab-root': { fontSize: '0.8rem', minWidth: 80, py: 0.75 },
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
              sx={{
                color: t !== 'All' ? `${getTrackColor(t)} !important` : undefined,
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} mb={3}>
        {kpis.map((kpi) => (
          <Grid item xs={6} md={3} key={kpi.id}>
            <KPICard kpi={kpi} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Study Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Study Activity
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Last 28 days
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#30363D' : '#E8ECEF'} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#8B949E' }}
                    interval={6}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: theme === 'dark' ? '#161B22' : '#fff',
                      border: '1px solid #30363D',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="days"
                    stroke="#667eea"
                    strokeWidth={2}
                    fill="url(#studyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Continue Learning */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Continue Learning
              </Typography>
              {currentPhase && (
                <Box mb={2}>
                  <TrackBanner track={currentPhase.track} compact />
                  <Box mt={1.5}>
                    <Typography variant="caption" color="text.secondary">
                      Phase {currentPhase.number}: {currentPhase.title.replace(/Phase \d+ · /, '')}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress.phaseProgress[currentPhase.id] ?? 0}
                      sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
              )}
              <Button
                variant="contained"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(`/learn/${progress.currentDay}`)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 700,
                  py: 1.25,
                  mb: 1.5,
                }}
              >
                Day {progress.currentDay}: Continue
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<RecordVoiceOverIcon />}
                onClick={() => navigate(`/scenarios?day=${progress.currentDay}`)}
                sx={{ fontWeight: 600, py: 1, mb: 1.5 }}
              >
                Scenario interview drill
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AutoAwesomeIcon />}
                onClick={() => navigate('/llm')}
                sx={{ fontWeight: 600, py: 1, mb: 1.5 }}
              >
                LLM &amp; GenAI overview
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MenuBookIcon />}
                onClick={() => navigate('/blog')}
                sx={{ fontWeight: 600, py: 1, mb: 1.5 }}
              >
                Topics &amp; blog
              </Button>

              {/* Recent Activity */}
              {recentActivity.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                    Recent completions
                  </Typography>
                  {recentActivity.map(({ day, title }) => (
                    <Box
                      key={day}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      py={0.5}
                      onClick={() => navigate(`/learn/${day}`)}
                      sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#3FB950' }} />
                      <Typography variant="caption" color="text.secondary">
                        Day {day}: {title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Phase Grid */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Learning Phases
          </Typography>
          <Grid container spacing={2}>
            {filteredPhases.map((phase) => {
              const [startDay, endDay] = phase.days.split('–').map(Number);
              const phaseDays = endDay - startDay + 1;
              const phaseComplete = progress.completedDays.filter(
                (d) => d >= startDay && d <= endDay
              ).length;
              const pct = Math.round((phaseComplete / phaseDays) * 100);
              const levelColor = getLevelColor(phase.level);
              const isCurrent = progress.currentDay >= startDay && progress.currentDay <= endDay;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={phase.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: isCurrent ? `2px solid ${levelColor}40` : undefined,
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                    onClick={() => navigate(`/learn/${startDay}`)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Typography variant="h2" sx={{ fontSize: '2rem', lineHeight: 1 }}>
                          {phase.icon}
                        </Typography>
                        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                          <LevelBadge level={phase.level} />
                          {isCurrent && (
                            <Chip
                              label="Current"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.6rem',
                                bgcolor: `${levelColor}18`,
                                color: levelColor,
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                        Phase {phase.number} · Days {phase.days}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} mb={1.5} lineHeight={1.4}>
                        {phase.title.replace(/Phase \d+ · /, '')}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {phaseComplete}/{phaseDays} days
                        </Typography>
                        <Typography variant="caption" fontWeight={700} sx={{ color: levelColor }}>
                          {pct}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': { bgcolor: levelColor },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Upcoming Days */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Up Next
          </Typography>
          <Grid container spacing={2}>
            {nextDays.map((dayNum) => {
              const phaseData = Object.values(loadedPhases).find((p) =>
                p?.days?.some((d) => d.day === dayNum)
              );
              const dayData = phaseData?.days?.find((d) => d.day === dayNum);
              const phase = curriculum.phases.find((p) => {
                const [s, e] = p.days.split('–').map(Number);
                return dayNum >= s && dayNum <= e;
              });

              return (
                <Grid item xs={12} md={4} key={dayNum}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/learn/${dayNum}`)}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={`Day ${dayNum}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(102,126,234,0.12)',
                            color: 'primary.main',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                          }}
                        />
                        {dayData && <LevelBadge level={dayData.level} />}
                        {phase && (
                          <TrackBanner track={phase.track} compact />
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={700} mb={0.5}>
                        {dayData?.title ?? `Day ${dayNum}`}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {dayData?.estimatedHours ?? 2}h estimated
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
