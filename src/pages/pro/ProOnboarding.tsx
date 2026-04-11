import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  MenuItem,
  Slider,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Autocomplete,
  Stack,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { OnboardingGoal, OnboardingSkill, OnboardingState, ProPathId } from '../../types/pro.types'
import { onboardingSkillsForRole, recommendRole } from '../../utils/roleRecommender'
import { useProProgress } from '../../hooks/useProProgress'
import { deriveExperienceLevel } from '../../utils/proProfile'
import { PRO_UI } from '../../constants/proUi'
import PathCard from '../../components/pro/PathCard'
import RoleRoadmap from '../../components/pro/RoleRoadmap'
import SkillMatrix from '../../components/pro/SkillMatrix'
import { getProPath } from '../../constants/proCurriculum'
import { PRO_ROLES } from '../../constants/proRoles'

const JOB_TITLES = [
  'Software Engineer',
  'Data Analyst',
  'Product Manager',
  'Business Analyst',
  'Student',
  'Data Engineer',
  'Backend Developer',
  'Other',
]

const INDUSTRIES = [
  'Tech',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Education',
  'Government',
  'Other',
]

const SKILL_CARDS: { skill: OnboardingSkill; label: string; emoji: string }[] = [
  { skill: 'python', label: 'Python Programming', emoji: '🐍' },
  { skill: 'sql', label: 'SQL / Databases', emoji: '🗄️' },
  { skill: 'statistics', label: 'Statistics / Math', emoji: 'Σ' },
  { skill: 'web-dev', label: 'Web / Backend Dev', emoji: '{ }' },
  { skill: 'cloud', label: 'Cloud (AWS/GCP/Azure)', emoji: '☁️' },
  { skill: 'data-analysis', label: 'Data Analysis', emoji: '📊' },
  { skill: 'machine-learning', label: 'Machine Learning', emoji: '🧠' },
  { skill: 'llm-apis', label: 'LLMs / AI APIs', emoji: '✨' },
]

const GOAL_CARDS: {
  id: OnboardingGoal
  title: string
  desc: string
}[] = [
  {
    id: 'get-ai-job',
    title: 'Get a job in AI/ML',
    desc: 'Structured paths toward hireable projects and interview depth.',
  },
  {
    id: 'add-ai-to-role',
    title: 'Add AI to my current role',
    desc: 'Practical GenAI and LLM workflows without a full career pivot.',
  },
  { id: 'lead-ai', title: 'Lead AI initiatives', desc: 'Strategy, governance, and team narratives for leaders.' },
  {
    id: 'build-something',
    title: 'Build something with AI',
    desc: 'Ship portfolio-grade assistants, RAG apps, and agents.',
  },
  { id: 'research-ai', title: 'Research AI', desc: 'Foundations through deep learning and modern LLM science.' },
]

const HOUR_OPTIONS: { h: 5 | 10 | 15 | 20; title: string; desc: string; rec?: boolean }[] = [
  { h: 5, title: '5 hours / week', desc: 'Slow and steady — one lesson every few days' },
  { h: 10, title: '10 hours / week', desc: 'Steady pace — 2-3 lessons per week', rec: true },
  { h: 15, title: '15 hours / week', desc: 'Full send — finish most paths in 3-4 months' },
  { h: 20, title: '20 hours / week', desc: 'Bootcamp mode — intensive, fast-tracked' },
]

const steps = ['You', 'Skills', 'Goal', 'Time', 'Roadmap']

const initialState: OnboardingState = {
  name: '',
  currentJobTitle: '',
  industry: 'Tech',
  yearsExperience: 0,
  skills: [],
  mathComfort: 3,
  goal: null,
  weeklyHoursAvailable: null,
}

