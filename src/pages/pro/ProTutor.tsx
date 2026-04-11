import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Typography, TextField, Button, Stack, Paper } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import { findProLesson } from '../../constants/proCurriculum'
import { PRO_UI } from '../../constants/proUi'

type Msg = { role: 'user' | 'assistant'; text: string }

const ProTutor: React.FC = () => {
  const { lessonId } = useParams<{ lessonId?: string }>()
  const navigate = useNavigate()
  const { hasProProfile } = useProProgress()
  const lesson = lessonId ? findProLesson(lessonId) : null
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', text: 'Ask a question about this lesson or your career plan. (Demo UI — connect a backend to enable live tutoring.)' },
  ])

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  const systemHint = lesson
    ? `Context: ${lesson.title} (${lesson.pathId}, week ${lesson.weekNumber}).\n${lesson.keyConceptTags.join(', ')}`
    : 'General Pro Track tutor'

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])

    try {
      const res = await fetch('/api/pro/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, systemHint }),
      })
      if (res.ok) {
        const data = (await res.json()) as { reply?: string }
        const reply = typeof data.reply === 'string' && data.reply.trim() ? data.reply : null
        if (reply) {
          setMessages((m) => [...m, { role: 'assistant', text: reply }])
          return
        }
      }
    } catch {
      /* optional endpoint */
    }

    setMessages((m) => [
      ...m,
      {
        role: 'assistant',
        text: 'Connect your AI backend to enable the Pro Tutor. This UI is ready to stream answers once `/api/pro/tutor` returns JSON `{ reply: string }`.',
      },
    ])
  }

  return (
    <ProShell
      title="Pro Tutor"
      subtitle={lesson ? `Lesson context loaded: ${lesson.title}` : 'Career and curriculum Q&A'}
    >
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(6,182,212,0.08)', border: `1px solid ${PRO_UI.secondary}` }}>
        <Typography variant="caption" sx={{ color: PRO_UI.secondary, fontWeight: 700 }}>
          System prompt preview
        </Typography>
        <Typography variant="body2" sx={{ color: PRO_UI.slate300, whiteSpace: 'pre-wrap', mt: 0.5 }}>
          {systemHint}
        </Typography>
      </Paper>
      <Box
        sx={{
          border: `1px solid ${PRO_UI.border}`,
          borderRadius: 2,
          p: 2,
          minHeight: 320,
          maxHeight: 480,
          overflow: 'auto',
          bgcolor: 'rgba(15,23,42,0.8)',
          mb: 2,
        }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              mb: 1.5,
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              sx={{
                maxWidth: '85%',
                p: 1.5,
                bgcolor: msg.role === 'user' ? PRO_UI.surface : 'rgba(30,27,75,0.95)',
                border: `1px solid ${msg.role === 'user' ? PRO_UI.border : PRO_UI.primary}`,
                color: '#fff',
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
            </Paper>
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          InputProps={{ sx: { color: '#fff' } }}
          sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: PRO_UI.border } }}
        />
        <Button variant="contained" onClick={send} sx={{ bgcolor: PRO_UI.primary, minWidth: 100 }}>
          <SendIcon />
        </Button>
      </Stack>
    </ProShell>
  )
}

export default ProTutor
