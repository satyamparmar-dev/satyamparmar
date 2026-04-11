import React, { useState } from 'react'
import { Box, Typography, Button, Chip, Paper, Collapse, Stack } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

const PRO_SURFACE = '#1e293b'
const PRO_BORDER = '#334155'
const PRO_TEXT = '#f1f5f9'
const PRO_MUTED = '#94a3b8'
const PRO_ACCENT = '#6366f1'
const PRO_CYAN = '#06b6d4'

interface Props {
  question: string
  index: number
  answer: string
  interviewContext?: string
}

const InterviewPrepCard: React.FC<Props> = ({ question, index, answer, interviewContext }) => {
  const [open, setOpen] = useState(false)

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: 2.5,
        bgcolor: PRO_SURFACE,
        border: `1px solid ${PRO_BORDER}`,
        borderRadius: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} mb={1}>
        <Chip label={`#${index + 1}`} size="small" sx={{ bgcolor: `rgba(99,102,241,0.2)`, color: '#c7d2fe', fontWeight: 700 }} />
        <Typography variant="overline" sx={{ color: PRO_MUTED, flex: 1 }}>
          Interview question
        </Typography>
      </Stack>
      <Typography variant="h6" sx={{ color: PRO_TEXT, fontWeight: 700, mb: 1.5 }}>
        {question}
      </Typography>
      <Button
        size="small"
        onClick={() => setOpen(!open)}
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ color: PRO_ACCENT, fontWeight: 700, textTransform: 'none', p: 0, minWidth: 0 }}
      >
        {open ? 'Hide model answer' : 'Show model answer'}
      </Button>
      <Collapse in={open}>
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${PRO_BORDER}`,
          }}
        >
          <Typography variant="overline" sx={{ color: PRO_CYAN, fontWeight: 700 }}>
            Model answer
          </Typography>
          <Typography variant="body2" sx={{ color: PRO_MUTED, mt: 1, lineHeight: 1.75 }}>
            {answer}
          </Typography>
          {interviewContext && (
            <Typography
              variant="body2"
              sx={{ mt: 2, fontStyle: 'italic', color: PRO_CYAN, lineHeight: 1.65 }}
            >
              {interviewContext}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default InterviewPrepCard
