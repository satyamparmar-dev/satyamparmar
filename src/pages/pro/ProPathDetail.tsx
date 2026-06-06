import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import WeeklyPlan from '../../components/pro/WeeklyPlan'
import InterviewPrepCard from '../../components/pro/InterviewPrepCard'
import { getProPath } from '../../constants/proCurriculum'
import type { ProPathId } from '../../types/pro.types'
import { PRO_UI } from '../../constants/proUi'
import { getProInterviewAnswer } from '../../constants/proRoles'
import { usePageTitle } from '../../hooks/usePageTitle'

const ProPathDetail: React.FC = () => {
  const { pathId } = useParams<{ pathId: string; week?: string }>()
  const navigate = useNavigate()
  const { profile, progress, hasProProfile, enrollPath } = useProProgress()
  const [tab, setTab] = useState(0)

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  const path = pathId ? getProPath(pathId as ProPathId) : undefined

  usePageTitle(path?.title ?? 'Pro Path')

  const projectLessons = useMemo(() => {
    if (!path) return []
    return path.weeks.flatMap((w) => w.lessons).filter((l) => l.hasProject && l.projectSpec)
  }, [path])

  const interviewItems = useMemo(() => {
    if (!path) return []
    const items: { lessonId: string; q: string; qi: number }[] = []
    for (const l of path.weeks.flatMap((w) => w.lessons)) {
      if (!l.interviewQuestions?.length) continue
      l.interviewQuestions.forEach((q, qi) => items.push({ lessonId: l.id, q, qi }))
    }
    return items
  }, [path])

  if (!profile || !path) {
    return (
      <ProShell title="Path not found">
        <Typography sx={{ color: PRO_UI.textMuted }}>This path does not exist.</Typography>
      </ProShell>
    )
  }

  const enrolled = profile.activePaths.includes(path.id)

  return (
    <ProShell title={path.title} subtitle={path.tagline}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-start' }} mb={2}>
        <Typography variant="h2" component="span" sx={{ fontSize: '2.5rem' }}>
          {path.icon}
        </Typography>
        <Box flex={1}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: 'rgba(6,182,212,0.08)',
              border: `1px solid ${PRO_UI.secondary}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ color: PRO_UI.secondary, fontWeight: 700 }}>
              Prerequisite
            </Typography>
            <Typography variant="body2" sx={{ color: PRO_UI.slate300, mt: 0.5 }}>
              {path.prerequisite}
            </Typography>
          </Paper>
          <Stack direction="row" flexWrap="wrap" gap={0.5} mb={2}>
            {path.tools.map((t) => (
              <Chip key={t} label={t} size="small" variant="outlined" sx={{ borderColor: PRO_UI.border, color: PRO_UI.textMuted }} />
            ))}
          </Stack>
        </Box>
        {!enrolled && (
          <Button variant="contained" sx={{ bgcolor: path.color, fontWeight: 800 }} onClick={() => enrollPath(path.id)}>
            Enroll
          </Button>
        )}
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: PRO_UI.border, '& .MuiTab-root': { color: PRO_UI.textMuted } }}
      >
        <Tab label="Curriculum" />
        <Tab label={`Projects (${projectLessons.length})`} />
        <Tab label={`Interview prep (${interviewItems.length})`} />
      </Tabs>

      {tab === 0 && (
        <WeeklyPlan
          weeks={path.weeks}
          completedLessonIds={progress.completedLessons}
          pathColor={path.color}
          onLessonClick={(l) => navigate(`/pro/lesson/${l.id}`)}
        />
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          {projectLessons.map((l) => (
            <Grid item xs={12} md={6} key={l.id}>
              <Card
                sx={{ bgcolor: PRO_UI.surface, border: `1px solid ${PRO_UI.border}`, cursor: 'pointer' }}
                onClick={() => navigate(`/pro/lesson/${l.id}`)}
              >
                <CardContent>
                  <Typography fontWeight={800} sx={{ color: '#fff' }}>
                    {l.projectSpec?.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: PRO_UI.textMuted }}>
                    {l.durationMinutes} min · {l.projectSpec?.difficulty}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 2 &&
        interviewItems.map((item, i) => (
          <InterviewPrepCard
            key={`${item.lessonId}-${item.qi}`}
            index={i}
            question={item.q}
            answer={getProInterviewAnswer(item.lessonId, item.qi, item.q)}
            interviewContext={`From lesson ${item.lessonId}`}
          />
        ))}
    </ProShell>
  )
}

export default ProPathDetail
