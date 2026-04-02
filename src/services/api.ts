import axios from 'axios';
import { CurriculumMeta, PhaseData, ScenarioDrillData, ScenarioThemeBundle, AssignmentSection } from '../types';

// Base URL for data files (relative to public/)
const BASE = ((import.meta as unknown) as { env: { BASE_URL: string } }).env.BASE_URL || '/';

const api = axios.create({
  baseURL: `${BASE}data/`,
  timeout: 15000,
});

// ─── Fetch Curriculum Metadata ─────────────────────────────
export const fetchCurriculum = async (): Promise<CurriculumMeta> => {
  const { data } = await api.get<CurriculumMeta>('curriculum.json');
  return data;
};

// ─── Fetch Phase Data ──────────────────────────────────────
export const fetchPhase = async (phaseFile: string): Promise<PhaseData> => {
  const { data } = await api.get<PhaseData>(phaseFile);
  return data;
};

// ─── Search Across All Phases ──────────────────────────────
export const fetchAllPhases = async (
  phaseFiles: string[]
): Promise<PhaseData[]> => {
  const results = await Promise.allSettled(
    phaseFiles.map((file) => fetchPhase(file))
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<PhaseData> => r.status === 'fulfilled'
    )
    .map((r) => r.value);
};

// ─── Cache ─────────────────────────────────────────────────
const phaseCache = new Map<string, PhaseData>();

export const fetchPhaseWithCache = async (
  phaseFile: string
): Promise<PhaseData> => {
  if (phaseCache.has(phaseFile)) {
    return phaseCache.get(phaseFile)!;
  }
  const data = await fetchPhase(phaseFile);
  phaseCache.set(phaseFile, data);
  return data;
};

export const clearPhaseCache = () => phaseCache.clear();

// ─── Scenario Interview Drill ────────────────────────────────
let scenarioDrillCache: ScenarioDrillData | null = null;

export const fetchScenarioDrill = async (): Promise<ScenarioDrillData> => {
  if (scenarioDrillCache) {
    return scenarioDrillCache;
  }
  const [{ data: main }, themesResult] = await Promise.all([
    api.get<ScenarioDrillData>('scenarioDrill.json'),
    api
      .get<{ version: number; themes: ScenarioThemeBundle[] }>('scenarioInterviewThemes.json')
      .catch(() => ({ data: { version: 0, themes: [] as ScenarioThemeBundle[] } })),
  ]);
  const merged: ScenarioDrillData = {
    ...main,
    interviewThemes: Array.isArray(themesResult.data?.themes) ? themesResult.data.themes : [],
  };
  scenarioDrillCache = merged;
  return merged;
};

export const clearScenarioDrillCache = () => {
  scenarioDrillCache = null;
};

/** Day numbers that have at least one scenario in `scenarioDrill.json` */
export const getScenarioDrillDaysWithContent = async (): Promise<Set<number>> => {
  const d = await fetchScenarioDrill();
  return new Set(
    d.days.filter((b) => Array.isArray(b.scenarios) && b.scenarios.length > 0).map((b) => b.day)
  );
};

// ─── Assignment Data ─────────────────────────────────────────
interface AssignmentFile {
  phase: number;
  title: string;
  assignments: Record<string, AssignmentSection>;
}

const assignmentCache = new Map<number, AssignmentFile>();

const PHASE_FOR_DAY = (day: number): number => {
  if (day <= 9)  return 1;
  if (day <= 18) return 2;
  if (day <= 27) return 3;
  if (day <= 37) return 4;
  if (day <= 48) return 5;
  if (day <= 58) return 6;
  if (day <= 67) return 7;
  if (day <= 76) return 8;
  if (day <= 84) return 9;
  return 10;
};

export const fetchAssignmentForDay = async (
  day: number
): Promise<AssignmentSection | null> => {
  const phase = PHASE_FOR_DAY(day);
  if (!assignmentCache.has(phase)) {
    try {
      const { data } = await api.get<AssignmentFile>(
        `assignments_phase${phase}.json`
      );
      assignmentCache.set(phase, data);
    } catch {
      return null;
    }
  }
  const file = assignmentCache.get(phase);
  return file?.assignments?.[String(day)] ?? null;
};

export default api;
