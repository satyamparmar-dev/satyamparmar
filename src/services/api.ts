import axios from 'axios';
import {
  CurriculumMeta,
  LessonDay,
  PhaseData,
  ScenarioDayBundle,
  ScenarioDrillData,
  ScenarioThemeBundle,
  AssignmentSection,
} from '../types';

function phaseFileBase(phaseFile: string): string {
  return phaseFile.replace(/\.json$/i, '');
}

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
/** Merges `externalDayNumbers` from `phase{N}.json` with `data/days/phase{N}-day{D}.json` files. */
export const fetchPhase = async (phaseFile: string): Promise<PhaseData> => {
  const { data } = await api.get<PhaseData>(phaseFile);
  const extraDayNums = data.externalDayNumbers;
  if (!extraDayNums?.length) {
    return data;
  }
  const base = phaseFileBase(phaseFile);
  const results = await Promise.allSettled(
    extraDayNums.map((n) =>
      api.get<LessonDay>(`days/${base}-day${n}.json`).then((r) => r.data)
    )
  );
  const loaded = results
    .filter((r): r is PromiseFulfilledResult<LessonDay> => r.status === 'fulfilled')
    .map((r) => r.value);
  if (results.some((r) => r.status === 'rejected')) {
    console.warn('[fetchPhase] Some external day files failed to load — skipping missing days');
  }
  const byDay = new Map((data.days ?? []).map((d) => [d.day, d]));
  for (const d of loaded) {
    byDay.set(d.day, d);
  }
  data.days = [...byDay.values()].sort((a, b) => a.day - b.day);
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
  const [mainRes, themesResult] = await Promise.all([
    api.get<ScenarioDrillData>('scenarioDrill.json'),
    api
      .get<{ version: number; themes: ScenarioThemeBundle[] }>('scenarioInterviewThemes.json')
      .catch(() => ({ data: { version: 0, themes: [] as ScenarioThemeBundle[] } })),
  ]);
  const main = mainRes.data;
  const extraNums = main.externalDayNumbers ?? [];

  let dayBundles: ScenarioDayBundle[];
  if (extraNums.length) {
    const settled = await Promise.allSettled(
      extraNums.map((n) =>
        api.get<ScenarioDayBundle>(`days/scenarioDrill-day${n}.json`).then((r) => r.data)
      )
    );
    if (settled.some((r) => r.status === 'rejected')) {
      console.warn('[fetchScenarioDrill] Some external scenario day files failed to load — skipping missing days');
    }
    const loaded = settled
      .filter((r): r is PromiseFulfilledResult<ScenarioDayBundle> => r.status === 'fulfilled')
      .map((r) => r.value);
    dayBundles = loaded.sort((a, b) => a.day - b.day);
  } else {
    dayBundles = [...(main.days ?? [])];
  }

  const merged: ScenarioDrillData = {
    ...main,
    days: dayBundles,
    interviewThemes: Array.isArray(themesResult.data?.themes) ? themesResult.data.themes : [],
  };
  scenarioDrillCache = merged;
  return merged;
};

export const clearScenarioDrillCache = () => {
  scenarioDrillCache = null;
};

/** Day numbers that have at least one scenario (merged from `scenarioDrill.json` + `days/scenarioDrill-day*.json`) */
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

/**
 * Maps a day number to its phase number.
 * ⚠️  MUST stay in sync with the phase day ranges in public/data/curriculum.json
 * If the curriculum changes, update both this function AND curriculum.json.
 * Days:  1–9  → Phase 1
 *       10–18 → Phase 2
 *       19–27 → Phase 3
 *       28–37 → Phase 4
 *       38–48 → Phase 5
 *       49–58 → Phase 6
 *       59–67 → Phase 7
 *       68–76 → Phase 8
 *       77–84 → Phase 9
 *       85–90 → Phase 10
 */
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
