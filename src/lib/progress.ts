import type { ExerciseScore, Progress } from '../types'

const STORAGE_KEY = 'grammatik:progress:v1'

const defaultProgress = (): Progress => ({
  completedSections: [],
  exerciseScores: {},
  lastVisited: null,
})

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    return { ...defaultProgress(), ...JSON.parse(raw) }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markExerciseScore(
  progress: Progress,
  exerciseKey: string,
  score: ExerciseScore,
): Progress {
  const next = {
    ...progress,
    exerciseScores: { ...progress.exerciseScores, [exerciseKey]: score },
  }
  if (score.correct === score.total && score.total > 0) {
    if (!next.completedSections.includes(exerciseKey)) {
      next.completedSections = [...next.completedSections, exerciseKey]
    }
  }
  saveProgress(next)
  return next
}

export function setLastVisited(
  progress: Progress,
  level: 'A1' | 'A2',
  sectionId: string,
): Progress {
  const next = { ...progress, lastVisited: { level, sectionId } }
  saveProgress(next)
  return next
}

export function getLevelProgress(
  progress: Progress,
  sectionIds: string[],
): { completed: number; total: number; percent: number } {
  const exerciseKeys = Object.keys(progress.exerciseScores)
  const sectionExerciseKeys = exerciseKeys.filter((k) =>
    sectionIds.some((sid) => k.startsWith(`${sid}/`)),
  )
  const completed = sectionExerciseKeys.filter((k) =>
    progress.completedSections.includes(k),
  ).length
  const total = sectionExerciseKeys.length
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

export function isSectionComplete(progress: Progress, sectionId: string): boolean {
  const keys = progress.completedSections.filter((k) => k.startsWith(`${sectionId}/`))
  const scores = Object.keys(progress.exerciseScores).filter((k) =>
    k.startsWith(`${sectionId}/`),
  )
  return scores.length > 0 && keys.length === scores.length
}

export function isExerciseComplete(progress: Progress, exerciseKey: string): boolean {
  return progress.completedSections.includes(exerciseKey)
}
