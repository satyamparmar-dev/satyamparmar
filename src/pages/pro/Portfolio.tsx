import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import { PRO_CURRICULUM } from '../../constants/proCurriculum'
import { PRO_UI } from '../../constants/proUi'
import { usePageTitle } from '../../hooks/usePageTitle'

const Portfolio: React.FC = () => {
  usePageTitle('Portfolio')
  const navigate = useNavigate()
  const { profile, hasProProfile, saveProfile } = useProProgress()
  const [toast, setToast] = useState(false)

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  const togglePublic = (id: string) => {
    if (!profile) return
    const portfolioProjects = profile.portfolioProjects.map((p) =>
      p.id === id ? { ...p, isPublic: !p.isPublic } : p
    )
    saveProfile({ ...profile, portfolioProjects })
  }

  if (!profile) return null

  const projects = profile.portfolioProjects

  return (
    <ProShell title="Portfolio" subtitle="Projects you complete in Pro paths show up here.">
      <Button variant="outlined" sx={{ mb: 2, borderColor: PRO_UI.border, color: '#fff' }} onClick={() => setToast(true)}>
        Export as PDF
      </Button>
      {projects.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" sx={{ color: PRO_UI.textMuted, mb: 1 }}>
            Complete projects to build your portfolio
          </Typography>
          <Typography variant="body2" sx={{ color: PRO_UI.textMuted }}>
            Finish capstone lessons and mark projects complete from the project pages.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {projects.map((p) => {
            const path = PRO_CURRICULUM.find((x) => x.id === p.pathId)
            return (
              <Grid item xs={12} md={6} key={p.id}>
                <Card sx={{ bgcolor: PRO_UI.surface, border: `1px solid ${PRO_UI.border}` }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
                      {p.title}
                    </Typography>
                    <Chip
                      label={path?.title ?? p.pathId}
                      size="small"
                      sx={{ my: 1, bgcolor: `${path?.color ?? PRO_UI.primary}33`, color: '#fff' }}
                    />
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1}>
                      {p.skills.map((s) => (
                        <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderColor: PRO_UI.border, color: PRO_UI.textMuted }} />
                      ))}
                    </Stack>
                    <Typography variant="caption" sx={{ color: PRO_UI.textMuted, display: 'block' }}>
                      Completed {p.completedAt}
                    </Typography>
                    {p.githubUrl && (
                      <Typography variant="body2" sx={{ color: PRO_UI.secondary, mt: 1 }}>
                        GitHub: {p.githubUrl}
                      </Typography>
                    )}
                    {p.demoUrl && (
                      <Typography variant="body2" sx={{ color: PRO_UI.secondary }}>
                        Demo: {p.demoUrl}
                      </Typography>
                    )}
                    <FormControlLabel
                      control={<Switch checked={p.isPublic} onChange={() => togglePublic(p.id)} />}
                      label={<Typography sx={{ color: PRO_UI.textMuted }}>Public</Typography>}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
      <Snackbar open={toast} autoHideDuration={3000} onClose={() => setToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="info" variant="filled" onClose={() => setToast(false)}>
          Coming soon
        </Alert>
      </Snackbar>
    </ProShell>
  )
}

export default Portfolio
