// ============================================================
// Satyverse(Satyam Parmar) — Type Definitions
// ============================================================

export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type Track = 'Fresher' | 'Mid-Level' | 'Senior' | 'Staff';
export type Difficulty = Level;

// ─── Curriculum Meta ────────────────────────────────────────
export interface CurriculumMeta {
  title: string;
  subtitle: string;
  totalDays: number;
  hoursPerDay: number;
  tracks: TrackMeta[];
  phases: PhaseMeta[];
}

export interface TrackMeta {
  id: string;
  name: Track;
  days: string;
  color: string;
  description: string;
}

export interface PhaseMeta {
  id: string;
  number: number;
  title: string;
  days: string;
  file: string;
  color: string;
  icon: string;
  totalTopics: number;
  level: Level;
  track: Track;
}

// ─── Phase Data ─────────────────────────────────────────────
export interface PhaseData {
  phase: number;
  title: string;
  days: LessonDay[];
}

// ─── Lesson Day ─────────────────────────────────────────────
export interface LessonDay {
  day: number;
  title: string;
  estimatedHours: number;
  difficulty: Difficulty;
  level: Level;
  track: Track;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  sections: LessonSection[];
}

// ─── Section Types ───────────────────────────────────────────
export type LessonSection =
  | WhySection
  | TheorySection
  | CodeSection
  | DiagramSection
  | PitfallsSection
  | InterviewSection
  | CheatsheetSection
  | ExerciseSection
  | AssignmentSection;

export interface WhySection {
  type: 'why';
  title: string;
  content: string;
}

export interface TheorySection {
  type: 'theory';
  title: string;
  content: string;
}

export interface CodeSection {
  type: 'code';
  title: string;
  /** Short intent: what this snippet demonstrates (shown above the code block). */
  description?: string;
  language: string;
  filename: string;
  code: string;
  level: 'basic' | 'intermediate' | 'advanced';
  output?: string;
}

export interface DiagramSection {
  type: 'diagram';
  title: string;
  diagramType: string;
  description: string;
  plantuml: string;
}

export interface PitfallsSection {
  type: 'pitfalls';
  title: string;
  items: string[];
}

export interface CheatsheetSection {
  type: 'cheatsheet';
  title: string;
  content: string;
}

export interface ExerciseSection {
  type: 'exercise';
  title: string;
  problem: string;
  hints: string[];
  solution: string;
  difficulty: Difficulty;
}

// ─── Assignment Section ───────────────────────────────────────
export type AssignmentQuestionType = 'conceptual' | 'scenario' | 'coding';

export interface AssignmentQuestion {
  id: string;
  type: AssignmentQuestionType;
  difficulty: Difficulty;
  title: string;
  question: string;
  hints: string[];
  solution: string;
  /** Starter code shown in editor for coding questions */
  codeTemplate?: string;
  /** Expected program output for coding questions */
  expectedOutput?: string;
  /** Points awarded for this question */
  points: number;
}

export interface AssignmentSection {
  type: 'assignment';
  title: string;
  description: string;
  totalPoints: number;
  questions: AssignmentQuestion[];
}

export interface InterviewSection {
  type: 'interview';
  title: string;
  conceptual: { question: string; answer: string }[];
  codeBased: { question: string; answer: string }[];
  seniorScenario: { question: string; answer: string }[];
  wrongAnswers: string[];
}

// ─── Scenario Interview Drill (standalone JSON) ─────────────
export interface ScenarioFollowUp {
  question: string;
  /** Markdown: steps, theory, fenced code, shell commands */
  answer: string;
}

export interface ScenarioItem {
  id: string;
  question: string;
  /** Keywords / signals interviewers listen for */
  signals?: string[];
  /** Markdown answer */
  answer: string;
  followUps?: ScenarioFollowUp[];
}

export interface ScenarioDayBundle {
  day: number;
  title: string;
  phaseId: string;
  tags?: string[];
  scenarios: ScenarioItem[];
}

/** LinkedIn-style topic packs (OAuth, microservices, etc.) — optional merge from `scenarioInterviewThemes.json` */
export interface ScenarioThemeBundle {
  id: string;
  title: string;
  /** Short intro shown under the title */
  subtitle?: string;
  tags?: string[];
  scenarios: ScenarioItem[];
}

export interface ScenarioDrillData {
  version: number;
  days: ScenarioDayBundle[];
  /** Merged at load time from `scenarioInterviewThemes.json` when present */
  interviewThemes?: ScenarioThemeBundle[];
}

// ─── App Progress ────────────────────────────────────────────
export interface AppProgress {
  completedDays: number[];
  currentDay: number;
  lastVisited: string;
  phaseProgress: Record<string, number>;
  notes: Record<string, string>;
  quizScores: Record<string, { knew: number; review: number; date: string }>;
  bookmarks: number[];
  streak: number;
  lastStudyDate: string;
  totalHours: number;
  exercisesSolved: number[];
  /** Maps day number → array of completed question IDs */
  assignmentsCompleted: Record<string, string[]>;
}

// ─── KPI ─────────────────────────────────────────────────────
export interface KPI {
  id: string;
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

// ─── Search ──────────────────────────────────────────────────
export interface SearchResult {
  dayNumber: number;
  phase: string;
  phaseTitle: string;
  dayTitle: string;
  matchType: 'title' | 'tag' | 'theory' | 'interview' | 'code';
  snippet: string;
  score: number;
}

// ─── Quiz ─────────────────────────────────────────────────────
export interface QuizSession {
  dayNumber: number;
  questions: QuizQuestion[];
  currentIndex: number;
  knew: number;
  review: number;
}

export interface QuizQuestion {
  question: string;
  answer: string;
  type: 'conceptual' | 'codeBased' | 'seniorScenario';
  flipped: boolean;
}

// ─── Onboarding ──────────────────────────────────────────────
export interface OnboardingAnswer {
  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior';
  yearsOfExperience: number;
  javaKnowledge: 'none' | 'basic' | 'intermediate' | 'advanced';
  targetRole: 'fresher' | 'mid' | 'senior' | 'staff';
}

// ─── Activity ─────────────────────────────────────────────────
export interface StudyActivity {
  date: string;
  dayNumber: number;
  dayTitle: string;
  hoursSpent: number;
}
