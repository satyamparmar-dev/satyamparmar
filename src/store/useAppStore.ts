import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppProgress, CurriculumMeta, PhaseData, Track } from '../types';
import { format } from 'date-fns';

// ─── Default Progress ─────────────────────────────────────────
const defaultProgress: AppProgress = {
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

// ─── Store Interface ──────────────────────────────────────────
interface AppStore {
  // State
  progress: AppProgress;
  theme: 'light' | 'dark';
  curriculum: CurriculumMeta | null;
  loadedPhases: Record<string, PhaseData>;
  currentDay: number | null;
  currentSection: string;
  searchQuery: string;
  searchOpen: boolean;
  activeTrack: Track | 'All';
  onboardingComplete: boolean;
  sidebarOpen: boolean;

  // Actions
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setCurriculum: (c: CurriculumMeta) => void;
  loadPhase: (phaseId: string, data: PhaseData) => void;
  markDayComplete: (day: number) => void;
  unmarkDayComplete: (day: number) => void;
  setCurrentDay: (day: number) => void;
  setCurrentSection: (section: string) => void;
  saveNote: (day: number, note: string) => void;
  saveQuizScore: (day: number, knew: number, review: number) => void;
  toggleBookmark: (day: number) => void;
  markExerciseSolved: (day: number) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  setActiveTrack: (track: Track | 'All') => void;
  resetProgress: () => void;
  exportProgress: () => void;
  importProgress: (data: AppProgress) => void;
  updateStreak: () => void;
  completeOnboarding: () => void;
  setSidebarOpen: (open: boolean) => void;
  addHours: (hours: number) => void;
  markAssignmentQuestion: (day: number, questionId: string) => void;
  unmarkAssignmentQuestion: (day: number, questionId: string) => void;
}

// ─── Zustand Store ────────────────────────────────────────────
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Initial State ──
      progress: defaultProgress,
      theme: 'dark',
      curriculum: null,
      loadedPhases: {},
      currentDay: null,
      currentSection: 'why',
      searchQuery: '',
      searchOpen: false,
      activeTrack: 'All',
      onboardingComplete: false,
      sidebarOpen: true,

      // ── Actions ──
      setTheme: (t) => set({ theme: t }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setCurriculum: (c) => set({ curriculum: c }),

      loadPhase: (phaseId, data) =>
        set((state) => ({
          loadedPhases: { ...state.loadedPhases, [phaseId]: data },
        })),

      markDayComplete: (day) => {
        const state = get();
        if (state.progress.completedDays.includes(day)) return;

        const today = format(new Date(), 'yyyy-MM-dd');
        const lastStudy = state.progress.lastStudyDate;
        const yesterday = format(
          new Date(Date.now() - 86400000),
          'yyyy-MM-dd'
        );

        let newStreak = state.progress.streak;
        if (lastStudy === yesterday || lastStudy === today) {
          if (lastStudy !== today) newStreak += 1;
        } else if (lastStudy !== today) {
          newStreak = 1;
        }

        // Update phase progress
        const curriculum = state.curriculum;
        const updatedPhaseProgress = { ...state.progress.phaseProgress };
        if (curriculum) {
          for (const phase of curriculum.phases) {
            const [startDay, endDay] = phase.days
              .split('–')
              .map((d) => parseInt(d));
            const phaseDays = Array.from(
              { length: endDay - startDay + 1 },
              (_, i) => startDay + i
            );
            const completed = phaseDays.filter((d) =>
              [...state.progress.completedDays, day].includes(d)
            );
            updatedPhaseProgress[phase.id] = Math.round(
              (completed.length / phaseDays.length) * 100
            );
          }
        }

        set((s) => ({
          progress: {
            ...s.progress,
            completedDays: [...s.progress.completedDays, day],
            streak: newStreak,
            lastStudyDate: today,
            phaseProgress: updatedPhaseProgress,
          },
        }));
      },

      unmarkDayComplete: (day) =>
        set((s) => ({
          progress: {
            ...s.progress,
            completedDays: s.progress.completedDays.filter((d) => d !== day),
          },
        })),

      setCurrentDay: (day) =>
        set((s) => ({
          currentDay: day,
          progress: { ...s.progress, lastVisited: String(day), currentDay: day },
        })),

      setCurrentSection: (section) => set({ currentSection: section }),

      saveNote: (day, note) =>
        set((s) => ({
          progress: {
            ...s.progress,
            notes: { ...s.progress.notes, [String(day)]: note },
          },
        })),

      saveQuizScore: (day, knew, review) =>
        set((s) => ({
          progress: {
            ...s.progress,
            quizScores: {
              ...s.progress.quizScores,
              [String(day)]: {
                knew,
                review,
                date: format(new Date(), 'yyyy-MM-dd'),
              },
            },
          },
        })),

      toggleBookmark: (day) =>
        set((s) => {
          const bookmarks = s.progress.bookmarks;
          const isBookmarked = bookmarks.includes(day);
          return {
            progress: {
              ...s.progress,
              bookmarks: isBookmarked
                ? bookmarks.filter((b) => b !== day)
                : [...bookmarks, day],
            },
          };
        }),

      markExerciseSolved: (day) =>
        set((s) => {
          if (s.progress.exercisesSolved.includes(day)) return s;
          return {
            progress: {
              ...s.progress,
              exercisesSolved: [...s.progress.exercisesSolved, day],
            },
          };
        }),

      setSearchOpen: (open) => set({ searchOpen: open }),

      setSearchQuery: (q) => set({ searchQuery: q }),

      setActiveTrack: (track) => set({ activeTrack: track }),

      resetProgress: () =>
        set({
          progress: defaultProgress,
          loadedPhases: {},
          currentDay: null,
          currentSection: 'why',
        }),

      exportProgress: () => {
        const { progress } = get();
        const blob = new Blob([JSON.stringify(progress, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arch-progress-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importProgress: (data) =>
        set({ progress: { ...defaultProgress, ...data } }),

      updateStreak: () => {
        const { progress } = get();
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');

        if (
          progress.lastStudyDate !== today &&
          progress.lastStudyDate !== yesterday
        ) {
          set((s) => ({
            progress: { ...s.progress, streak: 0 },
          }));
        }
      },

      completeOnboarding: () => set({ onboardingComplete: true }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addHours: (hours) =>
        set((s) => ({
          progress: {
            ...s.progress,
            totalHours: s.progress.totalHours + hours,
          },
        })),

      markAssignmentQuestion: (day, questionId) =>
        set((s) => {
          const key = String(day);
          const map = s.progress.assignmentsCompleted ?? {};
          const existing = map[key] ?? [];
          if (existing.includes(questionId)) return s;
          return {
            progress: {
              ...s.progress,
              assignmentsCompleted: {
                ...map,
                [key]: [...existing, questionId],
              },
            },
          };
        }),

      unmarkAssignmentQuestion: (day, questionId) =>
        set((s) => {
          const key = String(day);
          const map = s.progress.assignmentsCompleted ?? {};
          const existing = map[key] ?? [];
          return {
            progress: {
              ...s.progress,
              assignmentsCompleted: {
                ...map,
                [key]: existing.filter((id) => id !== questionId),
              },
            },
          };
        }),
    }),
    {
      name: 'satyverse-satyam-parmar-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        progress: state.progress,
        theme: state.theme,
        activeTrack: state.activeTrack,
        onboardingComplete: state.onboardingComplete,
        sidebarOpen: state.sidebarOpen,
      }),
      /** Older persisted state may omit newer progress keys (e.g. assignmentsCompleted). */
      merge: (persisted, current) => {
        const p = persisted as Partial<AppStore> | undefined;
        const base = current as AppStore;
        if (!p) return base;
        return {
          ...base,
          ...p,
          progress: {
            ...defaultProgress,
            ...(p.progress ?? {}),
            assignmentsCompleted: {
              ...defaultProgress.assignmentsCompleted,
              ...(p.progress?.assignmentsCompleted ?? {}),
            },
          },
        };
      },
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────
export const selectCompletionRate = (state: AppStore) => {
  const total = state.curriculum?.totalDays ?? 90;
  return Math.round((state.progress.completedDays.length / total) * 100);
};

export const selectPhaseForDay = (dayNumber: number) => (state: AppStore) => {
  const phases = state.curriculum?.phases ?? [];
  return phases.find((p) => {
    const [start, end] = p.days.split('–').map(Number);
    return dayNumber >= start && dayNumber <= end;
  });
};

export const selectDayData = (dayNumber: number) => (state: AppStore) => {
  const phases = state.curriculum?.phases ?? [];
  for (const phase of phases) {
    const phaseData = state.loadedPhases[phase.id];
    if (phaseData) {
      const day = phaseData.days.find((d) => d.day === dayNumber);
      if (day) return day;
    }
  }
  return null;
};
