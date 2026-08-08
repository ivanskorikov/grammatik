import { MistakeTooltip } from '../MistakeTooltip'
import type { CheckResult, ExerciseItem } from '../../types'

interface PickAndTypeProps {
  items: ExerciseItem[]
  results: CheckResult[] | null
  answers: Record<string, string>
  onChange: (key: string, value: string) => void
  showAnswers?: boolean
}

function inputClass(correct: boolean | null): string {
  const base =
    'mx-0.5 inline-block min-w-[4rem] rounded border-b-2 bg-transparent px-1 py-0.5 text-center text-stone-900 outline-none dark:text-stone-100'
  if (correct === null)
    return `${base} border-stone-300 focus:border-emerald-500 dark:border-stone-600`
  if (correct)
    return `${base} border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60`
  return `${base} border-red-500 bg-red-50 dark:bg-red-950/60`
}

export function PickAndType({
  items,
  results,
  answers,
  onChange,
  showAnswers = false,
}: PickAndTypeProps) {
  return (
    <ol className="space-y-4">
      {items.map((item, idx) => {
        const parts = item.promptParts ?? item.prompt.split('___')
        const blanks = item.blanks ?? []
        return (
          <li key={item.id} className="flex gap-3">
            <span className="mt-1 text-stone-400 dark:text-stone-500">{idx + 1}.</span>
            <div className="flex-1 leading-loose">
              {parts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < blanks.length && (() => {
                    const blank = blanks[i]
                    const key = `${item.id}:${blank.index}`
                    const result =
                      results?.find(
                        (r) => r.itemId === item.id && r.blankIndex === blank.index,
                      ) ?? null
                    const input = (
                      <input
                        type="text"
                        value={answers[key] ?? ''}
                        onChange={(e) => onChange(key, e.target.value)}
                        className={inputClass(result ? result.correct : null)}
                      />
                    )
                    return result && !result.correct ? (
                      <MistakeTooltip result={result} hint={blank.hint}>
                        {input}
                      </MistakeTooltip>
                    ) : (
                      input
                    )
                  })()}
                </span>
              ))}
              {showAnswers &&
                blanks.map((b) => (
                  <span
                    key={b.index}
                    className="ml-2 text-sm text-emerald-700 dark:text-emerald-400"
                  >
                    ({b.accept.join(' / ')})
                  </span>
                ))}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
