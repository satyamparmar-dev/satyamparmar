/**
 * Zustand persist migration helpers for this app.
 *
 * Storage keys (do not rename without a migrate step):
 * - satyverse-satyam-parmar-app-store      (plain localStorage)
 * - satyverse-satyam-parmar-auth-store     (encrypted)
 * - satyverse-payments                     (encrypted)
 * - satyverse-satyam-parmar-allowlist-gate (plain localStorage)
 *
 * Course progress (plain JSON arrays, separate keys):
 * - kafka-course-completed-lessons
 * - java-course-completed-lessons
 * - claude-course-completed-lessons
 * - prompt-engineering-course-completed-lessons (if present)
 *
 * Wire in each store:
 *   version: APP_STORE_VERSION,
 *   migrate: migrateAppStore,
 */

import type { AppProgress } from '../types';

const DEFAULT_APP_PROGRESS: AppProgress = {
  completedDays: [],
  currentDay: 1,
  lastVisited: '',
  phaseProgress: {},
  notes: {},
  quizScores: {},
  bookmarks: [],
  streak: 0,
  lastStudyDate: '',
  totalHours: 0,
  exercisesSolved: [],
  assignmentsCompleted: {},
};

// Bump when persisted shape changes in a breaking way
export const APP_STORE_VERSION = 1;
export const PAYMENT_STORE_VERSION = 1;
export const AUTH_STORE_VERSION = 1;
export const ALLOWLIST_GATE_VERSION = 1;

type PersistedState<T> = T & { _persist?: { version?: number } };

/**
 * Generic wrapper: run domain migrate, then stamp version.
 */
export function createPersistMigrate<T>(
  version: number,
  migrateFn: (state: PersistedState<T>, fromVersion: number) => T
) {
  return (persisted: unknown, fromVersion: number): T => {
    const state = (persisted ?? {}) as PersistedState<T>;
    return migrateFn(state, fromVersion);
  };
}

// ─── App store (satyverse-satyam-parmar-app-store) ───────────────────────────

export type AppPersistedSlice = {
  progress?: Partial<AppProgress>;
  theme?: 'light' | 'dark';
  activeTrack?: string;
  activeCurriculum?: string;
  onboardingComplete?: boolean;
  sidebarOpen?: boolean;
};

export const migrateAppStore = createPersistMigrate<AppPersistedSlice>(
  APP_STORE_VERSION,
  (state, fromVersion) => {
    let next: AppPersistedSlice = { ...state };

    if (fromVersion < 1) {
      // v0 → v1: ensure assignmentsCompleted exists on progress
      next = {
        ...next,
        progress: {
          ...DEFAULT_APP_PROGRESS,
          ...(next.progress ?? {}),
          assignmentsCompleted: {
            ...DEFAULT_APP_PROGRESS.assignmentsCompleted,
            ...(next.progress?.assignmentsCompleted ?? {}),
          },
        },
      };
    }

    // Example future migration:
    // if (fromVersion < 2) {
    //   next = { ...next, activeCurriculum: next.activeCurriculum ?? 'java' };
    // }

    return next;
  }
);

// ─── Payment store (satyverse-payments, encrypted) ───────────────────────────

export type PaymentPersistedSlice = {
  purchasesByUser?: Record<
    string,
    Record<
      string,
      {
        courseId: string;
        purchasedAt: number;
        orderId: string;
        amountPaid: number;
      }
    >
  >;
};

export const migratePaymentStore = createPersistMigrate<PaymentPersistedSlice>(
  PAYMENT_STORE_VERSION,
  (state, fromVersion) => {
    let purchasesByUser = state.purchasesByUser ?? {};

    if (fromVersion < 1) {
      // Strip malformed entries; keep valid purchase records only
      const cleaned: PaymentPersistedSlice['purchasesByUser'] = {};
      for (const [userId, courses] of Object.entries(purchasesByUser)) {
        if (!courses || typeof courses !== 'object') continue;
        const valid: NonNullable<PaymentPersistedSlice['purchasesByUser']>[string] = {};
        for (const [courseId, rec] of Object.entries(courses)) {
          if (
            rec &&
            typeof rec.purchasedAt === 'number' &&
            typeof rec.courseId === 'string'
          ) {
            valid[courseId] = rec;
          }
        }
        if (Object.keys(valid).length > 0) cleaned[userId] = valid;
      }
      purchasesByUser = cleaned;
    }

    return { purchasesByUser };
  }
);

// ─── Auth store (satyverse-satyam-parmar-auth-store, encrypted) ─────────────

export const migrateAuthStore = createPersistMigrate<{
  users?: Record<string, unknown>;
  sessionToken?: string | null;
  currentUser?: unknown;
}>(AUTH_STORE_VERSION, (state, fromVersion) => {
  if (fromVersion < 1) {
    return {
      users: state.users ?? {},
      sessionToken: state.sessionToken ?? null,
      currentUser: state.currentUser ?? null,
    };
  }
  return state;
});

// ─── Allowlist gate (plain localStorage) ───────────────────────────────────

export const migrateAllowlistGateStore = createPersistMigrate<{
  gateEmail?: string | null;
}>(ALLOWLIST_GATE_VERSION, (state, fromVersion) => {
  if (fromVersion < 1) {
    const email = state.gateEmail;
    return {
      gateEmail:
        typeof email === 'string' ? email.trim().toLowerCase() || null : null,
    };
  }
  return state;
});

// ─── Course lesson keys (manual migration if you rename keys) ───────────────

const COURSE_PROGRESS_KEYS = [
  'kafka-course-completed-lessons',
  'java-course-completed-lessons',
  'claude-course-completed-lessons',
] as const;

/**
 * Call once on app boot if you rename a course progress localStorage key.
 * Copies oldKey → newKey only when newKey is empty.
 */
export function migrateCourseProgressKey(oldKey: string, newKey: string): void {
  try {
    if (localStorage.getItem(newKey)) return;
    const raw = localStorage.getItem(oldKey);
    if (raw) {
      localStorage.setItem(newKey, raw);
      // localStorage.removeItem(oldKey); // uncomment after one release
    }
  } catch {
    // private mode / quota
  }
}

export function listCourseProgressKeys(): readonly string[] {
  return COURSE_PROGRESS_KEYS;
}
