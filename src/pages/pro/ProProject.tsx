import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import { findProjectSpecById } from '../../constants/proCurriculum'
import { PRO_UI } from '../../constants/proUi'
import { usePageTitle } from '../../hooks/usePageTitle'

const storageKey = (projectId: string) => `pro_project_checks_${projectId}`

const ProProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { profile, hasProProfile, markProjectComplete, saveProfile } = useProProgress()
  const found = projectId ? findProjectSpecById(projectId) : null
  usePageTitle(found?.spec.title ?? 'Pro Project')
  const [checks, setChecks] = useState<boolean[]>([])
  const [github, setGithub] = useState('')

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  useEffect(() => {
    if (!found) return
    try {
      const raw = localStorage.getItem(storageKey(found.spec.id))
      if (raw) {
        const parsed = JSON.parse(raw) as boolean[]
        if (Array.isArray(parsed) && parsed.length === found.spec.deliverables.length) {
          setChecks(parsed)
          return
        }
      }
    } catch {
      /* ignore */
    }
    setChecks(found.spec.deliverables.map(() => false))
  }, [found])

  const persistChecks = (next: boolean[]) => {
    if (!found) return
    setChecks(next)
    localStorage.setItem(storageKey(found.spec.id), JSON.stringify(next))
  }

  const submitGithub = () => {
    if (!profile || !found || !github.trim()) return
    const portfolioProjects = profile.portfolioProjects.map((p) =>
      p.id === found.spec.id ? { ...p, githubUrl: github.trim() } : p
    )
    if (!portfolioProjects.some((p) => p.id === found.spec.id)) {
      portfolioProjects.push({
        id: found.spec.id,
        title: found.spec.title,
        pathId: found.pathId,
        skills: found.spec.tools,
        githubUrl: github.trim(),
        completedAt: new Date().toISOString().slice(0, 10),
        isPublic: true,
      })
    }
    saveProfile({ ...profile, portfolioProjects })
  }

  if (!found) {
    return (
      <ProShell title="Project not found">
        <Typography sx={{ color: PRO_UI.textMuted }}>Unknown project id.</Typography>
      </ProShell>
    )
  }

  const { spec, pathId, lesson } = found
  const allChecked = checks.length > 0 && checks.every(Boolean)

  return (
    <ProShell title={spec.title} subtitle={lesson.title}>
      <Chip
        label={spec.difficulty}
        sx={{ mb: 2, textTransform: 'capitalize', bgcolor: 'rgba(99,102,241,0.2)', color: '#e0e7ff' }}
      />
      <Typography variant="body1" sx={{ color: PRO_UI.slate300, mb: 2 }}>
        {spec.description}
      </Typography>
      <Typography variant="body2" sx={{ color: PRO_UI.textMuted, mb: 1 }}>
        Estimated {spec.estimatedHours} hours · Path {pathId}
      </Typography>

      <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
        Deliverables
      </Typography>
      <List dense>
        {spec.deliverables.map((d, i) => (
          <ListItem key={d} disablePadding>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={!!checks[i]}
                onChange={() => {
                  const next = [...checks]
                  next[i] = !next[i]
                  persistChecks(next)
                }}
                sx={{ color: PRO_UI.border, '&.Mui-checked': { color: PRO_UI.primary } }}
              />
            </ListItemIcon>
            <ListItemText primary={d} primaryTypographyProps={{ sx: { color: PRO_UI.slate300 } }} />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ color: '#fff', mt: 3, mb: 1 }}>
        Tools
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {spec.tools.map((t) => (
          <Chip key={t} label={t} size="small" variant="outlined" sx={{ borderColor: PRO_UI.border, color: PRO_UI.textMuted }} />
        ))}
      </Stack>

      <Typography variant="h6" sx={{ color: '#fff', mt: 3, mb: 1 }}>
        GitHub repository
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          fullWidth
          placeholder="https://github.com/you/repo"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          InputProps={{ sx: { color: '#fff' } }}
          sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: PRO_UI.border } }}
        />
        <Button variant="outlined" onClick={submitGithub} sx={{ borderColor: PRO_UI.secondary, color: PRO_UI.secondary }}>
          Save to portfolio
        </Button>
      </Stack>

      <Button
        variant="contained"
        disabled={!allChecked}
        sx={{ mt: 3, bgcolor: PRO_UI.primary, fontWeight: 800 }}
        onClick={() => {
          markProjectComplete(spec.id)
          navigate('/pro/portfolio')
        }}
      >
        Mark Project Complete
      </Button>
    </ProShell>
  )
}

export default ProProject
