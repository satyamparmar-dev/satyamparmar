/**
 * Sequential curriculum mirroring Satyverse-Satyam-Parmar/Java (main).
 * Display titles are repo filenames; paths are relative to public/data/java-github/.
 */

export const JAVA_GITHUB_PUBLIC_PREFIX = 'data/java-github';

export type JavaGithubContentKind = 'markdown' | 'java';

export type JavaGithubCurriculumStep = {
  step: number;
  /** Basename exactly as in the repo (for UI). */
  displayName: string;
  /** Path under java-github/. */
  repoPath: string;
  kind: JavaGithubContentKind;
};

export const JAVA_GITHUB_CURRICULUM: JavaGithubCurriculumStep[] = [
  { step: 1, displayName: 'GETTING_STARTED.md', repoPath: 'GETTING_STARTED.md', kind: 'markdown' },
  { step: 2, displayName: 'README.md', repoPath: 'README.md', kind: 'markdown' },
  { step: 3, displayName: 'SUMMARY.md', repoPath: 'SUMMARY.md', kind: 'markdown' },
  {
    step: 4,
    displayName: 'StreamBasics.java',
    repoPath: 'src/main/java/com/example/streams/StreamBasics.java',
    kind: 'java',
  },
  {
    step: 5,
    displayName: 'AdvancedCollectors.java',
    repoPath: 'src/main/java/com/example/streams/AdvancedCollectors.java',
    kind: 'java',
  },
  {
    step: 6,
    displayName: 'FunctionalInterfacesDemo.java',
    repoPath: 'src/main/java/com/example/functional/FunctionalInterfacesDemo.java',
    kind: 'java',
  },
  {
    step: 7,
    displayName: 'OptionalExamples.java',
    repoPath: 'src/main/java/com/example/optional/OptionalExamples.java',
    kind: 'java',
  },
  { step: 8, displayName: 'ARCHITECTURE_DIAGRAMS.md', repoPath: 'ARCHITECTURE_DIAGRAMS.md', kind: 'markdown' },
  { step: 9, displayName: 'INTERVIEW_QUESTIONS.md', repoPath: 'INTERVIEW_QUESTIONS.md', kind: 'markdown' },
  {
    step: 10,
    displayName: 'OrderProcessingService.java',
    repoPath: 'src/main/java/com/example/enterprise/OrderProcessingService.java',
    kind: 'java',
  },
  { step: 11, displayName: 'SCENARIO_BASED_QA_INDEX.md', repoPath: 'SCENARIO_BASED_QA_INDEX.md', kind: 'markdown' },
  { step: 12, displayName: 'SCENARIO_BASED_QA_PART1.md', repoPath: 'SCENARIO_BASED_QA_PART1.md', kind: 'markdown' },
  { step: 13, displayName: 'SCENARIO_BASED_QA_PART2.md', repoPath: 'SCENARIO_BASED_QA_PART2.md', kind: 'markdown' },
  { step: 14, displayName: 'SCENARIO_BASED_QA_PART3.md', repoPath: 'SCENARIO_BASED_QA_PART3.md', kind: 'markdown' },
  { step: 15, displayName: 'SENIOR_JAVA_INTERVIEW_INDEX.md', repoPath: 'SENIOR_JAVA_INTERVIEW_INDEX.md', kind: 'markdown' },
  { step: 16, displayName: 'SENIOR_JAVA_INTERVIEW_PART1.md', repoPath: 'SENIOR_JAVA_INTERVIEW_PART1.md', kind: 'markdown' },
  { step: 17, displayName: 'SENIOR_JAVA_INTERVIEW_PART2.md', repoPath: 'SENIOR_JAVA_INTERVIEW_PART2.md', kind: 'markdown' },
  { step: 18, displayName: 'SENIOR_JAVA_INTERVIEW_PART3.md', repoPath: 'SENIOR_JAVA_INTERVIEW_PART3.md', kind: 'markdown' },
];

/** Present on disk for Phase 5 audit; not a curriculum step. */
export const JAVA_GITHUB_AUDIT_ONLY_PATH = 'pom.xml';

export function javaGithubAssetUrl(repoPath: string): string {
  const base = import.meta.env.BASE_URL || './';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  const segments = repoPath.split('/').map(encodeURIComponent);
  return `${normalized}${JAVA_GITHUB_PUBLIC_PREFIX}/${segments.join('/')}`;
}

export function getJavaGithubStepByParam(stepParam: string | undefined): JavaGithubCurriculumStep | null {
  const n = Number(stepParam);
  if (!Number.isInteger(n) || n < 1 || n > JAVA_GITHUB_CURRICULUM.length) return null;
  return JAVA_GITHUB_CURRICULUM[n - 1] ?? null;
}
