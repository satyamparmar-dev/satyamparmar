import React, { useState } from 'react'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { ProLesson, ProWeek } from '../../types/pro.types'

const PRO_SURFACE = '#1e293b'
const PRO_BORDER = '#334155'
const PRO_TEXT = '#f1f5f9'
const PRO_MUTED = '#94a3b8'

function formatIcon(format: ProLesson['format']): string {
  switch (format) {
    case 'concept':
      return '💡'
    case 'hands-on':
      return '🛠️'
    case 'project':
      return '🏗️'
    case 'paper-review':
      return '📄'
    case 'interview-prep':
      return '🎯'
    default:
      return '•'
  }
}

interface Props {
  weeks: ProWeek[]
  completedLessonIds: string[]
  pathColor: string
  onLessonClick: (lesson: ProLesson) => void
  defaultOpenWeek?: number
}

const WeeklyPlan: React.FC<Props> = ({
  weeks,
  completedLessonIds,
  pathColor,
  onLessonClick,
  defaultOpenWeek = 1,
}) => {
  const [expanded, setExpanded] = useState<string | false>(`w-${defaultOpenWeek}`)

  return (
    <Box>
      {weeks.map((w) => {
        const panel = `w-${w.weekNumber}`
        const total = w.lessons.length
        const done = w.lessons.filter((l) => completedLessonIds.includes(l.id)).length
        return (
          <Accordion
            key={w.weekNumber}
            expanded={expanded === panel}
            onChange={(_, v) => setExpanded(v ? panel : false)}
            disableGutters
            sx={{
              mb: 1,
              bgcolor: PRO_SURFACE,
              border: `1px solid ${PRO_BORDER}`,
              borderRadius: '12px !important',
              borderLeft: `4px solid ${pathColor}`,
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: PRO_MUTED }} />}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1} gap={1} flexWrap="wrap">
                <Box>
                  <Typography variant="caption" sx={{ color: pathColor, fontWeight: 700 }}>
                    Week {w.weekNumber}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: PRO_TEXT }}>
                    {w.title}
                  </Typography>
                </Box>
                <Chip
                  label={`${done}/${total} complete`}
                  size="small"
                  sx={{ height: 22, fontSize: '0.65rem', color: PRO_MUTED, borderColor: PRO_BORDER }}
                  variant="outlined"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Stack spacing={1}>
                {w.lessons.map((l) => {
                  const complete = completedLessonIds.includes(l.id)
                  return (
                    <Box
                      key={l.id}
                      onClick={() => onLessonClick(l)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onLessonClick(l)
                      }}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      sx={{
                        py: 0.75,
                        px: 1,
                        borderRadius: 1,
                        bgcolor: 'rgba(15,23,42,0.5)',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(15,23,42,0.85)' },
                      }}
                    >
                      <Typography component="span" sx={{ fontSize: '1.1rem' }}>
                        {formatIcon(l.format)}
                      </Typography>
                      {complete ? (
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#22c55e' }} />
                      ) : (
                        <Box sx={{ width: 18 }} />
                      )}
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" sx={{ color: PRO_TEXT, fontWeight: 600 }}>
                          {l.title}
                        </Typography>
                        <Chip
                          label={`${l.durationMinutes} min`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem', color: PRO_MUTED, mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Box>
  )
}

export default WeeklyPlan
