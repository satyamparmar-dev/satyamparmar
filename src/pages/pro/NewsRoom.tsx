import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Card, CardContent, Chip, Stack, Button } from '@mui/material'
import type { IndustryNews, ProPathId } from '../../types/pro.types'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import { PRO_UI } from '../../constants/proUi'
import { usePageTitle } from '../../hooks/usePageTitle'

const MOCK_NEWS: IndustryNews[] = [
  {
    id: '1',
    title: 'Claude 4 family doubles down on long-context tool use',
    source: 'Synthetic Wire',
    tags: ['LLM', 'agents'],
    summary: 'Enterprise buyers are evaluating safer defaults for autonomous tool loops and audit logs.',
    url: 'https://example.com/claude4',
    relatedPathIds: ['llm-engineering', 'agentic-ai'],
  },
  {
    id: '2',
    title: 'GPT-5 class models push eval harnesses to production parity',
    source: 'Model Notes',
    tags: ['evals', 'safety'],
    summary: 'Teams mirror offline RAGAS-style suites in CI to block regressions before deploy.',
    url: 'https://example.com/gpt5-evals',
    relatedPathIds: ['genai-and-rag', 'llm-engineering'],
  },
  {
    id: '3',
    title: 'Gemini 2.5 Flash highlights multimodal pricing experiments',
    source: 'Cloud Daily',
    tags: ['multimodal', 'cost'],
    summary: 'Finance orgs ask for per-feature unit economics as video+text apps scale.',
    url: 'https://example.com/gemini25',
    relatedPathIds: ['genai-and-rag'],
  },
  {
    id: '4',
    title: 'Open-weight MoE checkpoints close the gap on closed APIs',
    source: 'OSS Radar',
    tags: ['open models', 'MoE'],
    summary: 'Distilled routers and speculative decoding make local inference competitive for many RAG apps.',
    url: 'https://example.com/openmoe',
    relatedPathIds: ['llm-engineering', 'mlops-and-deployment'],
  },
  {
    id: '5',
    title: 'EU AI Act: documentation expectations for GenAI vendors',
    source: 'Policy Brief',
    tags: ['regulation', 'governance'],
    summary: 'Product legal teams want traceable data lineage attached to every fine-tune.',
    url: 'https://example.com/eu-ai-act',
    relatedPathIds: ['ai-for-leaders', 'domain-specialization'],
  },
  {
    id: '6',
    title: 'Vector database market consolidates around Postgres + disk ANN',
    source: 'Infra Review',
    tags: ['vector', 'postgres'],
    summary: 'Hybrid SQL + vector patterns reduce moving parts for mid-size teams.',
    url: 'https://example.com/pgvector',
    relatedPathIds: ['genai-and-rag', 'llm-engineering'],
  },
]

const NewsRoom: React.FC = () => {
  usePageTitle('Newsroom')
  const navigate = useNavigate()
  const { hasProProfile } = useProProgress()
  const [filter, setFilter] = useState<ProPathId | 'all'>('all')

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  const visible = useMemo(() => {
    if (filter === 'all') return MOCK_NEWS
    return MOCK_NEWS.filter((n) => n.relatedPathIds?.includes(filter))
  }, [filter])

  return (
    <ProShell title="News Room" subtitle="Curated 2026-era headlines tied to Pro paths (mock data).">
      <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
        <Chip label="All" onClick={() => setFilter('all')} sx={{ bgcolor: filter === 'all' ? 'rgba(99,102,241,0.3)' : PRO_UI.surface, color: '#fff' }} />
        {(['llm-engineering', 'genai-and-rag', 'agentic-ai'] as ProPathId[]).map((id) => (
          <Chip key={id} label={id} onClick={() => setFilter(id)} sx={{ bgcolor: filter === id ? 'rgba(99,102,241,0.3)' : PRO_UI.surface, color: '#fff' }} />
        ))}
      </Stack>
      <Grid container spacing={2}>
        {visible.map((n) => (
          <Grid item xs={12} md={6} key={n.id}>
            <Card sx={{ bgcolor: PRO_UI.surface, border: `1px solid ${PRO_UI.border}`, height: '100%' }}>
              <CardContent>
                <Typography variant="overline" sx={{ color: PRO_UI.secondary }}>
                  {n.source}
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 1 }}>
                  {n.title}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1}>
                  {n.tags.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ bgcolor: 'rgba(51,65,85,0.6)', color: PRO_UI.textMuted }} />
                  ))}
                </Stack>
                <Typography variant="body2" sx={{ color: PRO_UI.slate300, mb: 2 }}>
                  {n.summary}
                </Typography>
                <Button href={n.url} target="_blank" rel="noreferrer" size="small" sx={{ color: PRO_UI.secondary }}>
                  Read Article
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </ProShell>
  )
}

export default NewsRoom
