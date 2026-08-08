interface CheckButtonProps {
  onCheck: () => void
  disabled?: boolean
  checking?: boolean
}

export function CheckButton({ onCheck, disabled, checking }: CheckButtonProps) {
  return (
    <button
      type="button"
      onClick={onCheck}
      disabled={disabled || checking}
      className="rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {checking ? 'Checking…' : 'Check'}
    </button>
  )
}
