import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { PRO_UI } from '../../constants/proUi'

const PRO_SURFACE = '#1e293b'
const PRO_BORDER = '#334155'

interface Props {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: string
}

const ProStatCard: React.FC<Props> = ({ label, value, icon, color = PRO_UI.primary }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      bgcolor: PRO_SURFACE,
      border: `1px solid ${PRO_BORDER}`,
      borderRadius: 2,
      borderLeft: `4px solid ${color}`,
    }}
  >
    <Box display="flex" alignItems="center" gap={1.5}>
      <Box sx={{ color, display: 'flex', '& svg': { fontSize: 28 } }}>{icon}</Box>
      <Box>
        <Typography variant="h5" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: PRO_UI.textMuted }}>
          {label}
        </Typography>
      </Box>
    </Box>
  </Paper>
)

export default ProStatCard
