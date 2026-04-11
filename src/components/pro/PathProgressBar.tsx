import React from 'react'
import { Box, Typography, LinearProgress } from '@mui/material'
import type { ProPath } from '../../types/pro.types'
import { PRO_UI } from '../../constants/proUi'

interface Props {
  path: ProPath
  completedLessons: number
  totalLessons: number
}

const PathProgressBar: React.FC<Props> = ({ path, completedLessons, totalLessons }) => {
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="caption" sx={{ color: PRO_UI.textMuted }}>
          Progress
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ color: path.color }}>
          {pct}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'rgba(51,65,85,0.5)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            bgcolor: path.color,
          },
        }}
      />
      <Typography variant="caption" sx={{ color: PRO_UI.textMuted, mt: 0.5, display: 'block' }}>
        {completedLessons} / {totalLessons} lessons
      </Typography>
    </Box>
  )
}

export default PathProgressBar
