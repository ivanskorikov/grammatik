import { useState, useCallback } from 'react'
import type { Exercise, CheckResult } from '../types'
import { checkItem, scoreResults } from '../lib/check'
import { markExerciseScore, loadProgress } from '../lib/progress'
import { CheckButton } from './CheckButton'
import { FillBlank } from './exercises/FillBlank'
import { WordBank } from './exercises/WordBank'
import { WordOrder } from './exercises/WordOrder'
import { PickAndType } from './exercises/PickAndType'

interface ExerciseSetProps {
  exercise: Exercise
  exerciseKey: string
  onProgress?: () => void
}

export function ExerciseSet({ exercise, exerciseKey, onProgress }: ExerciseSetProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<CheckResult[] | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null)

  const handleChange = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }, [])

  const hasInput = Object.values(answers).some((v) => v.trim())

  function handleCheck() {
    const allResults: CheckResult[] = []
    for (const item of exercise.items) {
      allResults.push(...checkItem(item, answers, exercise.type))
    }
    setResults(allResults)
    const s = scoreResults(allResults)
    setScore(s)
    markExerciseScore(loadProgress(), exerciseKey, {
      correct: s.correct,
      total: s.total,
      lastChecked: new Date().toISOString(),
    })
    onProgress?.()
  }

  const shared = {
    items: exercise.items,
    results,
    answers,
    onChange: handleChange,
    showAnswers,
  }

  function renderExercise() {
    switch (exercise.type) {
      case 'fill_blank':
      case 'fill_blank_with_hint':
        return <FillBlank {...shared} />
      case 'word_bank':
        return (
          <WordBank
            {...shared}
            wordBank={exercise.items[0]?.wordBank ?? []}
          />
        )
      case 'word_order':
      case 'free_text':
        return <WordOrder {...shared} />
      case 'pick_and_type':
        return <PickAndType {...shared} />
      default:
        return <FillBlank {...shared} />
    }
  }

  return (
    <div>
      <p className="mb-6 text-stone-600 italic dark:text-stone-400">
        {exercise.instructions}
      </p>
      {renderExercise()}

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-stone-200 pt-4 dark:border-stone-700">
        <CheckButton onCheck={handleCheck} disabled={!hasInput} />
        {results && (
          <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
            <input
              type="checkbox"
              checked={showAnswers}
              onChange={(e) => setShowAnswers(e.target.checked)}
            />
            Show correct answers
          </label>
        )}
        {score && (
          <span
            className={`text-sm font-medium ${
              score.correct === score.total
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            {score.correct} / {score.total} correct
            {score.correct === score.total && score.total > 0 && ' — well done!'}
          </span>
        )}
      </div>
    </div>
  )
}
