import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Grid, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import PathCard from '../../components/pro/PathCard'
import { PRO_CURRICULUM } from '../../constants/proCurriculum'
import { PRO_ROLES } from '../../constants/proRoles'
import { PRO_UI } from '../../constants/proUi'
import type { ProRole } from '../../types/pro.types'

const ProPaths: React.FC = () => {
  const navigate = useNavigate()
  const { profile, progress, hasProProfile, enrollPath } = useProProgress()
  const [tab, setTab] = useState(0)
  const [roleFilter, setRoleFilter] = useState<ProRole | ''>('')

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  const paths = PRO_CURRICULUM.filter((p) => {
    if (tab === 1) return profile?.activePaths.includes(p.id)
    if (tab === 2 && roleFilter) return p.targetRoles.includes(roleFilter)
    if (tab === 2) return true
    return true
  })

  if (!profile) return null

  return (
    <ProShell title="Learning paths" subtitle="Enroll, track progress, and go deep on each stack.">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 2 }} flexWrap="wrap">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { color: PRO_UI.textMuted, fontWeight: 600 } }}
          textColor="inherit"
          TabIndicatorProps={{ sx: { bgcolor: PRO_UI.primary } }}
        >
          <Tab label="All" />
          <Tab label="Enrolled" />
          <Tab label="By role" />
        </Tabs>
        {tab === 2 && (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="pro-role-filter" sx={{ color: PRO_UI.textMuted }}>
              Target role
            </InputLabel>
            <Select
              labelId="pro-role-filter"
              label="Target role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as ProRole | '')}
              sx={{ color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: PRO_UI.border } }}
            >
              <MenuItem value="">
                <em>All roles</em>
              </MenuItem>
              {PRO_ROLES.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
      <Grid container spacing={2}>
        {paths.map((path) => {
          const enrolled = profile.activePaths.includes(path.id)
          const total = path.weeks.reduce((n, w) => n + w.lessons.length, 0)
          const done = path.weeks.reduce(
            (n, w) => n + w.lessons.filter((l) => progress.completedLessons.includes(l.id)).length,
            0
          )
          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <Grid item xs={12} sm={6} md={4} key={path.id}>
              <PathCard
                path={path}
                onEnroll={() => enrollPath(path.id)}
                isEnrolled={enrolled}
                completedLessons={done}
                progress={enrolled ? pct : undefined}
              />
            </Grid>
          )
        })}
      </Grid>
      {paths.length === 0 && (
        <Typography sx={{ color: PRO_UI.textMuted }}>Nothing in this filter yet.</Typography>
      )}
    </ProShell>
  )
}

export default ProPaths
