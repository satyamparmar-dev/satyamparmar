import { useAuthStore } from '../auth/useAuthStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { getGrantedCourseIds } from '../config/premiumGrants';

export function useHasCourseAccess(courseId: string): boolean {
  const userId = useAuthStore((s) => s.currentUser?.userId ?? null);
  const email = useAuthStore((s) => s.currentUser?.email ?? null);
  const hasCourse = usePaymentStore((s) => s.hasCourse);

  if (!userId) return false;
  if (hasCourse(userId, courseId)) return true;
  return getGrantedCourseIds(email).includes(courseId);
}

export function useAccessibleCourseIds(): string[] {
  const userId = useAuthStore((s) => s.currentUser?.userId ?? null);
  const email = useAuthStore((s) => s.currentUser?.email ?? null);
  const purchasesSlice = usePaymentStore((s) => (userId ? s.purchasesByUser[userId] : undefined));
  const granted = getGrantedCourseIds(email);

  const ids = new Set<string>([
    ...Object.keys(purchasesSlice ?? {}),
    ...granted,
  ]);
  return [...ids];
}
