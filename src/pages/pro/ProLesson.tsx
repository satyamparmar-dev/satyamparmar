import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  IconButton,
  Paper,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import type { CodeSection } from '../../types'
import { parseMarkdown } from '../../utils/markdown'
import CodeBlock from '../../components/CodeBlock'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import LessonFormatBadge from '../../components/pro/LessonFormatBadge'
import { findProLesson, getProPath } from '../../constants/proCurriculum'
import type { ProPathId } from '../../types/pro.types'
import { getProInterviewAnswer } from '../../constants/proRoles'
import { PRO_UI } from '../../constants/proUi'
import { usePageTitle } from '../../hooks/usePageTitle'

function flattenLessons(pathId: ProPathId) {
  const path = getProPath(pathId)
  if (!path) return []
  return path.weeks.flatMap((w) => w.lessons)
}

const ProLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const {
    progress,
    hasProProfile,
    markLessonComplete,
    isLessonComplete,
    toggleBookmark,
    updateNote,
  } = useProProgress()
  const lesson = lessonId ? findProLesson(lessonId) : null
  const path = lesson ? getProPath(lesson.pathId) : null

  usePageTitle(lesson?.title ?? 'Pro Lesson')

  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  useEffect(() => {
    if (lesson) setNoteDraft(progress.lessonNotes[lesson.id] ?? '')
  }, [lesson?.id, progress.lessonNotes, lesson])

  const persistNote = useCallback(
    (text: string) => {
      if (lesson) updateNote(lesson.id, text)
    },
    [lesson, updateNote]
  )

  const sequence = useMemo(() => (lesson ? flattenLessons(lesson.pathId) : []), [lesson])
  const idx = lesson ? sequence.findIndex((l) => l.id === lesson.id) : -1
  const prev = idx > 0 ? sequence[idx - 1] : null
  const next = idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : null

  const weekLessons = path?.weeks.find((w) => w.weekNumber === lesson?.weekNumber)?.lessons ?? []

  if (!lessonId || !lesson || !path) {
    return (
      <ProShell title="Lesson not found">
        <Typography sx={{ color: PRO_UI.textMuted, mb: 2 }}>This lesson does not exist or was removed.</Typography>
        <Button component={Link} to="/pro/paths" variant="contained" sx={{ bgcolor: PRO_UI.primary, fontWeight: 700 }}>
          Back to paths
        </Button>
      </ProShell>
    )
  }

  const html = parseMarkdown(lesson.content)
  const bookmarked = progress.bookmarkedLessons.includes(lesson.id)

  return (
    <ProShell>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" sx={{ color: PRO_UI.textMuted, mb: 1 }}>
            Week {lesson.weekNumber}
          </Typography>
          <List dense>
            {weekLessons.map((l) => (
              <ListItemButton
                key={l.id}
                selected={l.id === lesson.id}
                onClick={() => navigate(`/pro/lesson/${l.id}`)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                {isLessonComplete(l.id) ? (
                  <CheckCircleIcon sx={{ fontSize: 18, mr: 1, color: PRO_UI.emerald }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 18, mr: 1, color: PRO_UI.border }} />
                )}
                <ListItemText primary={l.title} primaryTypographyProps={{ variant: 'body2', sx: { color: '#fff' } }} />
              </ListItemButton>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={9}>
          <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} mb={2}>
            <LessonFormatBadge format={lesson.format} />
            <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', flex: '1 1 100%' }}>
              {lesson.title}
            </Typography>
            <Chip label={`${lesson.durationMinutes} min`} size="small" sx={{ color: PRO_UI.textMuted }} />
            <IconButton
              aria-label="Bookmark lesson"
              onClick={() => toggleBookmark(lesson.id)}
              sx={{ color: bookmarked ? PRO_UI.primary : PRO_UI.textMuted }}
            >
              {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.5} mb={2}>
            {lesson.tools.map((t) => (
              <Chip key={t} label={t} size="small" variant="outlined" sx={{ borderColor: PRO_UI.border, color: PRO_UI.textMuted }} />
            ))}
          </Stack>

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              border: `1px solid ${PRO_UI.secondary}`,
              bgcolor: 'rgba(6,182,212,0.06)',
            }}
          >
            <Typography variant="subtitle2" sx={{ color: PRO_UI.secondary, fontWeight: 700 }}>
              Job relevance
            </Typography>
            <Typography variant="body2" sx={{ color: PRO_UI.slate300, mt: 0.5 }}>
              {lesson.jobRelevance}
            </Typography>
            {lesson.estimatedSalaryImpact && (
              <Typography variant="caption" sx={{ color: PRO_UI.textMuted, display: 'block', mt: 1 }}>
                Salary signal: {lesson.estimatedSalaryImpact}
              </Typography>
            )}
          </Paper>

          <Box
            className="pro-lesson-md"
            sx={{
              color: PRO_UI.slate300,
              '& h2': { color: '#fff', mt: 2, mb: 1 },
              '& p': { mb: 1.5, lineHeight: 1.75 },
              '& code': { bgcolor: 'rgba(51,65,85,0.5)', px: 0.5, borderRadius: 0.5 },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {lesson.interviewQuestions && lesson.interviewQuestions.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 1 }}>
                Interview questions
              </Typography>
              {lesson.interviewQuestions.map((q, i) => (
                <Accordion
                  key={i}
                  disableGutters
                  sx={{ bgcolor: PRO_UI.surface, border: `1px solid ${PRO_UI.border}`, mb: 1, borderRadius: '8px !important' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: PRO_UI.textMuted }} />}>
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>{q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ color: PRO_UI.slate300 }}>{getProInterviewAnswer(lesson.id, i, q)}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          {lesson.codeNotebook && (
            <Box mt={3}>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 1 }}>
                Code notebook
              </Typography>
              {lesson.codeNotebook.cells.map((cell, i) =>
                cell.type === 'markdown' ? (
                  <Box
                    key={i}
                    className="pro-lesson-md"
                    sx={{
                      color: PRO_UI.slate300,
                      mb: 2,
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'rgba(148,163,184,0.12)',
                    }}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(cell.content) }}
                  />
                ) : (
                  <CodeBlock
                    key={`${lessonId}-cell-${i}`}
                    defaultExpanded={i === 0}
                    section={
                      {
                        type: 'code',
                        title: `Code cell ${i + 1}`,
                        language: cell.language ?? 'python',
                        filename: `cell-${i + 1}.${(cell.language ?? 'py').replace('dockerfile', 'Dockerfile')}`,
                        code: cell.content,
                        level: 'intermediate',
                      } satisfies CodeSection
                    }
                  />
                )
              )}
            </Box>
          )}

          {lesson.hasProject && lesson.projectSpec && (
            <Box mt={3} sx={{ p: 2, border: `1px solid ${PRO_UI.border}`, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.8)' }}>
              <Button
                variant="outlined"
                size="small"
                sx={{ mb: 2, borderColor: PRO_UI.secondary, color: PRO_UI.secondary }}
                onClick={() => navigate(`/pro/project/${lesson.projectSpec!.id}`)}
              >
                Open project workspace
              </Button>
              <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
                {lesson.projectSpec.title}
              </Typography>
              <Chip
                label={lesson.projectSpec.difficulty}
                size="small"
                sx={{ my: 1, textTransform: 'capitalize', bgcolor: 'rgba(99,102,241,0.2)', color: '#e0e7ff' }}
              />
              <Typography variant="body2" sx={{ color: PRO_UI.textMuted, mb: 1 }}>
                ~{lesson.projectSpec.estimatedHours} hours · {lesson.projectSpec.tools.join(', ')}
              </Typography>
              <Typography variant="body2" sx={{ color: PRO_UI.slate300, mb: 1 }}>
                {lesson.projectSpec.description}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#fff' }}>
                Deliverables
              </Typography>
              <ul style={{ color: PRO_UI.slate300, marginTop: 8 }}>
                {lesson.projectSpec.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Box>
          )}

          <TextField
            label="Your notes (autosaved)"
            multiline
            minRows={3}
            fullWidth
            value={noteDraft}
            onChange={(e) => {
              const v = e.target.value
              setNoteDraft(v)
              persistNote(v)
            }}
            sx={{ mt: 3, '& .MuiInputBase-root': { bgcolor: PRO_UI.surface }, '& .MuiInputLabel-root': { color: PRO_UI.textMuted } }}
            InputProps={{ sx: { color: '#fff' } }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" mt={4}>
            <Button
              disabled={!prev}
              onClick={() => prev && navigate(`/pro/lesson/${prev.id}`)}
              sx={{ color: PRO_UI.textMuted }}
            >
              ← Previous Lesson
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: PRO_UI.primary, fontWeight: 800 }}
              onClick={() => {
                markLessonComplete(lesson.id)
                if (next) navigate(`/pro/lesson/${next.id}`)
                else navigate(`/pro/paths/${path.id}`)
              }}
            >
              Mark Complete & Next →
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </ProShell>
  )
}

export default ProLesson
