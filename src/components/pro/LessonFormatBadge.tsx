import React from 'react'
import { Chip } from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BuildIcon from '@mui/icons-material/Build'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ArticleIcon from '@mui/icons-material/Article'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import type { ProLesson } from '../../types/pro.types'
import { PRO_UI } from '../../constants/proUi'

interface Props {
  format: ProLesson['format']
}

const config: Record<
  ProLesson['format'],
  { label: string; icon: React.ReactElement; bg: string; color: string }
> = {
  concept: {
    label: 'Concept',
    icon: <MenuBookIcon sx={{ fontSize: 14 }} />,
    bg: 'rgba(51,65,85,0.6)',
    color: PRO_UI.slate300,
  },
  'hands-on': {
    label: 'Hands-On',
    icon: <BuildIcon sx={{ fontSize: 14 }} />,
    bg: 'rgba(99,102,241,0.25)',
    color: '#a5b4fc',
  },
  project: {
    label: 'Project',
    icon: <AssignmentIcon sx={{ fontSize: 14 }} />,
    bg: 'rgba(6,182,212,0.2)',
    color: PRO_UI.secondary,
  },
  'paper-review': {
    label: 'Paper',
    icon: <ArticleIcon sx={{ fontSize: 14 }} />,
    bg: 'rgba(245,158,11,0.2)',
    color: PRO_UI.amber,
  },
  'interview-prep': {
    label: 'Interview',
    icon: <RecordVoiceOverIcon sx={{ fontSize: 14 }} />,
    bg: 'rgba(16,185,129,0.2)',
    color: PRO_UI.emerald,
  },
}

const LessonFormatBadge: React.FC<Props> = ({ format }) => {
  const c = config[format]
  return (
    <Chip
      icon={c.icon}
      label={c.label}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.7rem',
        fontWeight: 600,
        bgcolor: c.bg,
        color: c.color,
        border: `1px solid ${PRO_UI.border}`,
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  )
}

export default LessonFormatBadge
