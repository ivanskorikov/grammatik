import type { OverviewBlock } from '../types'

interface GrammarOverviewProps {
  blocks: OverviewBlock[]
}

export function GrammarOverview({ blocks }: GrammarOverviewProps) {
  return (
    <div className="max-w-none text-gray-800 dark:text-stone-200">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <h3
                key={i}
                className="mt-5 text-lg font-semibold text-stone-900 first:mt-0 dark:text-stone-50"
              >
                {block.content}
              </h3>
            )
          case 'paragraph':
            return (
              <p key={i} className="mt-2 leading-relaxed text-stone-700 dark:text-stone-300">
                {block.content}
              </p>
            )
          case 'list':
            return (
              <ul
                key={i}
                className="mt-2 list-disc space-y-1 pl-5 text-stone-700 dark:text-stone-300"
              >
                {block.content.split('\n').map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
              </ul>
            )
          case 'example':
            return (
              <figure
                key={i}
                className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/40"
              >
                <blockquote className="font-medium text-stone-900 dark:text-stone-100">
                  {block.de}
                </blockquote>
                {block.note && (
                  <figcaption className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    {block.note}
                  </figcaption>
                )}
              </figure>
            )
          case 'table':
            return (
              <div key={i} className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[280px] border-collapse text-sm">
                  <tbody>
                    {block.rows?.map((row, ri) => (
                      <tr
                        key={ri}
                        className={
                          ri === 0
                            ? 'bg-stone-100 font-medium text-stone-800 dark:bg-stone-800 dark:text-stone-100'
                            : ''
                        }
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="border border-stone-200 px-3 py-1.5 text-stone-700 dark:border-stone-700 dark:text-stone-300"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
