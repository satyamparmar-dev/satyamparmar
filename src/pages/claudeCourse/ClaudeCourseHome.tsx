import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import {
  COURSE_PHASES,
  COURSE_LESSONS,
  getLessonsForPhase,
  getCompletedLessons,
  getTotalLessons,
  getTotalHours,
} from '../../content/claudeCourse/courseData';
import { usePageTitle } from '../../hooks/usePageTitle';

const difficultyColor: Record<string, string> = {
  Beginner: '#10b981',
  Intermediate: '#d97757',
  Advanced: '#c45c3e',
  Expert: '#8b5cf6',
};

const ClaudeCourseHome: React.FC = () => {
  usePageTitle('Claude for Developers');
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const completed = useMemo(() => getCompletedLessons(), []);
  const totalLessons = getTotalLessons();
  const totalCompleted = COURSE_LESSONS.filter((l) => completed.has(l.id)).length;
  const overallPct = Math.round((totalCompleted / totalLessons) * 100);

  const handleStartPhase = (phaseNumber: number) => {
    const lessons = getLessonsForPhase(phaseNumber);
    const firstIncomplete = lessons.find((l) => !completed.has(l.id));
    const target = firstIncomplete ?? lessons[0];
    if (target) navigate(`/claude-course/lesson/${target.id}`);
  };

  return (
    <Box className="fade-in" sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: isDark
            ? `linear-gradient(135deg, ${alpha('#d97757', 0.15)} 0%, ${alpha('#c45c3e', 0.1)} 50%, transparent 100%)`
            : `linear-gradient(135deg, ${alpha('#d97757', 0.12)} 0%, ${alpha('#c45c3e', 0.07)} 50%, ${theme.palette.background.paper} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: alpha('#d97757', 0.07),
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            right: 80,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: alpha('#c45c3e', 0.05),
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Chip
              label="NEW COURSE"
              size="small"
              sx={{
                bgcolor: '#d97757',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.65rem',
                height: 22,
                letterSpacing: '0.06em',
              }}
            />
            <Chip
              label="Java + Anthropic"
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
            />
          </Box>

          <Typography
            variant="h3"
            fontWeight={900}
            sx={{ letterSpacing: '-0.03em', lineHeight: 1.15, mb: 1.5 }}
          >
            Claude for Developers:{' '}
            <Box component="span" sx={{ color: '#d97757' }}>
              Essentials
            </Box>
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 620, mb: 3, lineHeight: 1.7 }}
          >
            From your first API call to a working CLI code review assistant — in 4 phases.
            Built for Java developers using the Anthropic Java SDK: Maven, Gradle, streaming, tool use, and production habits.
          </Typography>

          {/* Stats row */}
          <Box
            display="flex"
            flexWrap="wrap"
            gap={3}
            mb={3}
            sx={{ color: 'text.secondary' }}
          >
            {[
              { icon: <MenuBookIcon sx={{ fontSize: 16 }} />, label: `${totalLessons} Lessons` },
              { icon: <AccessTimeIcon sx={{ fontSize: 16 }} />, label: `${getTotalHours()} Hours` },
              { icon: <SchoolIcon sx={{ fontSize: 16 }} />, label: '4 Phases' },
              { icon: <EmojiEventsIcon sx={{ fontSize: 16 }} />, label: 'Beginner → Advanced' },
            ].map((s) => (
              <Box key={s.label} display="flex" alignItems="center" gap={0.75}>
                {s.icon}
                <Typography variant="body2" fontWeight={600}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Overall progress */}
          {totalCompleted > 0 && (
            <Box sx={{ maxWidth: 400 }}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Your progress
                </Typography>
                <Typography variant="caption" fontWeight={700} color="#d97757">
                  {totalCompleted} / {totalLessons} lessons · {overallPct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={overallPct}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha('#d97757', 0.15),
                  '& .MuiLinearProgress-bar': { bgcolor: '#d97757', borderRadius: 4 },
                }}
              />
            </Box>
          )}

          {totalCompleted === 0 && (
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/claude-course/lesson/p1-l1')}
              sx={{
                bgcolor: '#d97757',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                '&:hover': { bgcolor: '#c45c3e' },
              }}
            >
              Start Learning
            </Button>
          )}
        </Box>
      </Paper>

      {/* ── Phase Cards ──────────────────────────────────────────────── */}
      <Grid container spacing={2}>
        {COURSE_PHASES.map((phase) => {
          const phaseLessons = getLessonsForPhase(phase.number);
          const phaseCompleted = phaseLessons.filter((l) => completed.has(l.id)).length;
          const phasePct = Math.round((phaseCompleted / phaseLessons.length) * 100);
          const allComplete = phaseCompleted === phaseLessons.length;
          const firstIncomplete = phaseLessons.find((l) => !completed.has(l.id));
          const ctaLabel = phaseCompleted === 0
            ? 'Start Phase'
            : allComplete
            ? 'Review'
            : 'Continue';

          return (
            <Grid item xs={12} md={6} key={phase.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: allComplete ? alpha(phase.color, 0.4) : 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(phase.color, 0.5),
                    boxShadow: `0 4px 20px ${alpha(phase.color, 0.12)}`,
                  },
                }}
              >
                {/* Phase header */}
                <Box display="flex" alignItems="flex-start" gap={1.5} mb={1.5}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: phase.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0,
                    }}
                  >
                    {phase.icon}
                  </Box>
                  <Box flex={1} minWidth={0}>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.25}>
                      <Typography
                        variant="overline"
                        sx={{ color: phase.color, fontWeight: 700, fontSize: '0.62rem' }}
                      >
                        Phase {phase.number}
                      </Typography>
                      {allComplete && (
                        <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                      )}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={800}
                      sx={{
                        lineHeight: 1.25,
                        letterSpacing: '-0.01em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {phase.title}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1.5, display: 'block', lineHeight: 1.5 }}
                >
                  {phase.description}
                </Typography>

                {/* Lesson list */}
                <Box flex={1} mb={1.5}>
                  {phaseLessons.slice(0, 4).map((lesson) => {
                    const isDone = completed.has(lesson.id);
                    return (
                      <Box
                        key={lesson.id}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        py={0.4}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 1,
                          px: 0.5,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate(`/claude-course/lesson/${lesson.id}`)}
                      >
                        {isDone ? (
                          <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981', flexShrink: 0 }} />
                        ) : (
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              border: '1.5px solid',
                              borderColor: 'divider',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          color={isDone ? 'text.secondary' : 'text.primary'}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: isDone ? 400 : 500,
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}
                        >
                          {lesson.lesson}. {lesson.title}
                        </Typography>
                        <Box sx={{ ml: 'auto', flexShrink: 0 }}>
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                            {lesson.duration}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  {phaseLessons.length > 4 && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ pl: 2.5, display: 'block', mt: 0.5 }}
                    >
                      +{phaseLessons.length - 4} more lessons
                    </Typography>
                  )}
                </Box>

                {/* Progress bar */}
                <Box mb={1.5}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Box display="flex" gap={0.75} alignItems="center">
                      <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.disabled">
                        {phase.totalDuration}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: phase.color, fontWeight: 700 }}>
                      {phaseCompleted}/{phaseLessons.length} · {phasePct}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={phasePct}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: alpha(phase.color, 0.12),
                      '& .MuiLinearProgress-bar': {
                        background: phase.gradient,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>

                {/* CTA */}
                <Button
                  variant={phaseCompleted === 0 ? 'contained' : 'outlined'}
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleStartPhase(phase.number)}
                  sx={{
                    alignSelf: 'flex-start',
                    fontWeight: 700,
                    borderRadius: 2,
                    fontSize: '0.78rem',
                    ...(phaseCompleted === 0
                      ? {
                          background: phase.gradient,
                          color: '#fff',
                          border: 'none',
                          '&:hover': { filter: 'brightness(0.92)' },
                        }
                      : {
                          borderColor: alpha(phase.color, 0.4),
                          color: phase.color,
                          '&:hover': {
                            borderColor: phase.color,
                            bgcolor: alpha(phase.color, 0.06),
                          },
                        }),
                  }}
                >
                  {ctaLabel}
                </Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Bottom CTA if started ─────────────────────────────────── */}
      {totalCompleted > 0 && totalCompleted < totalLessons && (
        <Paper
          elevation={0}
          sx={{
            mt: 2.5,
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha('#d97757', 0.3),
            background: alpha('#d97757', isDark ? 0.08 : 0.04),
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box flex={1} minWidth={160}>
            <Typography variant="subtitle2" fontWeight={700}>
              Continue where you left off
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalCompleted} of {totalLessons} lessons completed
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => {
              const next = COURSE_LESSONS.find((l) => !completed.has(l.id));
              if (next) navigate(`/claude-course/lesson/${next.id}`);
            }}
            sx={{
              bgcolor: '#d97757',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 2,
              '&:hover': { bgcolor: '#c45c3e' },
            }}
          >
            Continue Learning
          </Button>
        </Paper>
      )}

      {totalCompleted === totalLessons && (
        <Paper
          elevation={0}
          sx={{
            mt: 2.5,
            p: 2.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha('#10b981', 0.4),
            background: alpha('#10b981', isDark ? 0.08 : 0.04),
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 36, color: '#10b981' }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              Course Complete! 🎉
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You have completed all {totalLessons} lessons. You can build AI-powered Java apps.
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ClaudeCourseHome;
