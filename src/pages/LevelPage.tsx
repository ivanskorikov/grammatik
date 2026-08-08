import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { getSectionsForLevel, groupSections } from '../lib/content'
import { loadProgress, isSectionComplete } from '../lib/progress'

export function LevelPage() {
  const { level } = useParams<{ level: 'A1' | 'A2' }>()
  const progress = loadProgress()

  const grouped = useMemo(() => {
    if (!level || (level !== 'A1' && level !== 'A2')) return {}
    return groupSections(getSectionsForLevel(level))
  }, [level])

  if (!level || (level !== 'A1' && level !== 'A2')) {
    return <p>Invalid level.</p>
  }

  return (
    <div>
      <Link to="/" className="text-sm text-emerald-700 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{level} Grammar</h1>
      <p className="mt-1 text-stone-600">Choose a topic to study.</p>

      <div className="mt-8 space-y-8">
        {Object.entries(grouped).map(([group, sections]) => (
          <section key={group}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
              {group}
            </h2>
            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
              {sections.map((section) => {
                const complete = isSectionComplete(progress, section.id)
                return (
                  <li key={section.id}>
                    <Link
                      to={`/section/${section.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-stone-50"
                    >
                      <span className="font-medium text-stone-800">{section.title}</span>
                      <span className="flex items-center gap-2 text-sm text-stone-500">
                        {section.exercises.length} exercises
                        {complete && (
                          <span className="text-emerald-600" title="Complete">
                            ✓
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
