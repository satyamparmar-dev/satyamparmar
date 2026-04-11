import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Button } from '@mui/material'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import CertBadge from '../../components/pro/CertBadge'
import { PRO_CURRICULUM } from '../../constants/proCurriculum'
import { PRO_UI } from '../../constants/proUi'

const Certifications: React.FC = () => {
  const navigate = useNavigate()
  const { profile, progress, hasProProfile } = useProProgress()

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  if (!profile) return null

  return (
    <ProShell title="Certifications" subtitle="Complete every lesson in a path to earn its badge.">
      <Box sx={{ p: 2, mb: 3, border: `1px dashed ${PRO_UI.border}`, borderRadius: 2 }}>
        <Button variant="outlined" sx={{ borderColor: PRO_UI.secondary, color: PRO_UI.secondary }} onClick={() => navigate('/pro')}>
          Share on LinkedIn (coming soon)
        </Button>
      </Box>
      <Grid container spacing={3}>
        {PRO_CURRICULUM.map((path) => {
          const earned = progress.completedPaths.includes(path.id)
          const total = path.weeks.reduce((n, w) => n + w.lessons.length, 0)
          const done = path.weeks.reduce(
            (n, w) => n + w.lessons.filter((l) => progress.completedLessons.includes(l.id)).length,
            0
          )
          const remaining = total - done
          return (
            <Grid item xs={6} sm={4} md={3} key={path.id}>
              <CertBadge
                pathId={path.id}
                isEarned={earned}
                earnedAt={earned ? profile.lastActiveDate : undefined}
              />
              <Typography variant="caption" sx={{ color: PRO_UI.textMuted, display: 'block', textAlign: 'center', mt: 1 }}>
                {earned ? 'Completed' : `${remaining} lessons remaining`}
              </Typography>
            </Grid>
          )
        })}
      </Grid>
    </ProShell>
  )
}

export default Certifications
