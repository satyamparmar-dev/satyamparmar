import React from 'react'
import { Box, Paper, Tooltip, Typography } from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import type { ProPathId } from '../../types/pro.types'
import { getProPath } from '../../constants/proCurriculum'

const PRO_BG = '#0f172a'
const PRO_MUTED = '#94a3b8'
const GOLD = '#f59e0b'

interface Props {
  pathId: ProPathId
  earnedAt?: string
  isEarned: boolean
}

const CertBadge: React.FC<Props> = ({ pathId, earnedAt, isEarned }) => {
  const path = getProPath(pathId)
  const icon = path?.icon ?? '📘'

  const inner = (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        width: 80,
        height: 80,
        borderRadius: '50%',
        mx: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        bgcolor: PRO_BG,
        border: isEarned ? `2px solid ${GOLD}` : `2px solid ${PRO_MUTED}`,
        opacity: isEarned ? 1 : 0.4,
      }}
    >
      {icon}
      {!isEarned && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(15,23,42,0.55)',
          }}
        >
          <LockIcon sx={{ color: PRO_MUTED, fontSize: 28 }} />
        </Box>
      )}
    </Paper>
  )

  return (
    <Box textAlign="center">
      {!isEarned ? (
        <Tooltip title="Complete every lesson in this path to earn" arrow>
          {inner}
        </Tooltip>
      ) : (
        inner
      )}
      <Typography variant="body2" fontWeight={600} sx={{ mt: 1, color: '#fff' }}>
        {path?.title ?? pathId}
      </Typography>
      <Typography variant="caption" sx={{ color: PRO_MUTED }}>
        {isEarned && earnedAt ? `Earned ${earnedAt}` : ' '}
      </Typography>
    </Box>
  )
}

export default CertBadge
