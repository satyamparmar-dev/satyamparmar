import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Button, Card, CardContent, Stack, Chip } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import PathCard from '../../components/pro/PathCard'
import ProStatCard from '../../components/pro/ProStatCard'
import { PRO_CURRICULUM, findProLesson } from '../../constants/proCurriculum'
import { PRO_UI } from '../../constants/proUi'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { ProPathId } from '../../types/pro.types'

function nextIncompleteLesson(activePaths: ProPathId[], completed: string[]): string | null {
  for (const pid of activePaths) {
    const path = PRO_CURRICULUM.find((p) => p.id === pid)
    if (!path) continue
    for (const w of path.weeks) {
      for (const l of w.lessons) {
        if (!completed.includes(l.id)) return l.id
      }
    }
  }
  return null
}

const ProHome: React.FC = () => {
  usePageTitle('Pro Track')
  const navigate = useNavigate()
  const { profile, progress, hasProProfile, enrollPath } = useProProgress()

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  const continueLessonId = useMemo(
    () => nextIncompleteLesson(progress.activePaths, progress.completedLessons),
    [progress.activePaths, progress.completedLessons]
  )
  const continueLesson = continueLessonId ? findProLesson(continueLessonId) : null

  const lastCompletedId = progress.completedLessons[progress.completedLessons.length - 1]
  const lastCompletedLesson = lastCompletedId ? findProLesson(lastCompletedId) : null

  const lessonsDone = progress.completedLessons.length
  const projectsBuilt = progress.completedProjects.length
  const pathsDone = progress.completedPaths.length

  const recommendedPair = useMemo(() => {
    if (!profile) return []
    return PRO_CURRICULUM.filter((p) => !profile.activePaths.includes(p.id)).slice(0, 2)
  }, [profile])

  if (!profile) return null

  return (
    <ProShell
      title={`Welcome back, ${profile.name || 'Learner'}`}
      subtitle={`${profile.xpTotal} XP · ${profile.streakDays}-day streak · Pro Track dashboard for your AI/ML pivot.`}
    >
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ProStatCard label="Lessons done" value={lessonsDone} icon={<AssignmentTurnedInIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProStatCard label="Projects built" value={projectsBuilt} icon={<TrendingUpIcon />} color={PRO_UI.secondary} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProStatCard
            label="Streak days"
            value={profile.streakDays}
            icon={<LocalFireDepartmentIcon />}
            color="#fb923c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ProStatCard label="Paths completed" value={pathsDone} icon={<EmojiEventsIcon />} color={PRO_UI.emerald} />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 2 }}>
        Your active paths
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {profile.activePaths.map((pid) => {
          const path = PRO_CURRICULUM.find((p) => p.id === pid)
          if (!path) return null
          const total = path.weeks.reduce((n, w) => n + w.lessons.length, 0)
          const done = path.weeks.reduce(
            (n, w) => n + w.lessons.filter((l) => progress.completedLessons.includes(l.id)).length,
            0
          )
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <Grid item xs={12} md={4} key={pid}>
              <PathCard path={path} onEnroll={() => enrollPath(pid)} isEnrolled progress={pct} completedLessons={done} />
            </Grid>
          )
        })}
      </Grid>

      <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 2 }}>
        Continue learning
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {lastCompletedLesson && (
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: PRO_UI.surface, border: `1px solid ${PRO_UI.border}`, height: '100%' }}>
              <CardContent>
                <Typography variant="overline" sx={{ color: PRO_UI.textMuted }}>
                  Last completed
                </Typography>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
                  {lastCompletedLesson.title}
                </Typography>
                <Button sx={{ mt: 2, color: PRO_UI.secondary }} onClick={() => navigate(`/pro/lesson/${lastCompletedLesson.id}`)}>
                  Review lesson
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
        {continueLesson && (
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: PRO_UI.surface, border: `1px solid ${PRO_UI.border}`, height: '100%' }}>
              <CardContent>
                <Typography variant="overline" sx={{ color: PRO_UI.secondary }}>
                  Next up
                </Typography>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>
                  {continueLesson.title}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, bgcolor: PRO_UI.primary, fontWeight: 700 }}
                  onClick={() => navigate(`/pro/lesson/${continueLesson.id}`)}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {recommendedPair.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 2 }}>
            Recommended paths
          </Typography>
          <Grid container spacing={2}>
            {recommendedPair.map((p) => (
              <Grid item xs={12} md={6} key={p.id}>
                <PathCard
                  path={p}
                  onEnroll={() => enrollPath(p.id)}
                  isEnrolled={profile.activePaths.includes(p.id)}
                  completedLessons={
                    p.weeks.reduce((n, w) => n + w.lessons.filter((l) => progress.completedLessons.includes(l.id)).length, 0)
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 2 }}>
        Quick links
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Chip label="Interview prep" onClick={() => navigate('/pro/interview-prep')} sx={{ color: '#fff', fontWeight: 600 }} />
        <Chip label="AI tutor" onClick={() => navigate('/pro/tutor')} sx={{ color: '#fff', fontWeight: 600 }} />
        <Chip label="Portfolio" onClick={() => navigate('/pro/portfolio')} sx={{ color: '#fff', fontWeight: 600 }} />
        <Chip label="Certifications" onClick={() => navigate('/pro/certifications')} sx={{ color: '#fff', fontWeight: 600 }} />
      </Stack>
    </ProShell>
  )
}

export default ProHome
