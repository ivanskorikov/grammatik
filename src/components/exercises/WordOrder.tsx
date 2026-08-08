import { MistakeTooltip } from '../MistakeTooltip'
import type { CheckResult, ExerciseItem } from '../../types'

interface WordOrderProps {
  items: ExerciseItem[]
  results: CheckResult[] | null
  answers: Record<string, string>
  onChange: (key: string, value: string) => void
  showAnswers?: boolean
}

function inputClass(correct: boolean | null): string {
  const base =
    'w-full rounded-lg border px-3 py-2 outline-none focus:ring-2'
  if (correct === null) return `${base} border-stone-300 focus:border-emerald-500 focus:ring-emerald-200`
  if (correct) return `${base} border-emerald-500 bg-emerald-50`
  return `${base} border-red-500 bg-red-50`
}

export function WordOrder({
  items,
  results,
  answers,
  onChange,
  showAnswers = false,
}: WordOrderProps) {
  return (
    <ol className="space-y-6">
      {items.map((item, idx) => {
        const result = results?.find((r) => r.itemId === item.id) ?? null
        const input = (
          <textarea
            rows={2}
            value={answers[item.id] ?? ''}
            onChange={(e) => onChange(item.id, e.target.value)}
            className={inputClass(result ? result.correct : null)}
            placeholder="Type the complete German sentence…"
          />
        )
        return (
          <li key={item.id} className="space-y-2">
            <div className="flex gap-3">
              <span className="text-stone-400">{idx + 1}.</span>
              <p className="flex-1 text-stone-700">{item.prompt}</p>
            </div>
            {result && !result.correct ? (
              <MistakeTooltip result={result}>
                {input}
              </MistakeTooltip>
            ) : (
              input
            )}
            {showAnswers && item.acceptFull && (
              <p className="text-sm text-emerald-700">
                Answer: {item.acceptFull[0]}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
