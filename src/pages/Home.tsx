import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { getSectionsForLevel } from '../lib/content'
import { loadProgress, getLevelProgress } from '../lib/progress'

function ProgressRing({ percent }: { percent: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        className="stroke-stone-200 dark:stroke-stone-700"
        strokeWidth="6"
      />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="#059669"
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="36"
        y="36"
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 fill-stone-700 text-xs font-semibold dark:fill-stone-300"
        transform="rotate(90 36 36)"
      >
        {percent}%
      </text>
    </svg>
  )
}

export function Home() {
  const progress = loadProgress()

  const levels = useMemo(() => {
    return (['A1', 'A2'] as const).map((level) => {
      const sections = getSectionsForLevel(level)
      const sectionIds = sections.map((s) => s.id)
      const { percent } = getLevelProgress(progress, sectionIds)
      const exerciseCount = sections.reduce((n, s) => n + s.exercises.length, 0)
      return { level, sections: sections.length, exerciseCount, percent }
    })
  }, [progress])

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50">
        Learn German Grammar
      </h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        Interactive exercises for CEFR A1 and A2 levels. Complete worksheets, check your
        answers, and learn from detailed explanations.
      </p>

      {progress.lastVisited && (
        <Link
          to={`/section/${progress.lastVisited.sectionId}`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
        >
          Continue where you left off →
        </Link>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {levels.map(({ level, sections, exerciseCount, percent }) => (
          <Link
            key={level}
            to={`/level/${level}`}
            className="group rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
                  {level}
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                  {sections} sections · {exerciseCount} exercises
                </p>
              </div>
              <ProgressRing percent={percent} />
            </div>
            <p className="mt-4 text-sm text-stone-600 dark:text-stone-300">
              {level === 'A1'
                ? 'Cases, present tense, articles, basic word order, modal verbs.'
                : 'Dative, Perfekt, reflexive verbs, conjunctions, comparatives.'}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-emerald-700 group-hover:underline dark:text-emerald-400">
              Start learning →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
