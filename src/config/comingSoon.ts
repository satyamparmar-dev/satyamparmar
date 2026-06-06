/** Flip to false when AI curriculum and related courses are ready to launch. */
export const AI_CURRICULUM_COMING_SOON = true;

export const COMING_SOON_NAV_PATHS = ['/llm', '/claude-course', '/prompt-course'] as const;

export const SCENARIO_CURRICULUM_BY_DAY_DISABLED = true;

export function isComingSoonNavPath(path: string): boolean {
  return COMING_SOON_NAV_PATHS.some(
    (base) => path === base || path.startsWith(`${base}/`)
  );
}
