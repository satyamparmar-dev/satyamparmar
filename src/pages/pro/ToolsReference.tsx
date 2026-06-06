import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material'
import { useProProgress } from '../../hooks/useProProgress'
import ProShell from '../../components/pro/ProShell'
import { PRO_CURRICULUM } from '../../constants/proCurriculum'
import type { ProPathId } from '../../types/pro.types'
import { PRO_UI } from '../../constants/proUi'
import { usePageTitle } from '../../hooks/usePageTitle'

type Cat = 'Core Python' | 'ML Libraries' | 'DL Frameworks' | 'LLM Tools' | 'Vector Databases' | 'MLOps' | 'Deployment' | 'Evaluation'

function categorize(tool: string): Cat {
  const t = tool.toLowerCase()
  if (t.includes('pytorch') || t.includes('cuda') || t.includes('torch')) return 'DL Frameworks'
  if (t.includes('kubernetes') || t.includes('helm') || t.includes('docker')) return 'Deployment'
  if (t.includes('vector') || t.includes('chroma') || t.includes('pgvector') || t.includes('neo4j')) return 'Vector Databases'
  if (t.includes('mlflow') || t.includes('dvc') || t.includes('sagemaker') || t.includes('vertex') || t.includes('azure ml')) return 'MLOps'
  if (t.includes('openai') || t.includes('langchain') || t.includes('llama') || t.includes('anthropic') || t.includes('ollama') || t.includes('mcp')) return 'LLM Tools'
  if (t.includes('ragas') || t.includes('eval')) return 'Evaluation'
  if (t.includes('scikit') || t.includes('pandas') || t.includes('numpy') || t.includes('xgboost') || t.includes('lightgbm')) return 'ML Libraries'
  return 'Core Python'
}

const ToolsReference: React.FC = () => {
  usePageTitle('Tools Reference')
  const navigate = useNavigate()
  const { hasProProfile } = useProProgress()

  useEffect(() => {
    if (!hasProProfile) navigate('/pro/onboarding', { replace: true })
  }, [hasProProfile, navigate])

  const catalog = useMemo(() => {
    const map = new Map<string, Set<ProPathId>>()
    for (const path of PRO_CURRICULUM) {
      const add = (tool: string) => {
        if (!map.has(tool)) map.set(tool, new Set())
        map.get(tool)!.add(path.id)
      }
      for (const t of path.tools) add(t)
      for (const w of path.weeks) {
        for (const l of w.lessons) {
          for (const t of l.tools) add(t)
        }
      }
    }
    const rows: { name: string; cat: Cat; paths: ProPathId[]; desc: string }[] = []
    map.forEach((set, name) => {
      const cat = categorize(name)
      const desc =
        cat === 'LLM Tools'
          ? 'Used in LLM apps, agents, or prompt pipelines.'
          : cat === 'ML Libraries'
            ? 'Classical ML and data workflows.'
            : cat === 'DL Frameworks'
              ? 'Neural network training and inference.'
              : cat === 'Vector Databases'
                ? 'Embeddings storage and retrieval.'
                : cat === 'MLOps'
                  ? 'Experiment tracking, registry, and cloud ML.'
                  : cat === 'Deployment'
                    ? 'Containers and orchestration.'
                    : cat === 'Evaluation'
                      ? 'Quality measurement for models and RAG.'
                      : 'General Python ecosystem tooling.'
      rows.push({ name, cat, paths: [...set], desc })
    })
    rows.sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name))
    return rows
  }, [])

  const byCat = useMemo(() => {
    const m = new Map<Cat, typeof catalog>()
    for (const row of catalog) {
      if (!m.has(row.cat)) m.set(row.cat, [])
      m.get(row.cat)!.push(row)
    }
    return m
  }, [catalog])

  const catOrder: Cat[] = [
    'Core Python',
    'ML Libraries',
    'DL Frameworks',
    'LLM Tools',
    'Vector Databases',
    'MLOps',
    'Deployment',
    'Evaluation',
  ]

  return (
    <ProShell title="Tools Reference" subtitle="Tools referenced across Pro paths, grouped for quick scanning.">
      {catOrder.map((cat) => {
        const rows = byCat.get(cat)
        if (!rows?.length) return null
        return (
          <Box key={cat} mb={3}>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', mb: 1 }}>
              {cat}
            </Typography>
            <Grid container spacing={1.5}>
              {rows.map((row) => (
                <Grid item xs={12} sm={6} md={4} key={row.name}>
                  <Card sx={{ bgcolor: PRO_UI.surface, border: `1px solid ${PRO_UI.border}`, height: '100%' }}>
                    <CardContent>
                      <Typography fontWeight={800} sx={{ color: '#fff' }}>
                        {row.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: PRO_UI.slate300, my: 1 }}>
                        {row.desc}
                      </Typography>
                      <Typography variant="caption" sx={{ color: PRO_UI.textMuted }}>
                        Paths:
                      </Typography>
                      <Box mt={0.5} display="flex" flexWrap="wrap" gap={0.5}>
                        {row.paths.map((p) => (
                          <Chip key={p} label={p} size="small" sx={{ fontSize: '0.6rem', height: 20, color: PRO_UI.textMuted }} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )
      })}
    </ProShell>
  )
}

export default ToolsReference
