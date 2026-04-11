import { useCallback, useSyncExternalStore } from 'react'
import type { ProPathId, ProProgress, ProUserProfile } from '../types/pro.types'
import { PRO_CURRICULUM, findProjectSpecById } from '../constants/proCurriculum'

const PROGRESS_KEY = 'pro_progress'
const PROFILE_KEY = 'pro_profile'

const defaultProgress: ProProgress = {
  completedLessons: [],
  completedProjects: [],
  completedPaths: [],
  activePaths: [],
  xpTotal: 0,
  streakDays: 0,
  lastActiveDate: '',
  lessonNotes: {},
  bookmarkedLessons: [],
}

let proVersion = 0
const proListeners = new Set<() => void>()

type ProStoreSnapshot = {
  v: number
  profile: ProUserProfile | null
  progress: ProProgress
}

/** useSyncExternalStore requires a stable snapshot reference when the store has not changed. */
let proSnapshotCache: ProStoreSnapshot | null = null

function bumpPro() {
  proVersion += 1
  proListeners.forEach((l) => l())
}

function subscribePro(cb: () => void) {
  proListeners.add(cb)
  const onStorage = (e: StorageEvent) => {
    if (e.key === PROGRESS_KEY || e.key === PROFILE_KEY) {
      proSnapshotCache = null
      cb()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    proListeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

function readProgress(): ProProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return { ...defaultProgress }
    const parsed = JSON.parse(raw) as Partial<ProProgress>
    return {
      ...defaultProgress,
      ...parsed,
      completedLessons: parsed.completedLessons ?? [],
      completedProjects: parsed.completedProjects ?? [],
      completedPaths: parsed.completedPaths ?? [],
      activePaths: parsed.activePaths ?? [],
      lessonNotes: parsed.lessonNotes ?? {},
      bookmarkedLessons: parsed.bookmarkedLessons ?? [],
    }
  } catch {
    return { ...defaultProgress }
  }
}

function readProfile(): ProUserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProUserProfile
  } catch {
    return null
  }
}

