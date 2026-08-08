import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="shrink-0 border-b border-stone-200 bg-white transition-colors dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400"
          >
            Grammatik
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 dark:text-stone-400 sm:inline">
              German A1 / A2
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  )
}
