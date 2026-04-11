import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, Typography, Button, Box, Chip, Stack, LinearProgress } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import type { ProPath } from '../../types/pro.types'

const PRO_SURFACE = '#1e293b'
const PRO_BORDER = '#334155'
const PRO_TEXT = '#f1f5f9'
const PRO_MUTED = '#94a3b8'

interface Props {
  path: ProPath
  onEnroll: () => void
  isEnrolled?: boolean
  progress?: number
  completedLessons?: number
}

const PathCard: React.FC<Props> = ({ path, onEnroll, isEnrolled = false, progress, completedLessons = 0 }) => {
  const navigate = useNavigate()
  const total = path.weeks.reduce((n, w) => n + w.lessons.length, 0)
  const pct =
    progress !== undefined ? Math.min(100, Math.max(0, progress)) : total > 0 ? Math.round((completedLessons / total) * 100) : 0

  const go = () => navigate(`/pro/paths/${path.id}`)

  return (
    <Card
      onClick={go}
      sx={{
        cursor: 'pointer',
        bgcolor: PRO_SURFACE,
        border: `1px solid ${PRO_BORDER}`,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': { borderColor: path.color },
      }}
    >
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: path.color }} />
      <CardContent sx={{ pl: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
          <Typography variant="h4" component="span" sx={{ lineHeight: 1 }}>
            {path.icon}
          </Typography>
          <Box flex={1} minWidth={0}>
            <Typography variant="h6" fontWeight={800} sx={{ color: PRO_TEXT }}>
              {path.title}
            </Typography>
            <Typography variant="body2" sx={{ color: PRO_MUTED }}>
              {path.tagline}
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          {path.tools.slice(0, 4).map((t) => (
            <Chip
              key={t}
              label={t}
              size="small"
              variant="outlined"
              sx={{ borderColor: PRO_BORDER, color: PRO_MUTED, fontSize: '0.65rem' }}
            />
          ))}
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ color: PRO_MUTED, fontWeight: 600 }}>
            {path.estimatedWeeks} weeks
          </Typography>
          <Typography variant="caption" sx={{ color: PRO_MUTED }}>
            ·
          </Typography>
          <Chip
            icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
            label={`${path.jobDemandScore}% demand`}
            size="small"
            sx={{ height: 22, fontSize: '0.65rem', bgcolor: 'rgba(6,182,212,0.12)', color: '#67e8f9' }}
          />
        </Stack>
        {isEnrolled && (
          <Box sx={{ mb: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 8,
                borderRadius: 2,
                bgcolor: 'rgba(15,23,42,0.8)',
                '& .MuiLinearProgress-bar': { bgcolor: path.color, borderRadius: 2 },
              }}
            />
            <Typography variant="caption" sx={{ color: PRO_MUTED, display: 'block', mt: 0.5 }}>
              {pct}% complete
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={(e) => {
              e.stopPropagation()
              onEnroll()
              go()
            }}
            sx={{
              bgcolor: path.color,
              '&:hover': { bgcolor: path.color, filter: 'brightness(1.08)' },
              fontWeight: 700,
            }}
          >
            {isEnrolled ? 'Continue →' : 'Enroll →'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PathCard
