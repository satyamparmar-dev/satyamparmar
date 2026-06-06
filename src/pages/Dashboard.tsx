import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Grid, Typography, Card, CardContent,
  Button, Chip, LinearProgress, Tabs, Tab,
  alpha, CircularProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import CheckIcon from '@mui/icons-material/Check';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/useAuthStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { getCourseDef } from '../config/courses';
import { useAccessibleCourseIds } from '../hooks/useCourseAccess';
import {
  getCompletedLessons as getJavaCompletedLessons,
  getTotalLessons as getJavaTotalLessons,
} from '../content/javaCourse/courseData';
import {
  getCompletedLessons as getKafkaCompletedLessons,
  getTotalLessons as getKafkaTotalLessons,
} from '../content/kafkaCourse/courseData';
import {
  getCompletedLessons as getClaudeCompletedLessons,
  getTotalLessons as getClaudeTotalLessons,
} from '../content/claudeCourse/courseData';
import {
  getCompletedLessons as getPromptEngineeringCompletedLessons,
  getTotalLessons as getPromptEngineeringTotalLessons,
} from '../content/promptEngineeringCourse/courseData';
import { format, subDays } from 'date-fns';
import { useAppStore, selectCompletionRate } from '../store/useAppStore';
import { fetchCurriculum, fetchPhaseWithCache } from '../services/api';
import { CurriculumId, Track } from '../types';
import { getGreeting, getStreakMessage, getLevelColor, getTrackColor, formatHours } from '../utils/formatters';
import KPICard from '../components/KPICard';
import LevelBadge from '../components/LevelBadge';
import TrackBanner from '../components/TrackBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import { usePageTitle } from '../hooks/usePageTitle';
import { AI_CURRICULUM_COMING_SOON } from '../config/comingSoon';

const trackOptions: (Track | 'All')[] = ['All', 'Fresher', 'Mid-Level', 'Senior'];

// ─── Curriculum Switcher Card ─────────────────────────────────────────────────
const CURRICULUM_OPTIONS = [
  {
    id: 'java' as CurriculumId,
    icon: <CodeIcon sx={{ fontSize: 28 }} />,
    label: 'Java Track',
    subtitle: '90-Day Java Engineer Path',
    description: 'Fresher → Mid-Level → Senior',
    tags: ['Spring Boot', 'Kafka', 'System Design'],
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    accentColor: '#f59e0b',
    days: 90,
  },
  {
    id: 'ai' as CurriculumId,
    icon: <SmartToyIcon sx={{ fontSize: 28 }} />,
    label: 'AI / GenAI Track',
    subtitle: '90-Day AI Engineer Path',
    description: 'Beginner → Developer → Expert',
    tags: ['LLMs', 'Agents', 'RAG', 'MCP'],
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    accentColor: '#6366f1',
    days: 90,
    comingSoon: AI_CURRICULUM_COMING_SOON,
  },
];

interface CurriculumSwitcherProps {
  active: CurriculumId;
  onSwitch: (id: CurriculumId) => void;
}

