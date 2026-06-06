import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ALLOWLIST_GATE_VERSION,
  migrateAllowlistGateStore,
} from '../store/persistMigration';

interface AllowlistGateState {
  gateEmail: string | null;
  setGateEmail: (email: string) => void;
  clearGate: () => void;
}

export const useAllowlistGateStore = create<AllowlistGateState>()(
  persist(
    (set) => ({
      gateEmail: null,
      setGateEmail: (email) =>
        set({ gateEmail: email.trim().toLowerCase() || null }),
      clearGate: () => set({ gateEmail: null }),
    }),
    {
      name: 'satyverse-satyam-parmar-allowlist-gate',
      version: ALLOWLIST_GATE_VERSION,
      migrate: migrateAllowlistGateStore,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ gateEmail: s.gateEmail }),
    }
  )
);
