import { useState } from 'react'

type Theme = 'light' | 'dark'

function getCurrentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getCurrentTheme)
  const isDark = theme === 'dark'

  function toggleTheme() {
    const next: Theme = isDark ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('grammatik-theme', next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white"
    >
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M20.5 14.25A8.5 8.5 0 0 1 9.75 3.5 8.5 8.5 0 1 0 20.5 14.25Z" />
        </svg>
      )}
    </button>
  )
}
