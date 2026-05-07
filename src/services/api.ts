import axios from 'axios';
import {
  CurriculumId,
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

const CURRICULUM_ROOT: Record<CurriculumId, string> = {
  java: '',
  ai: 'ai-curriculum/',
};

function withCurriculumPath(curriculumId: CurriculumId, relativePath: string): string {
  return `${CURRICULUM_ROOT[curriculumId]}${relativePath}`;
}

// Base URL for data files (relative to public/)
const BASE = ((import.meta as unknown) as { env: { BASE_URL: string } }).env.BASE_URL || '/';

const api = axios.create({
  baseURL: `${BASE}data/`,
  timeout: 15000,
});

// ─── Fetch Curriculum Metadata ─────────────────────────────
export const fetchCurriculum = async (
  curriculumId: CurriculumId = 'java'
): Promise<CurriculumMeta> => {
  const { data } = await api.get<CurriculumMeta>(
    withCurriculumPath(curriculumId, 'curriculum.json')
  );
  return data;
};

// ─── Fetch Phase Data ──────────────────────────────────────
/** Merges `externalDayNumbers` from `phase{N}.json` with `data/days/phase{N}-day{D}.json` files. */
export const fetchPhase = async (
  phaseFile: string,
  curriculumId: CurriculumId = 'java'
): Promise<PhaseData> => {
  const { data } = await api.get<PhaseData>(
    withCurriculumPath(curriculumId, phaseFile)
  );
  const extraDayNums = data.externalDayNumbers;
  if (!extraDayNums?.length) {
    return data;
  }
  const base = phaseFileBase(phaseFile);
  const results = await Promise.allSettled(
    extraDayNums.map((n) =>
      api
        .get<LessonDay>(withCurriculumPath(curriculumId, `days/${base}-day${n}.json`))
        .then((r) => r.data)
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
  phaseFiles: string[],
  curriculumId: CurriculumId = 'java'
): Promise<PhaseData[]> => {
  const results = await Promise.allSettled(
    phaseFiles.map((file) => fetchPhase(file, curriculumId))
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
  phaseFile: string,
  curriculumId: CurriculumId = 'java'
): Promise<PhaseData> => {
  const cacheKey = `${curriculumId}:${phaseFile}`;
  if (phaseCache.has(cacheKey)) {
    return phaseCache.get(cacheKey)!;
  }
  const data = await fetchPhase(phaseFile, curriculumId);
  phaseCache.set(cacheKey, data);
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

const assignmentCache = new Map<string, AssignmentFile>();

export const fetchAssignmentForDay = async (
  day: number,
  phaseNumber: number,
  curriculumId: CurriculumId = 'java'
): Promise<AssignmentSection | null> => {
  const cacheKey = `${curriculumId}:phase${phaseNumber}`;
  if (!assignmentCache.has(cacheKey)) {
    try {
      const filePath = withCurriculumPath(
        curriculumId,
        `assignments_phase${phaseNumber}.json`
      );
      const { data } = await api.get<AssignmentFile>(
        filePath
      );
      assignmentCache.set(cacheKey, data);
    } catch {
      return null;
    }
  }
  const file = assignmentCache.get(cacheKey);
  return file?.assignments?.[String(day)] ?? null;
};

export default api;
