import type { ExperienceLevel, OnboardingSkill } from '../types/pro.types'

export function deriveExperienceLevel(
  yearsExperience: number,
  skills: OnboardingSkill[]
): ExperienceLevel {
  const technical =
    skills.includes('python') ||
    skills.includes('machine-learning') ||
    skills.includes('web-dev') ||
    skills.includes('llm-apis')

  if (!technical && yearsExperience <= 3) return 'non-technical'
  if (skills.includes('machine-learning') && yearsExperience >= 3) return 'ml-practitioner'
  if (yearsExperience >= 8 && technical) return 'senior-dev'
  if (yearsExperience >= 3) return 'intermediate-dev'
  return 'beginner-dev'
}
