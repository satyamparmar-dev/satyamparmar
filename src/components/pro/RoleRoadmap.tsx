import React from 'react'
import { Box, Typography, Chip, Stack, LinearProgress, Paper } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { Recommendation } from '../../types/pro.types'
import { PRO_ROLES } from '../../constants/proRoles'
import { getProPath } from '../../constants/proCurriculum'
import { onboardingSkillsForRole } from '../../utils/roleRecommender'
import { PRO_UI } from '../../constants/proUi'

interface Props {
  recommendation: Recommendation
}

const RoleRoadmap: React.FC<Props> = ({ recommendation }) => {
  const roleTitle = PRO_ROLES.find((r) => r.id === recommendation.targetRole)?.title ?? recommendation.targetRole
  const paths = recommendation.orderedPaths
    .map((id) => getProPath(id))
    .filter((p): p is NonNullable<typeof p> => p != null)
  const requiredSkillCount = Math.max(1, onboardingSkillsForRole(recommendation.targetRole).length)
  const gapPct = Math.min(100, (recommendation.skillGapScore / requiredSkillCount) * 100)

  return (
    <Stack spacing={2}>
      <Chip
        label={roleTitle}
        sx={{
          alignSelf: 'flex-start',
          fontWeight: 800,
          fontSize: '0.95rem',
          py: 2.5,
          px: 1,
          bgcolor: 'rgba(99,102,241,0.25)',
          color: '#e0e7ff',
          border: `1px solid ${PRO_UI.primary}`,
        }}
      />
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', md: '1fr auto 1fr auto 1fr' }}
        gap={2}
        alignItems="center"
      >
        {paths.map((p, i) => (
          <React.Fragment key={p.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'rgba(15,23,42,0.8)',
                border: `1px solid ${PRO_UI.border}`,
                borderTop: `4px solid ${p.color}`,
              }}
            >
              <Typography variant="caption" sx={{ color: p.color }}>
                Step {i + 1}
              </Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#fff' }}>
                {p.icon} {p.title}
              </Typography>
              <Typography variant="caption" sx={{ color: PRO_UI.textMuted }}>
                {p.estimatedWeeks} weeks
              </Typography>
            </Paper>
            {i < paths.length - 1 && (
              <ArrowForwardIcon sx={{ color: PRO_UI.secondary, display: { xs: 'none', md: 'block' } }} />
            )}
          </React.Fragment>
        ))}
      </Box>
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(15,23,42,0.8)', border: `1px solid ${PRO_UI.border}` }}>
        <Typography variant="body2" sx={{ color: PRO_UI.textMuted, mb: 1 }}>
          Weeks to job-ready (estimate)
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>
          ~{recommendation.estimatedWeeks} weeks
        </Typography>
      </Paper>
      <Box>
        <Typography variant="body2" sx={{ color: PRO_UI.textMuted, mb: 0.5 }}>
          Skill alignment ({recommendation.skillGapScore} / {requiredSkillCount} relevant onboarding skills)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={gapPct}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: 'rgba(51,65,85,0.6)',
            '& .MuiLinearProgress-bar': { bgcolor: PRO_UI.primary, borderRadius: 5 },
          }}
        />
      </Box>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: `1px solid ${PRO_UI.secondary}`,
          bgcolor: 'rgba(6,182,212,0.08)',
        }}
      >
        <Typography variant="subtitle2" sx={{ color: PRO_UI.secondary, fontWeight: 700 }}>
          Salary range (typical US tech, 2026)
        </Typography>
        <Typography variant="h6" sx={{ color: '#fff', mt: 0.5 }}>
          {recommendation.salaryRange}
        </Typography>
      </Paper>
      <Typography variant="body2" sx={{ color: PRO_UI.slate300 }}>
        {recommendation.rationale}
      </Typography>
    </Stack>
  )
}

export default RoleRoadmap
