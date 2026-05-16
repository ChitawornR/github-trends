interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const

export function Spinner({ size = 'md', label = 'Loading…' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`inline-block animate-spin rounded-full border-[#2C2C2E] border-t-[#00E5FF] ${SIZE_CLASSES[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
