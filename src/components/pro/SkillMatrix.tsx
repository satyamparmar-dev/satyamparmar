import React from 'react'
import { Box, Typography, LinearProgress, Grid } from '@mui/material'
import type { OnboardingSkill } from '../../types/pro.types'

const PRO_BG = '#0f172a'
const PRO_SURFACE = '#1e293b'
const PRO_BORDER = '#334155'
const PRO_TEXT = '#f1f5f9'
const PRO_MUTED = '#94a3b8'

const SKILL_META: { skill: OnboardingSkill; label: string; icon: string }[] = [
  { skill: 'python', label: 'Python', icon: '🐍' },
  { skill: 'sql', label: 'SQL', icon: '🗄️' },
  { skill: 'statistics', label: 'Statistics', icon: 'Σ' },
  { skill: 'web-dev', label: 'Web / Backend', icon: '{ }' },
  { skill: 'cloud', label: 'Cloud', icon: '☁️' },
  { skill: 'data-analysis', label: 'Data analysis', icon: '📊' },
  { skill: 'machine-learning', label: 'Machine learning', icon: '🧠' },
  { skill: 'llm-apis', label: 'LLMs / APIs', icon: '✨' },
]

interface Props {
  userSkills: OnboardingSkill[]
  requiredSkills: OnboardingSkill[]
}

const SkillMatrix: React.FC<Props> = ({ userSkills, requiredSkills }) => {
  const reqSet = new Set(requiredSkills)
  const covered = userSkills.filter((s) => reqSet.has(s)).length
  const totalReq = requiredSkills.length

  return (
    <Box sx={{ bgcolor: PRO_SURFACE, border: `1px solid ${PRO_BORDER}`, borderRadius: 2, p: 2 }}>
      <Typography variant="subtitle2" sx={{ color: PRO_TEXT, fontWeight: 700, mb: 2 }}>
        {covered} of {Math.max(totalReq, 1)} required skills covered
      </Typography>
      <Grid container spacing={2}>
        {SKILL_META.map(({ skill, label, icon }) => {
          const required = reqSet.has(skill)
          const has = userSkills.includes(skill)
          const value = has ? 100 : required ? 20 : 35
          const barColor = has ? '#22c55e' : required ? '#ef4444' : PRO_MUTED
          return (
            <Grid item xs={12} sm={6} md={3} key={skill}>
              <Typography variant="caption" sx={{ color: PRO_TEXT, fontWeight: 600, display: 'block', mb: 0.5 }}>
                {icon} {label}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: PRO_BG,
                  '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 1 },
                }}
              />
              {!has && required && (
                <Typography variant="caption" sx={{ color: '#f87171', mt: 0.25, display: 'block' }}>
                  Gap
                </Typography>
              )}
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default SkillMatrix