function getProSnapshot(): ProStoreSnapshot {
  if (proSnapshotCache && proSnapshotCache.v === proVersion) {
    return proSnapshotCache
  }
  proSnapshotCache = {
    v: proVersion,
    profile: readProfile(),
    progress: readProgress(),
  }
  return proSnapshotCache
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function bumpStreak(lastActiveDate: string, streakDays: number): { streakDays: number; lastActiveDate: string } {
  const today = todayStr()
  if (lastActiveDate === today) return { streakDays, lastActiveDate: today }
  const y = new Date()
  y.setDate(y.getDate() - 1)
  const yesterday = y.toISOString().slice(0, 10)
  if (lastActiveDate === yesterday) {
    return { streakDays: streakDays + 1, lastActiveDate: today }
  }
  return { streakDays: 1, lastActiveDate: today }
}

function allLessonIdsForPath(pathId: ProPathId): string[] {
  const path = PRO_CURRICULUM.find((p) => p.id === pathId)
  if (!path) return []
  return path.weeks.flatMap((w) => w.lessons.map((l) => l.id))
}

function writeProgress(p: ProProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  bumpPro()
}

function writeProfile(p: ProUserProfile | null) {
  if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  else localStorage.removeItem(PROFILE_KEY)
  bumpPro()
}

export function useProProgress() {
  const snap = useSyncExternalStore(subscribePro, getProSnapshot, getProSnapshot)
  const profile = snap.profile
  const progress = snap.progress

  const saveProfile = useCallback((p: ProUserProfile) => {
    const prog = readProgress()
    const nextProgress: ProProgress = {
      ...prog,
      activePaths: p.activePaths,
      completedPaths: p.completedPaths,
      xpTotal: p.xpTotal,
      streakDays: p.streakDays,
      lastActiveDate: p.lastActiveDate,
    }
    writeProgress(nextProgress)
    writeProfile(p)
  }, [])

  const markLessonComplete = useCallback((lessonId: string) => {
    const xpGain = 10
    const prog = readProgress()
    const prof = readProfile()
    if (prog.completedLessons.includes(lessonId)) return
    const { streakDays, lastActiveDate } = bumpStreak(prog.lastActiveDate, prog.streakDays)
    let next: ProProgress = {
      ...prog,
      completedLessons: [...prog.completedLessons, lessonId],
      xpTotal: prog.xpTotal + xpGain,
      streakDays,
      lastActiveDate,
    }

    const path = PRO_CURRICULUM.find((p) => p.weeks.some((w) => w.lessons.some((l) => l.id === lessonId)))
    if (path) {
      const ids = allLessonIdsForPath(path.id)
      const done = ids.every((id) => next.completedLessons.includes(id))
      if (done && !next.completedPaths.includes(path.id)) {
        next = { ...next, completedPaths: [...next.completedPaths, path.id] }
      }
    }

    writeProgress(next)

    if (prof) {
      writeProfile({
        ...prof,
        xpTotal: next.xpTotal,
        streakDays: next.streakDays,
        lastActiveDate: next.lastActiveDate,
        completedPaths: next.completedPaths,
      })
    }
  }, [])

  const markProjectComplete = useCallback((projectId: string) => {
    const prog = readProgress()
    const prof = readProfile()
    if (prog.completedProjects.includes(projectId)) return
    const xpGain = 50
    const next: ProProgress = {
      ...prog,
      completedProjects: [...prog.completedProjects, projectId],
      xpTotal: prog.xpTotal + xpGain,
    }
    writeProgress(next)
    if (prof) {
      const found = findProjectSpecById(projectId)
      const exists = prof.portfolioProjects.some((pp) => pp.id === projectId)
      const portfolioProjects = exists
        ? prof.portfolioProjects
        : [
            ...prof.portfolioProjects,
            {
              id: projectId,
              title: found?.spec.title ?? projectId,
              pathId: found?.pathId ?? 'python-for-ai',
              skills: found?.spec.tools ?? [],
              completedAt: todayStr(),
              isPublic: true,
            },
          ]
      writeProfile({ ...prof, portfolioProjects, xpTotal: next.xpTotal })
    }
  }, [])

  const toggleBookmark = useCallback((lessonId: string) => {
    const prog = readProgress()
    const set = new Set(prog.bookmarkedLessons)
    if (set.has(lessonId)) set.delete(lessonId)
    else set.add(lessonId)
    writeProgress({ ...prog, bookmarkedLessons: [...set] })
  }, [])

  const updateNote = useCallback((lessonId: string, note: string) => {
    const prog = readProgress()
    writeProgress({
      ...prog,
      lessonNotes: { ...prog.lessonNotes, [lessonId]: note },
    })
  }, [])

  const clearProData = useCallback(() => {
    localStorage.removeItem(PROGRESS_KEY)
    localStorage.removeItem(PROFILE_KEY)
    bumpPro()
  }, [])

  const enrollPath = useCallback((pathId: ProPathId) => {
    const prog = readProgress()
    const prof = readProfile()
    if (prog.activePaths.includes(pathId)) return
    writeProgress({ ...prog, activePaths: [...prog.activePaths, pathId] })
    if (prof && !prof.activePaths.includes(pathId)) {
      writeProfile({ ...prof, activePaths: [...prof.activePaths, pathId] })
    }
  }, [])

  const isLessonComplete = useCallback(
    (lessonId: string) => readProgress().completedLessons.includes(lessonId),
    [snap.v]
  )

  const isPathComplete = useCallback(
    (pathId: ProPathId) => {
      const ids = allLessonIdsForPath(pathId)
      if (ids.length === 0) return false
      const done = readProgress().completedLessons
      return ids.every((id) => done.includes(id))
    },
    [snap.v]
  )

  const hasProProfile = profile !== null

  return {
    profile,
    progress,
    saveProfile,
    markLessonComplete,
    markProjectComplete,
    toggleBookmark,
    updateNote,
    clearProData,
    enrollPath,
    isLessonComplete,
    isPathComplete,
    hasProProfile,
  }
}