const CurriculumSwitcher: React.FC<CurriculumSwitcherProps> = ({ active, onSwitch }) => (
  <Box mb={3}>
    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={1}>
      Choose Your Curriculum
    </Typography>
    <Grid container spacing={2}>
      {CURRICULUM_OPTIONS.map((opt) => {
        const isActive = active === opt.id;
        const isDisabled = opt.comingSoon === true;
        return (
          <Grid item xs={12} sm={6} key={opt.id}>
            <Box
              onClick={() => {
                if (!isDisabled) onSwitch(opt.id);
              }}
              sx={{
                position: 'relative',
                borderRadius: 2.5,
                border: '2px solid',
                borderColor: isActive ? opt.accentColor : 'divider',
                background: isActive
                  ? alpha(opt.accentColor, 0.06)
                  : 'background.paper',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.72 : 1,
                p: 2,
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                '&:hover': isDisabled
                  ? {}
                  : {
                      borderColor: opt.accentColor,
                      background: alpha(opt.accentColor, 0.04),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${alpha(opt.accentColor, 0.18)}`,
                    },
              }}
            >
              {/* Active stripe accent at top */}
              {isActive && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: 3,
                    background: opt.gradient,
                    borderRadius: '8px 8px 0 0',
                  }}
                />
              )}

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                {/* Icon bubble */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: isActive ? opt.gradient : alpha(opt.accentColor, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#fff' : opt.accentColor,
                    flexShrink: 0,
                  }}
                >
                  {opt.icon}
                </Box>

                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.25}>
                    <Typography variant="body2" fontWeight={800} color="text.primary">
                      {opt.label}
                    </Typography>
                    {isActive && (
                      <Chip
                        icon={<CheckIcon sx={{ fontSize: '11px !important' }} />}
                        label="Active"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          bgcolor: alpha(opt.accentColor, 0.15),
                          color: opt.accentColor,
                          borderRadius: '6px',
                          '& .MuiChip-icon': { color: opt.accentColor, ml: '4px' },
                        }}
                      />
                    )}
                    {isDisabled && (
                      <Chip
                        label="Coming Soon"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          bgcolor: 'action.hover',
                          color: 'text.disabled',
                          borderRadius: '6px',
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
                    {opt.subtitle} · {opt.days} days
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {opt.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.55rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          bgcolor: alpha(opt.accentColor, 0.08),
                          color: isActive ? opt.accentColor : 'text.secondary',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Switch CTA — shown only on inactive card */}
              {!isActive && !isDisabled && (
                <Box mt={1.5} display="flex" justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => { e.stopPropagation(); onSwitch(opt.id); }}
                    sx={{
                      fontSize: '0.7rem',
                      py: 0.35,
                      px: 1.25,
                      borderColor: opt.accentColor,
                      color: opt.accentColor,
                      fontWeight: 700,
                      borderRadius: '8px',
                      '&:hover': {
                        bgcolor: alpha(opt.accentColor, 0.08),
                        borderColor: opt.accentColor,
                      },
                    }}
                  >
                    Switch →
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);

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

function getPaidCourseProgressPercent(courseId: string): number | null {
  if (courseId === 'java-modern') {
    const done = getJavaCompletedLessons().size;
    const total = getJavaTotalLessons();
    return total > 0 ? Math.round((done / total) * 100) : null;
  }
  if (courseId === 'apache-kafka') {
    const done = getKafkaCompletedLessons().size;
    const total = getKafkaTotalLessons();
    return total > 0 ? Math.round((done / total) * 100) : null;
  }
  if (courseId === 'claude-for-developers') {
    const done = getClaudeCompletedLessons().size;
    const total = getClaudeTotalLessons();
    return total > 0 ? Math.round((done / total) * 100) : null;
  }
  if (courseId === 'prompt-engineering') {
    const done = getPromptEngineeringCompletedLessons().size;
    const total = getPromptEngineeringTotalLessons();
    return total > 0 ? Math.round((done / total) * 100) : null;
  }
  return null;
}

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.currentUser?.userId ?? null);
  const accessibleCourseIds = useAccessibleCourseIds();
  const [paymentHydrated, setPaymentHydrated] = useState(() => usePaymentStore.persist.hasHydrated());

  useEffect(() => {
    if (usePaymentStore.persist.hasHydrated()) {
      setPaymentHydrated(true);
      return;
    }
    return usePaymentStore.persist.onFinishHydration(() => setPaymentHydrated(true));
  }, []);

  const myAccessibleCourses = useMemo(() => {
    if (!userId) return [];
    return accessibleCourseIds
      .map((courseId) => getCourseDef(courseId))
      .filter((def): def is NonNullable<typeof def> => !!def && def.isAvailable);
  }, [userId, accessibleCourseIds]);

  const {
    curriculum, setCurriculum, loadPhase, loadedPhases,
    progress, activeTrack, setActiveTrack, activeCurriculum, setActiveCurriculum, theme,
  } = useAppStore();
  const completionRate = useAppStore(selectCompletionRate);
  const [loading, setLoading] = useState(!curriculum);
  const [chartData] = useState(() => buildChartData(progress.completedDays));

  // Load curriculum
  useEffect(() => {
    if (curriculum) { setLoading(false); return; }
    fetchCurriculum(activeCurriculum)
      .then((c) => {
        setCurriculum(c);
        setLoading(false);
        // Preload first few phases
        c.phases.slice(0, 3).forEach((p) =>
          fetchPhaseWithCache(p.file, activeCurriculum).then((d) => loadPhase(p.id, d))
        );
      })
      .catch(() => setLoading(false));
  }, [curriculum, activeCurriculum, setCurriculum, loadPhase]);

  // Load visible phases
  useEffect(() => {
    if (!curriculum) return;
    curriculum.phases.forEach((p) => {
      if (!loadedPhases[p.id]) {
        fetchPhaseWithCache(p.file, activeCurriculum).then((d) => loadPhase(p.id, d));
      }
    });
  }, [curriculum, loadedPhases, loadPhase, activeCurriculum]);

  if (loading) return <LoadingSpinner message="Loading curriculum..." fullPage />;
  if (!curriculum) return null;

  const filteredPhases = curriculum.phases.filter(
    (p) => activeTrack === 'All' || p.track === activeTrack
  );

  const currentPhase = curriculum.phases.find((p) => {
    const [start, end] = (p.days ?? '0–0').split('–').map(Number);
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
        <Typography variant="h4" component="h1" fontWeight={800} gutterBottom>
          {getGreeting()}, learner! 👋
        </Typography>
        <Typography color="text.secondary">
          {getStreakMessage(progress.streak)} · Day {progress.currentDay} of {curriculum.totalDays}
        </Typography>
      </Box>

      {/* Curriculum Switcher */}
      <CurriculumSwitcher active={activeCurriculum} onSwitch={setActiveCurriculum} />


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

      {/* My Courses (purchased) */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          My Courses
        </Typography>
        {!paymentHydrated ? (
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ color: '#667eea' }} />
            </CardContent>
          </Card>
        ) : myAccessibleCourses.length === 0 ? (
          <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
            <CardContent sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body1" fontWeight={700} gutterBottom>
                Start your learning journey
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/pricing')}
                sx={{
                  mt: 1,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {myAccessibleCourses.map((def) => {
              const pct = getPaidCourseProgressPercent(def.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={def.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                        {def.name}
                      </Typography>
                      {pct != null ? (
                        <>
                          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                            Progress
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{
                              height: 8,
                              borderRadius: 2,
                              mb: 1,
                              '& .MuiLinearProgress-bar': { bgcolor: def.color },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {pct}% complete
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          Progress tracked inside the course
                        </Typography>
                      )}
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2, fontWeight: 700, borderColor: def.color, color: def.color }}
                        onClick={() => navigate(def.route)}
                      >
                        Continue
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

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
                onClick={() => navigate('/scenarios?view=themes')}
                sx={{ fontWeight: 600, py: 1, mb: 1.5 }}
              >
                Scenario interview drill
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AutoAwesomeIcon />}
                disabled
                sx={{ fontWeight: 600, py: 1, mb: 1.5, opacity: 0.72 }}
              >
                LLM &amp; GenAI overview — Coming Soon
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
              const [startDay, endDay] = (phase.days ?? '0–0').split('–').map(Number);
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
                const [s, e] = (p.days ?? '0–0').split('–').map(Number);
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
