import { MistakeTooltip } from '../MistakeTooltip'
import type { CheckResult, ExerciseItem } from '../../types'

interface FillBlankProps {
  items: ExerciseItem[]
  results: CheckResult[] | null
  answers: Record<string, string>
  onChange: (key: string, value: string) => void
  showAnswers?: boolean
}

function inputClass(correct: boolean | null): string {
  const base =
    'mx-1 inline-block min-w-[4rem] rounded border-b-2 bg-transparent px-1 py-0.5 text-center text-stone-900 outline-none focus:ring-1 dark:text-stone-100'
  if (correct === null)
    return `${base} border-stone-300 focus:border-emerald-500 focus:ring-emerald-200 dark:border-stone-600 dark:focus:ring-emerald-900`
  if (correct)
    return `${base} border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60`
  return `${base} border-red-500 bg-red-50 dark:bg-red-950/60`
}

function getResult(
  results: CheckResult[] | null,
  itemId: string,
  blankIndex: number,
): CheckResult | null {
  return (
    results?.find((r) => r.itemId === itemId && r.blankIndex === blankIndex) ?? null
  )
}

function renderPrompt(
  item: ExerciseItem,
  results: CheckResult[] | null,
  answers: Record<string, string>,
  onChange: (key: string, value: string) => void,
  showAnswers: boolean,
) {
  const parts = item.promptParts ?? item.prompt.split('___')
  const blanks = item.blanks ?? []

  return (
    <span className="leading-relaxed">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < blanks.length && (() => {
            const blank = blanks[i]
            const key = `${item.id}:${blank.index}`
            const result = getResult(results, item.id, blank.index)
            const input = (
              <input
                type="text"
                value={answers[key] ?? ''}
                onChange={(e) => onChange(key, e.target.value)}
                className={inputClass(result ? result.correct : null)}
                aria-label={`Blank ${blank.index + 1}`}
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
    </span>
  )
}

export function FillBlank({
  items,
  results,
  answers,
  onChange,
  showAnswers = false,
}: FillBlankProps) {
  return (
    <ol className="space-y-4">
      {items.map((item, idx) => (
        <li key={item.id} className="flex gap-3">
          <span className="mt-1 min-w-[1.5rem] text-stone-400 dark:text-stone-500">
            {idx + 1}.
          </span>
          <div className="flex-1">
            {renderPrompt(item, results, answers, onChange, showAnswers)}
          </div>
        </li>
      ))}
    </ol>
  )
}
