/**
 * Manual premium grants — add a learner's email after offline payment / contact enquiry.
 * Keys must be lowercase email addresses; values are course IDs from {@link COURSE_CATALOG}.
 */
export const PREMIUM_COURSE_GRANTS: Record<string, string[]> = {
  'passingen3@gmail.com': ['apache-kafka', 'java-modern', 'java-roadmap'],
};

export function getGrantedCourseIds(email: string | null | undefined): string[] {
  if (!email) return [];
  return PREMIUM_COURSE_GRANTS[email.toLowerCase().trim()] ?? [];
}
