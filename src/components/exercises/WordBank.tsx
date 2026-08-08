import { useState } from 'react'
import { MistakeTooltip } from '../MistakeTooltip'
import type { CheckResult, ExerciseItem } from '../../types'

interface WordBankProps {
  items: ExerciseItem[]
  wordBank: string[]
  results: CheckResult[] | null
  answers: Record<string, string>
  onChange: (key: string, value: string) => void
  showAnswers?: boolean
}

function inputClass(correct: boolean | null): string {
  const base =
    'inline-block min-w-[5rem] rounded border-2 border-dashed px-2 py-1 text-center text-stone-900 outline-none dark:text-stone-100'
  if (correct === null)
    return `${base} border-stone-300 bg-stone-50 dark:border-stone-600 dark:bg-stone-800`
  if (correct)
    return `${base} border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60`
  return `${base} border-red-400 bg-red-50 dark:bg-red-950/60`
}

export function WordBank({
  items,
  wordBank,
  results,
  answers,
  onChange,
  showAnswers = false,
}: WordBankProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const usedWords = new Set(Object.values(answers).filter(Boolean))

  function handleGapClick(itemId: string, blankIndex: number) {
    if (selectedWord) {
      onChange(`${itemId}:${blankIndex}`, selectedWord)
      setSelectedWord(null)
    }
  }

  function getResult(itemId: string, blankIndex: number): CheckResult | null {
    return (
      results?.find((r) => r.itemId === itemId && r.blankIndex === blankIndex) ?? null
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
        <span className="w-full text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Word bank — tap a word, then tap a gap
        </span>
        {wordBank.map((word) => {
          const used = usedWords.has(word)
          return (
            <button
              key={word}
              type="button"
              disabled={used}
              onClick={() => setSelectedWord(selectedWord === word ? null : word)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                selectedWord === word
                  ? 'bg-emerald-600 text-white'
                  : used
                    ? 'bg-stone-100 text-stone-400 line-through dark:bg-stone-800 dark:text-stone-500'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900'
              }`}
            >
              {word}
            </button>
          )
        })}
      </div>

      <ol className="space-y-4">
        {items.map((item, idx) => {
          const parts = item.promptParts ?? item.prompt.split('___')
          const blanks = item.blanks ?? []
          return (
            <li key={item.id} className="flex gap-3">
              <span className="mt-1 text-stone-400 dark:text-stone-500">{idx + 1}.</span>
              <div className="flex-1 leading-relaxed">
                {parts.map((part, i) => (
                  <span key={i}>
                    {part}
                    {i < blanks.length && (() => {
                      const blank = blanks[i]
                      const key = `${item.id}:${blank.index}`
                      const result = getResult(item.id, blank.index)
                      const gap = (
                        <button
                          type="button"
                          onClick={() => handleGapClick(item.id, blank.index)}
                          className={inputClass(result ? result.correct : null)}
                        >
                          {answers[key] || '___'}
                        </button>
                      )
                      return result && !result.correct ? (
                        <MistakeTooltip result={result} hint={blank.hint}>
                          {gap}
                        </MistakeTooltip>
                      ) : (
                        gap
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
    </div>
  )
}