const ProOnboarding: React.FC = () => {
  const navigate = useNavigate()
  const { saveProfile, hasProProfile } = useProProgress()
  const [activeStep, setActiveStep] = useState(0)
  const [state, setState] = useState<OnboardingState>(initialState)

  useEffect(() => {
    if (hasProProfile) navigate('/pro', { replace: true })
  }, [hasProProfile, navigate])

  const recommendation = useMemo(() => recommendRole(state), [state])

  const stepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return state.name.trim().length > 0 && state.currentJobTitle.trim().length > 0
      case 1:
        return true
      case 2:
        return state.goal !== null
      case 3:
        return state.weeklyHoursAvailable !== null
      default:
        return true
    }
  }

  const handleStart = () => {
    if (!state.goal || !state.weeklyHoursAvailable) return
    const rec = recommendRole(state)
    const profile = {
      id: `pro-${Date.now()}`,
      name: state.name.trim(),
      currentRole: state.currentJobTitle.trim(),
      targetRole: rec.targetRole,
      experienceLevel: deriveExperienceLevel(state.yearsExperience, state.skills),
      weeklyHoursAvailable: state.weeklyHoursAvailable,
      activePaths: [rec.primaryPath],
      completedPaths: [] as ProPathId[],
      certifications: [] as string[],
      portfolioProjects: [],
      industry: state.industry,
      goal: state.goal,
      skills: state.skills,
      mathComfort: state.mathComfort,
      yearsExperience: state.yearsExperience,
      xpTotal: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString().slice(0, 10),
    }
    saveProfile(profile)
    navigate('/pro')
  }

  const progressPct = ((activeStep + 1) / steps.length) * 100

  const primaryPath = getProPath(recommendation.primaryPath)

  return (
    <Box
      sx={{
        m: { xs: -2, sm: -3 },
        p: { xs: 2, sm: 3 },
        minHeight: 'calc(100vh - 56px)',
        bgcolor: PRO_UI.slate900,
        color: '#fff',
      }}
    >
      <LinearProgress
        variant="determinate"
        value={progressPct}
        sx={{
          mb: 2,
          height: 4,
          borderRadius: 2,
          bgcolor: 'rgba(51,65,85,0.5)',
          '& .MuiLinearProgress-bar': { bgcolor: PRO_UI.primary },
        }}
      />
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3, '& .MuiStepLabel-label': { color: PRO_UI.textMuted } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Stack spacing={2} maxWidth={560}>
          <Typography variant="h5" fontWeight={800}>
            Tell us about yourself
          </Typography>
          <TextField
            label="Name"
            value={state.name}
            onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
            fullWidth
            InputLabelProps={{ sx: { color: PRO_UI.textMuted } }}
            sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }}
          />
          <Autocomplete
            freeSolo
            options={JOB_TITLES}
            value={state.currentJobTitle}
            onInputChange={(_, v) => setState((s) => ({ ...s, currentJobTitle: v }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Current Job Title"
                InputLabelProps={{ sx: { color: PRO_UI.textMuted } }}
                sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }}
              />
            )}
          />
          <TextField
            select
            label="Industry"
            value={state.industry}
            onChange={(e) => setState((s) => ({ ...s, industry: e.target.value }))}
            fullWidth
            InputLabelProps={{ sx: { color: PRO_UI.textMuted } }}
            sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }}
          >
            {INDUSTRIES.map((i) => (
              <MenuItem key={i} value={i}>
                {i}
              </MenuItem>
            ))}
          </TextField>
          <Box>
            <Typography gutterBottom sx={{ color: PRO_UI.textMuted }}>
              Years of experience: {state.yearsExperience}
            </Typography>
            <Slider
              value={state.yearsExperience}
              onChange={(_, v) => setState((s) => ({ ...s, yearsExperience: v as number }))}
              min={0}
              max={20}
              sx={{ color: PRO_UI.primary }}
            />
          </Box>
        </Stack>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            What&apos;s your technical foundation?
          </Typography>
          <Grid container spacing={1.5}>
            {SKILL_CARDS.map((c) => {
              const on = state.skills.includes(c.skill)
              return (
                <Grid item xs={6} key={c.skill}>
                  <Card
                    sx={{
                      bgcolor: on ? 'rgba(99,102,241,0.2)' : PRO_UI.surface,
                      border: `2px solid ${on ? PRO_UI.primary : PRO_UI.border}`,
                    }}
                  >
                    <CardActionArea onClick={() =>
                      setState((s) => ({
                        ...s,
                        skills: on ? s.skills.filter((x) => x !== c.skill) : [...s.skills, c.skill],
                      }))
                    }
                    >
                      <CardContent>
                        <Typography variant="h5">{c.emoji}</Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#fff' }}>
                          {c.label}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
          <Box mt={3}>
            <Typography sx={{ color: PRO_UI.textMuted }} gutterBottom>
              Math comfort: {state.mathComfort}{' '}
              {state.mathComfort === 1 ? '(Math makes me sweat)' : state.mathComfort === 5 ? '(I dream in matrices)' : ''}
            </Typography>
            <Slider
              value={state.mathComfort}
              min={1}
              max={5}
              marks={[
                { value: 1, label: '1' },
                { value: 5, label: '5' },
              ]}
              onChange={(_, v) => setState((s) => ({ ...s, mathComfort: v as number }))}
              sx={{ color: PRO_UI.secondary }}
            />
          </Box>
        </Box>
      )}

      {activeStep === 2 && (
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            What&apos;s your goal?
          </Typography>
          <Stack spacing={1.5}>
            {GOAL_CARDS.map((g) => {
              const sel = state.goal === g.id
              return (
                <Card
                  key={g.id}
                  onClick={() => setState((s) => ({ ...s, goal: g.id }))}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: sel ? 'rgba(99,102,241,0.15)' : PRO_UI.surface,
                    border: `2px solid ${sel ? PRO_UI.primary : PRO_UI.border}`,
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      {sel && <CheckCircleIcon sx={{ color: PRO_UI.primary }} />}
                      <Box>
                        <Typography fontWeight={800} sx={{ color: '#fff' }}>
                          {g.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: PRO_UI.textMuted }}>
                          {g.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        </Box>
      )}

      {activeStep === 3 && (
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            How much time per week?
          </Typography>
          <Grid container spacing={1.5}>
            {HOUR_OPTIONS.map((o) => {
              const sel = state.weeklyHoursAvailable === o.h
              return (
                <Grid item xs={12} sm={6} key={o.h}>
                  <Card
                    onClick={() => setState((s) => ({ ...s, weeklyHoursAvailable: o.h }))}
                    sx={{
                      cursor: 'pointer',
                      border: `2px solid ${sel ? PRO_UI.primary : PRO_UI.border}`,
                      bgcolor: sel ? 'rgba(99,102,241,0.12)' : PRO_UI.surface,
                    }}
                  >
                    <CardContent>
                      <Typography fontWeight={800} sx={{ color: '#fff' }}>
                        {o.title}{' '}
                        {o.rec && (
                          <Typography component="span" variant="caption" sx={{ color: PRO_UI.secondary, ml: 1 }}>
                            RECOMMENDED
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ color: PRO_UI.textMuted }}>
                        {o.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {activeStep === 4 && primaryPath && (
        <Box>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Your personalized roadmap
          </Typography>
          <Box
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${PRO_UI.primary}, #4338ca)`,
            }}
          >
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Target role
            </Typography>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#fff' }}>
              {PRO_ROLES.find((r) => r.id === recommendation.targetRole)?.title}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <PathCard path={primaryPath} onEnroll={() => {}} isEnrolled={false} />
            </Grid>
            <Grid item xs={12} md={6}>
              <SkillMatrix
                userSkills={state.skills}
                requiredSkills={onboardingSkillsForRole(recommendation.targetRole)}
              />
            </Grid>
            <Grid item xs={12}>
              <RoleRoadmap recommendation={recommendation} />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3, py: 1.5, fontWeight: 800, bgcolor: PRO_UI.primary }}
            onClick={handleStart}
          >
            Start My Journey
          </Button>
        </Box>
      )}

      <Stack direction="row" justifyContent="space-between" mt={4}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          sx={{ color: PRO_UI.textMuted }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          disabled={!stepValid(activeStep) || activeStep === steps.length - 1}
          onClick={() => setActiveStep((s) => Math.min(steps.length - 1, s + 1))}
          sx={{ bgcolor: PRO_UI.secondary, fontWeight: 700 }}
        >
          Next
        </Button>
      </Stack>
    </Box>
  )
}

export default ProOnboarding
