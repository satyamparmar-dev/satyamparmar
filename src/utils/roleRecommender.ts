import { PRO_CURRICULUM } from '../constants/proCurriculum'
import { PRO_ROLES } from '../constants/proRoles'
import type { OnboardingSkill, OnboardingState, Recommendation, ProPathId, ProRole } from '../types/pro.types'

/** Skills that materially overlap each role (used for gap scoring + SkillMatrix). */
export const PRO_ROLE_ONBOARDING_RELEVANCE: Record<ProRole, OnboardingSkill[]> = {
  'ai-engineer': ['python', 'llm-apis', 'web-dev', 'cloud', 'machine-learning'],
  'ml-engineer': ['python', 'machine-learning', 'statistics', 'sql', 'data-analysis', 'cloud'],
  'genai-engineer': ['python', 'llm-apis', 'web-dev', 'machine-learning', 'cloud'],
  'data-scientist': ['python', 'statistics', 'sql', 'data-analysis', 'machine-learning'],
  'mlops-engineer': ['python', 'cloud', 'machine-learning', 'web-dev', 'sql'],
  'ai-researcher': ['python', 'machine-learning', 'statistics', 'llm-apis'],
  'ai-product-manager': ['llm-apis', 'data-analysis', 'statistics'],
  'ai-ethics-officer': ['data-analysis', 'statistics'],
  'domain-ml-specialist': ['python', 'machine-learning', 'sql', 'statistics', 'llm-apis'],
  'ai-leader-non-technical': ['data-analysis'],
}

function sumPathWeeks(pathIds: ProPathId[]): number {
  return pathIds.reduce((sum, id) => {
    const p = PRO_CURRICULUM.find((x) => x.id === id)
    return sum + (p?.estimatedWeeks ?? 0)
  }, 0)
}

function hoursMultiplier(h: 5 | 10 | 15 | 20 | null): number {
  switch (h) {
    case 5:
      return 2.5
    case 10:
      return 1.4
    case 15:
      return 1.0
    case 20:
      return 0.75
    default:
      return 1.4
  }
}

export function onboardingSkillsForRole(role: ProRole): OnboardingSkill[] {
  return PRO_ROLE_ONBOARDING_RELEVANCE[role]
}

function skillGapScoreForRole(role: ProRole, skills: OnboardingSkill[]): number {
  const relevant = new Set(PRO_ROLE_ONBOARDING_RELEVANCE[role])
  return skills.filter((s) => relevant.has(s)).length
}

function buildRationale(
  goal: OnboardingState['goal'],
  skills: OnboardingSkill[],
  targetRole: ProRole,
  orderedPaths: ProPathId[]
): string {
  const g = goal ?? 'get-ai-job'
  const skillHint =
    skills.length === 0
      ? 'your baseline skill selections'
      : skills.includes('python')
        ? 'your Python experience'
        : 'your current strengths'
  const pathHint = orderedPaths[0] ?? 'python-for-ai'
  if (g === 'get-ai-job') {
    return `Because you want to land an AI role and we weighed ${skillHint}, we prioritise **${PRO_ROLES.find((r) => r.id === targetRole)?.title ?? targetRole}** starting with **${pathHint}** for the fastest credible stack.`
  }
  if (g === 'add-ai-to-role') {
    return `To bolt AI onto an existing job, this track emphasises practical GenAI delivery without forcing a full research detour, anchored on **${pathHint}**.`
  }
  if (g === 'lead-ai') {
    return `For leadership scope we bias toward strategy, governance, and literacy paths so you can steer teams without needing to own every notebook.`
  }
  if (g === 'build-something') {
    return `You want shipped artifacts—this orders GenAI, agents, and deployment paths so portfolio projects stay interview-defensible.`
  }
  if (g === 'research-ai') {
    return `Research-oriented goals push deeper into fundamentals, deep learning, and LLM science before product polish.`
  }
  return `This default balances Python foundations, classical ML, and LLM engineering so you can specialise after the first milestones.`
}

export function recommendRole(state: OnboardingState): Recommendation {
  const hours = state.weeklyHoursAvailable ?? 10
  const skills = state.skills ?? []
  const has = (s: OnboardingSkill) => skills.includes(s)

  let targetRole: ProRole = 'ai-engineer'
  let orderedPaths: ProPathId[] = ['python-for-ai', 'ml-fundamentals', 'llm-engineering']

  if (state.goal === 'get-ai-job') {
    if (has('machine-learning') && has('python')) {
      targetRole = 'ml-engineer'
      orderedPaths = ['ml-fundamentals', 'deep-learning', 'mlops-and-deployment']
    } else if (has('llm-apis')) {
      targetRole = 'ai-engineer'
      orderedPaths = ['llm-engineering', 'genai-and-rag', 'agentic-ai']
    } else if (has('web-dev') && has('python')) {
      targetRole = 'genai-engineer'
      orderedPaths = ['llm-engineering', 'genai-and-rag', 'agentic-ai']
    } else if (has('python')) {
      targetRole = 'ml-engineer'
      orderedPaths = ['ml-fundamentals', 'deep-learning', 'mlops-and-deployment']
    } else {
      targetRole = 'ai-engineer'
      orderedPaths = ['python-for-ai', 'ml-fundamentals', 'llm-engineering']
    }
  } else if (state.goal === 'add-ai-to-role') {
    if (has('python')) {
      targetRole = 'genai-engineer'
      orderedPaths = ['genai-and-rag', 'agentic-ai', 'llm-engineering']
    } else {
      targetRole = 'ai-leader-non-technical'
      orderedPaths = ['ai-for-leaders', 'domain-specialization']
    }
  } else if (state.goal === 'lead-ai') {
    targetRole = 'ai-leader-non-technical'
    orderedPaths = ['ai-for-leaders', 'domain-specialization']
  } else if (state.goal === 'build-something') {
    targetRole = 'genai-engineer'
    orderedPaths = ['genai-and-rag', 'agentic-ai', 'mlops-and-deployment']
  } else if (state.goal === 'research-ai') {
    targetRole = 'ai-researcher'
    orderedPaths = ['ml-fundamentals', 'deep-learning', 'llm-engineering']
  }

  const primaryPath = orderedPaths[0] ?? 'python-for-ai'
  const slice = orderedPaths.slice(0, 3)
  const baseWeeks = sumPathWeeks(slice)
  const mult = hoursMultiplier(state.weeklyHoursAvailable)
  const estimatedWeeks = Math.max(1, Math.ceil(baseWeeks * mult))

  const skillGapScore = skillGapScoreForRole(targetRole, skills)
  const roleMeta = PRO_ROLES.find((r) => r.id === targetRole)
  const salaryRange = roleMeta?.salaryRange ?? '$120k–$180k USD'

  const rationale = buildRationale(state.goal, skills, targetRole, orderedPaths)

  return {
    targetRole,
    primaryPath,
    orderedPaths,
    estimatedWeeks,
    skillGapScore,
    salaryRange,
    rationale,
  }
}
