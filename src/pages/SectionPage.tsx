import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSection } from '../lib/content'
import { loadProgress, setLastVisited, isExerciseComplete } from '../lib/progress'
import { GrammarOverview } from '../components/GrammarOverview'
import { ExerciseSet } from '../components/ExerciseSet'

function exerciseLabel(id: string): string {
  const part = id.split('-').pop()
  return part && /^[A-Z]$/.test(part) ? part : id
}

export function SectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>()
  const [progressTick, setProgressTick] = useState(0)
  const progress = loadProgress()

  const section = sectionId ? getSection(sectionId) : null

  useEffect(() => {
    if (section) {
      setLastVisited(loadProgress(), section.level, section.id)
    }
  }, [section])

  if (!section) {
    return (
      <div>
        <Link
          to="/"
          className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Home
        </Link>
        <p className="mt-4">Section not found.</p>
      </div>
    )
  }

  void progressTick

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0">
        <Link
          to={`/level/${section.level}`}
          className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← {section.level}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50">
          {section.title}
        </h1>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,2fr)_minmax(360px,3fr)] lg:gap-6">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 lg:max-h-[calc(100vh-9rem)]">
          <div className="shrink-0 border-b border-stone-100 px-5 py-3 dark:border-stone-800">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Theory
            </h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <GrammarOverview blocks={section.overview.blocks} />
          </div>
        </aside>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 lg:max-h-[calc(100vh-9rem)]">
          <div className="shrink-0 border-b border-stone-100 px-5 py-3 dark:border-stone-800">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Exercises
            </h2>
          </div>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4">
            {section.exercises.map((ex) => {
              const key = `${section.id}/${ex.id}`
              const done = isExerciseComplete(progress, key)
              return (
                <article
                  key={ex.id}
                  id={`exercise-${ex.id}`}
                  className="rounded-lg border border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-950/50"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                      {exerciseLabel(ex.id)}
                    </h3>
                    {done && (
                      <span className="text-sm font-medium text-emerald-600">Complete ✓</span>
                    )}
                  </div>
                  <ExerciseSet
                    exercise={ex}
                    exerciseKey={key}
                    onProgress={() => setProgressTick((t) => t + 1)}
                  />
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
