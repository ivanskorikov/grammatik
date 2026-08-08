import { useState, useRef } from 'react'
import { explainResult } from '../lib/explain'
import type { CheckResult } from '../types'

interface MistakeTooltipProps {
  result: CheckResult
  hint?: string | null
  children: React.ReactNode
}

export function MistakeTooltip({ result, hint, children }: MistakeTooltipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  if (result.correct) return <>{children}</>

  const { title, body } = explainResult(result, hint ?? null)

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-0 mb-2 w-72 rounded-lg border border-red-200 bg-white p-3 text-sm shadow-lg"
        >
          <p className="font-semibold text-red-700">{title}</p>
          <p className="mt-1 text-gray-700">{body}</p>
        </div>
      )}
    </div>
  )
}
