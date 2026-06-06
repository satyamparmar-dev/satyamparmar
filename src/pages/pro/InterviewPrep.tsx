import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Typography, Tabs, Tab, Button, Chip, Stack } from '@mui/material'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import InterviewPrepCard from '../../components/pro/InterviewPrepCard'
import { PRO_CURRICULUM, getAllProLessons } from '../../constants/proCurriculum'
import { PRO_ROLES, getProInterviewAnswer } from '../../constants/proRoles'
import type { ProPathId, ProRole } from '../../types/pro.types'
import { PRO_UI } from '../../constants/proUi'
import { usePageTitle } from '../../hooks/usePageTitle'

type PrepItem = { lessonId: string; pathId: ProPathId; question: string; qIndex: number }

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const InterviewPrep: React.FC = () => {
  usePageTitle('Interview Prep')
  const { role: roleParam } = useParams<{ role?: string }>()
  const navigate = useNavigate()
  const { profile, hasProProfile } = useProProgress()
  const [pathTab, setPathTab] = useState<ProPathId | 'all'>('all')
  const [shuffled, setShuffled] = useState<PrepItem[] | null>(null)

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  const allItems = useMemo(() => {
    const items: PrepItem[] = []
    const lessons = getAllProLessons()
    for (const l of lessons) {
      if (!l.interviewQuestions) continue
      l.interviewQuestions.forEach((q, qIndex) => {
        items.push({ lessonId: l.id, pathId: l.pathId, question: q, qIndex })
      })
    }
    return items
  }, [])

  const roleFilter = roleParam as ProRole | undefined

  const filtered = useMemo(() => {
    let list = shuffled ?? allItems
    if (pathTab !== 'all') list = list.filter((i) => i.pathId === pathTab)
    if (roleFilter && PRO_ROLES.some((r) => r.id === roleFilter)) {
      list = list.filter((i) => {
        const path = PRO_CURRICULUM.find((p) => p.id === i.pathId)
        return path?.targetRoles.includes(roleFilter)
      })
    }
    return list
  }, [allItems, shuffled, pathTab, roleFilter])

  useEffect(() => {
    setShuffled(null)
  }, [pathTab, roleFilter])

  const counts = useMemo(() => {
    const m: Partial<Record<ProPathId, number>> = {}
    for (const i of allItems) {
      m[i.pathId] = (m[i.pathId] ?? 0) + 1
    }
    return m
  }, [allItems])

  if (!profile) return null

  return (
    <ProShell title="Interview Prep Bank" subtitle="Expand each question to reveal a concise model answer.">
      <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
        <Button
          variant="outlined"
          onClick={() => {
            let pool = [...allItems]
            if (pathTab !== 'all') pool = pool.filter((i) => i.pathId === pathTab)
            if (roleFilter && PRO_ROLES.some((r) => r.id === roleFilter)) {
              pool = pool.filter((i) => {
                const path = PRO_CURRICULUM.find((p) => p.id === i.pathId)
                return path?.targetRoles.includes(roleFilter)
              })
            }
            setShuffled(shuffle(pool))
          }}
          sx={{ borderColor: PRO_UI.border, color: '#fff' }}
        >
          Shuffle All
        </Button>
        {PRO_ROLES.slice(0, 4).map((r) => (
          <Chip
            key={r.id}
            label={r.title}
            onClick={() => navigate(`/pro/interview-prep/${r.id}`)}
            sx={{ bgcolor: roleFilter === r.id ? 'rgba(99,102,241,0.3)' : PRO_UI.surface, color: '#fff' }}
          />
        ))}
        {roleFilter && (
          <Chip label="Clear role" onClick={() => navigate('/pro/interview-prep')} sx={{ color: '#fff' }} />
        )}
      </Stack>
      <Tabs
        value={pathTab}
        onChange={(_, v) => setPathTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, '& .MuiTab-root': { color: PRO_UI.textMuted } }}
      >
        <Tab label={`All (${allItems.length})`} value="all" />
        {PRO_CURRICULUM.map((p) => (
          <Tab key={p.id} label={`${p.title} (${counts[p.id] ?? 0})`} value={p.id} />
        ))}
      </Tabs>
      <Typography variant="body2" sx={{ color: PRO_UI.textMuted, mb: 2 }}>
        Showing {filtered.length} questions
      </Typography>
      {filtered.map((item, index) => (
        <InterviewPrepCard
          key={`${item.lessonId}-${item.qIndex}`}
          index={index}
          question={item.question}
          answer={getProInterviewAnswer(item.lessonId, item.qIndex, item.question)}
          interviewContext={`Path: ${PRO_CURRICULUM.find((p) => p.id === item.pathId)?.title ?? item.pathId}`}
        />
      ))}
    </ProShell>
  )
}

export default InterviewPrep
