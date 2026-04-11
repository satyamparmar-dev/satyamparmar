export type ProRole =
  | 'ai-engineer'
  | 'ml-engineer'
  | 'genai-engineer'
  | 'data-scientist'
  | 'mlops-engineer'
  | 'ai-researcher'
  | 'ai-product-manager'
  | 'ai-ethics-officer'
  | 'domain-ml-specialist'
  | 'ai-leader-non-technical'

export type ProPathId =
  | 'python-for-ai'
  | 'ml-fundamentals'
  | 'deep-learning'
  | 'llm-engineering'
  | 'genai-and-rag'
  | 'agentic-ai'
  | 'mlops-and-deployment'
  | 'ai-for-leaders'
  | 'domain-specialization'

export type ExperienceLevel =
  | 'non-technical'
  | 'beginner-dev'
  | 'intermediate-dev'
  | 'senior-dev'
  | 'ml-practitioner'

export type OnboardingSkill =
  | 'python'
  | 'sql'
  | 'statistics'
  | 'web-dev'
  | 'cloud'
  | 'data-analysis'
  | 'machine-learning'
  | 'llm-apis'

export type OnboardingGoal =
  | 'get-ai-job'
  | 'add-ai-to-role'
  | 'lead-ai'
  | 'build-something'
  | 'research-ai'

export interface PortfolioProject {
  id: string
  title: string
  pathId: ProPathId
  skills: string[]
  githubUrl?: string
  demoUrl?: string
  completedAt: string
  isPublic: boolean
}

export interface ProjectSpec {
  id: string
  title: string
  description: string
  deliverables: string[]
  tools: string[]
  estimatedHours: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface NotebookCell {
  type: 'markdown' | 'code'
  content: string
  language?: string
}

export interface CodeNotebook {
  cells: NotebookCell[]
}

export interface ProQuizQuestion {
  id: string
  question: string
  options?: string[]
  answer: string
}

export interface IndustryNews {
  id: string
  title: string
  source: string
  tags: string[]
  summary: string
  url: string
  relatedPathIds?: ProPathId[]
}

export interface ProLesson {
  id: string
  title: string
  slug: string
  pathId: ProPathId
  weekNumber: number
  durationMinutes: number
  format: 'concept' | 'hands-on' | 'project' | 'paper-review' | 'interview-prep'
  prerequisites: string[]
  content: string
  codeNotebook?: CodeNotebook
  paperUrl?: string
  tools: string[]
  jobRelevance: string
  keyConceptTags: string[]
  hasProject: boolean
  projectSpec?: ProjectSpec
  interviewQuestions?: string[]
  estimatedSalaryImpact?: string
}

export interface ProWeek {
  weekNumber: number
  title: string
  lessons: ProLesson[]
}

export interface ProPath {
  id: ProPathId
  title: string
  tagline: string
  description: string
  prerequisite: string
  targetRoles: ProRole[]
  estimatedWeeks: number
  color: string
  icon: string
  tools: string[]
  weeks: ProWeek[]
  jobDemandScore: number
}

export interface OnboardingState {
  name: string
  currentJobTitle: string
  industry: string
  yearsExperience: number
  skills: OnboardingSkill[]
  mathComfort: number
  goal: OnboardingGoal | null
  weeklyHoursAvailable: 5 | 10 | 15 | 20 | null
}

export interface ProUserProfile {
  id: string
  name: string
  currentRole: string
  targetRole: ProRole
  experienceLevel: ExperienceLevel
  weeklyHoursAvailable: 5 | 10 | 15 | 20
  activePaths: ProPathId[]
  completedPaths: ProPathId[]
  certifications: string[]
  portfolioProjects: PortfolioProject[]
  githubUrl?: string
  linkedinUrl?: string
  xpTotal: number
  streakDays: number
  lastActiveDate: string
  industry?: string
  goal: OnboardingGoal
  skills: OnboardingSkill[]
  mathComfort: number
  yearsExperience: number
}

export interface ProProgress {
  completedLessons: string[]
  completedProjects: string[]
  completedPaths: ProPathId[]
  activePaths: ProPathId[]
  xpTotal: number
  streakDays: number
  lastActiveDate: string
  lessonNotes: Record<string, string>
  bookmarkedLessons: string[]
}

export interface Recommendation {
  targetRole: ProRole
  primaryPath: ProPathId
  orderedPaths: ProPathId[]
  estimatedWeeks: number
  skillGapScore: number
  salaryRange: string
  rationale: string
}

export interface ProRoleDefinition {
  id: ProRole
  title: string
  description: string
  salaryRange: string
  demandLevel: string
  requiredPaths: ProPathId[]
  keySkills: string[]
  topCompanies: string[]
}
