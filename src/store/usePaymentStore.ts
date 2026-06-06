import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistStorage } from 'zustand/middleware';
import { encryptedPersistStorage } from '../auth/encryptedStorage';
import { BUNDLE_PRICE, COURSE_CATALOG, getCourseDef } from '../config/courses';

const LIST_PRICE_SUM = 799 + 799 + 1499 + 1499;

const ORDER_CHARS = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function createSimulatedOrderId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  let suffix = '';
  for (let i = 0; i < 8; i += 1) {
    suffix += ORDER_CHARS[arr[i]! % ORDER_CHARS.length];
  }
  return `SATV-${suffix}`;
}

/** Per-course rupee amounts for a bundle purchase; sums exactly to {@link BUNDLE_PRICE}. */
function bundleAmountsByCourseId(): Record<string, number> {
  const raw = COURSE_CATALOG.map((c) => Math.floor((c.price / LIST_PRICE_SUM) * BUNDLE_PRICE));
  const sum = raw.reduce((a, b) => a + b, 0);
  const remainder = BUNDLE_PRICE - sum;
  const out: Record<string, number> = {};
  COURSE_CATALOG.forEach((c, i) => {
    const isLast = i === COURSE_CATALOG.length - 1;
    out[c.id] = raw[i]! + (isLast ? remainder : 0);
  });
  return out;
}

export interface PurchasedCourse {
  courseId: string;
  purchasedAt: number;
  orderId: string;
  amountPaid: number;
}

interface PaymentState {
  purchasesByUser: Record<string, Record<string, PurchasedCourse>>;
  hasCourse: (userId: string, courseId: string) => boolean;
  purchaseCourse: (userId: string, courseId: string, amountPaid: number) => void;
  purchaseBundle: (userId: string) => void;
  getUserPurchases: (userId: string) => PurchasedCourse[];
  clearUserPurchases: (userId: string) => void;
}

type PaymentPersistedSlice = Pick<PaymentState, 'purchasesByUser'>;

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      purchasesByUser: {},

      hasCourse: (userId, courseId) => {
        const byUser = get().purchasesByUser[userId];
        return !!byUser?.[courseId];
      },

      purchaseCourse: (userId, courseId, amountPaid) => {
        const now = Date.now();
        const orderId = createSimulatedOrderId();
        set((s) => {
          const prevUser = s.purchasesByUser[userId] ?? {};
          return {
            purchasesByUser: {
              ...s.purchasesByUser,
              [userId]: {
                ...prevUser,
                [courseId]: {
                  courseId,
                  purchasedAt: now,
                  orderId,
                  amountPaid,
                },
              },
            },
          };
        });
      },

      purchaseBundle: (userId) => {
        const now = Date.now();
        const sharedOrderId = createSimulatedOrderId();
        const amounts = bundleAmountsByCourseId();
        set((s) => {
          const prevUser = { ...(s.purchasesByUser[userId] ?? {}) };
          COURSE_CATALOG.forEach((c) => {
            prevUser[c.id] = {
              courseId: c.id,
              purchasedAt: now,
              orderId: sharedOrderId,
              amountPaid: amounts[c.id] ?? 0,
            };
          });
          return {
            purchasesByUser: {
              ...s.purchasesByUser,
              [userId]: prevUser,
            },
          };
        });
      },

      getUserPurchases: (userId) => {
        const map = get().purchasesByUser[userId];
        if (!map) return [];
        return Object.values(map).sort((a, b) => b.purchasedAt - a.purchasedAt);
      },

      clearUserPurchases: (userId) => {
        set((s) => {
          const next = { ...s.purchasesByUser };
          delete next[userId];
          return { purchasesByUser: next };
        });
      },
    }),
    {
      name: 'satyverse-payments',
      // version: PAYMENT_STORE_VERSION,
      // migrate: migratePaymentStore,  // see persistMigration.ts — wire when schema changes
      storage: encryptedPersistStorage as PersistStorage<PaymentPersistedSlice>,
      partialize: (state) => ({ purchasesByUser: state.purchasesByUser }),
    }
  )
);

export function courseExistsInCatalog(courseId: string): boolean {
  return !!getCourseDef(courseId);
}
